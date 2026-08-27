import { describe, expect, test } from "vitest";

import { BlobItineraryRepository } from "./service";

function privateItineraryFixture({ legacy = false } = {}) {
  return {
    schemaVersion: 1,
    title: "Private trip",
    subtitle: "Five days",
    days: ["day-1", "day-2", "day-3", "day-4", "day-5"].map(
      (id, index) => ({
        id,
        date: `2035-04-${String(index + 10).padStart(2, "0")}`,
        headline: `Route ${index + 1}`,
        items: [
          {
            id: `${id}-stop-1`,
            time: "08:00",
            activity: "First stop",
            duration: "1 giờ",
            transport: "Metro",
            places:
              legacy && index === 0
                ? [{ label: "Legacy station", query: "测试旧车站" }]
                : [
                    {
                      label: "Station",
                      uid: `fictional-station-${index + 1}`,
                    },
                  ],
            route:
              legacy && index === 0
                ? {
                    origin: "测试旧起点",
                    destination: "测试旧终点",
                    preferredMode: "transit",
                  }
                : undefined,
          },
        ],
      }),
    ),
  };
}

function blobResult(payload: unknown) {
  return {
    statusCode: 200 as const,
    stream: new Response(JSON.stringify(payload)).body,
    blob: { etag: "etag-1" },
  };
}

describe("BlobItineraryRepository", () => {
  test("reads and validates the private five-day itinerary", async () => {
    const payload = privateItineraryFixture();
    const repository = new BlobItineraryRepository({
      get: async () => blobResult(payload),
    });

    await expect(repository.read()).resolves.toEqual(payload);
  });

  test("rejects a payload whose public day identities are out of order", async () => {
    const payload = privateItineraryFixture();
    payload.days[0].id = "day-5";
    const repository = new BlobItineraryRepository({
      get: async () => blobResult(payload),
    });

    await expect(repository.read()).rejects.toThrow("Ngày phải theo thứ tự");
  });

  test("normalizes legacy Blob routes instead of crashing the page", async () => {
    const payload = privateItineraryFixture({ legacy: true });
    const repository = new BlobItineraryRepository({
      get: async () => blobResult(payload),
    });

    const itinerary = await repository.read();
    expect(itinerary.days[0].items[0].places?.[0]).toEqual({
      label: "Legacy station",
      query: "测试旧车站",
    });
    expect(itinerary.days[0].items[0].route).toEqual({
      origin: { name: "测试旧起点" },
      destination: { name: "测试旧终点" },
      preferredMode: "transit",
    });
  });

  test("reports a missing private itinerary instead of rendering empty data", async () => {
    const repository = new BlobItineraryRepository({
      get: async () => null,
    });

    await expect(repository.read()).rejects.toThrow("ITINERARY_BLOB_NOT_FOUND");
  });
});
