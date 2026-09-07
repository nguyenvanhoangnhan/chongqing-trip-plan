import { get } from "@vercel/blob";

import { GiftCatalogSchema, type GiftCatalog } from "@/domain/gifts";

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
const defaultPathname = "catalog/current.json";

/**
 * The catalog is trip research the repository does not carry, so it is read
 * from Blob the same way the itinerary is.
 */
export class BlobCatalogRepository {
  constructor(
    private readonly blobClient: BlobClient = defaultBlobClient,
    private readonly pathname = defaultPathname,
  ) {}

  async read(): Promise<GiftCatalog> {
    const result = await this.blobClient.get(this.pathname, {
      access: "private",
      useCache: false,
    });

    if (!result) {
      throw new Error("CATALOG_BLOB_NOT_FOUND");
    }

    if (result.statusCode !== 200 || !result.stream) {
      throw new Error("UNEXPECTED_CATALOG_BLOB_RESPONSE");
    }

    const payload = await new Response(result.stream).json();
    return GiftCatalogSchema.parse(payload);
  }
}
