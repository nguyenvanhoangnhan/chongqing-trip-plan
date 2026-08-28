import { get, put } from "@vercel/blob";

import type { PersonId } from "@/domain/people";
import {
  createEmptySelection,
  PersonSelectionSchema,
  type PersonSelection,
  type SelectionEntry,
} from "@/domain/selections";
import { toStrongEtag } from "@/server/blob/etag";

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
  put: (
    pathname: string,
    body: string,
    options: {
      access: "private";
      addRandomSuffix: false;
      allowOverwrite: boolean;
      contentType: "application/json";
      cacheControlMaxAge: 60;
      ifMatch?: string;
    },
  ) => Promise<{ etag: string }>;
};

export type StoredSelection = {
  selection: PersonSelection;
  etag: string | null;
};

const defaultBlobClient: BlobClient = { get, put };

export function prepareSelectionUpdate(
  authenticatedPersonId: PersonId,
  requestedPersonId: PersonId,
  entries: readonly SelectionEntry[],
): PersonSelection {
  if (authenticatedPersonId !== requestedPersonId) {
    throw new Error("FORBIDDEN_SELECTION_UPDATE");
  }

  return PersonSelectionSchema.parse({
    schemaVersion: 1,
    personId: requestedPersonId,
    updatedAt: new Date().toISOString(),
    entries,
  });
}

export class BlobSelectionRepository {
  constructor(private readonly blobClient: BlobClient = defaultBlobClient) {}

  async read(personId: PersonId): Promise<StoredSelection> {
    const result = await this.blobClient.get(this.pathname(personId), {
      access: "private",
      useCache: false,
    });

    if (!result) {
      return { selection: createEmptySelection(personId), etag: null };
    }

    if (result.statusCode !== 200 || !result.stream) {
      throw new Error("UNEXPECTED_BLOB_READ_RESPONSE");
    }

    const payload = await new Response(result.stream).json();
    const selection = PersonSelectionSchema.parse(payload);

    if (selection.personId !== personId) {
      throw new Error("SELECTION_OWNER_MISMATCH");
    }

    return { selection, etag: toStrongEtag(result.blob.etag) };
  }

  async readAll(personIds: readonly PersonId[]): Promise<StoredSelection[]> {
    return Promise.all(personIds.map((personId) => this.read(personId)));
  }

  async write(
    personId: PersonId,
    selection: PersonSelection,
    expectedEtag: string | null,
  ): Promise<StoredSelection> {
    const validatedSelection = PersonSelectionSchema.parse(selection);

    if (validatedSelection.personId !== personId) {
      throw new Error("SELECTION_OWNER_MISMATCH");
    }

    const result = await this.blobClient.put(
      this.pathname(personId),
      JSON.stringify(validatedSelection),
      {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: expectedEtag !== null,
        contentType: "application/json",
        cacheControlMaxAge: 60,
        ...(expectedEtag ? { ifMatch: expectedEtag } : {}),
      },
    );

    return { selection: validatedSelection, etag: result.etag };
  }

  private pathname(personId: PersonId): string {
    return `selections/${personId}.json`;
  }
}
