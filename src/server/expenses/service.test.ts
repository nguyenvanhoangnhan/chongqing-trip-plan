import { BlobPreconditionFailedError } from "@vercel/blob";
import { describe, expect, it, vi } from "vitest";

import type { ExpenseEntry, ExpenseLedger } from "@/domain/expenses";
import {
  appendEntry,
  BlobExpenseRepository,
  LedgerConflictError,
  removeEntry,
} from "@/server/expenses/service";

const entry: ExpenseEntry = {
  id: "11111111-1111-4111-8111-111111111111",
  paidBy: "traveler-2",
  participants: ["traveler-1", "traveler-2", "traveler-3"],
  amountCny: 90,
  note: "Lẩu",
  kind: "expense",
  createdBy: "traveler-2",
  createdAt: "2026-08-29T10:00:00.000Z",
};

function ledgerWith(entries: ExpenseEntry[]): ExpenseLedger {
  return { schemaVersion: 1, updatedAt: "2026-08-29T09:00:00.000Z", entries };
}

function blobWith(ledger: ExpenseLedger | null, etag = 'W/"e1"') {
  return {
    get: vi.fn().mockImplementation(async () =>
      ledger
        ? {
            statusCode: 200 as const,
            stream: new Response(JSON.stringify(ledger)).body,
            blob: { etag },
          }
        : null,
    ),
    put: vi.fn().mockResolvedValue({ etag: '"e2"' }),
  };
}

describe("BlobExpenseRepository", () => {
  it("returns an empty ledger when the blob does not exist", async () => {
    const repository = new BlobExpenseRepository(blobWith(null));

    const stored = await repository.read();

    expect(stored.ledger.entries).toEqual([]);
    expect(stored.etag).toBeNull();
  });

  it("reads the ledger with a strong etag", async () => {
    const repository = new BlobExpenseRepository(blobWith(ledgerWith([entry])));

    const stored = await repository.read();

    expect(stored.ledger.entries).toHaveLength(1);
    expect(stored.etag).toBe('"e1"');
  });

  it("writes with the expected etag and no overwrite for a new blob", async () => {
    const blob = blobWith(null);
    const repository = new BlobExpenseRepository(blob);

    await repository.write(ledgerWith([entry]), null);

    expect(blob.put).toHaveBeenCalledWith(
      "expenses/ledger.json",
      expect.any(String),
      expect.objectContaining({ allowOverwrite: false }),
    );
    expect(blob.put.mock.calls[0][2]).not.toHaveProperty("ifMatch");
  });
});

describe("appendEntry", () => {
  it("adds the entry and stamps updatedAt", async () => {
    const blob = blobWith(ledgerWith([]));
    const repository = new BlobExpenseRepository(blob);

    const stored = await appendEntry(repository, entry);

    expect(stored.ledger.entries).toEqual([entry]);
    expect(stored.ledger.updatedAt).not.toBe("2026-08-29T09:00:00.000Z");
    expect(blob.put.mock.calls[0][2]).toMatchObject({
      ifMatch: '"e1"',
      allowOverwrite: true,
    });
  });

  it("re-reads and retries once after a precondition failure", async () => {
    const blob = blobWith(ledgerWith([]));
    blob.put
      .mockRejectedValueOnce(new BlobPreconditionFailedError())
      .mockResolvedValueOnce({ etag: '"e3"' });
    const repository = new BlobExpenseRepository(blob);

    const stored = await appendEntry(repository, entry);

    expect(blob.get).toHaveBeenCalledTimes(2);
    expect(stored.etag).toBe('"e3"');
  });

  it("gives up after three conflicts", async () => {
    const blob = blobWith(ledgerWith([]));
    blob.put.mockRejectedValue(new BlobPreconditionFailedError());
    const repository = new BlobExpenseRepository(blob);

    await expect(appendEntry(repository, entry)).rejects.toBeInstanceOf(
      LedgerConflictError,
    );
    expect(blob.put).toHaveBeenCalledTimes(3);
  });
});

describe("removeEntry", () => {
  it("drops the entry by id", async () => {
    const repository = new BlobExpenseRepository(blobWith(ledgerWith([entry])));

    const stored = await removeEntry(repository, entry.id);

    expect(stored?.ledger.entries).toEqual([]);
  });

  it("returns null when the id is unknown", async () => {
    const blob = blobWith(ledgerWith([entry]));
    const repository = new BlobExpenseRepository(blob);

    expect(
      await removeEntry(repository, "22222222-2222-4222-8222-222222222222"),
    ).toBeNull();
    expect(blob.put).not.toHaveBeenCalled();
  });
});
