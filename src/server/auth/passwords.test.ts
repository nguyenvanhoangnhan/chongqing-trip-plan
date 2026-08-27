import { describe, expect, it } from "vitest";

import {
  authenticateTraveler,
  verifyPassword,
} from "@/server/auth/passwords";

const validHash =
  "scrypt$cHVibGljLXRlc3Qtc2FsdA$Tal8FcLrhq49B5mWDwDyzG7NvnucsR6o5NymudfqDqs";
const secondValidHash =
  "scrypt$c2Vjb25kLXRlc3Qtc2FsdA$Xp5-MTT2Nh8tAnk5XW2Y8g1thKNWDR5zjCFlhhJMKXA";

describe("password verification", () => {
  it("accepts the password that produced a stored scrypt hash", async () => {
    await expect(
      verifyPassword("test-only-password", validHash),
    ).resolves.toBe(true);
  });

  it("rejects a different password", async () => {
    await expect(verifyPassword("wrong-test-password", validHash)).resolves.toBe(
      false,
    );
  });

  it.each(["", "sha256$salt$key", "scrypt$invalid$!"])(
    "rejects malformed stored hash %j",
    async (malformedHash) => {
      await expect(
        verifyPassword("test-only-password", malformedHash),
      ).resolves.toBe(false);
    },
  );
});

describe("traveler credentials", () => {
  it("returns the traveler selected with their matching password", async () => {
    await expect(
      authenticateTraveler(
        { personId: "duy", password: "test-only-password" },
        { duy: validHash, nhan: undefined, minh: undefined },
      ),
    ).resolves.toMatchObject({ id: "duy" });
  });

  it("rejects a password belonging to another traveler", async () => {
    await expect(
      authenticateTraveler(
        { personId: "minh", password: "test-only-password" },
        { duy: validHash, minh: secondValidHash },
      ),
    ).resolves.toBeNull();
  });

  it.each([
    {},
    { personId: "duy" },
    { password: "test-only-password" },
    { personId: "unknown", password: "test-only-password" },
    { personId: "duy", password: "" },
  ])("rejects malformed credentials %j", async (credentials) => {
    await expect(
      authenticateTraveler(credentials, { duy: validHash }),
    ).resolves.toBeNull();
  });
});
