import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  Mic,
  Gamepad2,
  Video,
  Monitor,
  Music,
  PartyPopper,
  Camera,
  Users,
  Star,
  MapPin,
  Clock,
  User,
  CalendarCheck,
  Home as HomeIcon,
  Compass,
  LogIn,
  Shield,
  Sparkles,
  Zap,
  Heart,
  Quote,
  ChevronRight,
  Play,
  TrendingUp,
  Award,
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  podcast: <Mic className="w-6 h-6" />,
  gaming: <Gamepad2 className="w-6 h-6" />,
  reel_studio: <Video className="w-6 h-6" />,
  rgb_room: <Monitor className="w-6 h-6" />,
  music: <Music className="w-6 h-6" />,
  dance: <PartyPopper className="w-6 h-6" />,
  photography: <Camera className="w-6 h-6" />,
  meeting: <Users className="w-6 h-6" />,
};

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

const testimonials = [
  {
    name: "Rahul Kumar",
    role: "Podcast Host",
    avatar: "RK",
    text: "SNAPFOREST transformed my podcast production. The studio quality is unreal for the price. Booked 20+ sessions already!",
    rating: 5,
    studio: "Premium Podcast Studio",
  },
  {
    name: "Priya Singh",
    role: "Content Creator",
    avatar: "PS",
    text: "The reel studio is a game changer. Ring lights, backdrops, everything setup perfectly. My Reels engagement went up 3x!",
    rating: 5,
    studio: "Reel Studio Deluxe",
  },
  {
    name: "Amit Sharma",
    role: "Esports Organizer",
    avatar: "AS",
    text: "Hosted our gaming tournament here. 10 stations, streaming setup, everything worked flawlessly. Will book again!",
    rating: 5,
    studio: "Esports Tournament Arena",
  },
  {
    name: "Neha Gupta",
    role: "Music Producer",
    avatar: "NG",
    text: "The music studio has incredible acoustics. Recorded my entire EP here. Equipment is top-notch and well maintained.",
    rating: 5,
    studio: "Music Recording Studio",
  },
];

