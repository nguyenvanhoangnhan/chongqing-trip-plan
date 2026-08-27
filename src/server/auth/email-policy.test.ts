import { describe, expect, it } from "vitest";

import { createEmailPolicy } from "@/server/auth/email-policy";

const policy = createEmailPolicy({
  duy: "duy@example.com",
  nhan: "nhan@example.com",
  minh: "minh@example.com",
});

describe("traveler email policy", () => {
  it("maps normalized configured emails to travelers", () => {
    expect(policy.personFromEmail(" DUY@example.com ")?.id).toBe("duy");
    expect(policy.personFromEmail("nhan@example.com")?.id).toBe("nhan");
    expect(policy.personFromEmail("minh@example.com")?.id).toBe("minh");
  });

  it("does not allow missing or unconfigured emails", () => {
    expect(policy.personFromEmail("outside@example.com")).toBeNull();
    expect(policy.personFromEmail(null)).toBeNull();
    expect(createEmailPolicy({}).personFromEmail("duy@example.com")).toBeNull();
  });

  it("requires Google to verify an allowlisted email", () => {
    expect(
      policy.isAllowedGoogleProfile({
        email: "nhan@example.com",
        email_verified: true,
      }),
    ).toBe(true);
    expect(
      policy.isAllowedGoogleProfile({
        email: "nhan@example.com",
        email_verified: false,
      }),
    ).toBe(false);
  });

  it("returns the configured email for credentials sessions", () => {
    expect(policy.emailForPerson("duy")).toBe("duy@example.com");
    expect(createEmailPolicy({}).emailForPerson("duy")).toBeNull();
  });
});
