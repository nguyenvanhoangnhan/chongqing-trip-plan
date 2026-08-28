import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LocationGuide } from "@/components/planner/location-guide";
import { giftCatalog } from "@/data/catalog";

const originalClipboard = navigator.clipboard;

afterEach(() => {
  vi.useRealTimers();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: originalClipboard,
  });
});

describe("LocationGuide", () => {
  it("shows shopping stops in itinerary order", () => {
    render(<LocationGuide locations={giftCatalog.locations} />);

    expect(
      screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
    ).toEqual([
      "Raffles City Trùng Khánh",
      "Hồng Nhai Động",
      "Khu Giải Phóng Bi - Bát Nhất Lộ",
      "Công viên sáng tạo Nhị Xưởng",
      "Phố cổ Từ Khí Khẩu",
    ]);
  });

  it("presents each stop as a concise itinerary step", () => {
    render(<LocationGuide locations={giftCatalog.locations} />);

    expect(screen.getByText("Quanh khu trung tâm")).toBeInTheDocument();
    expect(screen.getAllByText("Trong lịch trình")).toHaveLength(4);
    expect(screen.getAllByRole("article")).toHaveLength(5);
  });

  it("copies the exact Chinese map query from a location action", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<LocationGuide locations={giftCatalog.locations} />);

    await userEvent.click(
      screen.getAllByRole("button", { name: "Tìm trên bản đồ" })[0],
    );

    expect(writeText).toHaveBeenCalledWith("重庆来福士 L1 重庆伴手礼");
    expect(
      screen.getByRole("button", { name: "Đã sao chép" }),
    ).toBeInTheDocument();
  });

  it("reports a clipboard failure without showing success", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("Clipboard blocked")),
      },
    });
    render(<LocationGuide locations={giftCatalog.locations.slice(0, 1)} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Tìm trên bản đồ" }),
    );

    expect(
      await screen.findByRole("button", { name: "Không sao chép được" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Đã sao chép" }),
    ).not.toBeInTheDocument();
  });

  it("restores the map action after temporary copy feedback", async () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    render(<LocationGuide locations={giftCatalog.locations.slice(0, 1)} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Tìm trên bản đồ" }));
    });
    expect(
      screen.getByRole("button", { name: "Đã sao chép" }),
    ).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });

    expect(
      screen.getByRole("button", { name: "Tìm trên bản đồ" }),
    ).toBeInTheDocument();
  });
});
