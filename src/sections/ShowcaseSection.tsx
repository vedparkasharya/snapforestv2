import { motion } from 'framer-motion';
import { Heart, Eye } from 'lucide-react';

const showcaseImages = [
  {
    src: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&h=600&fit=crop',
    title: 'Ethereal Forest',
    author: 'Sarah Chen',
    likes: 234,
    views: 1.2,
  },
  {
    src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop',
    title: 'Abstract Dreams',
    author: 'Mike Ross',
    likes: 189,
    views: 0.9,
  },
  {
    src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&h=600&fit=crop',
    title: 'Golden Sunset',
    author: 'Emma Wilson',
    likes: 456,
    views: 2.1,
  },
  {
    src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=600&fit=crop',
    title: 'Ocean Waves',
    author: 'Alex Kim',
    likes: 312,
    views: 1.5,
  },
  {
    src: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&h=600&fit=crop',
    title: 'Neon City',
    author: 'Lisa Park',
    likes: 567,
    views: 3.2,
  },
  {
    src: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&h=600&fit=crop',
    title: 'Cosmic Journey',
    author: 'Tom Brown',
    likes: 445,
    views: 2.8,
  },
];

export default function ShowcaseSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-emerald-400 font-medium text-sm uppercase tracking-wider">
            Gallery
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4">
            Community{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Showcase
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore amazing creations from our community of artists and creators.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {showcaseImages.map((image, index) => (
            <motion.div
              key={image.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white font-semibold text-lg mb-1">{image.title}</h3>
                <p className="text-white/70 text-sm mb-3">by {image.author}</p>
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {image.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {image.views}k
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
