import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { connectMongo } from "../mongo/connection";
import { User } from "../mongo/models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";

const JWT_SECRET = process.env.APP_SECRET;
if (!JWT_SECRET) {
  throw new Error("APP_SECRET environment variable is required");
}

function generateToken(userId: string, email: string, role: string) {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: "30d" });
}

export const mongoAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await connectMongo();

      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists with this email",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await User.create({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        phone: input.phone,
        role: "user",
        isHost: false,
      });

      const token = generateToken(user._id.toString(), user.email, user.role);

      return {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isHost: user.isHost,
          avatar: user.avatar,
          phone: user.phone,
        },
      };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await connectMongo();

      const user = await User.findOne({ email: input.email });
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      user.lastSignInAt = new Date();
      await user.save();

      const token = generateToken(user._id.toString(), user.email, user.role);

      return {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isHost: user.isHost,
          avatar: user.avatar,
          phone: user.phone,
        },
      };
    }),

  adminLogin: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await connectMongo();

      const user = await User.findOne({ email: input.email, role: "admin" });
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid admin credentials",
        });
      }

      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid admin credentials",
        });
      }

      user.lastSignInAt = new Date();
      await user.save();

      const token = generateToken(user._id.toString(), user.email, user.role);

      return {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isHost: user.isHost,
          avatar: user.avatar,
        },
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const authHeader = ctx.req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };

      await connectMongo();
      const user = await User.findById(decoded.userId);

      if (!user) return null;

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isHost: user.isHost,
        avatar: user.avatar,
        phone: user.phone,
      };
    } catch {
      return null;
    }
  }),
});
