import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/auth";
import { DELETE } from "@/app/api/expenses/[id]/route";
import { removeEntry } from "@/server/expenses/service";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/server/expenses/service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/server/expenses/service")>();
  return {
    ...actual,
    BlobExpenseRepository: vi.fn(function () {
      return {};
    }),
    removeEntry: vi.fn(),
  };
});

const emptyLedger = {
  schemaVersion: 1 as const,
  updatedAt: "2026-08-29T09:00:00.000Z",
  entries: [],
};
const params = (id: string) => ({ params: Promise.resolve({ id }) });
const request = new Request("http://localhost/api/expenses/x", {
  method: "DELETE",
});

describe("DELETE /api/expenses/[id]", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(removeEntry).mockReset();
  });

  it("requires a signed-in traveler", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    expect((await DELETE(request, params("abc"))).status).toBe(401);
  });

  it("returns 404 for an unknown id", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { personId: "nhan" } } as never);
    vi.mocked(removeEntry).mockResolvedValue(null);

    expect((await DELETE(request, params("abc"))).status).toBe(404);
  });

  it("returns the ledger after removing", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { personId: "nhan" } } as never);
    vi.mocked(removeEntry).mockResolvedValue({ ledger: emptyLedger, etag: '"e2"' });

    const response = await DELETE(request, params("abc"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ledger: emptyLedger, etag: '"e2"' });
  });
});
