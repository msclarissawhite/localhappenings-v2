import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createOrganizerContext(organizerId: number): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-organizer",
    email: "organizer@example.com",
    name: "Test Organizer",
    loginMethod: "manus",
    role: "user",
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
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Contact Templates", () => {
  const testOrganizerId = 999999; // Use a high ID to avoid conflicts

  it("should create and retrieve a contact template", async () => {
    const ctx = createOrganizerContext(testOrganizerId);
    const caller = appRouter.createCaller(ctx);

    // Create a template
    const created = await caller.contactTemplates.create({
      organizerId: testOrganizerId,
      name: "Test Organization",
      contactName: "John Doe",
      contactEmail: "john@example.com",
      contactPhone: "(902) 555-1234",
      contactWebsite: "https://example.com",
      displayPublicly: false,
      isDefault: false,
    });

    expect(created).toBeDefined();
    expect(created.name).toBe("Test Organization");
    expect(created.contactEmail).toBe("john@example.com");

    // Retrieve templates
    const templates = await caller.contactTemplates.list({
      organizerId: testOrganizerId,
    });

    expect(templates).toBeDefined();
    expect(templates.length).toBeGreaterThan(0);
    const found = templates.find((t) => t.id === created.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe("Test Organization");

    // Clean up
    await caller.contactTemplates.delete({ id: created.id });
  });

  it("should update a contact template", async () => {
    const ctx = createOrganizerContext(testOrganizerId);
    const caller = appRouter.createCaller(ctx);

    // Create a template
    const created = await caller.contactTemplates.create({
      organizerId: testOrganizerId,
      name: "Original Name",
      contactName: "John Doe",
      contactEmail: "john@example.com",
      contactPhone: "(902) 555-1234",
      contactWebsite: "https://example.com",
      displayPublicly: false,
      isDefault: false,
    });

    // Update it
    const updated = await caller.contactTemplates.update({
      id: created.id,
      name: "Updated Name",
      contactName: "Jane Doe",
      contactEmail: "jane@example.com",
      contactPhone: "(902) 555-5678",
      contactWebsite: "https://updated.com",
    });

    expect(updated.name).toBe("Updated Name");
    expect(updated.contactEmail).toBe("jane@example.com");

    // Clean up
    await caller.contactTemplates.delete({ id: created.id });
  });

  it("should set a template as default", async () => {
    const ctx = createOrganizerContext(testOrganizerId);
    const caller = appRouter.createCaller(ctx);

    // Create a template
    const created = await caller.contactTemplates.create({
      organizerId: testOrganizerId,
      name: "Default Template",
      contactName: "John Doe",
      contactEmail: "john@example.com",
      contactPhone: "(902) 555-1234",
      contactWebsite: "https://example.com",
      displayPublicly: false,
      isDefault: false,
    });

    // Set as default
    await caller.contactTemplates.setDefault({
      id: created.id,
      organizerId: testOrganizerId,
    });

    // Verify it's default
    const templates = await caller.contactTemplates.list({
      organizerId: testOrganizerId,
    });

    const defaultTemplate = templates.find((t) => t.id === created.id);
    expect(defaultTemplate?.isDefault).toBe(1); // Database stores as 1/0 not true/false

    // Clean up
    await caller.contactTemplates.delete({ id: created.id });
  });

  it("should delete a contact template", async () => {
    const ctx = createOrganizerContext(testOrganizerId);
    const caller = appRouter.createCaller(ctx);

    // Create a template
    const created = await caller.contactTemplates.create({
      organizerId: testOrganizerId,
      name: "To Be Deleted",
      contactName: "John Doe",
      contactEmail: "john@example.com",
      contactPhone: "(902) 555-1234",
      contactWebsite: "https://example.com",
      displayPublicly: false,
      isDefault: false,
    });

    // Delete it
    await caller.contactTemplates.delete({ id: created.id });

    // Verify it's gone
    const templates = await caller.contactTemplates.list({
      organizerId: testOrganizerId,
    });

    const deleted = templates.find((t) => t.id === created.id);
    expect(deleted).toBeUndefined();
  });
});
