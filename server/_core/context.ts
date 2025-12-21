import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import jwt from "jsonwebtoken";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // First, try Manus OAuth authentication (for organizers)
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // If Manus OAuth fails, try magic link authentication (for regular users)
    try {
      const token = opts.req.cookies?.user_session || opts.req.headers.authorization?.replace("Bearer ", "");
      
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };
        const db = await getDb();
        
        if (db) {
          const [magicLinkUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, decoded.userId))
            .limit(1);
          
          if (magicLinkUser) {
            user = magicLinkUser;
          }
        }
      }
    } catch (magicLinkError) {
      // Both authentication methods failed, user remains null
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
