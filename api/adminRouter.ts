import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, rooms, bookings } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const adminRouter = createRouter({
  dashboard: adminQuery.query(async () => {
    const db = getDb();
    const allUsers = await db.select().from(users);
    const allRooms = await db.select().from(rooms);
    const allBookings = await db.select().from(bookings);

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
      stats: {
        totalUsers: allUsers.length,
        totalRooms: allRooms.length,
        activeRooms: allRooms.filter((r) => r.status === "active").length,
        pendingRooms: allRooms.filter((r) => r.status === "pending").length,
        totalBookings: allBookings.length,
        pendingApprovals: allBookings.filter((b) => b.bookingStatus === "pending").length,
        totalRevenue,
        todayRevenue,
      },
    };
  }),

  users: adminQuery.query(async () => {
    const db = getDb();
    return db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });
  }),

  approveRoom: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(rooms).set({ status: "active" }).where(eq(rooms.id, input.id));
      return { success: true };
    }),

  rejectRoom: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(rooms).set({ status: "inactive" }).where(eq(rooms.id, input.id));
      return { success: true };
    }),

  toggleHost: adminQuery
    .input(z.object({ userId: z.number(), isHost: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(users).set({ isHost: input.isHost }).where(eq(users.id, input.userId));
      return { success: true };
    }),
});
