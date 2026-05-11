import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { connectMongo } from "../mongo/connection";
import { Review, User, Room } from "../mongo/models";

export const mongoReviewRouter = createRouter({
  byRoom: publicQuery
    .input(z.object({ roomId: z.string() }))
    .query(async ({ input }) => {
      await connectMongo();
      const roomReviews = await Review.find({ roomId: input.roomId })
        .sort({ createdAt: -1 })
        .lean();

      const reviewsWithUsers = await Promise.all(
        roomReviews.map(async (review: any) => {
          const user = await User.findById(review.userId)
            .select("name email avatar")
            .lean();
          return { ...review, user };
        })
      );
      return reviewsWithUsers;
    }),

  create: authedQuery
    .input(
      z.object({
        roomId: z.string(),
        bookingId: z.string(),
        rating: z.number().min(1).max(5),
        cleanliness: z.number().min(1).max(5).optional(),
        lighting: z.number().min(1).max(5).optional(),
        setupQuality: z.number().min(1).max(5).optional(),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await connectMongo();
      const userId = (ctx.user as any).id || (ctx.user as any)._id;
      const review = await Review.create({
        userId,
        roomId: input.roomId,
        bookingId: input.bookingId,
        rating: input.rating,
        cleanliness: input.cleanliness ?? 5,
        lighting: input.lighting ?? 5,
        setupQuality: input.setupQuality ?? 5,
        comment: input.comment,
      });

      // Update room rating
      const roomReviews = await Review.find({ roomId: input.roomId }).lean();
      const avgRating = roomReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / roomReviews.length;
      await Room.findByIdAndUpdate(input.roomId, {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: roomReviews.length,
      });

      return { id: review._id.toString() };
    }),

  recent: publicQuery.query(async () => {
    await connectMongo();
    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const reviewsWithDetails = await Promise.all(
      recentReviews.map(async (review: any) => {
        const user = await User.findById(review.userId)
          .select("name email avatar")
          .lean();
        const room = await Room.findById(review.roomId)
          .select("title featuredImage")
          .lean();
        return { ...review, user, room };
      })
    );
    return reviewsWithDetails;
  }),
});
