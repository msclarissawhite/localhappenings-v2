import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Event Submission Tests
 * 
 * Tests the complete event submission workflow including:
 * - Basic event creation with required fields
 * - Accessibility data validation
 * - Cost validation (free, fixed, range, donation-based)
 * - Age group validation
 * - Image upload handling
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

describe("Event Submission Flow", () => {
  describe("Basic Event Submission", () => {
    it("should create a basic event with required fields", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Test Community Event",
        description: "A test event for the community",
        province: "Nova Scotia",
        municipality: "Halifax",
        venue: "Community Center",
        address: "123 Main St",
        startDate: new Date("2025-06-15T14:00:00"),
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
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
      expect(result.eventId).toBeTypeOf("number");
    });

    it("should handle events with end dates (multi-day events)", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Summer Festival",
        description: "A 3-day summer festival",
        province: "Nova Scotia",
        municipality: "Dartmouth",
        venue: "Waterfront Park",
        address: "456 Harbor Rd",
        startDate: new Date("2025-07-01T10:00:00"),
        endDate: new Date("2025-07-03T18:00:00"),
        isFree: false,
        fixedPrice: 25,
        allAges: true,
        outdoor: true,
        organizerName: "Festival Organizer",
        organizerEmail: "festival@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
      expect(result.eventId).toBeTypeOf("number");
    });

    it("should handle events with image URLs", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Art Exhibition",
        description: "Local art showcase",
        province: "Nova Scotia",
        municipality: "Bedford",
        venue: "Art Gallery",
        address: "789 Art Lane",
        startDate: new Date("2025-08-10T11:00:00"),
        imageUrl: "https://storage.example.com/events/art-exhibit.jpg",
        isFree: true,
        allAges: true,
        indoor: true,
        organizerName: "Art Curator",
        organizerEmail: "art@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
      expect(result.eventId).toBeTypeOf("number");
    });
  });

  describe("Cost Validation", () => {
    it("should handle free events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Free Community Picnic",
        description: "Everyone welcome",
        province: "Nova Scotia",
        municipality: "Halifax",
        venue: "Public Park",
        address: "100 Park Ave",
        startDate: new Date("2025-06-20T12:00:00"),
        isFree: true,
        allAges: true,
        outdoor: true,
        organizerName: "Community Group",
        organizerEmail: "community@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
    });

    it("should handle fixed price events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Concert Ticket",
        description: "Live music performance",
        province: "Nova Scotia",
        municipality: "Halifax",
        venue: "Music Hall",
        address: "200 Concert Dr",
        startDate: new Date("2025-07-15T19:00:00"),
        isFree: false,
        fixedPrice: 35,
        allAges: false,
        adults: true,
        indoor: true,
        organizerName: "Music Promoter",
        organizerEmail: "music@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
    });

    it("should handle price range events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Workshop Series",
        description: "Educational workshops",
        province: "Nova Scotia",
        municipality: "Dartmouth",
        venue: "Learning Center",
        address: "300 Education Way",
        startDate: new Date("2025-08-01T10:00:00"),
        isFree: false,
        priceMin: 10,
        priceMax: 50,
        allAges: true,
        indoor: true,
        organizerName: "Education Team",
        organizerEmail: "edu@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
    });

    it("should handle donation-based events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Charity Fundraiser",
        description: "Support local causes",
        province: "Nova Scotia",
        municipality: "Halifax",
        venue: "Community Hall",
        address: "400 Charity Ln",
        startDate: new Date("2025-09-10T18:00:00"),
        isFree: false,
        donationBased: true,
        allAges: true,
        indoor: true,
        organizerName: "Charity Org",
        organizerEmail: "charity@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
    });

    it("should handle pay-what-you-can events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Theater Performance",
        description: "Pay what you can afford",
        province: "Nova Scotia",
        municipality: "Bedford",
        venue: "Community Theater",
        address: "500 Stage St",
        startDate: new Date("2025-10-05T19:30:00"),
        isFree: false,
        payWhatYouCan: true,
        allAges: true,
        indoor: true,
        organizerName: "Theater Group",
        organizerEmail: "theater@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
    });

    it("should handle kids free events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Family Museum Day",
        description: "Kids get in free",
        province: "Nova Scotia",
        municipality: "Halifax",
        venue: "Museum",
        address: "600 History Rd",
        startDate: new Date("2025-11-01T10:00:00"),
        isFree: false,
        fixedPrice: 15,
        kidsFree: true,
        allAges: true,
        indoor: true,
        organizerName: "Museum Staff",
        organizerEmail: "museum@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
    });
  });

  describe("Age Group Validation", () => {
    it("should handle all ages events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "All Ages Concert",
        description: "Family-friendly music",
        province: "Nova Scotia",
        municipality: "Halifax",
        venue: "Outdoor Stage",
        address: "700 Music Ave",
        startDate: new Date("2025-06-25T15:00:00"),
        isFree: true,
        allAges: true,
        outdoor: true,
        organizerName: "Concert Organizer",
        organizerEmail: "concert@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
    });

    it("should handle young children events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Toddler Story Time",
        description: "Stories for little ones",
        province: "Nova Scotia",
        municipality: "Dartmouth",
        venue: "Library",
        address: "800 Book Rd",
        startDate: new Date("2025-07-05T10:00:00"),
        isFree: true,
        youngChildren: true,
        indoor: true,
        organizerName: "Librarian",
        organizerEmail: "library@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
    });

    it("should handle adults-only events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Wine Tasting",
        description: "18+ only",
        province: "Nova Scotia",
        municipality: "Halifax",
        venue: "Wine Bar",
        address: "900 Grape St",
        startDate: new Date("2025-08-20T19:00:00"),
        isFree: false,
        fixedPrice: 45,
        adults: true,
        indoor: true,
        organizerName: "Wine Expert",
        organizerEmail: "wine@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
    });
  });

  describe("Accessibility Data", () => {
    it("should store wheelchair accessibility information", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Accessible Workshop",
        description: "Fully accessible venue",
        province: "Nova Scotia",
        municipality: "Halifax",
        venue: "Accessible Center",
        address: "1000 Access Way",
        startDate: new Date("2025-09-15T14:00:00"),
        isFree: true,
        allAges: true,
        indoor: true,
        organizerName: "Accessibility Advocate",
        organizerEmail: "access@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {
            wheelchairEntrance: "yes" as const,
            stepFreeEntry: "yes" as const,
            accessibleWashrooms: "yes" as const,
            accessibleParking: "yes" as const,
          },
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
    });

    it("should store sensory accessibility information", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Sensory-Friendly Movie",
        description: "Low sensory environment",
        province: "Nova Scotia",
        municipality: "Bedford",
        venue: "Cinema",
        address: "1100 Film Ln",
        startDate: new Date("2025-10-10T11:00:00"),
        isFree: false,
        fixedPrice: 8,
        kids: true,
        indoor: true,
        organizerName: "Cinema Manager",
        organizerEmail: "cinema@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {
            quietEnvironment: "yes" as const,
            sensoryFriendly: "yes" as const,
            crowdLevel: "spacious" as const,
          },
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
    });

    it("should handle 'unknown' accessibility values", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "New Venue Event",
        description: "Accessibility details being confirmed",
        province: "Nova Scotia",
        municipality: "Dartmouth",
        venue: "New Location",
        address: "1200 Unknown St",
        startDate: new Date("2025-11-01T15:00:00"),
        isFree: true,
        allAges: true,
        indoor: true,
        organizerName: "New Organizer",
        organizerEmail: "new@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {
            wheelchairEntrance: "unknown" as const,
            accessibleWashrooms: "unknown" as const,
          },
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
    });

    it("should handle 'not-relevant' accessibility values", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Virtual Webinar",
        description: "Online event",
        province: "Nova Scotia",
        municipality: "Halifax",
        venue: "Online",
        address: "Virtual",
        startDate: new Date("2025-12-01T19:00:00"),
        isFree: true,
        allAges: true,
        organizerName: "Webinar Host",
        organizerEmail: "webinar@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {
            wheelchairEntrance: "not-relevant" as const,
            accessibleParking: "not-relevant" as const,
          },
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
    });
  });

  describe("Environment and Venue Details", () => {
    it("should handle indoor events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Indoor Craft Fair",
        description: "Browse local crafts",
        province: "Nova Scotia",
        municipality: "Dartmouth",
        venue: "Convention Center",
        address: "1300 Indoor Ave",
        startDate: new Date("2025-08-15T10:00:00"),
        isFree: true,
        allAges: true,
        indoor: true,
        organizerName: "Craft Coordinator",
        organizerEmail: "crafts@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
    });

    it("should handle outdoor events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const eventData = {
        name: "Outdoor Market",
        description: "Fresh produce and goods",
        province: "Nova Scotia",
        municipality: "Halifax",
        venue: "Farmers Market",
        address: "1400 Market St",
        startDate: new Date("2025-09-01T08:00:00"),
        isFree: true,
        allAges: true,
        outdoor: true,
        organizerName: "Market Manager",
        organizerEmail: "market@example.com",
        showOrganizerInfo: true,
        accessibility: {
          caregiver: {},
          mobility: {},
          sensory: {},
          cognitive: {},
          social: {},
        },
      };

      const result = await caller.events.submit(eventData);

      expect(result.success).toBe(true);
    });
  });
});
