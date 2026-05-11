import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  ChevronLeft,
  Home,
  Plus,
  DollarSign,
  Users,
  Star,
  Loader2,
  X,
} from "lucide-react";

const categories = [
  "podcast", "gaming", "reel_studio", "rgb_room", "music", "dance", "photography", "meeting",
] as const;

export default function HostDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: myRooms, isLoading, refetch } = trpc.mongoRoom.myRooms.useQuery(undefined, { enabled: !!user });

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "podcast" as typeof categories[number],
    city: "",
    address: "",
    pricePerHour: "",
    weekendPrice: "",
    maxGuests: 5,
    amenities: "",
    rules: "",
    equipment: "",
    lightingSetup: "",
    featuredImage: "",
  });

  const createRoom = trpc.mongoRoom.create.useMutation({
    onSuccess: () => {
      setShowAddForm(false);
      setForm({
        title: "",
        description: "",
        category: "podcast",
        city: "",
        address: "",
        pricePerHour: "",
        weekendPrice: "",
        maxGuests: 5,
        amenities: "",
        rules: "",
        equipment: "",
        lightingSetup: "",
        featuredImage: "",
      });
      refetch();
    },
  });

  const handleSubmit = () => {
    if (!form.title || !form.city || !form.address || !form.pricePerHour) return;
    createRoom.mutate({
      ...form,
      amenities: form.amenities ? JSON.stringify(form.amenities.split(",").map((a) => a.trim())) : undefined,
      rules: form.rules ? JSON.stringify(form.rules.split(",").map((r) => r.trim())) : undefined,
      equipment: form.equipment ? JSON.stringify(form.equipment.split(",").map((e) => e.trim())) : undefined,
      lightingSetup: form.lightingSetup ? JSON.stringify(form.lightingSetup.split(",").map((l) => l.trim())) : undefined,
    });
  };

  const totalEarnings = myRooms?.reduce((sum, room) => sum + Number(room.pricePerHour), 0) || 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-dark text-white flex items-center justify-center">
        <div className="text-center">
          <Home className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Login Required</h2>
          <button onClick={() => navigate("/login")} className="text-emerald-400 hover:underline">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white pb-20">
      <div className="bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Host Dashboard</h1>
            <p className="text-xs text-gray-400">Manage your studios</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glass-card rounded-2xl p-4 text-center">
            <Home className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{myRooms?.length || 0}</p>
            <p className="text-xs text-gray-400">My Rooms</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <DollarSign className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">₹{totalEarnings}</p>
            <p className="text-xs text-gray-400">Total Earnings</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{myRooms?.reduce((sum, r) => sum + r.reviewCount, 0) || 0}</p>
            <p className="text-xs text-gray-400">Reviews</p>
          </div>
        </div>

        {/* Add Room Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          Add New Studio
        </button>

        {/* Add Room Form */}
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6">
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold mb-4 text-white">New Studio Listing</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Studio Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="bg-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-white placeholder:text-gray-500 border border-white/10"
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as typeof categories[number] })}
                  className="bg-white/5 rounded-xl px-4 py-2.5 text-sm outline-none text-white border border-white/10"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-gray-900">{c.replace("_", " ")}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="bg-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-white placeholder:text-gray-500 border border-white/10"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="bg-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-white placeholder:text-gray-500 border border-white/10"
                />
                <input
                  type="text"
                  placeholder="Price per hour (₹)"
                  value={form.pricePerHour}
                  onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
                  className="bg-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-white placeholder:text-gray-500 border border-white/10"
                />
                <input
                  type="text"
                  placeholder="Weekend price (₹)"
                  value={form.weekendPrice}
                  onChange={(e) => setForm({ ...form, weekendPrice: e.target.value })}
                  className="bg-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-white placeholder:text-gray-500 border border-white/10"
                />
                <input
                  type="text"
                  placeholder="Amenities (comma separated)"
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  className="bg-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-white placeholder:text-gray-500 border border-white/10 sm:col-span-2"
                />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="bg-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-white placeholder:text-gray-500 border border-white/10 sm:col-span-2 h-20 resize-none"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleSubmit} className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-600 transition-all">
                  Submit for Approval
                </button>
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2.5 bg-white/5 rounded-xl text-gray-400 hover:bg-white/10 border border-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* My Rooms */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : !myRooms || myRooms.length === 0 ? (
          <div className="text-center py-10">
            <Home className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No rooms listed yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myRooms.map((room) => (
              <div key={room.id} className="glass-card rounded-2xl p-4 flex gap-4">
                <img
                  src={room.featuredImage || ""}
                  alt={room.title}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800"; }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{room.title}</h3>
                  <p className="text-xs text-gray-400">{room.city} | ₹{room.pricePerHour}/hr</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      room.status === "active" ? "text-emerald-400 bg-emerald-400/10" :
                      room.status === "pending" ? "text-amber-400 bg-amber-400/10" :
                      "text-red-400 bg-red-400/10"
                    }`}>
                      {room.status.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {room.rating}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
