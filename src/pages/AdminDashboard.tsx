import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  Home,
  CalendarCheck,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Crown,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "rooms" | "users">("overview");

  const { data: dashboard } = trpc.mongoAdmin.dashboard.useQuery(undefined, { enabled: user?.role === "admin" });
  const { data: allBookings } = trpc.mongoBooking.all.useQuery(undefined, { enabled: user?.role === "admin" });
  const { data: allRooms } = trpc.mongoRoom.list.useQuery({});
  const { data: allUsers } = trpc.mongoAdmin.users.useQuery(undefined, { enabled: user?.role === "admin" });

  const approveRoom = trpc.mongoAdmin.approveRoom.useMutation({
    onSuccess: () => utils.mongoRoom.list.invalidate(),
  });
  const rejectRoom = trpc.mongoAdmin.rejectRoom.useMutation({
    onSuccess: () => utils.mongoRoom.list.invalidate(),
  });
  const updateBooking = trpc.mongoBooking.updateStatus.useMutation({
    onSuccess: () => utils.mongoBooking.all.invalidate(),
  });

  const utils = trpc.useUtils();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-dark text-white flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
          <button onClick={() => navigate("/")} className="text-emerald-400 hover:underline">
            Go back home
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats;

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "bookings" as const, label: "Bookings", icon: <CalendarCheck className="w-4 h-4" /> },
    { id: "rooms" as const, label: "Rooms", icon: <Home className="w-4 h-4" /> },
    { id: "users" as const, label: "Users", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark text-white pb-20">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <p className="text-xs text-gray-400">SNAPFOREST Management</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Users", value: stats?.totalUsers ?? 0, icon: <Users className="w-5 h-5 text-blue-400" />, color: "from-blue-500/20 to-blue-600/20" },
                { label: "Total Rooms", value: stats?.totalRooms ?? 0, icon: <Home className="w-5 h-5 text-emerald-400" />, color: "from-emerald-500/20 to-emerald-600/20" },
                { label: "Total Bookings", value: stats?.totalBookings ?? 0, icon: <CalendarCheck className="w-5 h-5 text-purple-400" />, color: "from-purple-500/20 to-purple-600/20" },
                { label: "Total Revenue", value: `₹${stats?.totalRevenue ?? 0}`, icon: <DollarSign className="w-5 h-5 text-amber-400" />, color: "from-amber-500/20 to-amber-600/20" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`glass-card rounded-2xl p-4 bg-gradient-to-br ${stat.color} border-white/5`}
                >
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-3">
                    {stat.icon}
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Active Rooms", value: stats?.activeRooms ?? 0, color: "text-emerald-400" },
                { label: "Pending Rooms", value: stats?.pendingRooms ?? 0, color: "text-amber-400" },
                { label: "Pending Approvals", value: stats?.pendingApprovals ?? 0, color: "text-rose-400" },
                { label: "Today's Revenue", value: `₹${stats?.todayRevenue ?? 0}`, color: "text-teal-400" },
              ].map((stat, i) => (
                <div key={i} className="glass-card rounded-2xl p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bookings */}
        {activeTab === "bookings" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {allBookings?.map((booking) => (
              <div key={booking.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold text-sm text-white">#{booking.bookingId}</p>
                    <p className="text-xs text-gray-400">{booking.room?.title}</p>
                    <p className="text-xs text-gray-500">{String(booking.bookingDate)} | {booking.startTime}-{booking.endTime}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      booking.bookingStatus === "confirmed" ? "text-emerald-400 bg-emerald-400/10" :
                      booking.bookingStatus === "pending" ? "text-amber-400 bg-amber-400/10" :
                      booking.bookingStatus === "cancelled" ? "text-red-400 bg-red-400/10" :
                      "text-blue-400 bg-blue-400/10"
                    }`}>
                      {booking.bookingStatus.toUpperCase()}
                    </span>
                    <select
                      onChange={(e) => updateBooking.mutate({ id: booking.id, bookingStatus: e.target.value as any })}
                      className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white outline-none"
                    >
                      <option value="pending" className="bg-gray-900">Pending</option>
                      <option value="confirmed" className="bg-gray-900">Confirm</option>
                      <option value="completed" className="bg-gray-900">Complete</option>
                      <option value="cancelled" className="bg-gray-900">Cancel</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Rooms */}
        {activeTab === "rooms" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {allRooms?.map((room) => (
              <div key={room.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={room.featuredImage || ""}
                    alt={room.title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800"; }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-white">{room.title}</p>
                    <p className="text-xs text-gray-400">{room.city} | ₹{room.pricePerHour}/hr</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      room.status === "active" ? "text-emerald-400 bg-emerald-400/10" :
                      room.status === "pending" ? "text-amber-400 bg-amber-400/10" :
                      "text-red-400 bg-red-400/10"
                    }`}>
                      {room.status.toUpperCase()}
                    </span>
                    {room.status === "pending" && (
                      <>
                        <button
                          onClick={() => approveRoom.mutate({ id: room.id })}
                          className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => rejectRoom.mutate({ id: room.id })}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {allUsers?.map((u) => (
              <div key={u.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {u.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">{u.name || "User"}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      u.role === "admin" ? "text-red-400 bg-red-400/10" : "text-gray-400 bg-gray-400/10"
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
