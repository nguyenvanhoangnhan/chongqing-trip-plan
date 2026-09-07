import { describe, expect, it, vi } from "vitest";

import {
  BlobSelectionRepository,
  prepareSelectionUpdate,
} from "@/server/selections/service";

describe("selection authorization", () => {
  const entries = [
    { giftId: "chongqing-hotpot-base", quantity: 2, unitPriceCny: 35, note: "" },
  ];

  it("allows a traveler to update only their own list", () => {
    expect(prepareSelectionUpdate("traveler-1", "traveler-1", entries).personId).toBe("traveler-1");
    expect(() => prepareSelectionUpdate("traveler-1", "traveler-2", entries)).toThrow(
      "FORBIDDEN_SELECTION_UPDATE",
    );
  });
});

describe("BlobSelectionRepository", () => {
  it("returns an empty list when a person's blob does not exist", async () => {
    const blobClient = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn(),
    };
    const repository = new BlobSelectionRepository(blobClient);

    const result = await repository.read("traveler-2");

    expect(result.selection.entries).toEqual([]);
    expect(result.etag).toBeNull();
    expect(blobClient.get).toHaveBeenCalledWith("selections/traveler-2.json", {
      access: "private",
      useCache: false,
    });
  });

  it("strips the weak marker the CDN adds to a compressed blob's ETag", async () => {
    // Blobs over roughly 1KB come back brotli-compressed with a W/"..." ETag,
    // but a conditional put only accepts the strong form.
    const selection = {
      schemaVersion: 1,
      personId: "traveler-2",
      updatedAt: "2026-08-24T13:31:36.833Z",
      entries: [],
    };
    const blobClient = {
      get: vi.fn().mockResolvedValue({
        statusCode: 200,
        stream: new Response(JSON.stringify(selection)).body,
        blob: { etag: 'W/"4b45a98bcf32b6992dad8a603536fdf4"' },
      }),
      put: vi.fn(),
    };
    const repository = new BlobSelectionRepository(blobClient);

    const result = await repository.read("traveler-2");

    expect(result.etag).toBe('"4b45a98bcf32b6992dad8a603536fdf4"');
  });

  it("uses the latest ETag for a conditional overwrite", async () => {
    const blobClient = {
      get: vi.fn(),
      put: vi.fn().mockResolvedValue({ etag: "etag-next" }),
    };
    const repository = new BlobSelectionRepository(blobClient);
    const selection = prepareSelectionUpdate("traveler-3", "traveler-3", [
      { giftId: "chen-mahua", quantity: 1, unitPriceCny: 25, note: "Vị ngọt" },
    ]);

    const result = await repository.write("traveler-3", selection, "etag-current");

    expect(result.etag).toBe("etag-next");
    expect(blobClient.put).toHaveBeenCalledWith(
      "selections/traveler-3.json",
      JSON.stringify(selection),
      expect.objectContaining({
        access: "private",
        allowOverwrite: true,
        ifMatch: "etag-current",
      }),
    );
  });
});
