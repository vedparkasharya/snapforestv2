import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reviews, users } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const reviewRouter = createRouter({
  byRoom: publicQuery
    .input(z.object({ roomId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const roomReviews = await db.query.reviews.findMany({
        where: eq(reviews.roomId, input.roomId),
        orderBy: [desc(reviews.createdAt)],
      });
      const reviewsWithUsers = await Promise.all(
        roomReviews.map(async (review) => {
          const user = await db.query.users.findFirst({
            where: eq(users.id, review.userId),
          });
          return { ...review, user };
        })
      );
      return reviewsWithUsers;
    }),

  create: authedQuery
    .input(
      z.object({
        roomId: z.number(),
        bookingId: z.number(),
        rating: z.number().min(1).max(5),
        cleanliness: z.number().min(1).max(5).optional(),
        lighting: z.number().min(1).max(5).optional(),
        setupQuality: z.number().min(1).max(5).optional(),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(reviews).values({
        userId: ctx.user.id,
        roomId: input.roomId,
        bookingId: input.bookingId,
        rating: input.rating,
        cleanliness: input.cleanliness ?? 5,
        lighting: input.lighting ?? 5,
        setupQuality: input.setupQuality ?? 5,
        comment: input.comment,
      }).$returningId();
      return { id };
    }),

  recent: publicQuery.query(async () => {
    const db = getDb();
    const recentReviews = await db.query.reviews.findMany({
      orderBy: [desc(reviews.createdAt)],
      limit: 6,
    });
    const reviewsWithDetails = await Promise.all(
      recentReviews.map(async (review) => {
        const user = await db.query.users.findFirst({
          where: eq(users.id, review.userId),
        });
        const room = await db.query.rooms.findFirst({
          where: eq(users.id, review.roomId),
        });
        return { ...review, user, room };
      })
    );
    return reviewsWithDetails;
  }),
});
