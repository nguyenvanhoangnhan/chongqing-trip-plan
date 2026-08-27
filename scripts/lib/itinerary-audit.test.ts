import { describe, expect, test } from "vitest";

import { auditItinerary } from "./itinerary-audit.ts";

type AuditRoutePoint = { name: string };

type AuditItem = {
  id: string;
  time: string;
  activity: string;
  places: { label: string; query?: string; uid?: string }[];
  route?: { origin: AuditRoutePoint; destination: AuditRoutePoint };
};

type AuditDay = {
  id: string;
  date: string;
  headline: string;
  items: AuditItem[];
};

function itinerary(overrides: Record<string, unknown> = {}) {
  const days: AuditDay[] = ["day-1", "day-2", "day-3", "day-4", "day-5"].map(
    (id, index) => ({
      id,
      date: `2035-04-1${index}`,
      headline: `Route ${index + 1}`,
      items: [
        {
          id: `${id}-stop-1`,
          time: "08:00 - 09:00",
          activity: "Fictional stop",
          places: [{ label: "Fictional place", query: "测试地点" }],
        },
      ],
    }),
  );

  return {
    schemaVersion: 1,
    title: "Fictional trip",
    subtitle: "Fictional subtitle",
    days,
    ...overrides,
  };
}

describe("auditItinerary", () => {
  test("passes an itinerary whose links all resolve", () => {
    expect(auditItinerary(itinerary())).toEqual([]);
  });

  test("catches a route endpoint past the length Baidu still routes", () => {
    const data = itinerary();
    data.days[0].items[0].route = {
      origin: { name: "起点" },
      destination: { name: "终".repeat(120) },
    };

    const problems = auditItinerary(data);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("day-1-stop-1");
    expect(problems[0]).toContain("120");
  });

  test("holds the boundary at the last length Baidu still routes", () => {
    const atLimit = itinerary();
    atLimit.days[0].items[0].route = {
      origin: { name: "起点" },
      destination: { name: "终".repeat(100) },
    };
    expect(auditItinerary(atLimit)).toEqual([]);

    const overLimit = itinerary();
    overLimit.days[0].items[0].route = {
      origin: { name: "起点" },
      destination: { name: "终".repeat(101) },
    };
    expect(auditItinerary(overLimit)).toHaveLength(1);
  });

  test("catches a stop time no clock reading can be found in", () => {
    const data = itinerary();
    data.days[0].items[0].time = "cả ngày";

    expect(auditItinerary(data)).toEqual([
      expect.stringContaining("day-1-stop-1"),
    ]);
  });

  test("reports the schema's own complaint when the shape is wrong", () => {
    const problems = auditItinerary({ schemaVersion: 2 });

    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0]).toContain("schemaVersion");
  });
});
