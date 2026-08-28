import { describe, expect, test } from "vitest";

import {
  getChinaDateKey,
  getDefaultOpenDayIds,
  getItineraryProgress,
  ItineraryPlaceSchema,
  ItineraryRouteSchema,
  parseStopTime,
} from "./itinerary";

const tripDayIds = [
  "day-1",
  "day-2",
  "day-3",
  "day-4",
  "day-5",
];

const fictionalSchedule = [
  { id: "day-1", date: "2035-04-10" },
  { id: "day-2", date: "2035-04-11" },
  { id: "day-3", date: "2035-04-12" },
  { id: "day-4", date: "2035-04-13" },
  { id: "day-5", date: "2035-04-14" },
];

describe("itinerary day defaults", () => {
  test("uses the calendar date in China at the UTC date boundary", () => {
    expect(getChinaDateKey(new Date("2035-04-09T16:00:00.000Z"))).toBe(
      "2035-04-10",
    );
  });

  test("opens only the current trip day in China", () => {
    expect(
      getDefaultOpenDayIds(
        new Date("2035-04-12T03:30:00.000Z"),
        fictionalSchedule,
      ),
    ).toEqual(["day-3"]);
  });

  test("opens every day before the trip starts", () => {
    expect(
      getDefaultOpenDayIds(
        new Date("2035-04-05T03:30:00.000Z"),
        fictionalSchedule,
      ),
    ).toEqual(tripDayIds);
  });

  test("opens every day after the trip ends", () => {
    expect(
      getDefaultOpenDayIds(
        new Date("2035-04-20T03:30:00.000Z"),
        fictionalSchedule,
      ),
    ).toEqual(tripDayIds);
  });
});

describe("itinerary map targets", () => {
  test("accepts a text-search fallback while a POI UID is unresolved", () => {
    expect(
      ItineraryPlaceSchema.safeParse({
        label: "Fictional stop",
        query: "Fictional stop",
      }).success,
    ).toBe(true);
  });

  test("accepts a direct POI UID", () => {
    expect(
      ItineraryPlaceSchema.safeParse({
        label: "Fictional POI",
        uid: "fictional-poi-uid",
      }).success,
    ).toBe(true);
  });

  test("rejects a place that carries neither a POI UID nor a query", () => {
    expect(
      ItineraryPlaceSchema.safeParse({ label: "Fictional coordinate" }).success,
    ).toBe(false);
  });

  test("accepts named route endpoints while coordinates are still being resolved", () => {
    expect(
      ItineraryRouteSchema.safeParse({
        origin: { name: "Fictional origin" },
        destination: { name: "Fictional destination" },
      }).success,
    ).toBe(true);
  });
});

describe("stop times", () => {
  test("reads the shapes the private itinerary actually uses", () => {
    expect(parseStopTime("0:00-4:00")).toEqual({
      startMinutes: 0,
      endMinutes: 240,
    });
    expect(parseStopTime("4:00 - 5:00")).toEqual({
      startMinutes: 240,
      endMinutes: 300,
    });
    expect(parseStopTime("05:15-06:15")).toEqual({
      startMinutes: 315,
      endMinutes: 375,
    });
    expect(parseStopTime("16:00 -17:15")).toEqual({
      startMinutes: 960,
      endMinutes: 1035,
    });
    expect(parseStopTime("07:30-9:00")).toEqual({
      startMinutes: 450,
      endMinutes: 540,
    });
  });

  test("treats a lone time as a start with no end", () => {
    expect(parseStopTime("22:00")).toEqual({
      startMinutes: 1320,
      endMinutes: null,
    });
    expect(parseStopTime("20:30~")).toEqual({
      startMinutes: 1230,
      endMinutes: null,
    });
  });

  test("carries a stop that runs past midnight into the next day", () => {
    expect(parseStopTime("22:00 - 0h00")).toEqual({
      startMinutes: 1320,
      endMinutes: 1440,
    });
  });

  test("gives up on a stop with no clock time in it", () => {
    expect(parseStopTime("cả ngày")).toBeNull();
  });
});

describe("itinerary progress", () => {
  const day = {
    id: "day-2",
    date: "2035-04-11",
    items: [
      { id: "stop-1", time: "08:00 - 09:00" },
      { id: "stop-2", time: "10:00 - 12:00" },
      { id: "stop-3", time: "20:30~" },
    ],
  };
  const days = [{ id: "day-1", date: "2035-04-10", items: [] }, day];
  const chinaTime = (clock: string) =>
    new Date(`2035-04-11T${clock}:00+08:00`);

  test("marks the stop a traveler is standing in and the one after it", () => {
    expect(getItineraryProgress(chinaTime("10:30"), days)).toEqual({
      currentItemId: "stop-2",
      nextItemId: "stop-3",
    });
  });

  test("points at the first stop before the day has started", () => {
    expect(getItineraryProgress(chinaTime("06:00"), days)).toEqual({
      currentItemId: null,
      nextItemId: "stop-1",
    });
  });

  test("marks no stop in the gap between two of them", () => {
    expect(getItineraryProgress(chinaTime("09:30"), days)).toEqual({
      currentItemId: null,
      nextItemId: "stop-2",
    });
  });

  test("runs an open-ended last stop to the end of the day", () => {
    expect(getItineraryProgress(chinaTime("23:50"), days)).toEqual({
      currentItemId: "stop-3",
      nextItemId: null,
    });
  });

  test("marks nothing on a date outside the trip", () => {
    expect(
      getItineraryProgress(new Date("2035-04-20T10:30:00+08:00"), days),
    ).toEqual({ currentItemId: null, nextItemId: null });
  });

  test("reads the clock in Chongqing, not where the traveler booked from", () => {
    // 03:30 UTC is 11:30 in Chongqing, inside the second stop.
    expect(
      getItineraryProgress(new Date("2035-04-11T03:30:00Z"), days),
    ).toEqual({ currentItemId: "stop-2", nextItemId: "stop-3" });
  });
});
