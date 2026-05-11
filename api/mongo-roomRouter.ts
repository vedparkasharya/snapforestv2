import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { connectMongo } from "../mongo/connection";
import { Room } from "../mongo/models";

export const mongoRoomRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        city: z.string().optional(),
        category: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      await connectMongo();
      const query: any = {};

      if (input?.city) query.city = { $regex: input.city, $options: "i" };
      if (input?.category) query.category = input.category;
      if (input?.minPrice !== undefined || input?.maxPrice !== undefined) {
        query.pricePerHour = {};
        if (input.minPrice !== undefined) query.pricePerHour.$gte = input.minPrice;
        if (input.maxPrice !== undefined) query.pricePerHour.$lte = input.maxPrice;
      }
      if (input?.search) {
        query.$or = [
          { title: { $regex: input.search, $options: "i" } },
          { description: { $regex: input.search, $options: "i" } },
        ];
      }

      return Room.find(query).sort({ rating: -1 }).lean();
    }),

  byId: publicQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      await connectMongo();
      return Room.findById(input.id).lean();
    }),

  byCategory: publicQuery
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      await connectMongo();
      return Room.find({ category: input.category }).sort({ rating: -1 }).lean();
    }),

  trending: publicQuery.query(async () => {
    await connectMongo();
    return Room.find({ status: "active" }).sort({ rating: -1 }).limit(6).lean();
  }),

  featured: publicQuery.query(async () => {
    await connectMongo();
    return Room.find({ status: "active" }).sort({ rating: -1 }).limit(4).lean();
  }),

  categories: publicQuery.query(async () => {
    await connectMongo();
    const allRooms = await Room.find().lean();
    const categories = [...new Set(allRooms.map((r: any) => r.category))];
    return categories.map((cat) => ({
      id: cat,
      name: cat.replace(/_/g, " ").toUpperCase(),
      count: allRooms.filter((r: any) => r.category === cat).length,
    }));
  }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().optional(),
        category: z.enum(["podcast", "gaming", "reel_studio", "rgb_room", "music", "dance", "photography", "meeting"]),
        city: z.string().min(1),
        address: z.string().min(1),
        pricePerHour: z.number(),
        weekendPrice: z.number().optional(),
        maxGuests: z.number().default(5),
        amenities: z.string().optional(),
        rules: z.string().optional(),
        equipment: z.string().optional(),
        lightingSetup: z.string().optional(),
        featuredImage: z.string().optional(),
        images: z.string().optional(),
        threeSixtyImage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await connectMongo();
      const room = await Room.create({
        ...input,
        hostId: (ctx.user as any).id || (ctx.user as any)._id,
        status: "pending",
        rating: 0,
        reviewCount: 0,
      });
      return { id: room._id.toString() };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(["podcast", "gaming", "reel_studio", "rgb_room", "music", "dance", "photography", "meeting"]).optional(),
        city: z.string().optional(),
        address: z.string().optional(),
        pricePerHour: z.number().optional(),
        weekendPrice: z.number().optional(),
        maxGuests: z.number().optional(),
        amenities: z.string().optional(),
        rules: z.string().optional(),
        equipment: z.string().optional(),
        lightingSetup: z.string().optional(),
        status: z.enum(["active", "inactive", "pending"]).optional(),
        featuredImage: z.string().optional(),
        images: z.string().optional(),
        threeSixtyImage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await connectMongo();
      const { id, ...data } = input;
      const userId = (ctx.user as any).id || (ctx.user as any)._id;

      const room = await Room.findById(id);
      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      }
      // Only allow update if user is the host or an admin
      const roomHostId = room.hostId?.toString();
      const userIdStr = userId?.toString?.() || userId;
      const userRole = (ctx.user as any).role;
      if (roomHostId !== userIdStr && userRole !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only update your own rooms" });
      }

      await Room.findByIdAndUpdate(id, data);
      return { success: true };
    }),

  myRooms: authedQuery.query(async ({ ctx }) => {
    await connectMongo();
    const userId = (ctx.user as any).id || (ctx.user as any)._id;
    return Room.find({ hostId: userId }).sort({ createdAt: -1 }).lean();
  }),
});
