import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { rooms } from "@db/schema";
import { eq, and, like, gte, lte, sql, desc } from "drizzle-orm";

export const roomRouter = createRouter({
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
      const db = getDb();
      const conditions = [];

      if (input?.city) {
        conditions.push(like(rooms.city, `%${input.city}%`));
      }
      if (input?.category) {
        conditions.push(sql`${rooms.category} = ${input.category}`);
      }
      if (input?.minPrice) {
        conditions.push(gte(rooms.pricePerHour, input.minPrice.toString()));
      }
      if (input?.maxPrice) {
        conditions.push(lte(rooms.pricePerHour, input.maxPrice.toString()));
      }
      if (input?.search) {
        conditions.push(
          sql`${rooms.title} LIKE ${`%${input.search}%`} OR ${rooms.description} LIKE ${`%${input.search}%`}`
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      return db.query.rooms.findMany({
        where: whereClause,
        orderBy: [desc(rooms.rating)],
      });
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const room = await db.query.rooms.findFirst({
        where: eq(rooms.id, input.id),
      });
      return room ?? null;
    }),

  byCategory: publicQuery
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.rooms.findMany({
        where: sql`${rooms.category} = ${input.category}`,
        orderBy: [desc(rooms.rating)],
      });
    }),

  trending: publicQuery.query(async () => {
    const db = getDb();
    return db.query.rooms.findMany({
      where: eq(rooms.status, "active"),
      orderBy: [desc(rooms.rating)],
      limit: 6,
    });
  }),

  featured: publicQuery.query(async () => {
    const db = getDb();
    return db.query.rooms.findMany({
      where: eq(rooms.status, "active"),
      orderBy: [desc(rooms.rating)],
      limit: 4,
    });
  }),

  categories: publicQuery.query(async () => {
    const db = getDb();
    const allRooms = await db.select().from(rooms);
    const categories = [...new Set(allRooms.map((r) => r.category))];
    return categories.map((cat) => ({
      id: cat,
      name: cat.replace("_", " ").toUpperCase(),
      count: allRooms.filter((r) => r.category === cat).length,
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
        pricePerHour: z.string(),
        weekendPrice: z.string().optional(),
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
      const db = getDb();
      const [{ id }] = await db.insert(rooms).values({
        ...input,
        hostId: ctx.user.id,
        status: "pending",
      }).$returningId();
      return { id };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(["podcast", "gaming", "reel_studio", "rgb_room", "music", "dance", "photography", "meeting"]).optional(),
        city: z.string().optional(),
        address: z.string().optional(),
        pricePerHour: z.string().optional(),
        weekendPrice: z.string().optional(),
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
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(rooms).set(data).where(eq(rooms.id, id));
      return { success: true };
    }),

  myRooms: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.rooms.findMany({
      where: eq(rooms.hostId, ctx.user.id),
      orderBy: [desc(rooms.createdAt)],
    });
  }),
});
