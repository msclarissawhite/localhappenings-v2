import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Admin Approval Tests
 * 
 * Tests the complete admin moderation workflow including:
 * - Event approval (pending → published)
 * - Event rejection (pending → rejected)
 * - Request clarification (pending → needs-info)
 * - Admin event editing
 * - Bulk approval/rejection
 * - Admin permission validation
 */

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(isAdmin = false): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: isAdmin ? "admin" : "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Admin Approval Workflow", () => {
  let testEventId: number;

  beforeEach(async () => {
    // Create a test event for approval tests
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.events.submit({
      name: "Test Event for Approval",
      description: "This event will be used for approval testing",
      province: "Nova Scotia",
      municipality: "Halifax",
      venue: "Test Venue",
      address: "123 Test St",
      startDate: new Date("2025-06-15T14:00:00"),
      isFree: true,
      allAges: true,
      indoor: true,
      organizerName: "Test Organizer",
      organizerEmail: "test@example.com",
      showOrganizerInfo: true,
    });

    testEventId = result.eventId;
  });

  describe("Event Approval", () => {
    it("should approve a pending event", async () => {
      const ctx = createTestContext(true); // Admin context
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.updateStatus({
        eventId: testEventId,
        status: "published",
      });

      expect(result.success).toBe(true);
    });

    it("should require admin role to approve events", async () => {
      const ctx = createTestContext(false); // Non-admin context
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.events.updateStatus({
          eventId: testEventId,
          status: "published",
        })
      ).rejects.toThrow("Admin access required");
    });

    it("should allow approved events to appear in public listings", async () => {
      const adminCtx = createTestContext(true);
      const adminCaller = appRouter.createCaller(adminCtx);

      // Approve the event
      await adminCaller.events.updateStatus({
        eventId: testEventId,
        status: "published",
      });

      // Check public listing
      const publicCtx = createTestContext(false);
      const publicCaller = appRouter.createCaller(publicCtx);

      const result = await publicCaller.events.list({
        limit: 100,
        offset: 0,
      });

      expect(result.events.some(e => e.id === testEventId)).toBe(true);
    });
  });

  describe("Event Rejection", () => {
    it("should reject a pending event", async () => {
      const ctx = createTestContext(true);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.updateStatus({
        eventId: testEventId,
        status: "rejected",
        reviewNotes: "Event does not meet community guidelines",
      });

      expect(result.success).toBe(true);
    });

    it("should require admin role to reject events", async () => {
      const ctx = createTestContext(false);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.events.updateStatus({
          eventId: testEventId,
          status: "rejected",
        })
      ).rejects.toThrow("Admin access required");
    });

    it("should exclude rejected events from public listings", async () => {
      const adminCtx = createTestContext(true);
      const adminCaller = appRouter.createCaller(adminCtx);

      // Reject the event
      await adminCaller.events.updateStatus({
        eventId: testEventId,
        status: "rejected",
      });

      // Check public listing
      const publicCtx = createTestContext(false);
      const publicCaller = appRouter.createCaller(publicCtx);

      const result = await publicCaller.events.list({
        limit: 100,
        offset: 0,
      });

      expect(result.events.some(e => e.id === testEventId)).toBe(false);
    });
  });

  describe("Request Clarification", () => {
    it("should request clarification on a pending event", async () => {
      const ctx = createTestContext(true);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.updateStatus({
        eventId: testEventId,
        status: "needs-info",
        reviewNotes: "Please provide more details about accessibility features",
      });

      expect(result.success).toBe(true);
    });

    it("should require admin role to request clarification", async () => {
      const ctx = createTestContext(false);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.events.updateStatus({
          eventId: testEventId,
          status: "needs-info",
        })
      ).rejects.toThrow("Admin access required");
    });
  });

  describe("Admin Event Editing", () => {
    it("should allow admin to edit event details", async () => {
      const ctx = createTestContext(true);
      const caller = appRouter.createCaller(ctx);

      // First approve the event
      await caller.events.updateStatus({
        eventId: testEventId,
        status: "published",
      });

      // Admin edits the event
      const result = await caller.events.adminEdit({
        eventId: testEventId,
        name: "Updated Event Name",
        description: "Updated description",
      });

      expect(result.success).toBe(true);
    });

    it("should require admin role to edit events", async () => {
      const ctx = createTestContext(false);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.events.adminEdit({
          eventId: testEventId,
          name: "Updated Name",
        })
      ).rejects.toThrow("Admin access required");
    });
  });

  describe("Bulk Operations", () => {
    let bulkEventIds: number[];

    beforeEach(async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // Create multiple test events
      const event1 = await caller.events.submit({
        name: "Bulk Event 1",
        description: "First bulk event",
        province: "Nova Scotia",
        municipality: "Halifax",
        venue: "Venue 1",
        address: "400 Bulk St",
        startDate: new Date("2025-08-01T10:00:00"),
        isFree: true,
        allAges: true,
        indoor: true,
        organizerName: "Test Organizer",
        organizerEmail: "test@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      });

      const event2 = await caller.events.submit({
        name: "Bulk Event 2",
        description: "Second bulk event",
        province: "Nova Scotia",
        municipality: "Dartmouth",
        venue: "Venue 2",
        address: "500 Bulk Ave",
        startDate: new Date("2025-08-02T14:00:00"),
        isFree: true,
        allAges: true,
        indoor: true,
        organizerName: "Test Organizer",
        organizerEmail: "test@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      });

      const event3 = await caller.events.submit({
        name: "Bulk Event 3",
        description: "Third bulk event",
        province: "Nova Scotia",
        municipality: "Bedford",
        venue: "Venue 3",
        address: "600 Bulk Rd",
        startDate: new Date("2025-08-03T16:00:00"),
        isFree: true,
        allAges: true,
        indoor: true,
        organizerName: "Test Organizer",
        organizerEmail: "test@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      });

      bulkEventIds = [event1.eventId, event2.eventId, event3.eventId];
    });

    it("should approve multiple events at once", async () => {
      const ctx = createTestContext(true);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.bulkUpdateStatus({
        eventIds: bulkEventIds,
        status: "published",
      });

      expect(result.success).toBe(true);
      expect(result.updated).toBe(3);
    });

    it("should reject multiple events at once", async () => {
      const ctx = createTestContext(true);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.bulkUpdateStatus({
        eventIds: bulkEventIds,
        status: "rejected",
        reviewNotes: "Bulk rejection",
      });

      expect(result.success).toBe(true);
      expect(result.updated).toBe(3);
    });

    it("should require admin role for bulk operations", async () => {
      const ctx = createTestContext(false);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.events.bulkUpdateStatus({
          eventIds: bulkEventIds,
          status: "published",
        })
      ).rejects.toThrow("Admin access required");
    });
  });

  describe("Pending Events List", () => {
    it("should allow admin to view pending events", async () => {
      const ctx = createTestContext(true);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.getPending();

      expect(Array.isArray(result)).toBe(true);
      // Should include our test event
      expect(result.some(e => e.id === testEventId)).toBe(true);
    });

    it("should require admin role to view pending events", async () => {
      const ctx = createTestContext(false);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.events.getPending()).rejects.toThrow("Admin access required");
    });
  });

  describe("Admin Permissions", () => {
    it("should prevent non-admins from accessing admin endpoints", async () => {
      const ctx = createTestContext(false);
      const caller = appRouter.createCaller(ctx);

      // Try to access various admin endpoints
      await expect(caller.events.getPending()).rejects.toThrow("Admin access required");
      
      await expect(
        caller.events.updateStatus({
          eventId: testEventId,
          status: "published",
        })
      ).rejects.toThrow("Admin access required");

      await expect(
        caller.events.adminEdit({
          eventId: testEventId,
          name: "Hacked Name",
        })
      ).rejects.toThrow("Admin access required");
    });

    it("should allow admins to access all admin endpoints", async () => {
      const ctx = createTestContext(true);
      const caller = appRouter.createCaller(ctx);

      // All these should succeed without throwing
      const pending = await caller.events.getPending();
      expect(Array.isArray(pending)).toBe(true);

      const updateResult = await caller.events.updateStatus({
        eventId: testEventId,
        status: "published",
      });
      expect(updateResult.success).toBe(true);

      const editResult = await caller.events.adminEdit({
        eventId: testEventId,
        description: "Admin updated description",
      });
      expect(editResult.success).toBe(true);
    });
  });
});
