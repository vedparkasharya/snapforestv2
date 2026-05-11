import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  ChevronLeft,
  Calendar,
  Clock,
  CreditCard,
  Loader2,
  AlertCircle,
  MapPin,
  XCircle,
  CheckCircle,
  Clock4,
  Ban,
} from "lucide-react";

export default function MyBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: bookings, isLoading, refetch } = trpc.mongoBooking.list.useQuery(undefined, {
    enabled: !!user,
  });

  const cancelMutation = trpc.mongoBooking.cancel.useMutation({
    onSuccess: () => refetch(),
  });

  const filteredBookings = bookings?.filter((b) => {
    if (statusFilter === "all") return true;
    return b.bookingStatus === statusFilter;
  });

  const statusConfig = {
    pending: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", icon: <Clock4 className="w-3.5 h-3.5" /> },
    confirmed: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: <CheckCircle className="w-3.5 h-3.5" /> },
    completed: { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", icon: <CheckCircle className="w-3.5 h-3.5" /> },
    cancelled: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", icon: <Ban className="w-3.5 h-3.5" /> },
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center text-white">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Login Required</h2>
          <button onClick={() => navigate("/login")} className="text-emerald-400 hover:underline">
            Login to view bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white pb-20">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">My Bookings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === s
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : !filteredBookings || filteredBookings.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No bookings found</h3>
            <p className="text-sm text-gray-400 mb-6">
              {statusFilter === "all" ? "You haven't made any bookings yet" : `No ${statusFilter} bookings`}
            </p>
            <button
              onClick={() => navigate("/rooms")}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all"
            >
              Explore Studios
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredBookings.map((booking, i) => {
                const config = statusConfig[booking.bookingStatus as keyof typeof statusConfig] || statusConfig.pending;
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-2xl p-5 hover:shadow-emerald-500/5 hover:shadow-xl transition-all"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={booking.room?.featuredImage || ""}
                          alt={booking.room?.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800"; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-white line-clamp-1">{booking.room?.title}</h3>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap flex items-center gap-1 ${config.color} ${config.bg} ${config.border}`}>
                            {config.icon}
                            {booking.bookingStatus.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-400">{booking.room?.city}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {String(booking.bookingDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-sm font-bold text-emerald-400">&#8377;{booking.totalPrice}</span>
                          </div>
                          {booking.bookingStatus === "pending" && (
                            <button
                              onClick={() => {
                                if (confirm("Are you sure you want to cancel this booking?")) {
                                  cancelMutation.mutate({ id: booking.id });
                                }
                              }}
                              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
