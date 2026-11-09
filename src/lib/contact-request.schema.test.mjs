import { describe, expect, it } from "bun:test";

import { contactRequestSchema } from "./contact-request.schema.ts";

describe("contact request validation", () => {
  it("accepts a valid request within the form's 2,000-character message limit", () => {
    const result = contactRequestSchema.safeParse({
      name: "Reader",
      email: "reader@example.com",
      message: "Hello, I enjoyed the stories.",
      website: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email addresses and messages longer than 2,000 characters", () => {
    expect(
      contactRequestSchema.safeParse({
        name: "Reader",
        email: "not-an-email",
        message: "Hello",
      }).success,
    ).toBe(false);
    expect(
      contactRequestSchema.safeParse({
        name: "Reader",
        email: "reader@example.com",
        message: "x".repeat(2001),
      }).success,
    ).toBe(false);
  });
});