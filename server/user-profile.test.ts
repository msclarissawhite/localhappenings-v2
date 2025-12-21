import { describe, it, expect, beforeEach } from "vitest";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("User Profile", () => {
  let testUserId: number;
  const testEmail = `test-${Date.now()}@example.com`;

  beforeEach(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Create a test user
    const [result] = await db.insert(users).values({
      email: testEmail,
      name: "Test User",
      loginMethod: "magic_link",
      role: "user",
      openId: `magic_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    });

    testUserId = Number(result.insertId);
  });

  it("should create a user with magic link login", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    expect(user).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.name).toBe("Test User");
    expect(user.loginMethod).toBe("magic_link");
    expect(user.role).toBe("user");
  });

  it("should update user profile name", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    await db
      .update(users)
      .set({ name: "Updated Name" })
      .where(eq(users.id, testUserId));

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    expect(user.name).toBe("Updated Name");
  });

  it("should update user profile email", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const newEmail = `updated-${Date.now()}@example.com`;

    await db
      .update(users)
      .set({ email: newEmail })
      .where(eq(users.id, testUserId));

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    expect(user.email).toBe(newEmail);
  });

  it("should track last signed in timestamp", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const now = new Date();

    await db
      .update(users)
      .set({ lastSignedIn: now })
      .where(eq(users.id, testUserId));

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    expect(user.lastSignedIn).toBeDefined();
    // Allow 1 second difference for test execution time
    expect(Math.abs(user.lastSignedIn!.getTime() - now.getTime())).toBeLessThan(1000);
  });

  it("should maintain user role as 'user' by default", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    expect(user.role).toBe("user");
  });
});
