import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import AppError from "@/app/error";

describe("AppError", () => {
  it("explains the failure, shows the digest and offers a retry", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const reset = vi.fn();
    const error = Object.assign(new Error("boom"), { digest: "4274340757" });

    render(<AppError error={error} reset={reset} />);

    expect(screen.getByRole("heading", { name: "Trang chưa tải được" })).toBeInTheDocument();
    expect(screen.getByText(/4274340757/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Tải lại/ }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
