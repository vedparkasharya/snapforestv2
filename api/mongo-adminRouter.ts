import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { connectMongo } from "../mongo/connection";
import { User, Room, Booking } from "../mongo/models";

export const mongoAdminRouter = createRouter({
  dashboard: adminQuery.query(async () => {
    await connectMongo();
    const allUsers = await User.find().lean();
    const allRooms = await Room.find().lean();
    const allBookings = await Booking.find().lean();

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
      stats: {
        totalUsers: allUsers.length,
        totalRooms: allRooms.length,
        activeRooms: allRooms.filter((r: any) => r.status === "active").length,
        pendingRooms: allRooms.filter((r: any) => r.status === "pending").length,
        totalBookings: allBookings.length,
        pendingApprovals: allBookings.filter((b: any) => b.bookingStatus === "pending").length,
        totalRevenue,
        todayRevenue,
      },
    };
  }),

  users: adminQuery.query(async () => {
    await connectMongo();
    return User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
  }),

  approveRoom: adminQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await connectMongo();
      await Room.findByIdAndUpdate(input.id, { status: "active" });
      return { success: true };
    }),

  rejectRoom: adminQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await connectMongo();
      await Room.findByIdAndUpdate(input.id, { status: "inactive" });
      return { success: true };
    }),

  toggleHost: adminQuery
    .input(z.object({ userId: z.string(), isHost: z.boolean() }))
    .mutation(async ({ input }) => {
      await connectMongo();
      await User.findByIdAndUpdate(input.userId, { isHost: input.isHost });
      return { success: true };
    }),

  deleteRoom: adminQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await connectMongo();
      await Room.findByIdAndDelete(input.id);
      return { success: true };
    }),

  blockUser: adminQuery
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      await connectMongo();
      await User.findByIdAndUpdate(input.userId, { role: "user", isHost: false });
      return { success: true };
    }),
});
