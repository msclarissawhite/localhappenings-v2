import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { events, organizers } from "../drizzle/schema";
import * as eventsDb from "./events-db";
import * as organizerDb from "./organizer-db";

describe("Organizer Edit Functionality", () => {
  let testOrganizerId: number;
  let testEventId: number;

  beforeAll(async () => {
    // Create test organizer
    const organizer = await organizerDb.upsertOrganizer({
      email: "test-edit@example.com",
      name: "Test Editor",
      isVerified: 1,
    });
    testOrganizerId = organizer.id;

    // Create test event
    testEventId = await eventsDb.createEvent({
      name: "Test Event for Editing",
      description: "Original description",
      province: "Nova Scotia",
      municipality: "Halifax",
      startDate: new Date("2025-12-25"),
      isFree: 1,
      allAges: 1,
      isIndoor: 1,
      accessibility: JSON.stringify({}),
      organizerName: "Test Editor",
      organizerEmail: "test-edit@example.com",
      organizerId: testOrganizerId,
      status: "published",
    });
  });

  it("should update event and reset status to pending", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Update the event
    await eventsDb.updateEvent(testEventId, {
      description: "Updated description",
      status: "pending",
    });

    // Verify update
    const [updatedEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, testEventId))
      .limit(1);

    expect(updatedEvent).toBeDefined();
    expect(updatedEvent.description).toBe("Updated description");
    expect(updatedEvent.status).toBe("pending");
  });

  it("should maintain organizer link after edit", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, testEventId))
      .limit(1);

    expect(event.organizerId).toBe(testOrganizerId);
  });

  it("should retrieve organizer events", async () => {
    const organizerEvents = await organizerDb.getOrganizerEvents(testOrganizerId);
    
    expect(organizerEvents).toBeDefined();
    expect(organizerEvents.length).toBeGreaterThan(0);
    expect(organizerEvents.some(e => e.id === testEventId)).toBe(true);
  });
});
