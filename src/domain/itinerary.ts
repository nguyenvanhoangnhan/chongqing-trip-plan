import { z } from "zod";

export const ItineraryDayIdSchema = z.enum([
  "day-1",
  "day-2",
  "day-3",
  "day-4",
  "day-5",
]);

// Chongqing stacks streets, bridges and rooftops on top of each other, so one
// latitude/longitude can name half a dozen places at different heights. Every
// map target here is a Baidu POI or a text query, never a raw coordinate.
export const ItineraryPlaceSchema = z
  .object({
    label: z.string().min(1),
    query: z.string().min(1).optional(),
    uid: z.string().min(1).optional(),
  })
  .refine((place) => Boolean(place.uid || place.query), {
    message: "Địa điểm phải có Baidu POI UID hoặc truy vấn dự phòng",
  });

export const ItineraryRoutePointSchema = z.union([
  z
    .string()
    .min(1)
    .transform((name): { name: string } => ({ name })),
  z.object({
    name: z.string().min(1),
  }),
]);

export const ItineraryRouteSchema = z.object({
  origin: ItineraryRoutePointSchema,
  destination: ItineraryRoutePointSchema,
  preferredMode: z.enum(["driving", "transit", "walking"]).optional(),
});

export const ItineraryItemSchema = z.object({
  id: z.string().min(1),
  time: z.string().min(1),
  activity: z.string().min(1),
  duration: z.string().optional(),
  transport: z.string().optional(),
  note: z.string().optional(),
  places: z.array(ItineraryPlaceSchema).optional(),
  route: ItineraryRouteSchema.optional(),
});

export const ItineraryDaySchema = z.object({
  id: ItineraryDayIdSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  headline: z.string().min(1),
  items: z.array(ItineraryItemSchema).min(1),
});

const itineraryDayIds = ["day-1", "day-2", "day-3", "day-4", "day-5"];

export const ItinerarySchema = z
  .object({
    schemaVersion: z.literal(1),
    title: z.string().min(1),
    subtitle: z.string().min(1),
    days: z.array(ItineraryDaySchema).length(5),
  })
  .superRefine((itinerary, context) => {
    const ids = itinerary.days.map((day) => day.id);

    if (ids.some((id, index) => id !== itineraryDayIds[index])) {
      context.addIssue({
        code: "custom",
        path: ["days"],
        message: "Ngày phải theo thứ tự day-1 đến day-5",
      });
    }
  });

export type Itinerary = z.infer<typeof ItinerarySchema>;
export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;
export type ItineraryItem = z.infer<typeof ItineraryItemSchema>;
export type ItineraryPlace = z.infer<typeof ItineraryPlaceSchema>;
export type ItineraryRoute = z.infer<typeof ItineraryRouteSchema>;
export type ItineraryRoutePoint = z.infer<typeof ItineraryRoutePointSchema>;

export type ItineraryDayIdentity = {
  id: string;
  date: string;
};

export function getChinaDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function getDefaultOpenDayIds(
  now: Date,
  days: readonly ItineraryDayIdentity[],
): string[] {
  const currentDate = getChinaDateKey(now);
  const currentDay = days.find((day) => day.date === currentDate);

  return currentDay ? [currentDay.id] : days.map((day) => day.id);
}

const MINUTES_IN_A_DAY = 24 * 60;

// The private itinerary was written by hand, so a stop reads "0:00-4:00",
// "05:15-06:15", "16:00 -17:15", "20:30~" or "22:00 - 0h00". Pull the clock
// readings out and ignore whatever punctuation sits between them.
const CLOCK_PATTERN = /(\d{1,2})\s*[:h]\s*(\d{2})/g;

export type ItineraryStopTime = {
  startMinutes: number;
  endMinutes: number | null;
};

export function parseStopTime(time: string): ItineraryStopTime | null {
  const readings = [...time.matchAll(CLOCK_PATTERN)].map(
    (match) => Number(match[1]) * 60 + Number(match[2]),
  );

  if (readings.length === 0) {
    return null;
  }

  const [startMinutes, end] = readings;

  if (end === undefined) {
    return { startMinutes, endMinutes: null };
  }

  // "22:00 - 0h00" ends after midnight rather than eighteen hours earlier.
  return {
    startMinutes,
    endMinutes: end <= startMinutes ? end + MINUTES_IN_A_DAY : end,
  };
}

function getChinaMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return value("hour") * 60 + value("minute");
}

export type ItineraryProgressDay = {
  id: string;
  date: string;
  items: readonly { id: string; time: string }[];
};

export type ItineraryProgress = {
  currentItemId: string | null;
  nextItemId: string | null;
};

/**
 * Which stop a traveler is standing in right now, and which one comes after it,
 * so a ten-stop day does not have to be read from the top every time.
 */
export function getItineraryProgress(
  now: Date,
  days: readonly ItineraryProgressDay[],
): ItineraryProgress {
  const today = days.find((day) => day.date === getChinaDateKey(now));

  if (!today) {
    return { currentItemId: null, nextItemId: null };
  }

  const minutes = getChinaMinutes(now);
  const stops = today.items.flatMap((item) => {
    const time = parseStopTime(item.time);
    return time ? [{ id: item.id, time }] : [];
  });

  let currentItemId: string | null = null;
  let nextItemId: string | null = null;

  stops.forEach((stop, index) => {
    // A stop with no stated end runs until the next one begins, or until the
    // day is over when it is the last of them.
    const endMinutes =
      stop.time.endMinutes ??
      stops[index + 1]?.time.startMinutes ??
      MINUTES_IN_A_DAY;

    if (minutes >= stop.time.startMinutes && minutes < endMinutes) {
      currentItemId = stop.id;
    }

    if (nextItemId === null && stop.time.startMinutes > minutes) {
      nextItemId = stop.id;
    }
  });

  return { currentItemId, nextItemId };
}
