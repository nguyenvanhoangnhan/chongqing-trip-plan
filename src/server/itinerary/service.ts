import { get } from "@vercel/blob";

import { ItinerarySchema, type Itinerary } from "@/domain/itinerary";

type BlobReadResult = {
  statusCode: 200 | 304;
  stream: ReadableStream<Uint8Array> | null;
  blob: { etag: string };
};

type BlobClient = {
  get: (
    pathname: string,
    options: { access: "private"; useCache: false },
  ) => Promise<BlobReadResult | null>;
};

const defaultBlobClient: BlobClient = { get };
const defaultPathname = "itinerary/current.json";

export class BlobItineraryRepository {
  constructor(
    private readonly blobClient: BlobClient = defaultBlobClient,
    private readonly pathname = defaultPathname,
  ) {}

  async read(): Promise<Itinerary> {
    const result = await this.blobClient.get(this.pathname, {
      access: "private",
      useCache: false,
    });

    if (!result) {
      throw new Error("ITINERARY_BLOB_NOT_FOUND");
    }

    if (result.statusCode !== 200 || !result.stream) {
      throw new Error("UNEXPECTED_ITINERARY_BLOB_RESPONSE");
    }

    const payload = await new Response(result.stream).json();
    return ItinerarySchema.parse(payload);
  }
}
