import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { PlaceChineseName } from "@/components/itinerary/place-chinese-name";

const originalClipboard = navigator.clipboard;

afterEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: originalClipboard,
  });
});

describe("PlaceChineseName", () => {
  test("shows the Chinese name a driver can read", () => {
    render(<PlaceChineseName name="洪崖洞民俗风貌区" />);

    const name = screen.getByText("洪崖洞民俗风貌区");
    expect(name).toBeInTheDocument();
    expect(name.closest("[lang]")).toHaveAttribute("lang", "zh-CN");
  });

  test("copies the Chinese name so it can be pasted into a chat", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<PlaceChineseName name="洪崖洞民俗风貌区" />);
    await userEvent.click(screen.getByRole("button"));

    expect(writeText).toHaveBeenCalledWith("洪崖洞民俗风貌区");
    expect(
      screen.getByRole("button", { name: /Đã sao chép/ }),
    ).toBeInTheDocument();
  });

  test("says so when the browser refuses the clipboard", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<PlaceChineseName name="洪崖洞民俗风貌区" />);
    await userEvent.click(screen.getByRole("button"));

    expect(
      screen.getByRole("button", { name: /Không sao chép được/ }),
    ).toBeInTheDocument();
  });
});
