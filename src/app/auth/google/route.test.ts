import { beforeEach, describe, expect, it, vi } from "vitest";

import { signIn } from "@/auth";
import { GET } from "@/app/auth/google/route";

vi.mock("@/auth", () => ({
  signIn: vi.fn(),
}));

describe("Google sign-in transition route", () => {
  beforeEach(() => {
    vi.mocked(signIn).mockReset();
  });

  it("starts Google sign-in without leaving the current domain", async () => {
    const response = await GET();

    expect(response.status).toBe(204);
    expect(response.headers.get("location")).toBeNull();
    expect(signIn).toHaveBeenCalledWith("google", { redirectTo: "/" });
  });
});
