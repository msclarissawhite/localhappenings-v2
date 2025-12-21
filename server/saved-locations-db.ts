import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { savedLocations } from "../drizzle/schema";
import type { SavedLocation, InsertSavedLocation } from "../drizzle/schema";

/**
 * Get all saved locations for an organizer
 */
export async function getSavedLocationsByOrganizerId(organizerId: number): Promise<SavedLocation[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(savedLocations)
    .where(eq(savedLocations.organizerId, organizerId))
    .orderBy(savedLocations.createdAt);
}

/**
 * Get a single saved location by ID
 */
export async function getSavedLocationById(id: number, organizerId: number): Promise<SavedLocation | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [location] = await db
    .select()
    .from(savedLocations)
    .where(eq(savedLocations.id, id))
    .limit(1);
  
  // Verify ownership
  if (location && location.organizerId !== organizerId) {
    return null;
  }
  
  return location || null;
}

/**
 * Create a new saved location
 */
export async function createSavedLocation(data: InsertSavedLocation): Promise<SavedLocation> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const [result] = await db.insert(savedLocations).values(data);
  
  return {
    id: result.insertId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as SavedLocation;
}

/**
 * Update an existing saved location
 */
export async function updateSavedLocation(
  id: number,
  organizerId: number,
  data: Partial<InsertSavedLocation>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Verify ownership before updating
  const existing = await getSavedLocationById(id, organizerId);
  if (!existing) {
    throw new Error('Saved location not found or access denied');
  }
  
  await db
    .update(savedLocations)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(savedLocations.id, id));
}

/**
 * Delete a saved location
 */
export async function deleteSavedLocation(id: number, organizerId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Verify ownership before deleting
  const existing = await getSavedLocationById(id, organizerId);
  if (!existing) {
    throw new Error('Saved location not found or access denied');
  }
  
  await db.delete(savedLocations).where(eq(savedLocations.id, id));
}

/**
 * Set a location as the default for an organizer
 * Clears any existing default first (only one default per organizer)
 */
export async function setDefaultLocation(id: number, organizerId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Verify ownership
  const existing = await getSavedLocationById(id, organizerId);
  if (!existing) {
    throw new Error('Saved location not found or access denied');
  }
  
  // Clear any existing default for this organizer
  await db
    .update(savedLocations)
    .set({ isDefault: 0 })
    .where(eq(savedLocations.organizerId, organizerId));
  
  // Set the new default
  await db
    .update(savedLocations)
    .set({ isDefault: 1, updatedAt: new Date() })
    .where(eq(savedLocations.id, id));
}

/**
 * Get the default location for an organizer
 */
export async function getDefaultLocation(organizerId: number): Promise<SavedLocation | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [location] = await db
    .select()
    .from(savedLocations)
    .where(
      and(
        eq(savedLocations.organizerId, organizerId),
        eq(savedLocations.isDefault, 1)
      )
    )
    .limit(1);
  
  return location || null;
}
