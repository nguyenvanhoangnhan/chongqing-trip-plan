import { BlobPreconditionFailedError, get, put } from "@vercel/blob";

import {
  createEmptyLedger,
  ExpenseLedgerSchema,
  type ExpenseEntry,
  type ExpenseLedger,
} from "@/domain/expenses";
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
      cacheControlMaxAge: 0;
      ifMatch?: string;
    },
  ) => Promise<{ etag: string }>;
};

export type StoredLedger = { ledger: ExpenseLedger; etag: string | null };

const LEDGER_PATHNAME = "expenses/ledger.json";
const MAX_WRITE_ATTEMPTS = 3;
const defaultBlobClient: BlobClient = { get, put };

export class LedgerConflictError extends Error {
  constructor() {
    super("LEDGER_CONFLICT");
  }
}

export class BlobExpenseRepository {
  constructor(private readonly blobClient: BlobClient = defaultBlobClient) {}

  async read(): Promise<StoredLedger> {
    const result = await this.blobClient.get(LEDGER_PATHNAME, {
      access: "private",
      useCache: false,
    });

    if (!result) return { ledger: createEmptyLedger(), etag: null };

    if (result.statusCode !== 200 || !result.stream) {
      throw new Error("UNEXPECTED_BLOB_READ_RESPONSE");
    }

    const ledger = ExpenseLedgerSchema.parse(
      await new Response(result.stream).json(),
    );

    return { ledger, etag: toStrongEtag(result.blob.etag) };
  }

  async write(
    ledger: ExpenseLedger,
    expectedEtag: string | null,
  ): Promise<StoredLedger> {
    const validated = ExpenseLedgerSchema.parse(ledger);
    const result = await this.blobClient.put(
      LEDGER_PATHNAME,
      JSON.stringify(validated),
      {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: expectedEtag !== null,
        contentType: "application/json",
        cacheControlMaxAge: 0,
        ...(expectedEtag ? { ifMatch: expectedEtag } : {}),
      },
    );

    return { ledger: validated, etag: toStrongEtag(result.etag) };
  }
}

/**
 * Reads, changes and writes the ledger, re-reading when someone else wrote in
 * between. `change` returns null to signal there is nothing to write.
 */
async function updateLedger(
  repository: BlobExpenseRepository,
  change: (ledger: ExpenseLedger) => ExpenseLedger | null,
): Promise<StoredLedger | null> {
  for (let attempt = 1; attempt <= MAX_WRITE_ATTEMPTS; attempt += 1) {
    const current = await repository.read();
    const next = change(current.ledger);

    if (!next) return null;

    try {
      return await repository.write(
        { ...next, updatedAt: new Date().toISOString() },
        current.etag,
      );
    } catch (error) {
      if (!(error instanceof BlobPreconditionFailedError)) throw error;
    }
  }

  throw new LedgerConflictError();
}

export async function appendEntry(
  repository: BlobExpenseRepository,
  entry: ExpenseEntry,
): Promise<StoredLedger> {
  const stored = await updateLedger(repository, (ledger) => ({
    ...ledger,
    entries: [...ledger.entries, entry],
  }));

  // The change callback always returns a ledger, so null cannot happen here.
  if (!stored) throw new Error("LEDGER_APPEND_RETURNED_NOTHING");

  return stored;
}

export function removeEntry(
  repository: BlobExpenseRepository,
  id: string,
): Promise<StoredLedger | null> {
  return updateLedger(repository, (ledger) => {
    if (!ledger.entries.some((entry) => entry.id === id)) return null;

    return {
      ...ledger,
      entries: ledger.entries.filter((entry) => entry.id !== id),
    };
  });
}
