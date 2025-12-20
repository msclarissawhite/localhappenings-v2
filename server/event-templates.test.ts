import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Event Templates API", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let mockContext: Context;

  beforeEach(() => {
    mockContext = {
      user: { id: 1, email: "test@example.com", name: "Test User", role: "user", openId: "test-open-id" },
      req: {} as any,
      res: {} as any,
    };
    caller = appRouter.createCaller(mockContext);
  });

  describe("eventTemplates.create", () => {
    it("should require authentication", async () => {
      const unauthCaller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });
      
      await expect(
        unauthCaller.eventTemplates.create({
          templateName: "Test Template",
          templateData: { name: "Test Event" },
        })
      ).rejects.toThrow("UNAUTHORIZED");
    });

    it("should create template with valid data", async () => {
      const templateData = {
        description: "Test event description",
        province: "Nova Scotia",
        municipality: "Halifax",
        venue: "Test Venue",
        isFree: true,
        allAges: true,
        isIndoor: true,
      };

      const result = await caller.eventTemplates.create({
        templateName: "Weekly Storytime",
        description: "Template for weekly storytimes",
        templateData,
      });

      expect(result).toHaveProperty("templateId");
      expect(typeof result.templateId).toBe("number");
    });
  });

  describe("eventTemplates.list", () => {
    it("should require authentication", async () => {
      const unauthCaller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });
      
      await expect(unauthCaller.eventTemplates.list()).rejects.toThrow("UNAUTHORIZED");
    });

    it("should return empty array for user with no templates", async () => {
      const result = await caller.eventTemplates.list();
      
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return user's templates after creation", async () => {
      // Create a template first
      await caller.eventTemplates.create({
        templateName: "Test Template",
        templateData: { description: "Test" },
      });

      const result = await caller.eventTemplates.list();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("id");
        expect(result[0]).toHaveProperty("templateName");
        expect(result[0]).toHaveProperty("createdAt");
      }
    });
  });

  describe("eventTemplates.get", () => {
    it("should require authentication", async () => {
      const unauthCaller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });
      
      await expect(
        unauthCaller.eventTemplates.get({ templateId: 1 })
      ).rejects.toThrow("UNAUTHORIZED");
    });

    it("should return template data", async () => {
      const templateData = {
        description: "Test description",
        venue: "Test Venue",
        isFree: true,
      };

      const createResult = await caller.eventTemplates.create({
        templateName: "Test Template",
        templateData,
      });

      const result = await caller.eventTemplates.get({ templateId: createResult.templateId });
      
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("templateName");
      expect(result).toHaveProperty("templateData");
      expect(result.templateName).toBe("Test Template");
    });

    it("should not allow accessing another user's template", async () => {
      // Create as user 1
      const createResult = await caller.eventTemplates.create({
        templateName: "User 1 Template",
        templateData: { description: "Test" },
      });

      // Try to access as user 2
      const user2Context: Context = {
        user: { id: 2, email: "user2@example.com", name: "User 2", role: "user", openId: "user2-open-id" },
        req: {} as any,
        res: {} as any,
      };
      const user2Caller = appRouter.createCaller(user2Context);

      await expect(
        user2Caller.eventTemplates.get({ templateId: createResult.templateId })
      ).rejects.toThrow();
    });
  });

  describe("eventTemplates.update", () => {
    it("should require authentication", async () => {
      const unauthCaller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });
      
      await expect(
        unauthCaller.eventTemplates.update({
          templateId: 1,
          templateName: "Updated",
          templateData: {},
        })
      ).rejects.toThrow("UNAUTHORIZED");
    });

    it("should update template", async () => {
      const createResult = await caller.eventTemplates.create({
        templateName: "Original Name",
        templateData: { description: "Original" },
      });

      const updateResult = await caller.eventTemplates.update({
        templateId: createResult.templateId,
        templateName: "Updated Name",
        description: "Updated description",
        templateData: { description: "Updated" },
      });

      expect(updateResult).toHaveProperty("success");
      expect(updateResult.success).toBe(true);

      const getResult = await caller.eventTemplates.get({ templateId: createResult.templateId });
      expect(getResult.templateName).toBe("Updated Name");
    });
  });

  describe("eventTemplates.delete", () => {
    it("should require authentication", async () => {
      const unauthCaller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });
      
      await expect(
        unauthCaller.eventTemplates.delete({ templateId: 1 })
      ).rejects.toThrow("UNAUTHORIZED");
    });

    it("should delete user's own template", async () => {
      const createResult = await caller.eventTemplates.create({
        templateName: "To Delete",
        templateData: { description: "Test" },
      });

      const deleteResult = await caller.eventTemplates.delete({ templateId: createResult.templateId });
      
      expect(deleteResult).toHaveProperty("success");
      expect(deleteResult.success).toBe(true);

      await expect(
        caller.eventTemplates.get({ templateId: createResult.templateId })
      ).rejects.toThrow();
    });
  });
});
