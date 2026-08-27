import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSelectionAutosave } from "@/hooks/use-selection-autosave";
import { saveSelection } from "@/lib/selections-client";

vi.mock("@/lib/selections-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/selections-client")>()),
  saveSelection: vi.fn(),
}));

const saveSelectionMock = vi.mocked(saveSelection);

function storedSelection() {
  return {
    selection: {
      schemaVersion: 1 as const,
      personId: "nhan" as const,
      updatedAt: "2026-08-24T00:00:00.000Z",
      entries: [],
    },
    etag: "etag-1",
  };
}

describe("useSelectionAutosave", () => {
  beforeEach(() => {
    saveSelectionMock.mockReset();
  });

  function renderAutosave() {
    return renderHook(() =>
      useSelectionAutosave({
        personId: "nhan",
        onStored: vi.fn(),
        onConflict: vi.fn().mockResolvedValue(storedSelection()),
      }),
    );
  }

  it("reports no save in flight before anything changes", () => {
    const { result } = renderAutosave();

    expect(result.current.isSaving).toBe(false);
  });

  it("reports a save in flight from the change until the server answers", async () => {
    let releaseSave: (value: ReturnType<typeof storedSelection>) => void = () => {};
    saveSelectionMock.mockReturnValue(
      new Promise((resolve) => {
        releaseSave = resolve;
      }),
    );

    const { result } = renderAutosave();

    act(() => {
      result.current.save([]);
    });

    expect(result.current.isSaving).toBe(true);

    await act(async () => {
      releaseSave(storedSelection());
    });

    await waitFor(() => expect(result.current.isSaving).toBe(false));
  });

  it("stops reporting a save in flight after a failed write", async () => {
    saveSelectionMock.mockRejectedValue(new Error("network down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderAutosave();

    act(() => {
      result.current.save([]);
    });

    await waitFor(() => expect(result.current.isSaving).toBe(false));
  });
});
