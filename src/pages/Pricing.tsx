import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { payments } from '@/lib/api';
import { useAuthContext } from '@/providers/AuthProvider';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  generations: number;
  features: string[];
  popular?: boolean;
}

export default function Pricing() {
  const { isAuthenticated, user } = useAuthContext();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await payments.getPlans();
      const plansData = Object.entries(response.data.plans).map(([id, plan]: [string, any]) => ({
        id,
        ...plan
      }));
      setPlans(plansData);
      setRazorpayKey(response.data.keyId);
    } catch (error) {
      console.error('Plans fetch error:', error);
      // Fallback plans
      setPlans([
        {
          id: 'starter',
          name: 'Starter',
          price: 99,
          description: 'Perfect for hobbyists',
          generations: 25,
          features: ['25 image generations', 'All art styles', 'Standard resolution', 'Email support']
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 299,
          description: 'Best for creators',
          generations: 100,
          features: ['100 image generations', 'All art styles', 'High resolution', 'Priority support', 'Commercial license'],
          popular: true
        },
        {
          id: 'unlimited',
          name: 'Unlimited',
          price: 999,
          description: 'For professionals',
          generations: 999999,
          features: ['Unlimited generations', 'All art styles', '4K resolution', 'Priority support', 'Commercial license', 'API access']
        }
      ]);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe');
      return;
    }

    try {
      setLoading(true);
      
      // Create order
      const orderResponse = await payments.createOrder(planId);
      const { order, plan } = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key: razorpayKey || 'rzp_live_Snkzxe1jQKvupB',
        amount: order.amount,
        currency: order.currency,
        name: 'SnapForest',
        description: `${plan.name} Plan - ${plan.generations} generations`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await payments.verify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
            
            toast.success(`Payment successful! ${verifyResponse.data.generationsAdded} generations added.`);
            window.location.reload();
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#10b981'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-emerald-400 font-medium text-sm uppercase tracking-wider">
            Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Plan
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start for free, upgrade when you need more generations. 
            All plans include access to every art style.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-6 lg:p-8 rounded-2xl border ${
                plan.popular
                  ? 'border-emerald-500 bg-gradient-to-b from-emerald-500/5 to-transparent scale-105 shadow-xl shadow-emerald-500/10'
                  : 'bg-card hover:border-emerald-500/30 transition-colors'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                    : 'bg-muted'
                }`}>
                  {plan.id === 'starter' && <Zap className="w-6 h-6 text-white" />}
                  {plan.id === 'pro' && <Sparkles className="w-6 h-6 text-white" />}
                  {plan.id === 'unlimited' && <Crown className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">₹{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    {plan.generations >= 999999 
                      ? 'Unlimited generations' 
                      : `${plan.generations} generations`}
                  </span>
                </li>
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
                className={`w-full h-12 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                    : ''
                }`}
                variant={plan.popular ? 'default' : 'outline'}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground">
            All payments are processed securely via Razorpay. 
            30-day money-back guarantee on all plans.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
