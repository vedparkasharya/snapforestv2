import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  ChevronLeft,
  User,
  Mail,
  Shield,
  CalendarCheck,
  Home,
  Star,
  LogOut,
  Crown,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-dark text-white flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Not logged in</h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      icon: <CalendarCheck className="w-5 h-5 text-emerald-400" />,
      title: "My Bookings",
      desc: "View all your studio bookings",
      action: () => navigate("/my-bookings"),
    },
    ...(user.isHost ? [{
      icon: <Home className="w-5 h-5 text-blue-400" />,
      title: "Host Dashboard",
      desc: "Manage your studios",
      action: () => navigate("/host"),
    }] : []),
    ...(user.role === "admin" ? [{
      icon: <Shield className="w-5 h-5 text-red-400" />,
      title: "Admin Panel",
      desc: "Manage platform settings",
      action: () => navigate("/admin"),
    }] : []),
    {
      icon: <Star className="w-5 h-5 text-amber-400" />,
      title: "Become a Host",
      desc: "List your studio and earn",
      action: () => navigate("/host"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark text-white pb-20">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 mb-6 text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name || ""} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{user.name || "User"}</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-3">
            <Mail className="w-3.5 h-3.5" />
            <span>{user.email || "No email"}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            {user.role === "admin" && (
              <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                ADMIN
              </span>
            )}
            {user.isHost && (
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20 flex items-center gap-1">
                <Home className="w-3 h-3" />
                HOST
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              CREATOR
            </span>
          </div>
        </motion.div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="w-full flex items-center gap-4 p-4 glass-card rounded-2xl hover:shadow-emerald-500/5 hover:shadow-xl transition-all text-left group"
            >
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
            </button>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          ) : (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-sm text-red-300 mb-3 text-center">Are you sure you want to logout?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 bg-white/5 rounded-xl text-sm text-white hover:bg-white/10 transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={logout}
                  className="flex-1 py-2 bg-red-500 rounded-xl text-sm text-white hover:bg-red-600 transition-colors"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
