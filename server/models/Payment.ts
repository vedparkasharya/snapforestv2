import mongoose from 'mongoose';

export interface IPayment extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  orderId: string;
  paymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  plan: string;
  generationsAdded: number;
}

const paymentSchema = new mongoose.Schema<IPayment>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  paymentId: {
    type: String,
    default: null
  },
  signature: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  plan: {
    type: String,
    required: true,
    enum: ['starter', 'pro', 'unlimited']
  },
  generationsAdded: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
export default Payment;
