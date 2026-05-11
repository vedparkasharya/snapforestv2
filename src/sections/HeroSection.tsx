import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';

const floatingImages = [
  { src: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=400&fit=crop', className: 'top-10 left-[5%] w-20 h-20 lg:w-28 lg:h-28', delay: 0 },
  { src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop', className: 'top-20 right-[8%] w-24 h-24 lg:w-32 lg:h-32', delay: 0.2 },
  { src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&h=400&fit=crop', className: 'bottom-20 left-[10%] w-16 h-16 lg:w-24 lg:h-24', delay: 0.4 },
  { src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=400&fit=crop', className: 'bottom-32 right-[5%] w-20 h-20 lg:w-28 lg:h-28', delay: 0.6 },
  { src: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop', className: 'top-1/2 left-[2%] w-14 h-14 lg:w-20 lg:h-20', delay: 0.8 },
  { src: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&h=400&fit=crop', className: 'top-1/3 right-[2%] w-16 h-16 lg:w-22 lg:h-22', delay: 1.0 },
];

export default function HeroSection() {
  const { isAuthenticated } = useAuthContext();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />

      {/* Floating Images */}
      {floatingImages.map((img, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ delay: img.delay, duration: 0.8 }}
          className={`absolute ${img.className} rounded-2xl overflow-hidden hidden lg:block`}
          style={{
            animation: `float ${6 + index}s ease-in-out infinite`,
            animationDelay: `${index * 0.5}s`
          }}
        >
          <img
            src={img.src}
            alt=""
            className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
          />
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">
            AI-Powered Image Generation
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          Turn Your{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Imagination
          </span>{' '}
          Into Art
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Create stunning, unique images in seconds with our advanced AI. 
          From realistic photos to artistic masterpieces - your creativity is the only limit.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to={isAuthenticated ? '/generate' : '/register'}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 h-14 text-lg shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Creating
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/gallery">
            <Button
              variant="outline"
              size="lg"
              className="px-8 h-14 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Explore Gallery
            </Button>
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-emerald-400 to-teal-600"
                />
              ))}
            </div>
            <span>25K+ users</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span>No credit card required</span>
        </motion.div>
      </div>

      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
      `}</style>
    </section>
  );
}
