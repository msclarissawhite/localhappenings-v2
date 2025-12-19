import { getDb } from "./db";
import { savedEvents, events } from "../drizzle/schema";
import { eq, and, lt, gte, sql } from "drizzle-orm";

/**
 * Save/bookmark an event for a user
 */
export async function saveEvent(userId: number, eventId: number, reminderPreference: "none" | "24h" | "48h" | "both") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already saved
  const existing = await db
    .select()
    .from(savedEvents)
    .where(and(eq(savedEvents.userId, userId), eq(savedEvents.eventId, eventId)))
    .limit(1);

  if (existing.length > 0) {
    // Update reminder preference if already saved
    await db
      .update(savedEvents)
      .set({ reminderPreference })
      .where(eq(savedEvents.id, existing[0].id));
    return existing[0];
  }

  // Insert new saved event
  const result = await db.insert(savedEvents).values({
    userId,
    eventId,
    reminderPreference,
  });

  const insertId = (result as any).insertId || 0;
  return { id: Number(insertId), userId, eventId, reminderPreference };
}

/**
 * Remove a saved event
 */
export async function unsaveEvent(userId: number, eventId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(savedEvents)
    .where(and(eq(savedEvents.userId, userId), eq(savedEvents.eventId, eventId)));
}

/**
 * Get all saved events for a user with event details
 */
export async function getUserSavedEvents(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db
    .select({
      savedEvent: savedEvents,
      event: events,
    })
    .from(savedEvents)
    .innerJoin(events, eq(savedEvents.eventId, events.id))
    .where(eq(savedEvents.userId, userId))
    .orderBy(events.startDate);

  return results.map(r => ({
    ...r.event,
    savedEventId: r.savedEvent.id,
    reminderPreference: r.savedEvent.reminderPreference,
  }));
}

/**
 * Check if a user has saved a specific event
 */
export async function isEventSaved(userId: number, eventId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .select()
    .from(savedEvents)
    .where(and(eq(savedEvents.userId, userId), eq(savedEvents.eventId, eventId)))
    .limit(1);

  return result.length > 0;
}

/**
 * Get events that need 24h reminders (starting in 24-25 hours, reminder not sent yet)
 */
export async function getEvents24hReminders() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const results = await db
    .select({
      savedEvent: savedEvents,
      event: events,
    })
    .from(savedEvents)
    .innerJoin(events, eq(savedEvents.eventId, events.id))
    .where(
      and(
        // Event starts between 24-25 hours from now
        gte(events.startDate, in24h),
        lt(events.startDate, in25h),
        // Reminder not sent yet
        eq(savedEvents.reminder24hSent, 0),
        // User wants 24h or both reminders
        sql`${savedEvents.reminderPreference} IN ('24h', 'both')`
      )
    );

  return results.map(r => ({
    savedEventId: r.savedEvent.id,
    userId: r.savedEvent.userId,
    event: r.event,
  }));
}

/**
 * Get events that need 48h reminders (starting in 48-49 hours, reminder not sent yet)
 */
export async function getEvents48hReminders() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const in49h = new Date(now.getTime() + 49 * 60 * 60 * 1000);

  const results = await db
    .select({
      savedEvent: savedEvents,
      event: events,
    })
    .from(savedEvents)
    .innerJoin(events, eq(savedEvents.eventId, events.id))
    .where(
      and(
        // Event starts between 48-49 hours from now
        gte(events.startDate, in48h),
        lt(events.startDate, in49h),
        // Reminder not sent yet
        eq(savedEvents.reminder48hSent, 0),
        // User wants 48h or both reminders
        sql`${savedEvents.reminderPreference} IN ('48h', 'both')`
      )
    );

  return results.map(r => ({
    savedEventId: r.savedEvent.id,
    userId: r.savedEvent.userId,
    event: r.event,
  }));
}

/**
 * Mark 24h reminder as sent
 */
export async function mark24hReminderSent(savedEventId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(savedEvents)
    .set({ reminder24hSent: 1 })
    .where(eq(savedEvents.id, savedEventId));
}

/**
 * Mark 48h reminder as sent
 */
export async function mark48hReminderSent(savedEventId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(savedEvents)
    .set({ reminder48hSent: 1 })
    .where(eq(savedEvents.id, savedEventId));
}
