import { describe, expect, it } from "vitest";

import {
  getClientIp,
  LoginRateLimiter,
} from "@/server/auth/login-rate-limit";

const WINDOW_MS = 15 * 60 * 1_000;

describe("credentials login rate limit", () => {
  it("blocks an IP after 10 failed attempts within 15 minutes", () => {
    let now = 1_000;
    const limiter = new LoginRateLimiter({
      maxFailures: 10,
      windowMs: WINDOW_MS,
      now: () => now,
    });

    for (let attempt = 1; attempt <= 10; attempt += 1) {
      expect(limiter.isBlocked("203.0.113.10")).toBe(false);
      limiter.recordFailure("203.0.113.10");
    }

    expect(limiter.isBlocked("203.0.113.10")).toBe(true);
    expect(limiter.isBlocked("203.0.113.11")).toBe(false);

    now += WINDOW_MS;
    expect(limiter.isBlocked("203.0.113.10")).toBe(false);
  });

  it("clears an IP after a successful login", () => {
    const limiter = new LoginRateLimiter({
      maxFailures: 10,
      windowMs: WINDOW_MS,
    });

    for (let attempt = 0; attempt < 10; attempt += 1) {
      limiter.recordFailure("203.0.113.10");
    }

    limiter.reset("203.0.113.10");
    expect(limiter.isBlocked("203.0.113.10")).toBe(false);
  });

  it("uses the first forwarded IP and falls back safely", () => {
    expect(
      getClientIp(
        new Headers({
          "x-vercel-forwarded-for": "192.0.2.40",
          "x-forwarded-for": "203.0.113.10",
        }),
      ),
    ).toBe("192.0.2.40");
    expect(
      getClientIp(
        new Headers({
          "x-forwarded-for": "203.0.113.10, 198.51.100.20",
          "x-real-ip": "192.0.2.30",
        }),
      ),
    ).toBe("203.0.113.10");
    expect(getClientIp(new Headers({ "x-real-ip": "192.0.2.30" }))).toBe(
      "192.0.2.30",
    );
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
