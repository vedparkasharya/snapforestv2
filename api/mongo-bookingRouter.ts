import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { connectMongo } from "../mongo/connection";
import { Booking, Room } from "../mongo/models";

function generateBookingId(): string {
  return "SNAP" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const mongoBookingRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    await connectMongo();
    const userId = (ctx.user as any).id || (ctx.user as any)._id;
    const userBookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const bookingsWithRooms = await Promise.all(
      userBookings.map(async (booking: any) => {
        const room = await Room.findById(booking.roomId).lean();
        return { ...booking, room };
      })
    );
    return bookingsWithRooms;
  }),

  all: adminQuery.query(async () => {
    await connectMongo();
    const allBookings = await Booking.find().sort({ createdAt: -1 }).lean();
    const bookingsWithRooms = await Promise.all(
      allBookings.map(async (booking: any) => {
        const room = await Room.findById(booking.roomId).lean();
        return { ...booking, room };
      })
    );
    return bookingsWithRooms;
  }),

  byId: publicQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      await connectMongo();
      const booking = await Booking.findById(input.id).lean();
      if (!booking) return null;
      const room = await Room.findById(booking.roomId).lean();
      return { ...booking, room };
    }),

  checkAvailability: publicQuery
    .input(
      z.object({
        roomId: z.string(),
        bookingDate: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .query(async ({ input }) => {
      await connectMongo();
      const existingBookings = await Booking.find({
        roomId: input.roomId,
        bookingDate: input.bookingDate,
        bookingStatus: { $in: ["confirmed", "pending"] },
      }).lean();

      const newStart = input.startTime;
      const newEnd = input.endTime;

      const isAvailable = !existingBookings.some((existing: any) => {
        return existing.startTime < newEnd && existing.endTime > newStart;
      });

      return { available: isAvailable, existingBookings };
    }),

  create: authedQuery
    .input(
      z.object({
        roomId: z.string(),
        bookingDate: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        totalHours: z.number(),
        totalPrice: z.number(),
        specialRequests: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await connectMongo();

      // Atomic double-booking prevention: check availability right before creating
      const existingBookings = await Booking.find({
        roomId: input.roomId,
        bookingDate: input.bookingDate,
        bookingStatus: { $in: ["confirmed", "pending"] },
      }).lean();

      const newStart = input.startTime;
      const newEnd = input.endTime;

      const hasConflict = existingBookings.some((existing: any) => {
        return existing.startTime < newEnd && existing.endTime > newStart;
      });

      if (hasConflict) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This slot has just been booked by another user. Please select a different time.",
        });
      }

      const bookingId = generateBookingId();
      const userId = (ctx.user as any).id || (ctx.user as any)._id;

      const booking = await Booking.create({
        bookingId,
        userId,
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
      });

      return { id: booking._id.toString(), bookingId };
    }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.string(),
        bookingStatus: z.enum(["pending", "confirmed", "cancelled", "completed"]),
      })
    )
    .mutation(async ({ input }) => {
      await connectMongo();
      await Booking.findByIdAndUpdate(input.id, { bookingStatus: input.bookingStatus });
      return { success: true };
    }),

  cancel: authedQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await connectMongo();
      const userId = (ctx.user as any).id || (ctx.user as any)._id;
      const booking = await Booking.findById(input.id);
      if (!booking || booking.userId.toString() !== userId) {
        return { success: false, message: "Not authorized" };
      }
      await Booking.findByIdAndUpdate(input.id, { bookingStatus: "cancelled" });
      return { success: true };
    }),

  stats: adminQuery.query(async () => {
    await connectMongo();
    const allBookings = await Booking.find().lean();
    const totalBookings = allBookings.length;
    const pendingApprovals = allBookings.filter((b: any) => b.bookingStatus === "pending").length;
    const confirmed = allBookings.filter((b: any) => b.bookingStatus === "confirmed").length;
    const completed = allBookings.filter((b: any) => b.bookingStatus === "completed").length;
    const cancelled = allBookings.filter((b: any) => b.bookingStatus === "cancelled").length;

    const totalRevenue = allBookings
      .filter((b: any) => b.paymentStatus === "paid")
      .reduce((sum: number, b: any) => sum + Number(b.totalPrice), 0);

    const today = new Date().toISOString().split("T")[0];
    const todayBookings = allBookings.filter((b: any) => {
      const bDate = b.bookingDate instanceof Date
        ? b.bookingDate.toISOString().split("T")[0]
        : String(b.bookingDate).split("T")[0];
      return bDate === today;
    });
    const todayRevenue = todayBookings
      .filter((b: any) => b.paymentStatus === "paid")
      .reduce((sum: number, b: any) => sum + Number(b.totalPrice), 0);

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
