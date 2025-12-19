import { describe, it, expect } from "vitest";

describe("User Authentication - Magic Link Email", () => {
  it("should have RESEND_API_KEY configured", () => {
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.RESEND_API_KEY).not.toBe("");
    console.log("✅ RESEND_API_KEY is configured");
  });

  it("should have RESEND_FROM_EMAIL configured", () => {
    expect(process.env.RESEND_FROM_EMAIL).toBeDefined();
    expect(process.env.RESEND_FROM_EMAIL).not.toBe("");
    console.log("✅ RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL);
  });

  it("should have VITE_APP_URL configured for magic links", () => {
    expect(process.env.VITE_APP_URL).toBeDefined();
    expect(process.env.VITE_APP_URL).not.toBe("");
    console.log("✅ VITE_APP_URL:", process.env.VITE_APP_URL);
  });

  it("should have JWT_SECRET configured", () => {
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.JWT_SECRET).not.toBe("");
    console.log("✅ JWT_SECRET is configured");
  });
});
