import { describe, expect, it } from "vitest";

import { authorizeTravelerCredentials } from "@/server/auth/credentials-auth";
import { createEmailPolicy } from "@/server/auth/email-policy";
import { LoginRateLimiter } from "@/server/auth/login-rate-limit";

const validHash =
  "scrypt$cHVibGljLXRlc3Qtc2FsdA$Tal8FcLrhq49B5mWDwDyzG7NvnucsR6o5NymudfqDqs";
const policy = createEmailPolicy({ duy: "duy@example.com" });

function loginRequest(ip = "203.0.113.10") {
  return new Request("https://example.com/api/auth/callback/credentials", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("credentials authorization", () => {
  it("counts bad passwords by IP and clears the count after success", async () => {
    const limiter = new LoginRateLimiter({
      maxFailures: 2,
      windowMs: 15 * 60 * 1_000,
    });
    const options = {
      passwordHashes: { duy: validHash },
      emailPolicy: policy,
      limiter,
    };

    await expect(
      authorizeTravelerCredentials(
        { personId: "duy", password: "wrong" },
        loginRequest(),
        options,
      ),
    ).resolves.toBeNull();

    await expect(
      authorizeTravelerCredentials(
        { personId: "duy", password: "test-only-password" },
        loginRequest(),
        options,
      ),
    ).resolves.toMatchObject({
      id: "duy",
      email: "duy@example.com",
    });

    await authorizeTravelerCredentials(
      { personId: "duy", password: "wrong" },
      loginRequest(),
      options,
    );
    expect(limiter.isBlocked("203.0.113.10")).toBe(false);
  });

  it("rejects a blocked IP before accepting otherwise valid credentials", async () => {
    const limiter = new LoginRateLimiter({
      maxFailures: 2,
      windowMs: 15 * 60 * 1_000,
    });
    limiter.recordFailure("203.0.113.10");
    limiter.recordFailure("203.0.113.10");

    await expect(
      authorizeTravelerCredentials(
        { personId: "duy", password: "test-only-password" },
        loginRequest(),
        {
          passwordHashes: { duy: validHash },
          emailPolicy: policy,
          limiter,
        },
      ),
    ).resolves.toBeNull();
  });
});
