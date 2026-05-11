import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';

export default function CTASection() {
  const { isAuthenticated } = useAuthContext();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-background to-teal-950/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Unleash Your{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Creativity?
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already using SnapForest to bring their ideas to life. 
            Start for free, upgrade when you need more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={isAuthenticated ? '/generate' : '/register'}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 h-14 text-lg shadow-xl shadow-emerald-500/25"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {isAuthenticated ? 'Start Generating' : 'Get Started Free'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="px-8 h-14 text-lg">
                View Pricing
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Free tier includes 5 generations. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
