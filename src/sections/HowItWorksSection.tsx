import { motion } from 'framer-motion';
import { Pencil, Cpu, Download, Share2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Pencil,
    title: 'Write Your Prompt',
    description: 'Describe the image you want to create. Be as detailed or as creative as you like.',
  },
  {
    number: '02',
    icon: Cpu,
    title: 'AI Generates Art',
    description: 'Our advanced AI processes your prompt and creates a unique, high-quality image.',
  },
  {
    number: '03',
    icon: Download,
    title: 'Download & Save',
    description: 'Save your creation to your gallery or download it in high resolution.',
  },
  {
    number: '04',
    icon: Share2,
    title: 'Share With World',
    description: 'Share your artwork with the community or on your favorite social platforms.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-emerald-400 font-medium text-sm uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4">
            Create in{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              4 Simple Steps
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            No complicated setup or learning curve. Start creating stunning images right away.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              <div className="relative p-6 text-center">
                {/* Number */}
                <div className="text-6xl font-bold text-emerald-500/10 absolute top-0 left-1/2 -translate-x-1/2">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20 mb-6">
                  <step.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
