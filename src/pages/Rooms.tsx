import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  Star,
  MapPin,
  Users,
  SlidersHorizontal,
  X,
  ChevronLeft,
  User,
  Compass,
  Home as HomeIcon,
  CalendarCheck,
  ArrowUpDown,
} from "lucide-react";

const categoryColors: Record<string, string> = {
  podcast: "from-purple-500 to-indigo-600",
  gaming: "from-emerald-500 to-teal-600",
  reel_studio: "from-rose-500 to-pink-600",
  rgb_room: "from-amber-500 to-orange-600",
  music: "from-blue-500 to-cyan-600",
  dance: "from-pink-500 to-rose-500",
  photography: "from-cyan-500 to-blue-500",
  meeting: "from-gray-500 to-slate-600",
};

export default function Rooms() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCity = searchParams.get("city") || "";
  const initialCategory = searchParams.get("category") || "";

  const [city, setCity] = useState(initialCity);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  const { data: rooms, isLoading } = trpc.mongoRoom.list.useQuery({
    city: city || undefined,
    category: category || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    search: search || undefined,
  });

  const sortedRooms = useMemo(() => {
    if (!rooms) return [];
    const sorted = [...rooms];
    if (sortBy === "rating") sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
    if (sortBy === "price_low") sorted.sort((a, b) => Number(a.pricePerHour) - Number(b.pricePerHour));
    if (sortBy === "price_high") sorted.sort((a, b) => Number(b.pricePerHour) - Number(a.pricePerHour));
    return sorted;
  }, [rooms, sortBy]);

  const clearFilters = () => {
    setCity("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10 focus-within:border-emerald-400/50 transition-colors">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search studios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm w-full text-white placeholder:text-gray-500"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-white/10 rounded-lg relative transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {(category || minPrice || maxPrice) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full" />
              )}
            </button>
          </div>

          {/* Quick Category Chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            {["podcast", "gaming", "reel_studio", "rgb_room", "music", "dance", "photography", "meeting"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(category === cat ? "" : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  category === cat
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-black/60 backdrop-blur-xl border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">City</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-white placeholder:text-gray-500 border border-white/10"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">Min Price (&#8377;/hr)</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-white placeholder:text-gray-500 border border-white/10"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">Max Price (&#8377;/hr)</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-white placeholder:text-gray-500 border border-white/10"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-teal-700"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-white/5 text-gray-400 rounded-lg text-sm font-medium hover:bg-white/10 border border-white/10"
              >
                Clear All
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sort & Results Count */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{sortedRooms.length} studios found</span>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 outline-none text-white"
            >
              <option value="rating" className="bg-gray-900">Top Rated</option>
              <option value="price_low" className="bg-gray-900">Price: Low to High</option>
              <option value="price_high" className="bg-gray-900">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room Cards */}
      <div className="max-w-7xl mx-auto px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/5 rounded-2xl h-96 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : sortedRooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No studios found</h3>
            <p className="text-sm text-gray-400 mb-6">Try adjusting your filters</p>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRooms.map((room, i) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => navigate(`/rooms/${room.id}`)}
                className="group glass-card rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={room.featuredImage || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800"}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 glass px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold">{room.rating}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-white font-medium">{room.city}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-white mb-2 line-clamp-1 group-hover:text-emerald-300 transition-colors">{room.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full bg-gradient-to-r ${categoryColors[room.category] || "from-gray-600 to-slate-700"} text-white`}>
                      {room.category.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-400">{room.reviewCount} reviews</span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">{room.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                      <span className="text-xl font-bold text-emerald-400">&#8377;{room.pricePerHour}</span>
                      <span className="text-xs text-gray-400">/hour</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-xs">{room.maxGuests}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 sm:hidden">
        <div className="flex items-center justify-around py-2">
          <button onClick={() => navigate("/")} className="flex flex-col items-center gap-0.5 px-4 py-1 text-gray-400">
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button onClick={() => navigate("/rooms")} className="flex flex-col items-center gap-0.5 px-4 py-1 text-emerald-400">
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-medium">Explore</span>
          </button>
          <button onClick={() => navigate("/my-bookings")} className="flex flex-col items-center gap-0.5 px-4 py-1 text-gray-400">
            <CalendarCheck className="w-5 h-5" />
            <span className="text-[10px] font-medium">Bookings</span>
          </button>
          <button onClick={() => navigate(user ? "/profile" : "/login")} className="flex flex-col items-center gap-0.5 px-4 py-1 text-gray-400">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
