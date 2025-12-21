import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Saved Locations Workflow", () => {
  let testOrganizerId: number;
  let testLocationId: number;

  // Create test context
  const createContext = (): Context => ({
    req: {} as any,
    res: {} as any,
    user: null,
  });

  beforeAll(async () => {
    // Create or find test organizer
    const caller = appRouter.createCaller(createContext());
    
    try {
      const { organizer } = await caller.organizer.requestMagicLink({
        email: "saved-location-test@example.com",
      });
      testOrganizerId = organizer.id;
    } catch (error) {
      // Organizer already exists, find it
      const { findOrganizerByEmail } = await import("./organizer-db");
      const existing = await findOrganizerByEmail("saved-location-test@example.com");
      if (existing) {
        testOrganizerId = existing.id;
      } else {
        throw new Error("Failed to create test organizer");
      }
    }
  });

  it("should create a saved location", async () => {
    const caller = appRouter.createCaller(createContext());
    
    const result = await caller.savedLocations.create({
      organizerId: testOrganizerId,
      name: "Test Library",
      province: "Nova Scotia",
      municipality: "Halifax",
      neighborhoodCommunity: "Downtown",
      venue: "Halifax Central Library",
      address: "5440 Spring Garden Road",
      accessibility: {
        caregiver: {},
        mobility: { wheelchairEntrance: "yes" },
        sensory: {},
        cognitive: {},
        social: {},
      },
      isIndoor: true,
      isOutdoor: false,
    });

    expect(result.success).toBe(true);
    expect(result.location).toBeDefined();
    expect(result.location.name).toBe("Test Library");
    expect(result.location.organizerId).toBe(testOrganizerId);
    
    testLocationId = result.location.id;
  });

  it("should retrieve all saved locations for organizer", async () => {
    const caller = appRouter.createCaller(createContext());
    
    const locations = await caller.savedLocations.getAll({
      organizerId: testOrganizerId,
    });

    expect(locations).toBeDefined();
    expect(Array.isArray(locations)).toBe(true);
    expect(locations.length).toBeGreaterThan(0);
    
    const testLocation = locations.find((loc: any) => loc.id === testLocationId);
    expect(testLocation).toBeDefined();
    expect(testLocation?.name).toBe("Test Library");
  });

  it("should retrieve a single saved location by ID", async () => {
    const caller = appRouter.createCaller(createContext());
    
    const location = await caller.savedLocations.getById({
      id: testLocationId,
      organizerId: testOrganizerId,
    });

    expect(location).toBeDefined();
    expect(location?.id).toBe(testLocationId);
    expect(location?.name).toBe("Test Library");
    expect(location?.province).toBe("Nova Scotia");
    expect(location?.municipality).toBe("Halifax");
  });

  it("should update a saved location", async () => {
    const caller = appRouter.createCaller(createContext());
    
    const result = await caller.savedLocations.update({
      id: testLocationId,
      organizerId: testOrganizerId,
      name: "Updated Library Name",
      address: "Updated Address",
    });

    expect(result.success).toBe(true);

    // Verify the update
    const updated = await caller.savedLocations.getById({
      id: testLocationId,
      organizerId: testOrganizerId,
    });

    expect(updated?.name).toBe("Updated Library Name");
    expect(updated?.address).toBe("Updated Address");
    expect(updated?.municipality).toBe("Halifax"); // Should remain unchanged
  });

  it("should prevent access to another organizer's locations", async () => {
    const caller = appRouter.createCaller(createContext());
    
    // Try to access with wrong organizer ID
    const location = await caller.savedLocations.getById({
      id: testLocationId,
      organizerId: 99999, // Non-existent organizer
    });

    expect(location).toBeNull();
  });

  it("should delete a saved location", async () => {
    const caller = appRouter.createCaller(createContext());
    
    const result = await caller.savedLocations.delete({
      id: testLocationId,
      organizerId: testOrganizerId,
    });

    expect(result.success).toBe(true);

    // Verify deletion
    const deleted = await caller.savedLocations.getById({
      id: testLocationId,
      organizerId: testOrganizerId,
    });

    expect(deleted).toBeNull();
  });
});
