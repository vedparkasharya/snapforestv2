import { motion } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Shield,
  Palette,
  Globe,
  Download
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'Advanced AI models that understand your prompts and create stunning, unique images every time.',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate high-quality images in seconds. No waiting, no queues - just instant creativity.',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    icon: Palette,
    title: 'Multiple Styles',
    description: 'Choose from realistic, artistic, anime, watercolor, oil painting, and many more artistic styles.',
    color: 'from-purple-400 to-pink-500',
  },
  {
    icon: Globe,
    title: 'Cloud Storage',
    description: 'All your images are securely stored in the cloud with Cloudinary. Access them from anywhere.',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    icon: Download,
    title: 'High Resolution',
    description: 'Download your creations in high resolution. Perfect for prints, presentations, and social media.',
    color: 'from-green-400 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data and creations are protected with enterprise-grade security and encryption.',
    color: 'from-red-400 to-rose-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function FeaturesSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-emerald-400 font-medium text-sm uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Create
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features designed to bring your creative vision to life with ease and precision.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative p-6 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.05), transparent 70%)' }} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
