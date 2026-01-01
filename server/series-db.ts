import { getDb } from "./db";
import { eventSeries, events } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Get all series for an organizer
 */
export async function getSeriesByOrganizer(organizerId: number) {
  const db = await getDb();
  return await db
    .select()
    .from(eventSeries)
    .where(eq(eventSeries.organizerId, organizerId))
    .orderBy(desc(eventSeries.createdAt));
}

/**
 * Get a single series by ID
 */
export async function getSeriesById(seriesId: number) {
  const db = await getDb();
  const result = await db
    .select()
    .from(eventSeries)
    .where(eq(eventSeries.id, seriesId))
    .limit(1);
  return result[0] || null;
}

/**
 * Get a single series by slug
 */
export async function getSeriesBySlug(slug: string) {
  const db = await getDb();
  const result = await db
    .select()
    .from(eventSeries)
    .where(eq(eventSeries.slug, slug))
    .limit(1);
  return result[0] || null;
}

/**
 * Create a new series
 */
export async function createSeries(data: {
  name: string;
  description?: string;
  slug: string;
  organizerId: number;
  imageUrl?: string;
}) {
  const db = await getDb();
  const result = await db.insert(eventSeries).values(data);
  return result[0].insertId;
}

/**
 * Update a series
 */
export async function updateSeries(
  seriesId: number,
  data: {
    name?: string;
    description?: string;
    slug?: string;
    imageUrl?: string;
    isActive?: number;
  }
) {
  const db = await getDb();
  await db.update(eventSeries).set(data).where(eq(eventSeries.id, seriesId));
}

/**
 * Delete a series (and unlink all events)
 */
export async function deleteSeries(seriesId: number) {
  const db = await getDb();
  // First unlink all events from this series
  await db
    .update(events)
    .set({ seriesId: null })
    .where(eq(events.seriesId, seriesId));

  // Then delete the series
  await db.delete(eventSeries).where(eq(eventSeries.id, seriesId));
}

/**
 * Get all events in a series
 */
export async function getEventsBySeries(seriesId: number) {
  const db = await getDb();
  return await db
    .select()
    .from(events)
    .where(and(eq(events.seriesId, seriesId), eq(events.status, "published")))
    .orderBy(events.startDate);
}

/**
 * Count events in a series
 */
export async function countEventsBySeries(seriesId: number) {
  const db = await getDb();
  const result = await db
    .select()
    .from(events)
    .where(eq(events.seriesId, seriesId));
  return result.length;
}

/**
 * Link an event to a series
 */
export async function linkEventToSeries(eventId: number, seriesId: number | null) {
  const db = await getDb();
  await db.update(events).set({ seriesId }).where(eq(events.id, eventId));
}

/**
 * Generate a unique slug from a series name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Check if a slug is available
 */
export async function isSlugAvailable(slug: string, excludeId?: number): Promise<boolean> {
  const result = await db
    .select()
    .from(eventSeries)
    .where(eq(eventSeries.slug, slug))
    .limit(1);

  if (result.length === 0) return true;
  if (excludeId && result[0].id === excludeId) return true;
  return false;
}
