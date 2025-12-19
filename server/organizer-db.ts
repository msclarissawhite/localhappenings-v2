import { eq, and, gt, isNull } from "drizzle-orm";
import { getDb } from "./db";
import { organizers, magicLinkTokens, events } from "../drizzle/schema";
import type { Organizer, InsertOrganizer, MagicLinkToken, InsertMagicLinkToken } from "../drizzle/schema";
import { randomBytes } from "crypto";

/**
 * Find organizer by ID
 */
export async function getOrganizerById(id: number): Promise<Organizer | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [organizer] = await db.select().from(organizers).where(eq(organizers.id, id)).limit(1);
  return organizer;
}

/**
 * Find organizer by email
 */
export async function findOrganizerByEmail(email: string): Promise<Organizer | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [organizer] = await db.select().from(organizers).where(eq(organizers.email, email)).limit(1);
  return organizer;
}

/**
 * Create or update organizer account
 */
export async function upsertOrganizer(data: InsertOrganizer): Promise<Organizer> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const existing = await findOrganizerByEmail(data.email);
  
  if (existing) {
    // Update existing organizer
    await db.update(organizers)
      .set({
        name: data.name || existing.name,
        organizationName: data.organizationName || existing.organizationName,
        phone: data.phone || existing.phone,
        updatedAt: new Date(),
      })
      .where(eq(organizers.id, existing.id));
    
    return { ...existing, ...data };
  } else {
    // Create new organizer
    const [newOrganizer] = await db.insert(organizers).values(data);
    return { id: newOrganizer.insertId, ...data } as Organizer;
  }
}

/**
 * Generate magic link token
 */
export async function createMagicLinkToken(organizerId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  await db.insert(magicLinkTokens).values({
    organizerId,
    token,
    expiresAt,
  });
  
  return token;
}

/**
 * Verify magic link token and mark as used
 */
export async function verifyMagicLinkToken(token: string): Promise<Organizer | null> {
  const db = await getDb();
  if (!db) return null;
  
  // Find valid token
  const [tokenRecord] = await db.select()
    .from(magicLinkTokens)
    .where(
      and(
        eq(magicLinkTokens.token, token),
        isNull(magicLinkTokens.usedAt)
      )
    )
    .limit(1);
  
  // Check expiration manually
  if (tokenRecord && new Date(tokenRecord.expiresAt) < new Date()) {
    return null;
  }
  
  if (!tokenRecord) {
    return null;
  }
  
  // Mark token as used
  await db.update(magicLinkTokens)
    .set({ usedAt: new Date() })
    .where(eq(magicLinkTokens.id, tokenRecord.id));
  
  // Update last login time
  await db.update(organizers)
    .set({ lastLoginAt: new Date() })
    .where(eq(organizers.id, tokenRecord.organizerId));
  
  // Return organizer
  const [organizer] = await db.select()
    .from(organizers)
    .where(eq(organizers.id, tokenRecord.organizerId))
    .limit(1);
  
  return organizer || null;
}

/**
 * Get all events for an organizer
 */
export async function getOrganizerEvents(organizerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select()
    .from(events)
    .where(eq(events.organizerId, organizerId))
    .orderBy(events.createdAt);
}

/**
 * Clean up expired tokens (can be run periodically)
 */
export async function cleanupExpiredTokens() {
  const db = await getDb();
  if (!db) return;
  // Delete tokens where current time > expiresAt
  // We'll fetch and filter manually for simplicity
  const allTokens = await db.select().from(magicLinkTokens);
  const now = new Date();
  
  for (const token of allTokens) {
    if (new Date(token.expiresAt) < now) {
      await db.delete(magicLinkTokens).where(eq(magicLinkTokens.id, token.id));
    }
  }
}
