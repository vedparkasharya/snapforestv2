import { motion } from 'framer-motion';
import {
  Sparkles,
  Image,
  Star,
  Users
} from 'lucide-react';
import HeroSection from '@/sections/HeroSection';
import FeaturesSection from '@/sections/FeaturesSection';
import HowItWorksSection from '@/sections/HowItWorksSection';
import ShowcaseSection from '@/sections/ShowcaseSection';
import CTASection from '@/sections/CTASection';

const stats = [
  { label: 'Images Generated', value: '100K+', icon: Image },
  { label: 'Active Users', value: '25K+', icon: Users },
  { label: 'AI Models', value: '15+', icon: Sparkles },
  { label: 'Satisfaction', value: '99%', icon: Star },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center p-4"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 mb-3">
                  <stat.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Showcase */}
      <ShowcaseSection />

      {/* CTA */}
      <CTASection />
    </div>
  );
}
