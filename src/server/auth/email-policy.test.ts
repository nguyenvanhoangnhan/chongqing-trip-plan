import { describe, expect, it } from "vitest";

import { createEmailPolicy } from "@/server/auth/email-policy";

const policy = createEmailPolicy({
  "traveler-1": "first@example.com",
  "traveler-2": "second@example.com",
  "traveler-3": "third@example.com",
});

describe("traveler email policy", () => {
  it("maps normalized configured emails to travelers", () => {
    expect(policy.personFromEmail(" FIRST@example.com ")?.id).toBe("traveler-1");
    expect(policy.personFromEmail("second@example.com")?.id).toBe("traveler-2");
    expect(policy.personFromEmail("third@example.com")?.id).toBe("traveler-3");
  });

  it("does not allow missing or unconfigured emails", () => {
    expect(policy.personFromEmail("outside@example.com")).toBeNull();
    expect(policy.personFromEmail(null)).toBeNull();
    expect(createEmailPolicy({}).personFromEmail("first@example.com")).toBeNull();
  });

  it("requires Google to verify an allowlisted email", () => {
    expect(
      policy.isAllowedGoogleProfile({
        email: "second@example.com",
        email_verified: true,
      }),
    ).toBe(true);
    expect(
      policy.isAllowedGoogleProfile({
        email: "second@example.com",
        email_verified: false,
      }),
    ).toBe(false);
  });

  it("returns the configured email for credentials sessions", () => {
    expect(policy.emailForPerson("traveler-1")).toBe("first@example.com");
    expect(createEmailPolicy({}).emailForPerson("traveler-1")).toBeNull();
  });
});
