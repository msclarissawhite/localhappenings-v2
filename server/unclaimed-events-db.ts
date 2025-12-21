import { eq, isNull } from "drizzle-orm";
import { events } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get all published events without an organizer (for claim assignment)
 */
export async function getUnclaimedEvents() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(events)
    .where(
      eq(events.status, "published")
    )
    .then(results => results.filter(event => !event.organizerId));
}
