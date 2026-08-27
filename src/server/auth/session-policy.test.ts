import { describe, expect, it } from "vitest";

import { sessionPolicy, SESSION_MAX_AGE_SECONDS } from "@/server/auth/session-policy";

describe("session policy", () => {
  it("keeps a traveler signed in for two idle weeks", () => {
    expect(SESSION_MAX_AGE_SECONDS).toBe(14 * 24 * 60 * 60);
    expect(sessionPolicy.maxAge).toBe(SESSION_MAX_AGE_SECONDS);
  });

  it("stays on the stateless strategy the app already uses", () => {
    expect(sessionPolicy.strategy).toBe("jwt");
  });

  it("leaves renewal on the rolling default so the clock restarts on each visit", () => {
    // @auth/core refreshes an active session once a day (updateAge 86400), so
    // the two weeks run from the last visit, not from the sign-in.
    expect("updateAge" in sessionPolicy).toBe(false);
  });
});
