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

  it("moves the renamed production domain to the registered OAuth domain", async () => {
    const response = await GET(
      new Request("https://chongqing-plan.vercel.app/auth/google"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://chongqing-gift-planner.vercel.app/auth/google",
    );
    expect(signIn).not.toHaveBeenCalled();
  });

  it("starts Google sign-in on an already registered origin", async () => {
    const response = await GET(new Request("http://localhost:3010/auth/google"));

    expect(signIn).toHaveBeenCalledWith("google", { redirectTo: "/" });
    expect(response.status).toBe(204);
  });
});
