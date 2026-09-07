import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/auth";
import { GET, POST } from "@/app/api/expenses/route";
import { appendEntry } from "@/server/expenses/service";

const { readLedger } = vi.hoisted(() => ({ readLedger: vi.fn() }));

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/server/expenses/service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/server/expenses/service")>();
  return {
    ...actual,
    // A regular function so `new` works; the returned object is the instance.
    BlobExpenseRepository: vi.fn(function () {
      return { read: readLedger };
    }),
    appendEntry: vi.fn(),
  };
});

const emptyLedger = {
  schemaVersion: 1 as const,
  updatedAt: "2026-08-29T09:00:00.000Z",
  entries: [],
};

describe("GET /api/expenses", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    readLedger.mockReset();
  });

  it("requires a signed-in traveler", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("returns the ledger and etag without caching", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { personId: "traveler-2" } } as never);
    readLedger.mockResolvedValue({ ledger: emptyLedger, etag: '"e1"' });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ ledger: emptyLedger, etag: '"e1"' });
  });
});

describe("POST /api/expenses", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(appendEntry).mockReset();
    vi.mocked(auth).mockResolvedValue({ user: { personId: "traveler-2" } } as never);
  });

  const request = (body: unknown) =>
    new Request("http://localhost/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  it("rejects an invalid body", async () => {
    const response = await POST(
      request({ paidBy: "traveler-2", participants: [], amountCny: 1, note: "" }),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe("INVALID_EXPENSE");
    expect(appendEntry).not.toHaveBeenCalled();
  });

  it("stamps id, creator and time before appending", async () => {
    vi.mocked(appendEntry).mockResolvedValue({ ledger: emptyLedger, etag: '"e2"' });

    const response = await POST(
      request({
        paidBy: "traveler-1",
        participants: ["traveler-1", "traveler-2"],
        amountCny: 30,
        note: " Taxi ",
      }),
    );

    expect(response.status).toBe(200);
    const entry = vi.mocked(appendEntry).mock.calls[0][1];
    expect(entry).toMatchObject({
      paidBy: "traveler-1",
      participants: ["traveler-1", "traveler-2"],
      amountCny: 30,
      note: "Taxi",
      createdBy: "traveler-2",
    });
    expect(entry.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(() => new Date(entry.createdAt).toISOString()).not.toThrow();
  });
});
