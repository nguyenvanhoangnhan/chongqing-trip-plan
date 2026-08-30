import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WulongGuide } from "@/components/itinerary/wulong-guide";
import type { ItineraryDay } from "@/domain/itinerary";

function dayFixture(): ItineraryDay {
  return {
    id: "day-3",
    date: "2026-08-31",
    items: [
      {
        id: "day-3-stop-1",
        time: "06:00",
        activity: "Dậy",
      },
      {
        id: "day-3-stop-2",
        time: "08:08 - 08:43",
        activity: "Tàu G2427 đến Ga Vũ Long Nam",
        duration: "35 min",
        transport: "Cao tốc G2427",
        note: "Ga đến là 武隆南.",
        places: [{ label: "Ga Vũ Long Nam", query: "武隆南站" }],
        route: {
          origin: { name: "重庆东站" },
          destination: { name: "武隆南站" },
          preferredMode: "transit",
        },
      },
    ],
  };
}

describe("WulongGuide", () => {
  it("walks the day in order with its times, transport and notes", () => {
    render(<WulongGuide day={dayFixture()} />);

    const steps = screen.getAllByRole("listitem");
    expect(steps[0]).toHaveTextContent("06:00");
    expect(steps[0]).toHaveTextContent("Dậy");

    expect(screen.getByText("Tàu G2427 đến Ga Vũ Long Nam")).toBeInTheDocument();
    expect(screen.getByText("Cao tốc G2427")).toBeInTheDocument();
    expect(screen.getByText("Ga đến là 武隆南.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Ga Vũ Long Nam/ }),
    ).toBeInTheDocument();
  });

  it("carries the numbers a traveler needs before leaving", () => {
    render(<WulongGuide day={dayFixture()} />);

    expect(screen.getByText(/G8604/)).toBeInTheDocument();
    expect(screen.getByText(/^¥155 mùa cao điểm/)).toBeInTheDocument();
    expect(screen.getByText(/^¥105 mùa cao điểm/)).toBeInTheDocument();
    expect(screen.getByText(/08:00-17:00/)).toBeInTheDocument();

    const call = screen.getByRole("link", { name: /Gọi 4000235666/ });
    expect(call).toHaveAttribute("href", "tel:4000235666");
  });

  it("keeps every claim next to the source it came from", () => {
    render(<WulongGuide day={dayFixture()} />);

    const sources = screen.getByRole("contentinfo");
    expect(
      within(sources).getAllByRole("link").length,
    ).toBeGreaterThanOrEqual(7);
  });
});
