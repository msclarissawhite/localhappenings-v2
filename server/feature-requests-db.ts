import { getDb } from "./db";
import { featureRequests, featureRequestUpvotes } from "../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

/**
 * Get all feature requests with upvote status for current user
 */
export async function getAllFeatureRequests(userId?: number) {
  const db = await getDb();
  if (!db) return [];

  const requests = await db
    .select({
      id: featureRequests.id,
      title: featureRequests.title,
      description: featureRequests.description,
      status: featureRequests.status,
      upvoteCount: featureRequests.upvoteCount,
      clickupTaskUrl: featureRequests.clickupTaskUrl,
      createdAt: featureRequests.createdAt,
      updatedAt: featureRequests.updatedAt,
    })
    .from(featureRequests)
    .orderBy(desc(featureRequests.upvoteCount), desc(featureRequests.createdAt));

  // If user is logged in, check which requests they've upvoted
  if (userId) {
    const userUpvotes = await db
      .select({ featureRequestId: featureRequestUpvotes.featureRequestId })
      .from(featureRequestUpvotes)
      .where(eq(featureRequestUpvotes.userId, userId));

    const upvotedIds = new Set(userUpvotes.map(u => u.featureRequestId));

    return requests.map(r => ({
      ...r,
      hasUpvoted: upvotedIds.has(r.id),
    }));
  }

  return requests.map(r => ({ ...r, hasUpvoted: false }));
}

/**
 * Get a single feature request by ID
 */
export async function getFeatureRequestById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(featureRequests)
    .where(eq(featureRequests.id, id))
    .limit(1);

  return results[0] || null;
}

/**
 * Create a new feature request
 */
export async function createFeatureRequest(data: {
  title: string;
  description: string;
  userId?: number;
  submitterName?: string;
  submitterEmail?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(featureRequests).values({
    title: data.title,
    description: data.description,
    userId: data.userId,
    submitterName: data.submitterName,
    submitterEmail: data.submitterEmail,
    status: "pending",
    upvoteCount: 0,
  });

  return result[0].insertId;
}

/**
 * Update feature request status (admin only)
 */
export async function updateFeatureRequestStatus(
  id: number,
  status: string,
  adminNotes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(featureRequests)
    .set({
      status: status as any,
      adminNotes,
      updatedAt: new Date(),
    })
    .where(eq(featureRequests.id, id));
}

/**
 * Update ClickUp integration details
 */
export async function updateClickUpDetails(
  id: number,
  clickupTaskId: string,
  clickupTaskUrl: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(featureRequests)
    .set({
      clickupTaskId,
      clickupTaskUrl,
      updatedAt: new Date(),
    })
    .where(eq(featureRequests.id, id));
}

/**
 * Upvote a feature request
 */
export async function upvoteFeatureRequest(featureRequestId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user already upvoted
  const existing = await db
    .select()
    .from(featureRequestUpvotes)
    .where(
      sql`${featureRequestUpvotes.featureRequestId} = ${featureRequestId} AND ${featureRequestUpvotes.userId} = ${userId}`
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Already upvoted");
  }

  // Add upvote
  await db.insert(featureRequestUpvotes).values({
    featureRequestId,
    userId,
  });

  // Increment count
  await db
    .update(featureRequests)
    .set({
      upvoteCount: sql`${featureRequests.upvoteCount} + 1`,
    })
    .where(eq(featureRequests.id, featureRequestId));
}

/**
 * Remove upvote from a feature request
 */
export async function removeUpvote(featureRequestId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Remove upvote
  await db
    .delete(featureRequestUpvotes)
    .where(
      sql`${featureRequestUpvotes.featureRequestId} = ${featureRequestId} AND ${featureRequestUpvotes.userId} = ${userId}`
    );

  // Decrement count
  await db
    .update(featureRequests)
    .set({
      upvoteCount: sql`${featureRequests.upvoteCount} - 1`,
    })
    .where(eq(featureRequests.id, featureRequestId));
}

/**
 * Get feature request by ClickUp task ID
 */
export async function getFeatureRequestByClickUpId(clickupTaskId: string) {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(featureRequests)
    .where(eq(featureRequests.clickupTaskId, clickupTaskId))
    .limit(1);

  return results[0] || null;
}
