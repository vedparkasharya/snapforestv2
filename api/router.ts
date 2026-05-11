import { authRouter } from "./auth-router";
import { mongoAuthRouter } from "./mongo-auth-router";
import { roomRouter } from "./roomRouter";
import { mongoRoomRouter } from "./mongo-roomRouter";
import { bookingRouter } from "./bookingRouter";
import { mongoBookingRouter } from "./mongo-bookingRouter";
import { paymentRouter } from "./paymentRouter";
import { reviewRouter } from "./reviewRouter";
import { mongoReviewRouter } from "./mongo-reviewRouter";
import { adminRouter } from "./adminRouter";
import { mongoAdminRouter } from "./mongo-adminRouter";
import { seedRouter } from "./seedRouter";
import { mongoSeedRouter } from "./mongo-seedRouter";
import { cloudinaryRouter } from "./cloudinaryRouter";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  // Legacy MySQL/Drizzle routers (kept for compatibility)
  auth: authRouter,
  room: roomRouter,
  booking: bookingRouter,
  review: reviewRouter,
  admin: adminRouter,
  seed: seedRouter,
  // New MongoDB routers (primary)
  mongoAuth: mongoAuthRouter,
  mongoRoom: mongoRoomRouter,
  mongoBooking: mongoBookingRouter,
  mongoReview: mongoReviewRouter,
  mongoAdmin: mongoAdminRouter,
  mongoSeed: mongoSeedRouter,
  // Cloudinary
  cloudinary: cloudinaryRouter,
  // Payment (uses MongoDB)
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;
