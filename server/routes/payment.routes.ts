import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import Payment from '../models/Payment';
import { createOrder, verifyPayment } from '../utils/razorpay';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Pricing plans
const PLANS = {
  starter: {
    name: 'Starter',
    price: 99,
    generations: 25,
    description: 'Perfect for hobbyists'
  },
  pro: {
    name: 'Pro',
    price: 299,
    generations: 100,
    description: 'Best for creators'
  },
  unlimited: {
    name: 'Unlimited',
    price: 999,
    generations: 999999,
    description: 'For professionals'
  }
};

// Get pricing plans
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: PLANS,
    keyId: process.env.RAZORPAY_KEY_ID
  });
});

// Create order
router.post('/create-order', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { plan } = req.body;
    
    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const planDetails = PLANS[plan as keyof typeof PLANS];
    const receipt = `snapforest_${Date.now()}_${uuidv4().slice(0, 8)}`;

    // Create Razorpay order
    const order = await createOrder(planDetails.price, receipt, {
      userId: req.user?.userId || '',
      plan,
      generations: planDetails.generations.toString()
    });

    // Save payment record
    await Payment.create({
      userId: req.user?.userId,
      orderId: order.id,
      amount: planDetails.price,
      currency: 'INR',
      status: 'pending',
      plan,
      generationsAdded: planDetails.generations
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      plan: planDetails
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message || 'Failed to create order' });
  }
});

// Verify payment
router.post('/verify', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: 'Payment details are required' });
    }

    // Verify signature
    const isValid = verifyPayment(orderId, paymentId, signature);
    
    if (!isValid) {
      await Payment.findOneAndUpdate(
        { orderId },
        { status: 'failed', paymentId, signature }
      );
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      { status: 'completed', paymentId, signature },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Update user generations
    const user = await User.findById(req.user?.userId);
    if (user) {
      user.generationsLeft += payment.generationsAdded;
      if (payment.plan === 'unlimited') {
        user.isPremium = true;
        user.premiumExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      }
      await user.save();
    }

    res.json({
      success: true,
      message: 'Payment verified successfully!',
      generationsAdded: payment.generationsAdded,
      totalGenerations: user?.generationsLeft
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: error.message || 'Payment verification failed' });
  }
});

// Get payment history
router.get('/history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const payments = await Payment.find({ userId: req.user?.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      payments: payments.map(p => ({
        id: p._id,
        orderId: p.orderId,
        amount: p.amount,
        status: p.status,
        plan: p.plan,
        generationsAdded: p.generationsAdded,
        createdAt: p.createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
