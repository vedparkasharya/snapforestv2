import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  ChevronLeft,
  Star,
  MapPin,
  Users,
  CheckCircle,
  ChevronRight,
  Share2,
  Heart,
  Calendar,
  Shield,
  X,
  Wifi,
  Wind,
  Monitor,
  Sparkles,
  Eye,
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

export default function RoomDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const roomId = id || "";
  const { user } = useAuth();
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [liked, setLiked] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: room, isLoading } = trpc.mongoRoom.byId.useQuery({ id: roomId });
  const { data: reviews } = trpc.mongoReview.byRoom.useQuery({ roomId: roomId });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <div className="h-72 sm:h-96 bg-white/5 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="h-8 bg-white/5 rounded w-2/3 mb-4 animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-1/3 mb-6 animate-pulse" />
          <div className="h-32 bg-white/5 rounded mb-4 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-white">Room not found</h2>
          <button onClick={() => navigate("/rooms")} className="text-emerald-400 hover:text-emerald-300">
            Browse all rooms
          </button>
        </div>
      </div>
    );
  }

  const images = room.images ? JSON.parse(room.images) : [room.featuredImage];
  const amenities = room.amenities ? JSON.parse(room.amenities) : [];
  const rules = room.rules ? JSON.parse(room.rules) : [];
  const equipment = room.equipment ? JSON.parse(room.equipment) : [];
  const lightingSetup = room.lightingSetup ? JSON.parse(room.lightingSetup) : [];

  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % images.length);
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-gradient-dark text-white pb-24">
      {/* Photo Gallery */}
      <div className="relative">
        <div className="h-64 sm:h-[500px] overflow-hidden">
          <img
            src={images[currentPhotoIndex] || room.featuredImage}
            alt={room.title}
            className="w-full h-full object-cover"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>

        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setLiked(!liked)}
              className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-rose-500 text-rose-500" : "text-white"}`} />
            </button>
            <button className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
              <Share2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Photo Navigation Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_: string, i: number) => (
              <button
                key={i}
                onClick={() => setCurrentPhotoIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentPhotoIndex ? "w-6 bg-emerald-400" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Photo Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Show All Photos */}
        {images.length > 1 && (
          <button
            onClick={() => setShowAllPhotos(true)}
            className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-black/80 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>All {images.length} photos</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${categoryColors[room.category] || "from-gray-600 to-slate-700"} text-white`}>
                  {room.category.replace("_", " ")}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium">{room.rating}</span>
                  <span className="text-sm text-gray-400">({room.reviewCount} reviews)</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{room.title}</h1>
              <div className="flex items-center gap-1 text-gray-400 mb-6">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-sm">{room.address}</span>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-4 py-5 border-y border-white/10 mb-6"
            >
              {[
                { icon: <Users className="w-5 h-5 text-emerald-400" />, value: `${room.maxGuests} guests`, label: "Max capacity" },
                { icon: <Calendar className="w-5 h-5 text-emerald-400" />, value: "Hourly", label: "Flexible booking" },
                { icon: <Shield className="w-5 h-5 text-emerald-400" />, value: "Verified", label: "Studio quality" },
                { icon: <Wifi className="w-5 h-5 text-emerald-400" />, value: "High-speed", label: "WiFi included" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  {stat.icon}
                  <div>
                    <p className="text-sm font-medium text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6"
            >
              <h2 className="text-lg font-bold mb-3 text-white">About this studio</h2>
              <p className="text-gray-300 leading-relaxed">{room.description}</p>
            </motion.div>

            {/* Equipment */}
            {equipment.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="mb-6"
              >
                <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-emerald-400" />
                  Equipment
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {equipment.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Lighting Setup */}
            {lightingSetup.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.17 }}
                className="mb-6"
              >
                <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Lighting Setup
                </h2>
                <div className="flex flex-wrap gap-2">
                  {lightingSetup.map((item: string, i: number) => (
                    <span key={i} className="text-sm bg-amber-500/10 text-amber-300 px-3 py-1.5 rounded-full border border-amber-500/20">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <h2 className="text-lg font-bold mb-3 text-white">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenities.map((amenity: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{amenity}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Rules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-6"
            >
              <h2 className="text-lg font-bold mb-3 text-white">Studio Rules</h2>
              <div className="space-y-2">
                {rules.map((rule: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-400">{rule}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-bold mb-4 text-white">Reviews ({reviews?.length || 0})</h2>
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 4).map((review) => (
                    <div key={review.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {review.user?.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-white">{review.user?.name || "User"}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-300">{review.comment}</p>
                      )}
                      {review.cleanliness && (
                        <div className="flex gap-3 mt-3 pt-3 border-t border-white/5">
                          <span className="text-xs text-gray-500">Cleanliness: {review.cleanliness}/5</span>
                          <span className="text-xs text-gray-500">Lighting: {review.lighting}/5</span>
                          <span className="text-xs text-gray-500">Setup: {review.setupQuality}/5</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No reviews yet</p>
              )}
            </motion.div>
          </div>

          {/* Right Column - Booking Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 glass-card rounded-2xl p-6">
              <div className="mb-5">
                <span className="text-3xl font-bold text-emerald-400">&#8377;{room.pricePerHour}</span>
                <span className="text-gray-400 text-sm"> / hour</span>
              </div>
              {room.weekendPrice && (
                <p className="text-xs text-gray-400 mb-5">
                  Weekend: &#8377;{room.weekendPrice}/hour
                </p>
              )}

              {/* 360 Viewer Button */}
              <button
                onClick={() => navigate(`/rooms/${room.id}/360`)}
                className="w-full mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
              >
                <Eye className="w-5 h-5" />
                Explore in 360°
              </button>

              <button
                onClick={() => {
                  if (!user) {
                    navigate("/login");
                    return;
                  }
                  navigate(`/booking/${room.id}`);
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Book Now
              </button>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Free cancellation within 24h</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Instant booking confirmation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Wind className="w-4 h-4 text-emerald-400" />
                  <span>Fully sanitized before each session</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky Book Button (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-4 z-50 sm:hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-emerald-400">&#8377;{room.pricePerHour}</span>
            <span className="text-sm text-gray-400"> / hour</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/rooms/${room.id}/360`)}
              className="bg-purple-600 text-white px-4 py-3 rounded-xl"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (!user) { navigate("/login"); return; }
                navigate(`/booking/${room.id}`);
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      <AnimatePresence>
        {showAllPhotos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black"
          >
            <div className="flex items-center justify-between p-4">
              <h3 className="text-white font-semibold">All Photos ({images.length})</h3>
              <button onClick={() => setShowAllPhotos(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="overflow-y-auto h-full pb-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4">
                {images.map((img: string, i: number) => (
                  <motion.img
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    src={img}
                    alt={`${room.title} ${i + 1}`}
                    className="w-full rounded-xl object-cover"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800"; }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
