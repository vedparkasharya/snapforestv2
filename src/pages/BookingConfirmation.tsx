import { useNavigate, useParams } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Download,
  Share2,
  MessageCircle,
  Home,
  ArrowLeft,
} from "lucide-react";

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const bookingId = id || "";

  const { data: booking, isLoading } = trpc.mongoBooking.byId.useQuery({ id: bookingId });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Booking not found</h2>
          <button onClick={() => navigate("/my-bookings")} className="text-emerald-400 hover:underline">
            View all bookings
          </button>
        </div>
      </div>
    );
  }

  const handleWhatsAppShare = () => {
    const message = `Hi! I just booked ${booking.room?.title} on SNAPFOREST.\n\nBooking ID: ${booking.bookingId}\nDate: ${String(booking.bookingDate)}\nTime: ${booking.startTime} - ${booking.endTime}\nAmount: ₹${booking.totalPrice}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleDownloadReceipt = () => {
    const receiptContent = `
SNAPFOREST BOOKING RECEIPT
============================
Booking ID: ${booking.bookingId}
Studio: ${booking.room?.title}
Location: ${booking.room?.city}
Date: ${String(booking.bookingDate)}
Time: ${booking.startTime} - ${booking.endTime}
Duration: ${booking.totalHours} hours
Amount Paid: ₹${booking.totalPrice}
Payment Status: ${booking.paymentStatus}
Status: ${booking.bookingStatus}

Thank you for booking with SNAPFOREST!
The OYO for Content Creators
`;
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SNAPFOREST-${booking.bookingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddToCalendar = () => {
    const date = String(booking.bookingDate).replace(/-/g, "");
    const startTime = booking.startTime.replace(/:/g, "");
    const endTime = booking.endTime.replace(/:/g, "");
    const title = encodeURIComponent(`SNAPFOREST: ${booking.room?.title}`);
    const location = encodeURIComponent(booking.room?.address || "");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}T${startTime}00/${date}T${endTime}00&location=${location}&details=Booking+ID:+${booking.bookingId}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-gray-400">
            Your booking <span className="text-emerald-400 font-bold">#{booking.bookingId}</span> has been confirmed
          </p>
        </motion.div>

        {/* Booking Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl overflow-hidden mb-6"
        >
          <div className="h-48 overflow-hidden">
            <img
              src={booking.room?.featuredImage || ""}
              alt={booking.room?.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800"; }}
            />
          </div>
          <div className="p-5">
            <h2 className="text-xl font-bold mb-4">{booking.room?.title}</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-sm font-medium">{String(booking.bookingDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs text-gray-400">Time</p>
                  <p className="text-sm font-medium">{booking.startTime} - {booking.endTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-sm font-medium">{booking.room?.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs text-gray-400">Amount Paid</p>
                  <p className="text-lg font-bold text-emerald-400">&#8377;{booking.totalPrice}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center justify-center gap-2 bg-white/10 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition-all border border-white/10"
          >
            <Download className="w-4 h-4" />
            Receipt
          </button>
          <button
            onClick={handleAddToCalendar}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all"
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
          <button
            onClick={() => {
              const shareData = {
                title: `SNAPFOREST Booking: ${booking.room?.title}`,
                text: `I booked ${booking.room?.title} on SNAPFOREST!\nDate: ${String(booking.bookingDate)}\nTime: ${booking.startTime} - ${booking.endTime}`,
                url: window.location.href,
              };
              if (navigator.share) navigator.share(shareData);
            }}
            className="flex items-center justify-center gap-2 bg-white/10 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition-all border border-white/10"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate("/")}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </motion.button>
      </div>
    </div>
  );
}
