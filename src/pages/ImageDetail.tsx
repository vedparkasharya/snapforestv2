import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Heart,
  Download,
  ArrowLeft,
  Share2,
  Loader2,
  User,
  Calendar,
  Sparkles
} from 'lucide-react';
import { gallery } from '@/lib/api';

interface ImageDetail {
  id: string;
  title: string;
  imageUrl: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  likes: number;
  downloads: number;
  createdAt: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export default function ImageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [image, setImage] = useState<ImageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);

  const fetchImage = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await gallery.getById(id);
      setImage(response.data.image);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load image');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImage();
  }, [id]);

  const handleLike = async () => {
    if (!id || isLiking) return;
    try {
      setIsLiking(true);
      await gallery.like(id);
      setImage(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      toast.success('Liked!');
    } catch (error) {
      toast.error('Failed to like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `${image.title.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.click();
    toast.success('Download started!');
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Image not found</h2>
        <Link to="/gallery">
          <Button>Back to Gallery</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl overflow-hidden border bg-card">
              <img
                src={image.imageUrl}
                alt={image.title}
                className="w-full h-auto"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleLike}
                disabled={isLiking}
                variant="outline"
                className="flex-1"
              >
                <Heart className="w-4 h-4 mr-2" />
                {image.likes} Likes
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl border bg-card">
              <h1 className="text-2xl font-bold mb-2">{image.title}</h1>
              
              {/* Author */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">{image.user?.name || 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(image.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Prompt */}
              <div className="mb-4">
                <label className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Prompt
                </label>
                <p className="text-sm bg-muted p-3 rounded-lg">{image.prompt}</p>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Style</span>
                  <span className="capitalize font-medium">{image.style}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Aspect Ratio</span>
                  <span className="font-medium">{image.aspectRatio}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Downloads</span>
                  <span className="font-medium">{image.downloads}</span>
                </div>
              </div>
            </div>

            {/* Similar Style */}
            <div className="p-6 rounded-2xl border bg-card">
              <h3 className="font-semibold mb-3">More in {image.style}</h3>
              <Link to={`/gallery?style=${image.style}`}>
                <Button variant="outline" className="w-full">
                  Browse {image.style} Collection
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
