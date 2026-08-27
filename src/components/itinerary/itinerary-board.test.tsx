import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import type { Itinerary } from "@/domain/itinerary";

import { ItineraryBoard } from "./itinerary-board";

function itineraryFixture(): Itinerary {
  return {
    schemaVersion: 1,
    title: "Private trip",
    subtitle: "A route made for five days",
    days: ["day-1", "day-2", "day-3", "day-4", "day-5"].map(
      (id, index) => ({
        id: id as Itinerary["days"][number]["id"],
        date: `2035-04-${String(index + 10).padStart(2, "0")}`,
        headline: `Route ${index + 1}`,
        items: [
          {
            id: `${id}-stop-1`,
            time: "08:00",
            activity: `Stop ${index + 1}`,
            duration: "1 giờ",
            transport: "Metro",
            note: index === 2 ? "Bring the private booking note" : undefined,
            places: [
              {
                label: "Station",
                query: "测试车站",
                uid: `fictional-station-${index + 1}`,
              },
              { label: "Landmark", uid: `fictional-landmark-${index + 1}` },
            ],
            route:
              index === 2
                ? {
                    origin: { name: "起点" },
                    destination: { name: "终点" },
                    preferredMode: "transit" as const,
                  }
                : undefined,
          },
        ],
      }),
    ),
  };
}

describe("ItineraryBoard", () => {
  test("opens only the supplied current day by default", () => {
    const { container } = render(
      <ItineraryBoard
        itinerary={itineraryFixture()}
        defaultOpenDayIds={["day-3"]}
      />,
    );

    const days = [...container.querySelectorAll("details")];
    expect(days).toHaveLength(5);
    expect(days.map((day) => day.open)).toEqual([false, false, true, false, false]);
  });

  test("lets a traveler expand a collapsed day", () => {
    render(
      <ItineraryBoard
        itinerary={itineraryFixture()}
        defaultOpenDayIds={["day-3"]}
      />,
    );

    const firstDay = screen
      .getAllByText("Ngày 1")
      .map((element) => element.closest("details"))
      .find(Boolean);
    expect(firstDay).not.toBeNull();
    expect(firstDay?.open).toBe(false);

    fireEvent.click(within(firstDay as HTMLElement).getByText("Ngày 1"));

    expect(firstDay?.open).toBe(true);
  });

  test("lets the traveler pick the map right above the days", () => {
    render(
      <ItineraryBoard
        itinerary={itineraryFixture()}
        defaultOpenDayIds={["day-3"]}
      />,
    );

    expect(screen.getByText("Mở bản đồ bằng")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Baidu/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Amap/ })).not.toBeChecked();
  });

  test("offers both car and public-transport Baidu routes", () => {
    render(
      <ItineraryBoard
        itinerary={itineraryFixture()}
        defaultOpenDayIds={["day-3"]}
      />,
    );

    const driving = screen.getByRole("link", { name: "Ô tô" });
    const transit = screen.getByRole("link", { name: "Công cộng" });

    expect(new URL(driving.getAttribute("href") ?? "").searchParams.get("mode")).toBe(
      "driving",
    );
    expect(new URL(transit.getAttribute("href") ?? "").searchParams.get("mode")).toBe(
      "transit",
    );
  });

  test("renders private stop details and a Baidu place link", () => {
    render(
      <ItineraryBoard
        itinerary={itineraryFixture()}
        defaultOpenDayIds={["day-3"]}
      />,
    );

    expect(screen.getByText("Stop 3")).toBeInTheDocument();
    expect(screen.getAllByText("1 giờ")).toHaveLength(5);
    expect(screen.getAllByText("Metro")).toHaveLength(5);
    expect(screen.getByText("Bring the private booking note")).toBeInTheDocument();

    const place = screen.getAllByRole("link", { name: /Station/ })[2];
    const url = new URL(place.getAttribute("href") ?? "");
    expect(url.pathname).toBe("/place/detail");
    expect(url.searchParams.get("uid")).toBe("fictional-station-3");
  });

  test("keeps the trip hero focused on navigation instead of filler stats", () => {
    render(
      <ItineraryBoard
        itinerary={itineraryFixture()}
        defaultOpenDayIds={["day-3"]}
      />,
    );

    expect(screen.queryByText("A route made for five days")).not.toBeInTheDocument();
    expect(screen.queryByText("Hành trình")).not.toBeInTheDocument();
    expect(screen.queryByText("Điểm lịch")).not.toBeInTheDocument();
    expect(screen.queryByText("Múi giờ")).not.toBeInTheDocument();
  });

  test("leaves the itinerary open when a traveler opens a Baidu route", () => {
    render(
      <ItineraryBoard
        itinerary={itineraryFixture()}
        defaultOpenDayIds={["day-3"]}
      />,
    );

    for (const name of [/Ô tô/, /Công cộng/]) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    }
  });

  test("shows the Chinese name of a stop without opening Baidu", () => {
    render(
      <ItineraryBoard
        itinerary={itineraryFixture()}
        defaultOpenDayIds={["day-3"]}
      />,
    );

    const names = screen.getAllByText("测试车站");
    expect(names).toHaveLength(5);
    expect(names[0].closest("[lang]")).toHaveAttribute("lang", "zh-CN");
  });

  test("leaves out the Chinese line for a place that has no Chinese name", () => {
    const { container } = render(
      <ItineraryBoard
        itinerary={itineraryFixture()}
        defaultOpenDayIds={["day-3"]}
      />,
    );

    // Five stations carry a Chinese name; the five landmarks do not.
    expect(container.querySelectorAll(".itinerary-stop__zh")).toHaveLength(5);
  });

  test("marks where the traveler is now and what comes next", () => {
    const { container } = render(
      <ItineraryBoard
        itinerary={itineraryFixture()}
        defaultOpenDayIds={["day-3"]}
        progress={{
          currentItemId: "day-3-stop-1",
          nextItemId: "day-4-stop-1",
        }}
      />,
    );

    const current = container.querySelector('[data-progress="current"]');
    const next = container.querySelector('[data-progress="next"]');

    expect(current).toHaveTextContent("Đang ở đây");
    expect(next).toHaveTextContent("Tiếp theo");
    expect(container.querySelectorAll("[data-progress]")).toHaveLength(2);
  });

  test("marks nothing when the trip is not running today", () => {
    const { container } = render(
      <ItineraryBoard
        itinerary={itineraryFixture()}
        defaultOpenDayIds={["day-3"]}
      />,
    );

    expect(container.querySelectorAll("[data-progress]")).toHaveLength(0);
    expect(screen.queryByText("Đang ở đây")).not.toBeInTheDocument();
  });

  test("opens every map link in its own tab", () => {
    const { container } = render(
      <ItineraryBoard
        itinerary={itineraryFixture()}
        defaultOpenDayIds={["day-3"]}
      />,
    );

    const mapLinks = [
      ...container.querySelectorAll('a[href*="api.map.baidu.com"]'),
    ];
    expect(mapLinks.length).toBeGreaterThan(0);

    for (const link of mapLinks) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    }
  });
});
