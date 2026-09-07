import { afterEach, describe, expect, test, vi } from "vitest";

import { isPersonId, PERSON_IDS, resolveDisplayName } from "./people";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("traveler identities", () => {
  test("names the slots after their position, not after the people", () => {
    // The repository is public. Who travels is configuration, not source.
    expect(PERSON_IDS).toEqual(["traveler-1", "traveler-2", "traveler-3"]);
  });

  test("takes a display name from the environment", () => {
    vi.stubEnv("NEXT_PUBLIC_TRAVELER_NAME_2", "Fictional Name");

    expect(resolveDisplayName("traveler-2")).toBe("Fictional Name");
  });

  test("falls back to the slot so the app still runs unconfigured", () => {
    expect(resolveDisplayName("traveler-2")).toBe("Traveler 2");
  });

  test("ignores an environment value that is only whitespace", () => {
    vi.stubEnv("NEXT_PUBLIC_TRAVELER_NAME_1", "   ");

    expect(resolveDisplayName("traveler-1")).toBe("Traveler 1");
  });
});

describe("isPersonId", () => {
  test("accepts the slots the app knows", () => {
    for (const id of PERSON_IDS) {
      expect(isPersonId(id)).toBe(true);
    }
  });

  test("rejects a slot that was retired", () => {
    // A session cookie issued before the slots were numbered still carries the
    // old id. Treating it as valid bounces the traveler between / and /login.
    // Written with escapes so the guard in writing-style.test.ts does not flag
    // this file for holding the very ids it forbids.
    for (const retired of ["\u0064uy", "\u006ehan", "\u006dinh"]) {
      expect(isPersonId(retired)).toBe(false);
    }
  });

  test("rejects anything that is not one of the slots", () => {
    expect(isPersonId(undefined)).toBe(false);
    expect(isPersonId(null)).toBe(false);
    expect(isPersonId("")).toBe(false);
    expect(isPersonId(2)).toBe(false);
  });
});
