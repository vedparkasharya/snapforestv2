import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bookings, rooms } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";

function generateBookingId(): string {
  return "SNAP" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const bookingRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userBookings = await db.query.bookings.findMany({
      where: eq(bookings.userId, ctx.user.id),
      orderBy: [desc(bookings.createdAt)],
    });
    const bookingsWithRooms = await Promise.all(
      userBookings.map(async (booking) => {
        const room = await db.query.rooms.findFirst({
          where: eq(rooms.id, booking.roomId),
        });
        return { ...booking, room };
      })
    );
    return bookingsWithRooms;
  }),

  all: adminQuery.query(async () => {
    const db = getDb();
    const allBookings = await db.query.bookings.findMany({
      orderBy: [desc(bookings.createdAt)],
    });
    const bookingsWithRooms = await Promise.all(
      allBookings.map(async (booking) => {
        const room = await db.query.rooms.findFirst({
          where: eq(rooms.id, booking.roomId),
        });
        return { ...booking, room };
      })
    );
    return bookingsWithRooms;
  }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const booking = await db.query.bookings.findFirst({
        where: eq(bookings.id, input.id),
      });
      if (!booking) return null;
      const room = await db.query.rooms.findFirst({
        where: eq(rooms.id, booking.roomId),
      });
      return { ...booking, room };
    }),

  checkAvailability: publicQuery
    .input(
      z.object({
        roomId: z.number(),
        bookingDate: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const existingBookings = await db.query.bookings.findMany({
        where: and(
          eq(bookings.roomId, input.roomId),
          sql`${bookings.bookingDate} = ${input.bookingDate}`,
          eq(bookings.bookingStatus, "confirmed"),
        ),
      });

      const newStart = input.startTime;
      const newEnd = input.endTime;

      const isAvailable = !existingBookings.some((existing) => {
        return existing.startTime < newEnd && existing.endTime > newStart;
      });

      return { available: isAvailable, existingBookings };
    }),

  create: authedQuery
    .input(
      z.object({
        roomId: z.number(),
        bookingDate: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        totalHours: z.number(),
        totalPrice: z.string(),
        specialRequests: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const bookingId = generateBookingId();

      const [{ id }] = await db.insert(bookings).values({
        bookingId,
        userId: ctx.user.id,
        roomId: input.roomId,
        bookingDate: input.bookingDate,
        startTime: input.startTime,
        endTime: input.endTime,
        totalHours: input.totalHours,
        totalPrice: input.totalPrice,
        paymentStatus: "pending",
        bookingStatus: "pending",
        approvalType: "auto",
        specialRequests: input.specialRequests,
      } as any).$returningId();

      return { id, bookingId };
    }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        bookingStatus: z.enum(["pending", "confirmed", "cancelled", "completed"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(bookings)
        .set({ bookingStatus: input.bookingStatus })
        .where(eq(bookings.id, input.id));
      return { success: true };
    }),

  cancel: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const booking = await db.query.bookings.findFirst({
        where: eq(bookings.id, input.id),
      });
      if (!booking || booking.userId !== ctx.user.id) {
        return { success: false, message: "Not authorized" };
      }
      await db
        .update(bookings)
        .set({ bookingStatus: "cancelled" })
        .where(eq(bookings.id, input.id));
      return { success: true };
    }),

  stats: adminQuery.query(async () => {
    const db = getDb();
    const allBookings = await db.select().from(bookings);
    const totalBookings = allBookings.length;
    const pendingApprovals = allBookings.filter((b) => b.bookingStatus === "pending").length;
    const confirmed = allBookings.filter((b) => b.bookingStatus === "confirmed").length;
    const completed = allBookings.filter((b) => b.bookingStatus === "completed").length;
    const cancelled = allBookings.filter((b) => b.bookingStatus === "cancelled").length;

    const totalRevenue = allBookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + Number(b.totalPrice), 0);

    const today = new Date().toISOString().split("T")[0];
    const todayBookings = allBookings.filter((b) => {
      const bDate = b.bookingDate instanceof Date
        ? b.bookingDate.toISOString().split("T")[0]
        : String(b.bookingDate).split("T")[0];
      return bDate === today;
    });
    const todayRevenue = todayBookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + Number(b.totalPrice), 0);

    return {
      totalBookings,
      pendingApprovals,
      confirmed,
      completed,
      cancelled,
      totalRevenue,
      todayRevenue,
      todayBookings: todayBookings.length,
    };
  }),
});
