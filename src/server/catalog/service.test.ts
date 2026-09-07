import { describe, expect, test, vi } from "vitest";

import { CATALOG_FIXTURE } from "@/data/catalog-fixture";

import { BlobCatalogRepository } from "./service";

function blobClient(payload: unknown, { statusCode = 200 } = {}) {
  return {
    get: vi.fn().mockResolvedValue({
      statusCode,
      stream: new Response(JSON.stringify(payload)).body,
      blob: { etag: "fictional-etag" },
    }),
  };
}

describe("BlobCatalogRepository", () => {
  test("reads and validates the private catalog", async () => {
    const client = blobClient(CATALOG_FIXTURE);

    const catalog = await new BlobCatalogRepository(client).read();

    expect(catalog.gifts).toHaveLength(3);
    expect(client.get).toHaveBeenCalledWith("catalog/current.json", {
      access: "private",
      useCache: false,
    });
  });

  test("says so when the catalog has never been uploaded", async () => {
    const client = { get: vi.fn().mockResolvedValue(null) };

    await expect(new BlobCatalogRepository(client).read()).rejects.toThrow(
      "CATALOG_BLOB_NOT_FOUND",
    );
  });

  test("refuses a payload that does not match the catalog schema", async () => {
    const client = blobClient({ schemaVersion: 2, gifts: [] });

    await expect(new BlobCatalogRepository(client).read()).rejects.toThrow();
  });

  test("refuses a response that is not a fresh read", async () => {
    const client = blobClient(CATALOG_FIXTURE, { statusCode: 304 });

    await expect(new BlobCatalogRepository(client).read()).rejects.toThrow(
      "UNEXPECTED_CATALOG_BLOB_RESPONSE",
    );
  });
});
