import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { organizers, events } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Organizer Verification System", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testOrganizerId: number;
  let testEventId: number;

  beforeAll(async () => {
    caller = appRouter.createCaller({
      user: null,
    });

    // Find or create a test organizer
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const testEmail = "verified-test@example.com";
    
    // Try to find existing organizer
    const [existing] = await db
      .select()
      .from(organizers)
      .where(eq(organizers.email, testEmail))
      .limit(1);

    if (existing) {
      testOrganizerId = existing.id;
      // Reset to unverified for testing
      await db
        .update(organizers)
        .set({ isVerified: 0 })
        .where(eq(organizers.id, testOrganizerId));
    } else {
      const [result] = await db.insert(organizers).values({
        email: testEmail,
        name: "Test Verified Organizer",
        isVerified: 0,
      });
      testOrganizerId = result.insertId;
    }
  });

  it("should toggle organizer verification status", async () => {
    // Toggle to verified
    await caller.organizer.toggleVerification({
      organizerId: testOrganizerId,
      isVerified: true,
    });

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [organizer] = await db
      .select()
      .from(organizers)
      .where(eq(organizers.id, testOrganizerId))
      .limit(1);

    expect(organizer.isVerified).toBe(1);

    // Toggle back to unverified
    await caller.organizer.toggleVerification({
      organizerId: testOrganizerId,
      isVerified: false,
    });

    const [unverifiedOrganizer] = await db
      .select()
      .from(organizers)
      .where(eq(organizers.id, testOrganizerId))
      .limit(1);

    expect(unverifiedOrganizer.isVerified).toBe(0);
  });

  it("should auto-approve events from verified organizers", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Set organizer as verified
    await db
      .update(organizers)
      .set({ isVerified: 1 })
      .where(eq(organizers.id, testOrganizerId));

    // Submit an event as verified organizer
    const eventData = {
      name: "Auto-Approved Event",
      description: "This should be auto-approved",
      province: "Nova Scotia",
      municipality: "Halifax",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRecurring: false,
      isFree: true,
      kidsFree: false,
      freeCompanion: false,
      allAges: true,
      familyFriendly: true,
      youngChildren: false,
      kids: false,
      teens: false,
      adultsOnly: false,
      seniors: false,
      isIndoor: true,
      isOutdoor: false,
      accessibility: {
        caregiver: { changeTablesPresent: "no" },
        mobility: { wheelchairEntrance: "yes" },
        sensory: { sensoryFriendly: "unknown" },
        cognitive: { signLanguage: "not-relevant" },
        social: { lgbtqiaFriendly: "yes" },
      },
      organizerName: "Test Verified Organizer",
      organizerEmail: "verified-test@example.com",
      displayOrganizerInfo: true,
      organizerId: testOrganizerId,
    };

    const result = await caller.events.submit(eventData);
    expect(result.success).toBe(true);

    // Check that event was auto-approved (status should be "published")
    // Query the most recent event for this organizer
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.organizerId, testOrganizerId))
      .orderBy(events.createdAt)
      .limit(1);

    expect(event).toBeDefined();
    expect(event.status).toBe("published");
    expect(event.organizerId).toBe(testOrganizerId);
    
    testEventId = event.id;
    
    console.log("✅ Verified organizer event auto-approved with status:", event.status);
  });

  it("should include organizer verification status in event queries", async () => {
    // Get event by ID
    const event = await caller.events.getById({ id: testEventId });
    
    expect(event).toBeDefined();
    expect(event?.organizerIsVerified).toBe(true);
    
    console.log("✅ Event includes organizerIsVerified:", event?.organizerIsVerified);
  });

  it("should list all organizers for admin", async () => {
    const organizers = await caller.organizer.getAllOrganizers();
    
    expect(organizers).toBeDefined();
    expect(Array.isArray(organizers)).toBe(true);
    expect(organizers.length).toBeGreaterThan(0);
    
    const testOrganizer = organizers.find(o => o.id === testOrganizerId);
    expect(testOrganizer).toBeDefined();
    expect(testOrganizer?.isVerified).toBe(1);
    
    console.log(`✅ Found ${organizers.length} organizers, test organizer is verified`);
  });
});
