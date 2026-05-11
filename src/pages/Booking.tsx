import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  ChevronLeft,
  Calendar,
  Clock,
  CreditCard,
  Wallet,
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function Booking() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const id = roomId || "";
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentStep, setPaymentStep] = useState<"details" | "payment" | "processing" | "success">("details");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "wallet">("upi");

  const { data: room, isLoading } = trpc.mongoRoom.byId.useQuery({ id });
  const { data: availability } = trpc.mongoBooking.checkAvailability.useQuery(
    { roomId: id, bookingDate: selectedDate, startTime, endTime },
    { enabled: !!room }
  );

  const createBooking = trpc.mongoBooking.create.useMutation({
    onSuccess: () => {
      setPaymentStep("payment");
    },
  });

  const verifyPayment = trpc.payment.verify.useMutation({
    onSuccess: () => {
      setPaymentStep("success");
    },
  });

  const totalHours = useMemo(() => {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    return (endH + endM / 60) - (startH + startM / 60);
  }, [startTime, endTime]);

  const isWeekend = useMemo(() => {
    const day = new Date(selectedDate).getDay();
    return day === 0 || day === 6;
  }, [selectedDate]);

  const hourlyRate = useMemo(() => {
    if (!room) return 0;
    return isWeekend && room.weekendPrice ? Number(room.weekendPrice) : Number(room.pricePerHour);
  }, [room, isWeekend]);

  const totalPrice = useMemo(() => {
    return Math.round(hourlyRate * totalHours);
  }, [hourlyRate, totalHours]);

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00",
  ];

  const handleProceedToPayment = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!availability?.available) return;

    createBooking.mutate({
      roomId: id,
      bookingDate: selectedDate,
      startTime,
      endTime,
      totalHours: Math.round(totalHours),
      totalPrice: totalPrice,
      specialRequests,
    });
  };

  const handlePayNow = async () => {
    setPaymentStep("processing");

    try {
      const bookingId = createBooking.data?.id;
      if (!bookingId) {
        setPaymentStep("payment");
        return;
      }

      // Create Razorpay order via backend
      const orderData = await fetch("/api/trpc/payment.createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("snapforest_token")
            ? { Authorization: `Bearer ${localStorage.getItem("snapforest_token")}` }
            : {}),
        },
        body: JSON.stringify({
          json: { amount: totalPrice, currency: "INR" },
        }),
      }).then((r) => r.json());

      const order = orderData.result?.data?.json;

      if (!order?.orderId) {
        throw new Error("Failed to create payment order");
      }

      // Load Razorpay script and open checkout
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "SNAPFOREST",
          description: `Booking for ${room?.title || "Studio"}`,
          order_id: order.orderId,
          handler: function (response: any) {
            verifyPayment.mutate({
              bookingId: bookingId.toString(),
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          modal: {
            ondismiss: function () {
              setPaymentStep("payment");
            },
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
          },
          theme: { color: "#10B981" },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };

      script.onerror = () => {
        setPaymentStep("payment");
        alert("Failed to load payment gateway. Please try again.");
      };
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStep("payment");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">Room not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Book Studio</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {["details", "payment", "success"].map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                (step === "details" && paymentStep === "details") ||
                (step === "payment" && (paymentStep === "payment" || paymentStep === "processing")) ||
                (step === "success" && paymentStep === "success")
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  : "bg-white/10 text-gray-500"
              }`}>
                {step === "success" && paymentStep === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs font-medium ${
                (step === "details" && paymentStep === "details") ||
                (step === "payment" && (paymentStep === "payment" || paymentStep === "processing")) ||
                (step === "success" && paymentStep === "success")
                  ? "text-emerald-400"
                  : "text-gray-500"
              }`}>
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </span>
              {i < 2 && <div className="flex-1 h-0.5 bg-white/10" />}
            </div>
          ))}
        </div>

        {/* STEP 1: Booking Details */}
        {paymentStep === "details" && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            {/* Room Summary */}
            <div className="glass-card rounded-2xl p-4 mb-4 flex gap-3">
              <img
                src={room.featuredImage || ""}
                alt={room.title}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800"; }}
              />
              <div>
                <h3 className="font-semibold text-white line-clamp-1">{room.title}</h3>
                <p className="text-sm text-gray-400">{room.city}</p>
                <p className="text-emerald-400 font-bold mt-1">&#8377;{hourlyRate}/hour</p>
              </div>
            </div>

            {/* Date Selection */}
            <div className="glass-card rounded-2xl p-4 mb-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Select Date
              </h3>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/30 text-white border border-white/10"
              />
              {isWeekend && (
                <p className="text-xs text-amber-400 mt-2">Weekend pricing applied</p>
              )}
            </div>

            {/* Time Selection */}
            <div className="glass-card rounded-2xl p-4 mb-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
                <Clock className="w-4 h-4 text-emerald-400" />
                Select Time
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Start Time</label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-white/5 rounded-xl px-3 py-2.5 outline-none text-sm text-white border border-white/10"
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t} className="bg-gray-900">{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">End Time</label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-white/5 rounded-xl px-3 py-2.5 outline-none text-sm text-white border border-white/10"
                  >
                    {timeSlots.filter((t) => t > startTime).map((t) => (
                      <option key={t} value={t} className="bg-gray-900">{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Availability Check */}
            {availability && (
              <div className={`rounded-2xl p-4 mb-4 flex items-center gap-2 ${
                availability.available ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"
              }`}>
                {availability.available ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-sm text-emerald-300">Slot is available! Proceed to book.</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">This slot is already booked. Please select another time.</p>
                  </>
                )}
              </div>
            )}

            {/* Price Summary */}
            <div className="glass-card rounded-2xl p-4 mb-4">
              <h3 className="font-semibold mb-3 text-white">Price Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">&#8377;{hourlyRate} x {totalHours} hours</span>
                  <span className="font-medium text-white">&#8377;{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform fee</span>
                  <span className="font-medium text-emerald-400">FREE</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-emerald-400">&#8377;{totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="glass-card rounded-2xl p-4 mb-4">
              <h3 className="font-semibold mb-3 text-white">Special Requests</h3>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requirements..."
                className="w-full bg-white/5 rounded-xl px-4 py-3 outline-none text-sm resize-none h-24 text-white placeholder:text-gray-500 border border-white/10"
              />
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={!availability?.available || createBooking.isPending}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {createBooking.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* STEP 2: Payment */}
        {(paymentStep === "payment" || paymentStep === "processing") && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {/* Booking Summary */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 text-emerald-300 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Booking #{createBooking.data?.bookingId}</span>
              </div>
              <div className="text-sm text-emerald-400/70">
                <p>{room.title}</p>
                <p>{selectedDate} | {startTime} - {endTime} ({totalHours} hrs)</p>
              </div>
            </div>

            {/* Total */}
            <div className="glass-card rounded-2xl p-4 mb-4 text-center">
              <p className="text-sm text-gray-400">Total Amount</p>
              <p className="text-3xl font-bold text-white">&#8377;{totalPrice}</p>
            </div>

            {/* Payment Methods */}
            {paymentStep === "payment" && (
              <>
                <div className="glass-card rounded-2xl p-4 mb-4">
                  <h3 className="font-semibold mb-3 text-white">Select Payment Method</h3>
                  <div className="space-y-2">
                    {[
                      { id: "upi" as const, icon: <Wallet className="w-5 h-5 text-emerald-400" />, title: "UPI", desc: "Google Pay, PhonePe, Paytm" },
                      { id: "card" as const, icon: <Building2 className="w-5 h-5 text-blue-400" />, title: "Card", desc: "Credit/Debit Card" },
                      { id: "wallet" as const, icon: <CreditCard className="w-5 h-5 text-purple-400" />, title: "Wallet", desc: "Razorpay Wallet" },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          paymentMethod === method.id
                            ? "border-emerald-500/50 bg-emerald-500/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        {method.icon}
                        <div className="text-left">
                          <p className="text-sm font-medium text-white">{method.title}</p>
                          <p className="text-xs text-gray-400">{method.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handlePayNow}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Sparkles className="w-5 h-5" />
                  Pay &#8377;{totalPrice}
                </button>
              </>
            )}

            {paymentStep === "processing" && (
              <div className="glass-card rounded-2xl p-8 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Processing Payment</h3>
                <p className="text-sm text-gray-400">Please do not close or refresh this page</p>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 3: Success */}
        {paymentStep === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
            <p className="text-gray-400 mb-6">
              Your booking <span className="font-bold text-emerald-400">#{createBooking.data?.bookingId}</span> is confirmed
            </p>

            <div className="glass-card rounded-2xl p-5 text-left mb-6">
              <h3 className="font-semibold mb-3 text-white">Booking Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Studio</span>
                  <span className="font-medium text-white">{room.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date</span>
                  <span className="font-medium text-white">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time</span>
                  <span className="font-medium text-white">{startTime} - {endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration</span>
                  <span className="font-medium text-white">{totalHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount Paid</span>
                  <span className="font-bold text-emerald-400">&#8377;{totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/my-bookings")}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-2xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 bg-white/10 text-white py-3 rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/10"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
