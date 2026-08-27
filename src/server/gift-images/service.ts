import { get } from "@vercel/blob";

import type { PersonId } from "@/domain/people";

const GIFT_IMAGE_PREFIX = "gift-images/v1";
const GIFT_IMAGE_FILENAME = /^[a-z0-9-]+\.webp$/;

type BlobReadResult = {
  statusCode: 200 | 304;
  stream: ReadableStream<Uint8Array> | null;
  blob: {
    etag: string;
    contentType: string | null;
    size: number | null;
  };
};

type BlobClient = {
  get: (
    pathname: string,
    options: { access: "private" },
  ) => Promise<BlobReadResult | null>;
};

type StoredGiftImage = {
  stream: ReadableStream<Uint8Array>;
  contentType: "image/webp";
};

const defaultBlobClient: BlobClient = { get };

export class BlobGiftImageRepository {
  constructor(private readonly blobClient: BlobClient = defaultBlobClient) {}

  async read(filename: string): Promise<StoredGiftImage | null> {
    if (!GIFT_IMAGE_FILENAME.test(filename)) {
      throw new Error("INVALID_GIFT_IMAGE_FILENAME");
    }

    const result = await this.blobClient.get(
      `${GIFT_IMAGE_PREFIX}/${filename}`,
      { access: "private" },
    );

    if (!result) {
      return null;
    }

    if (
      result.statusCode !== 200 ||
      !result.stream ||
      result.blob.contentType !== "image/webp"
    ) {
      throw new Error("UNEXPECTED_GIFT_IMAGE_RESPONSE");
    }

    return {
      stream: result.stream,
      contentType: result.blob.contentType,
    };
  }
}

type GiftImageResponseOptions = {
  authenticatedPersonId: PersonId | null;
  filename: string;
  repository: BlobGiftImageRepository;
};

export async function createGiftImageResponse({
  authenticatedPersonId,
  filename,
  repository,
}: GiftImageResponseOptions): Promise<Response> {
  if (!authenticatedPersonId) {
    return new Response(null, { status: 401 });
  }

  try {
    const image = await repository.read(filename);

    if (!image) {
      return new Response(null, { status: 404 });
    }

    return new Response(image.stream, {
      headers: {
        "Cache-Control": "private, max-age=86400",
        "Content-Type": image.contentType,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_GIFT_IMAGE_FILENAME"
    ) {
      return new Response(null, { status: 404 });
    }

    throw error;
  }
}
