import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

describe("New Accessibility Fields", () => {
  it("should save and retrieve bus stop distance field", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const eventData = {
      name: "Test Event with Public Transit",
      description: "Testing new accessibility fields",
      province: "Ontario",
      municipality: "Toronto",
      startDate: new Date("2025-06-01T10:00:00Z"),
      isFree: true,
      familyFriendly: true,
      youngChildren: true,
      kids: true,
      teens: false,
      seniors: false,
      isIndoor: true,
      isOutdoor: false,
      accessibility: {
        caregiver: {},
        mobility: {
          busStopDistance: "short" as const,
          accessibleSidewalks: "yes" as const,
          bikeRacks: "yes" as const,
          coveredBikeParking: "no" as const,
        },
        sensory: {},
        cognitive: {},
        social: {},
      },
    };

    const result = await caller.events.submit(eventData);
    expect(result.success).toBe(true);
    expect(result.eventId).toBeDefined();

    // Retrieve and verify
    const event = await caller.events.getById({ id: result.eventId! });
    const accessibility = JSON.parse(event.accessibility);
    
    expect(accessibility.mobility.busStopDistance).toBe("short");
    expect(accessibility.mobility.accessibleSidewalks).toBe("yes");
    expect(accessibility.mobility.bikeRacks).toBe("yes");
    expect(accessibility.mobility.coveredBikeParking).toBe("no");
  });

  it("should save and retrieve crowd level with spacious/moderate/crowded values", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const eventData = {
      name: "Test Event with Crowd Level",
      description: "Testing crowd level field",
      province: "Ontario",
      municipality: "Ottawa",
      startDate: new Date("2025-06-15T14:00:00Z"),
      isFree: true,
      familyFriendly: true,
      youngChildren: true,
      kids: true,
      teens: false,
      seniors: false,
      isIndoor: true,
      isOutdoor: false,
      accessibility: {
        caregiver: {},
        mobility: {},
        sensory: {
          crowdLevel: "moderate" as const,
        },
        cognitive: {},
        social: {},
      },
    };

    const result = await caller.events.submit(eventData);
    expect(result.success).toBe(true);

    const event = await caller.events.getById({ id: result.eventId! });
    const accessibility = JSON.parse(event.accessibility);
    
    expect(accessibility.sensory.crowdLevel).toBe("moderate");
  });

  it("should handle all new accessibility fields together", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const eventData = {
      name: "Comprehensive Accessibility Test Event",
      description: "Testing all new fields at once",
      province: "British Columbia",
      municipality: "Vancouver",
      startDate: new Date("2025-07-01T09:00:00Z"),
      isFree: false,
      costMin: 1000,
      costMax: 2000,
      costType: "range" as const,
      familyFriendly: true,
      youngChildren: true,
      kids: true,
      teens: true,
      seniors: true,
      isIndoor: false,
      isOutdoor: true,
      accessibility: {
        caregiver: {},
        mobility: {
          busStopDistance: "moderate" as const,
          accessibleSidewalks: "yes" as const,
          bikeRacks: "yes" as const,
          coveredBikeParking: "yes" as const,
          strollerAccessible: "yes" as const,
          wheelchairEntrance: "yes" as const,
        },
        sensory: {
          crowdLevel: "spacious" as const,
          sensoryFriendly: "yes" as const,
        },
        cognitive: {},
        social: {},
      },
    };

    const result = await caller.events.submit(eventData);
    expect(result.success).toBe(true);

    const event = await caller.events.getById({ id: result.eventId! });
    const accessibility = JSON.parse(event.accessibility);
    
    // Verify all new fields
    expect(accessibility.mobility.busStopDistance).toBe("moderate");
    expect(accessibility.mobility.accessibleSidewalks).toBe("yes");
    expect(accessibility.mobility.bikeRacks).toBe("yes");
    expect(accessibility.mobility.coveredBikeParking).toBe("yes");
    expect(accessibility.sensory.crowdLevel).toBe("spacious");
  });

  it("should handle unknown and not-relevant values for new fields", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const eventData = {
      name: "Test Event with Unknown Values",
      description: "Testing unknown and not-relevant",
      province: "Alberta",
      municipality: "Calgary",
      startDate: new Date("2025-08-01T11:00:00Z"),
      isFree: true,
      familyFriendly: true,
      youngChildren: false,
      kids: true,
      teens: false,
      seniors: false,
      isIndoor: true,
      isOutdoor: false,
      accessibility: {
        caregiver: {},
        mobility: {
          busStopDistance: "unknown" as const,
          accessibleSidewalks: "unknown" as const,
          bikeRacks: "not-relevant" as const,
          coveredBikeParking: "not-relevant" as const,
        },
        sensory: {
          crowdLevel: "unknown" as const,
        },
        cognitive: {},
        social: {},
      },
    };

    const result = await caller.events.submit(eventData);
    expect(result.success).toBe(true);

    const event = await caller.events.getById({ id: result.eventId! });
    const accessibility = JSON.parse(event.accessibility);
    
    expect(accessibility.mobility.busStopDistance).toBe("unknown");
    expect(accessibility.mobility.bikeRacks).toBe("not-relevant");
    expect(accessibility.sensory.crowdLevel).toBe("unknown");
  });
});
