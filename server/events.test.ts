import { describe, expect, it } from "vitest";
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

describe("events.submit", () => {
  it("allows public event submission with required fields", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const eventData = {
      name: "Test Community Event",
      description: "A test event for our community",
      province: "Nova Scotia",
      city: "Halifax",
      startDate: new Date("2025-01-15T10:00:00"),
      isFree: true,
      familyFriendly: true,
      youngChildren: false,
      kids: false,
      teens: false,
      seniors: false,
      isIndoor: true,
      isOutdoor: false,
      accessibility: {
        caregiver: {
          changeTablesPresent: "unknown" as const,
        },
        mobility: {
          wheelchairEntrance: "yes" as const,
        },
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

describe("events.getPending", () => {
  it("requires admin role to access pending events", async () => {
    const ctx = createTestContext(false); // non-admin user
    const caller = appRouter.createCaller(ctx);

    await expect(caller.events.getPending()).rejects.toThrow("Admin access required");
  });

  it("allows admin to access pending events", async () => {
    const ctx = createTestContext(true); // admin user
    const caller = appRouter.createCaller(ctx);

    const result = await caller.events.getPending();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("events.updateStatus", () => {
  it("requires admin role to update event status", async () => {
    const ctx = createTestContext(false); // non-admin user
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.events.updateStatus({
        eventId: 1,
        status: "published",
      })
    ).rejects.toThrow("Admin access required");
  });
});
