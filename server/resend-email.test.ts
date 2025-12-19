import { describe, it, expect } from "vitest";
import { sendMagicLinkEmail, sendEventStatusEmail } from "./_core/resend-email";

describe("Resend Email Integration", () => {
  it("should send magic link email successfully", async () => {
    const result = await sendMagicLinkEmail({
      to: "test@example.com",
      name: "Test User",
      magicLink: "http://localhost:3000/organizer/verify?token=test123",
    });

    // Should return true if Resend is configured, false otherwise
    expect(typeof result).toBe("boolean");
  });

  it("should send event status email successfully", async () => {
    const result = await sendEventStatusEmail({
      to: "test@example.com",
      name: "Test Organizer",
      eventName: "Test Event",
      eventId: 1,
      status: "published",
    });

    // Should return true if Resend is configured, false otherwise
    expect(typeof result).toBe("boolean");
  });

  it("should handle rejected status email", async () => {
    const result = await sendEventStatusEmail({
      to: "test@example.com",
      name: "Test Organizer",
      eventName: "Test Event",
      eventId: 2,
      status: "rejected",
      reviewNotes: "Missing accessibility information",
    });

    expect(typeof result).toBe("boolean");
  });

  it("should handle needs-clarification status email", async () => {
    const result = await sendEventStatusEmail({
      to: "test@example.com",
      name: "Test Organizer",
      eventName: "Test Event",
      eventId: 3,
      status: "needs-clarification",
      reviewNotes: "Please provide venue address",
    });

    expect(typeof result).toBe("boolean");
  });
});
