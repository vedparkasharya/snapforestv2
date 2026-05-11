import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: "user" | "admin";
  isHost: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isHost: { type: Boolean, default: false },
  lastSignInAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export interface IRoom extends Document {
  _id: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: string;
  city: string;
  address: string;
  location?: string;
  pricePerHour: number;
  weekendPrice?: number;
  currency: string;
  maxGuests: number;
  rating: number;
  reviewCount: number;
  amenities?: string;
  rules?: string;
  equipment?: string;
  lightingSetup?: string;
  status: "active" | "inactive" | "pending";
  featuredImage?: string;
  images?: string;
  threeSixtyImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    enum: ["podcast", "gaming", "reel_studio", "rgb_room", "music", "dance", "photography", "meeting"],
    required: true,
  },
  city: { type: String, required: true },
  address: { type: String, required: true },
  location: { type: String },
  pricePerHour: { type: Number, required: true },
  weekendPrice: { type: Number },
  currency: { type: String, default: "INR" },
  maxGuests: { type: Number, default: 5 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  amenities: { type: String },
  rules: { type: String },
  equipment: { type: String },
  lightingSetup: { type: String },
  status: { type: String, enum: ["active", "inactive", "pending"], default: "pending" },
  featuredImage: { type: String },
  images: { type: String },
  threeSixtyImage: { type: String },
}, { timestamps: true });

export const Room = mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  bookingId: string;
  userId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  totalPrice: number;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  bookingStatus: "pending" | "confirmed" | "cancelled" | "completed";
  approvalType: "auto" | "manual";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  bookingId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  bookingDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  totalHours: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
  bookingStatus: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
  approvalType: { type: String, enum: ["auto", "manual"], default: "auto" },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  specialRequests: { type: String },
}, { timestamps: true });

// Compound index to prevent double-bookings at DB level
BookingSchema.index({ roomId: 1, bookingDate: 1, startTime: 1, endTime: 1 });

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  rating: number;
  cleanliness: number;
  lighting: number;
  setupQuality: number;
  comment?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  cleanliness: { type: Number, default: 5 },
  lighting: { type: Number, default: 5 },
  setupQuality: { type: Number, default: 5 },
  comment: { type: String },
}, { timestamps: true });

export const Review = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export interface ISavedRoom extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SavedRoomSchema = new Schema<ISavedRoom>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
}, { timestamps: true });

export const SavedRoom = mongoose.models.SavedRoom || mongoose.model<ISavedRoom>("SavedRoom", SavedRoomSchema);
