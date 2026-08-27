import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LoginPage from "@/app/login/page";

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
  signIn: vi.fn(),
}));

vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {},
}));

describe("LoginPage", () => {
  it("offers password sign-in for each traveler", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("radio", { name: "Duy" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Nhân" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Minh" })).toBeInTheDocument();
    expect(screen.getByLabelText("Mật khẩu")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(
      screen.getByRole("button", { name: "Đăng nhập bằng mật khẩu" }),
    ).toBeInTheDocument();
  });

  it("keeps Google sign-in available", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("link", { name: /Tiếp tục bằng Google/ }),
    ).toHaveAttribute("href", "/auth/google");
  });
});
