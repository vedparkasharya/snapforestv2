import mongoose from 'mongoose';

export interface IImage extends mongoose.Document {
  title: string;
  prompt: string;
  imageUrl: string;
  publicId: string;
  userId: mongoose.Types.ObjectId;
  style?: string;
  isPublic: boolean;
  likes: number;
  downloads: number;
  aspectRatio: string;
}

const imageSchema = new mongoose.Schema<IImage>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  prompt: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  style: {
    type: String,
    default: 'realistic'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  likes: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  aspectRatio: {
    type: String,
    default: '1:1'
  }
}, {
  timestamps: true
});

// Index for faster queries
imageSchema.index({ createdAt: -1 });
imageSchema.index({ userId: 1 });
imageSchema.index({ isPublic: 1 });

const Image = mongoose.model<IImage>('Image', imageSchema);
export default Image;
