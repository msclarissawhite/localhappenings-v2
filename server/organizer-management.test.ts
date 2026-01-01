import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-admin",
    name: "Test Admin",
    email: "admin@test.com",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    pendingEmail: null,
    loginMethod: "oauth",
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "test-user",
    name: "Test User",
    email: "user@test.com",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    pendingEmail: null,
    loginMethod: "oauth",
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Organizer Management Router", () => {
  let testOrganizerId: number;

  describe("Email Templates", () => {
    it("should create an email template", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.organizerManagement.createEmailTemplate({
        name: "Test Welcome Template",
        subject: "Welcome to Local Happenings!",
        body: "Thank you for joining us. We're excited to have you on board!",
        category: "welcome",
      });

      expect(result.success).toBe(true);
      expect(result.templateId).toBeDefined();
    });

    it("should list all email templates", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const templates = await caller.organizerManagement.getAllEmailTemplates();
      
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
      
      const testTemplate = templates.find(t => t.name === "Test Welcome Template");
      expect(testTemplate).toBeDefined();
      expect(testTemplate?.category).toBe("welcome");
    });

    it("should update an email template", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const templates = await caller.organizerManagement.getAllEmailTemplates();
      const testTemplate = templates.find(t => t.name === "Test Welcome Template");
      
      if (!testTemplate) throw new Error("Test template not found");

      const result = await caller.organizerManagement.updateEmailTemplate({
        id: testTemplate.id,
        name: "Updated Welcome Template",
        subject: "Welcome! (Updated)",
        body: "Updated body text",
        category: "welcome",
      });

      expect(result.success).toBe(true);

      const updatedTemplates = await caller.organizerManagement.getAllEmailTemplates();
      const updated = updatedTemplates.find(t => t.id === testTemplate.id);
      expect(updated?.name).toBe("Updated Welcome Template");
    });

    it("should delete an email template", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const templates = await caller.organizerManagement.getAllEmailTemplates();
      const testTemplate = templates.find(t => t.name === "Updated Welcome Template");
      
      if (!testTemplate) throw new Error("Test template not found");

      const result = await caller.organizerManagement.deleteEmailTemplate({
        id: testTemplate.id,
      });

      expect(result.success).toBe(true);

      const remainingTemplates = await caller.organizerManagement.getAllEmailTemplates();
      const deleted = remainingTemplates.find(t => t.id === testTemplate.id);
      expect(deleted).toBeUndefined();
    });
  });

  describe("Organizer Management", () => {
    it("should get all organizers with stats", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const organizers = await caller.organizerManagement.getAllOrganizers({
        verificationFilter: "all",
      });

      expect(Array.isArray(organizers)).toBe(true);
      
      if (organizers.length > 0) {
        const org = organizers[0];
        expect(org).toHaveProperty("id");
        expect(org).toHaveProperty("name");
        expect(org).toHaveProperty("email");
        expect(org).toHaveProperty("totalEvents");
        expect(org).toHaveProperty("approvedEvents");
        expect(org).toHaveProperty("approvalRate");
        
        testOrganizerId = org.id;
      }
    });

    it("should filter organizers by verification status", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const verifiedOrgs = await caller.organizerManagement.getAllOrganizers({
        verificationFilter: "verified",
      });

      expect(Array.isArray(verifiedOrgs)).toBe(true);
      verifiedOrgs.forEach(org => {
        expect(org.isVerified).toBe(1);
      });
    });

    it("should add a note to an organizer", async () => {
      if (!testOrganizerId) {
        console.log("Skipping note test - no organizers found");
        return;
      }

      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.organizerManagement.addOrganizerNote({
        organizerId: testOrganizerId,
        note: "Test admin note",
        isFlagged: false,
      });

      expect(result.success).toBe(true);
      expect(result.noteId).toBeDefined();
    });

    it("should get notes for an organizer", async () => {
      if (!testOrganizerId) {
        console.log("Skipping get notes test - no organizers found");
        return;
      }

      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const notes = await caller.organizerManagement.getOrganizerNotes({
        organizerId: testOrganizerId,
      });

      expect(Array.isArray(notes)).toBe(true);
      
      if (notes.length > 0) {
        const testNote = notes.find(n => n.note === "Test admin note");
        expect(testNote).toBeDefined();
      }
    });

    it("should add a flagged note", async () => {
      if (!testOrganizerId) {
        console.log("Skipping flagged note test - no organizers found");
        return;
      }

      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.organizerManagement.addOrganizerNote({
        organizerId: testOrganizerId,
        note: "Flagged for quality review",
        isFlagged: true,
        flagReason: "Multiple low-quality submissions",
      });

      expect(result.success).toBe(true);
    });

    it("should get organizer analytics", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const analytics = await caller.organizerManagement.getOrganizerAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics).toHaveProperty("topOrganizers");
      expect(analytics).toHaveProperty("newOrganizersThisMonth");
      expect(analytics).toHaveProperty("organizersByType");
      expect(analytics).toHaveProperty("organizersByProvince");

      expect(Array.isArray(analytics.topOrganizers)).toBe(true);
      expect(Array.isArray(analytics.organizersByType)).toBe(true);
      expect(Array.isArray(analytics.organizersByProvince)).toBe(true);
      expect(typeof analytics.newOrganizersThisMonth).toBe("number");
    });
  });

  describe("Access Control", () => {
    it("should deny non-admin access", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.organizerManagement.getAllOrganizers({ verificationFilter: "all" })
      ).rejects.toThrow();
    });
  });
});
