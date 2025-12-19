import { describe, it, expect } from "vitest";
import { testClickUpConnection } from "./clickup-integration";

describe("ClickUp Integration", () => {
  it("should successfully connect to ClickUp API with provided credentials", async () => {
    const isConnected = await testClickUpConnection();
    expect(isConnected).toBe(true);
  }, 10000); // 10 second timeout for API call
});
