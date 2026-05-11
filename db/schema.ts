import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  bigint,
  boolean,
  date,
  time,
} from "drizzle-orm/mysql-core";

// ── Users ──────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isHost: boolean("isHost").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Rooms ──────────────────────────────────────────────
export const rooms = mysqlTable("rooms", {
  id: serial("id").primaryKey(),
  hostId: bigint("hostId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "podcast",
    "gaming",
    "reel_studio",
    "rgb_room",
    "music",
    "dance",
    "photography",
    "meeting",
  ]).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  address: text("address").notNull(),
  location: text("location"),
  pricePerHour: decimal("pricePerHour", { precision: 10, scale: 2 }).notNull(),
  weekendPrice: decimal("weekendPrice", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("INR").notNull(),
  maxGuests: int("maxGuests").default(5).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0").notNull(),
  reviewCount: int("reviewCount").default(0).notNull(),
  amenities: text("amenities"),
  rules: text("rules"),
  equipment: text("equipment"),
  lightingSetup: text("lightingSetup"),
  status: mysqlEnum("status", ["active", "inactive", "pending"]).default("pending").notNull(),
  featuredImage: text("featuredImage"),
  images: text("images"),
  threeSixtyImage: text("threeSixtyImage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;

// ── Bookings ───────────────────────────────────────────
export const bookings = mysqlTable("bookings", {
  id: serial("id").primaryKey(),
  bookingId: varchar("bookingId", { length: 50 }).notNull().unique(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  roomId: bigint("roomId", { mode: "number", unsigned: true }).notNull(),
  bookingDate: date("bookingDate").notNull(),
  startTime: time("startTime").notNull(),
  endTime: time("endTime").notNull(),
  totalHours: int("totalHours").notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  bookingStatus: mysqlEnum("bookingStatus", ["pending", "confirmed", "cancelled", "completed"]).default("pending").notNull(),
  approvalType: mysqlEnum("approvalType", ["auto", "manual"]).default("auto").notNull(),
  razorpayOrderId: varchar("razorpayOrderId", { length: 255 }),
  razorpayPaymentId: varchar("razorpayPaymentId", { length: 255 }),
  razorpaySignature: varchar("razorpaySignature", { length: 255 }),
  specialRequests: text("specialRequests"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ── Reviews ────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  roomId: bigint("roomId", { mode: "number", unsigned: true }).notNull(),
  bookingId: bigint("bookingId", { mode: "number", unsigned: true }).notNull(),
  rating: int("rating").notNull(),
  cleanliness: int("cleanliness").default(5),
  lighting: int("lighting").default(5),
  setupQuality: int("setupQuality").default(5),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ── Saved Rooms ────────────────────────────────────────
export const savedRooms = mysqlTable("savedRooms", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  roomId: bigint("roomId", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedRoom = typeof savedRooms.$inferSelect;
