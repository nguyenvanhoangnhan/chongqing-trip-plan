import { describe, expect, it } from "vitest";

import {
  BlobGiftImageRepository,
  createGiftImageResponse,
} from "./service";

function blobResult(body = "image") {
  return {
    statusCode: 200 as const,
    stream: new Response(body).body,
    headers: new Headers({ "content-type": "image/webp" }),
    blob: {
      etag: "etag-1",
      contentType: "image/webp",
      size: body.length,
    },
  };
}

describe("private gift images", () => {
  it("streams a valid WebP from the private Blob namespace", async () => {
    const repository = new BlobGiftImageRepository({
      get: async (pathname, options) => {
        expect(pathname).toBe("gift-images/v1/example-product.webp");
        expect(options).toEqual({ access: "private" });
        return blobResult();
      },
    });

    const image = await repository.read("example-product.webp");

    expect(image?.contentType).toBe("image/webp");
    await expect(new Response(image?.stream).text()).resolves.toBe("image");
  });

  it("rejects an invalid filename before reading Blob storage", async () => {
    const repository = new BlobGiftImageRepository({
      get: async () => {
        throw new Error("Blob storage must not be called");
      },
    });

    await expect(repository.read("../private.json")).rejects.toThrow(
      "INVALID_GIFT_IMAGE_FILENAME",
    );
  });

  it("does not reveal an image to an anonymous request", async () => {
    const response = await createGiftImageResponse({
      authenticatedPersonId: null,
      filename: "example-product.webp",
      repository: new BlobGiftImageRepository({
        get: async () => blobResult(),
      }),
    });

    expect(response.status).toBe(401);
  });

  it("returns a private cacheable image to an authenticated traveler", async () => {
    const response = await createGiftImageResponse({
      authenticatedPersonId: "nhan",
      filename: "example-product.webp",
      repository: new BlobGiftImageRepository({
        get: async () => blobResult(),
      }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("cache-control")).toBe(
      "private, max-age=86400",
    );
    await expect(response.text()).resolves.toBe("image");
  });

  it("returns 404 when the private image is missing", async () => {
    const response = await createGiftImageResponse({
      authenticatedPersonId: "nhan",
      filename: "missing.webp",
      repository: new BlobGiftImageRepository({ get: async () => null }),
    });

    expect(response.status).toBe(404);
  });
});
