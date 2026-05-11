import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
const apiKey = process.env.CLOUDINARY_API_KEY || "";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

function generateSignature(timestamp: number): string {
  const str = `timestamp=${timestamp}${apiSecret}`;
  return crypto.createHash("sha1").update(str).digest("hex");
}

export const cloudinaryRouter = createRouter({
  getSignature: publicQuery.query(() => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    return {
      signature: generateSignature(timestamp),
      timestamp,
      cloudName,
      apiKey,
    };
  }),

  deleteImage: authedQuery
    .input(z.object({ publicId: z.string() }))
    .mutation(async ({ input }) => {
      const result = await cloudinary.uploader.destroy(input.publicId);
      return { success: result.result === "ok" };
    }),
});