const featuredCreators = [
  { name: "TechBurner", category: "Tech Creator", followers: "12M+", icon: <Zap className="w-5 h-5" /> },
  { name: "CarryMinati", category: "Gaming", followers: "41M+", icon: <Gamepad2 className="w-5 h-5" /> },
  { name: "BeerBiceps", category: "Podcast", followers: "8M+", icon: <Mic className="w-5 h-5" /> },
  { name: "Niharika NM", category: "Reels", followers: "5M+", icon: <Video className="w-5 h-5" /> },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchCity, setSearchCity] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const { data: trendingRooms, isLoading: roomsLoading } = trpc.mongoRoom.trending.useQuery();
  const { data: categories } = trpc.mongoRoom.categories.useQuery();
  const seedMutation = trpc.mongoSeed.run.useMutation();

  useEffect(() => {
    seedMutation.mutate();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCity) params.set("city", searchCity);
    if (searchCategory) params.set("category", searchCategory);
    navigate(`/rooms?${params.toString()}`);
  };

  const handleCategoryClick = (catId: string) => {
    navigate(`/rooms?category=${catId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white pb-20">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              SNAP<span className="text-emerald-400">FOREST</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Admin"
              >
                <Shield className="w-5 h-5 text-gray-300" />
              </button>
            )}
            {user ? (
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium hidden sm:block">{user.name}</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: "4s" }} />
        </div>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: "60px 60px" }} />

        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="text-sm font-medium text-emerald-100">The OYO for Content Creators</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Book Creator Studios
            <br />
            <span className="text-gradient">By The Hour</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-emerald-100/80 max-w-2xl mx-auto mb-10"
          >
            Podcast rooms, gaming arenas, reel studios & RGB rooms —
            <br className="hidden sm:block" />
            Premium creator spaces starting at ₹249/hour
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="glass rounded-2xl p-2 shadow-2xl shadow-black/20">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus-within:border-emerald-400/50 transition-colors">
                  <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter city (e.g., Patna)"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="bg-transparent outline-none text-white w-full text-sm placeholder:text-gray-400"
                  />
                </div>
                <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus-within:border-emerald-400/50 transition-colors">
                  <Search className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="bg-transparent outline-none text-white w-full text-sm appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-gray-900">All Categories</option>
                    <option value="podcast" className="bg-gray-900">Podcast Rooms</option>
                    <option value="gaming" className="bg-gray-900">Gaming Rooms</option>
                    <option value="reel_studio" className="bg-gray-900">Reel Studios</option>
                    <option value="rgb_room" className="bg-gray-900">RGB Rooms</option>
                    <option value="music" className="bg-gray-900">Music Studios</option>
                    <option value="dance" className="bg-gray-900">Dance Studios</option>
                    <option value="photography" className="bg-gray-900">Photography</option>
                    <option value="meeting" className="bg-gray-900">Meeting Rooms</option>
                  </select>
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-8 sm:gap-12 mt-10"
          >
            {[
              { value: "10+", label: "Studio Types" },
              { value: "50+", label: "Creator Rooms" },
              { value: "1000+", label: "Happy Creators" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs sm:text-sm text-emerald-200/60">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold mb-3">Browse by Category</h2>
          <p className="text-gray-400">Find the perfect space for your creative needs</p>
        </motion.div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
          {categories?.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => handleCategoryClick(cat.id)}
              className="group flex flex-col items-center gap-3 p-4"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${categoryColors[cat.id] || "from-gray-500 to-slate-600"} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {categoryIcons[cat.id] || <Star className="w-6 h-6" />}
              </div>
              <span className="text-xs font-medium text-gray-300 text-center leading-tight group-hover:text-white transition-colors">
                {cat.name}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Trending Rooms */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold mb-1">Trending Studios</h2>
            <p className="text-gray-400 text-sm">Most booked creator spaces this week</p>
          </div>
          <button
            onClick={() => navigate("/rooms")}
            className="flex items-center gap-1 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>

        {roomsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 rounded-2xl h-80 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingRooms?.map((room, i) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
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
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                      <span className="text-xl font-bold text-emerald-400">&#8377;{room.pricePerHour}</span>
                      <span className="text-xs text-gray-400">/hour</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-xs">{room.maxGuests}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Creators */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold mb-3">Trusted by Top Creators</h2>
          <p className="text-gray-400">India's biggest creators book their studios on SNAPFOREST</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {featuredCreators.map((creator, i) => (
            <motion.div
              key={creator.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-5 text-center hover:shadow-emerald-500/10 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                {creator.icon}
              </div>
              <h3 className="font-semibold text-white mb-1">{creator.name}</h3>
              <p className="text-xs text-gray-400 mb-2">{creator.category}</p>
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">{creator.followers}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold mb-3">What Creators Say</h2>
          <p className="text-gray-400">Real reviews from real creators</p>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="glass-card rounded-3xl p-8 text-center"
            >
              <Quote className="w-10 h-10 text-emerald-400/40 mx-auto mb-4" />
              <p className="text-lg text-gray-200 mb-6 leading-relaxed italic">
                "{testimonials[activeTestimonial].text}"
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">{testimonials[activeTestimonial].name}</p>
                  <p className="text-xs text-gray-400">{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
              <div className="flex justify-center gap-1 mt-4">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeTestimonial === i ? "bg-emerald-400 w-8" : "bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Creator Vibes / Why Choose */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold mb-3">Why SNAPFOREST?</h2>
          <p className="text-gray-400">Everything you need to create amazing content</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: <Clock className="w-8 h-8 text-emerald-400" />, title: "Book by Hour", desc: "Flexible hourly bookings. Pay only for the time you need. No long-term commitments." },
            { icon: <Award className="w-8 h-8 text-amber-400" />, title: "Verified Studios", desc: "Every studio is personally verified. Real photos, real equipment, real reviews." },
            { icon: <Shield className="w-8 h-8 text-blue-400" />, title: "Secure Payments", desc: "End-to-end encrypted payments with instant booking confirmation and free cancellation." },
            { icon: <Zap className="w-8 h-8 text-purple-400" />, title: "Instant Setup", desc: "Walk in and start creating. All equipment is pre-configured and ready to use." },
            { icon: <Heart className="w-8 h-8 text-rose-400" />, title: "Creator Community", desc: "Join 1000+ creators. Network, collaborate, and grow together." },
            { icon: <Play className="w-8 h-8 text-cyan-400" />, title: "Start Creating", desc: "From podcasting to gaming, find your perfect creative space in minutes." },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 hover:shadow-emerald-500/10 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2 text-lg">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 p-10 sm:p-16 text-center"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Create?</h2>
            <p className="text-emerald-100 mb-8 max-w-lg mx-auto">Book your first studio session today and join India's fastest growing creator community.</p>
            <button
              onClick={() => navigate("/rooms")}
              className="bg-white text-emerald-700 px-8 py-4 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-xl inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Explore Studios
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-10 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">SNAP<span className="text-emerald-400">FOREST</span></span>
          </div>
          <p className="text-sm text-gray-500">© 2025 SNAPFOREST. The OYO for Content Creators.</p>
        </div>
      </footer>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 sm:hidden">
        <div className="flex items-center justify-around py-2">
          <button onClick={() => navigate("/")} className="flex flex-col items-center gap-0.5 px-4 py-1 text-emerald-400">
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button onClick={() => navigate("/rooms")} className="flex flex-col items-center gap-0.5 px-4 py-1 text-gray-400">
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
