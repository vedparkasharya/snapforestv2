import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { toast } from 'sonner';
import {
  Heart,
  Loader2,
  Filter,
  Grid3X3,
  LayoutList
} from 'lucide-react';
import { gallery } from '@/lib/api';

interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
  prompt: string;
  style: string;
  likes: number;
  createdAt: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

const styleFilters = [
  { id: 'all', label: 'All' },
  { id: 'realistic', label: 'Realistic' },
  { id: 'artistic', label: 'Artistic' },
  { id: 'anime', label: 'Anime' },
  { id: 'watercolor', label: 'Watercolor' },
  { id: 'digital-art', label: 'Digital Art' },
];

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await gallery.getAll(1, 50, activeFilter === 'all' ? undefined : activeFilter);
      setImages(response.data.images || []);
    } catch (error) {
      console.error('Gallery fetch error:', error);
      toast.error('Failed to load gallery');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [activeFilter]);

  const handleLike = async (id: string) => {
    try {
      await gallery.like(id);
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, likes: img.likes + 1 } : img
      ));
      toast.success('Liked!');
    } catch (error) {
      toast.error('Failed to like');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              Community{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                Gallery
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover amazing AI-generated artwork from our community
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-emerald-500/10 text-emerald-400' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-emerald-500/10 text-emerald-400' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <LayoutList className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-8 overflow-x-auto pb-2"
        >
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {styleFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === filter.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : images.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
              <Grid3X3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No images yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to create and share amazing AI art!
            </p>
          </motion.div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative rounded-2xl overflow-hidden border bg-card hover:shadow-xl transition-all ${
                  viewMode === 'list' ? 'flex gap-4 p-4' : ''
                }`}
              >
                <Link to={`/gallery/${image.id}`} className={viewMode === 'list' ? 'flex gap-4 flex-1' : ''}>
                  <div className={`relative overflow-hidden ${
                    viewMode === 'list' 
                      ? 'w-32 h-32 rounded-xl flex-shrink-0' 
                      : 'aspect-square'
                  }`}>
                    <img
                      src={image.imageUrl}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className={viewMode === 'list' ? 'flex-1 py-1' : 'p-3'}>
                    <h3 className="font-medium text-sm mb-1 line-clamp-1">{image.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{image.prompt}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs capitalize">
                          {image.style}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleLike(image.id);
                          }}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5" />
                          {image.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
