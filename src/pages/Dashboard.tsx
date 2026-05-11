import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  User,
  Image,
  Sparkles,
  Crown,
  Zap,
  Trash2,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { images } from '@/lib/api';
import { useAuthContext } from '@/providers/AuthProvider';

interface UserImage {
  id: string;
  title: string;
  imageUrl: string;
  prompt: string;
  style: string;
  createdAt: string;
  likes: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
  const [myImages, setMyImages] = useState<UserImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMyImages();
  }, [isAuthenticated]);

  const fetchMyImages = async () => {
    try {
      setLoading(true);
      const response = await images.getMyImages(1, 12);
      setMyImages(response.data.images || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load your images');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await images.delete(id);
      setMyImages(prev => prev.filter(img => img.id !== id));
      toast.success('Image deleted');
    } catch (error) {
      toast.error('Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  const stats = [
    {
      label: 'Total Generations',
      value: user?.totalGenerations || 0,
      icon: Sparkles,
      color: 'from-emerald-400 to-teal-500'
    },
    {
      label: 'Remaining',
      value: typeof user?.generationsLeft === 'number' ? user.generationsLeft : '∞',
      icon: Zap,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      label: 'Saved Images',
      value: myImages.length,
      icon: Image,
      color: 'from-purple-400 to-pink-500'
    },
    {
      label: 'Plan',
      value: user?.isPremium ? 'Premium' : 'Free',
      icon: Crown,
      color: 'from-blue-400 to-cyan-500'
    },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{user?.name}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
            {user?.isPremium && (
              <span className="ml-auto px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-medium">
                Premium
              </span>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-2xl border bg-card"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <Link to="/generate" className="flex-1">
            <Button className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate New Image
            </Button>
          </Link>
          {!user?.isPremium && (
            <Link to="/pricing" className="flex-1">
              <Button variant="outline" className="w-full h-12">
                <Crown className="w-5 h-5 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
          )}
        </div>

        {/* My Images */}
        <div>
          <h2 className="text-xl font-bold mb-4">My Images</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
          ) : myImages.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border bg-card">
              <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No images yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start generating amazing AI art!
              </p>
              <Link to="/generate">
                <Button>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Your First Image
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {myImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative rounded-2xl overflow-hidden border bg-card"
                >
                  <div className="aspect-square">
                    <img
                      src={image.imageUrl}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 inset-x-0 p-3">
                      <p className="text-white text-sm font-medium line-clamp-1 mb-2">
                        {image.title}
                      </p>
                      <div className="flex gap-2">
                        <Link to={`/gallery/${image.id}`} className="flex-1">
                          <Button size="sm" variant="secondary" className="w-full">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(image.id)}
                          disabled={deletingId === image.id}
                        >
                          {deletingId === image.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Style Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 rounded-full bg-black/50 text-white text-xs backdrop-blur-sm capitalize">
                      {image.style}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
