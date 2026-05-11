import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { connectMongo } from "../mongo/connection";
import { User as MongoUser } from "../mongo/models";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.APP_SECRET;
if (!JWT_SECRET) {
  throw new Error("APP_SECRET environment variable is required");
}

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try Kimi OAuth first
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Kimi auth failed, try MongoDB JWT
  }

  // If no Kimi user, try MongoDB JWT
  if (!ctx.user) {
    try {
      const authHeader = opts.req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as {
          userId: string;
          email: string;
          role: string;
        };

        await connectMongo();
        const mongoUser = await MongoUser.findById(decoded.userId);
        if (mongoUser) {
          // Create a User-compatible object for middleware
          ctx.user = {
            id: Number(mongoUser._id.toString().slice(-8)) || 1, // Generate numeric ID for compatibility
            _id: mongoUser._id,
            unionId: mongoUser.email,
            name: mongoUser.name,
            email: mongoUser.email,
            phone: mongoUser.phone,
            avatar: mongoUser.avatar,
            role: mongoUser.role as "user" | "admin",
            isHost: mongoUser.isHost,
            createdAt: mongoUser.createdAt,
            updatedAt: mongoUser.updatedAt,
            lastSignInAt: mongoUser.lastSignInAt,
          } as any;
        }
      }
    } catch {
      // JWT auth failed, user stays undefined
    }
  }

  return ctx;
}
