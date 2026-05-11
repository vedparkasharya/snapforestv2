import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const adminLoginMutation = trpc.mongoAuth.adminLogin.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("snapforest_token", data.token);
      window.location.href = "/admin";
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    adminLoginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-red-500/10 rounded-full mix-blend-screen filter blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-orange-500/10 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative max-w-md w-full mx-4">
        <button
          onClick={() => navigate("/")}
          className="absolute -top-16 left-0 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 border border-red-500/20"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-1">
              <span className="text-red-400">Admin</span> Access
            </h1>
            <p className="text-sm text-gray-400">Secure admin portal</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Admin Email</label>
              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus-within:border-red-400/50 transition-colors">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="email"
                  placeholder="admin@snapforest.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent outline-none text-white w-full text-sm placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Password</label>
              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus-within:border-red-400/50 transition-colors">
                <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent outline-none text-white w-full text-sm placeholder:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={adminLoginMutation.isPending}
              className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white py-4 rounded-2xl font-bold hover:from-red-600 hover:to-orange-700 transition-all shadow-lg shadow-red-500/25 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {adminLoginMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Admin Login
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1 mx-auto"
            >
              <Sparkles className="w-3 h-3" />
              User Login
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
