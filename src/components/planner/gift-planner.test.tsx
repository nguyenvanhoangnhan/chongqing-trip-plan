import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GiftPlanner } from "@/components/planner/gift-planner";
import { giftCatalog } from "@/data/catalog";
import { PEOPLE } from "@/domain/people";
import {
  createEmptySelection,
  type SelectionEntry,
} from "@/domain/selections";
import { messages } from "@/i18n";
import { SelectionApiError } from "@/lib/selections-client";
import type { StoredSelection } from "@/server/selections/service";

const { loadSelectionsMock, saveSelectionMock } = vi.hoisted(() => ({
  loadSelectionsMock: vi.fn(),
  saveSelectionMock: vi.fn(),
}));

vi.mock("@/lib/selections-client", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("@/lib/selections-client")
  >();

  return {
    ...actual,
    loadSelections: loadSelectionsMock,
    saveSelection: saveSelectionMock,
  };
});

describe("GiftPlanner", () => {
  const currentPerson = PEOPLE.find((person) => person.id === "traveler-2")!;
  const gift = giftCatalog.gifts[0];
  const catalog = {
    ...giftCatalog,
    gifts: [gift],
  };

  beforeEach(() => {
    loadSelectionsMock.mockReset();
    saveSelectionMock.mockReset();
    loadSelectionsMock.mockResolvedValue(
      PEOPLE.map((person) => ({
        selection: createEmptySelection(person.id),
        etag: null,
      })),
    );
    saveSelectionMock.mockImplementation(
      async (personId, entries) => ({
        selection: {
          schemaVersion: 1,
          personId,
          updatedAt: "2026-08-24T12:00:00.000Z",
          entries,
        },
        etag: "etag-1",
      }),
    );
  });

  it("keeps a gift added while the first load is still in flight", async () => {
    const user = userEvent.setup();
    let resolveLoad!: (items: StoredSelection[]) => void;
    loadSelectionsMock.mockReturnValue(
      new Promise<StoredSelection[]>((resolve) => {
        resolveLoad = resolve;
      }),
    );

    render(<GiftPlanner catalog={catalog} currentPerson={currentPerson} />);

    await user.click(
      screen.getByRole("button", {
        name: messages.giftCard.addLabel(gift.name.vi),
      }),
    );

    expect(
      screen.getByRole("button", {
        name: messages.giftCard.removeLabel(gift.name.vi),
      }),
    ).toBeInTheDocument();

    await act(async () => {
      resolveLoad(
        PEOPLE.map((person) => ({
          selection: createEmptySelection(person.id),
          etag: "etag-from-server",
        })),
      );
    });

    expect(
      screen.getByRole("button", {
        name: messages.giftCard.removeLabel(gift.name.vi),
      }),
    ).toBeInTheDocument();
  });

  it("re-sends the traveler's change after a conflict instead of dropping it", async () => {
    const user = userEvent.setup();
    const serverSideEntry: SelectionEntry = {
      giftId: gift.id,
      quantity: 4,
      unitPriceCny: gift.priceCny,
      note: "",
    };

    saveSelectionMock.mockImplementationOnce(async () => {
      throw new SelectionApiError("SELECTION_CONFLICT", 409);
    });

    render(<GiftPlanner catalog={catalog} currentPerson={currentPerson} />);
    await waitFor(() =>
      expect(screen.queryByText(messages.storage.loading)).not.toBeInTheDocument(),
    );

    // The reload triggered by the conflict answers with somebody else's newer copy.
    loadSelectionsMock.mockResolvedValue(
      PEOPLE.map((person) => ({
        selection:
          person.id === currentPerson.id
            ? {
                schemaVersion: 1 as const,
                personId: person.id,
                updatedAt: "2026-08-25T00:00:00.000Z",
                entries: [serverSideEntry],
              }
            : createEmptySelection(person.id),
        etag: "etag-from-other-tab",
      })),
    );

    await user.click(
      screen.getByRole("button", {
        name: messages.giftCard.addLabel(gift.name.vi),
      }),
    );

    await waitFor(() => expect(saveSelectionMock).toHaveBeenCalledTimes(2));

    expect(saveSelectionMock).toHaveBeenLastCalledWith(
      "traveler-2",
      [
        {
          giftId: gift.id,
          quantity: 1,
          unitPriceCny: gift.priceCny,
          note: "",
        },
      ],
      "etag-from-other-tab",
    );
    expect(
      screen.getByRole("button", {
        name: messages.giftCard.removeLabel(gift.name.vi),
      }),
    ).toBeInTheDocument();
  });

  it("gives up with an error when the conflict keeps repeating", async () => {
    const user = userEvent.setup();
    saveSelectionMock.mockImplementation(async () => {
      throw new SelectionApiError("SELECTION_CONFLICT", 409);
    });

    render(<GiftPlanner catalog={catalog} currentPerson={currentPerson} />);
    await waitFor(() =>
      expect(screen.queryByText(messages.storage.loading)).not.toBeInTheDocument(),
    );

    await user.click(
      screen.getByRole("button", {
        name: messages.giftCard.addLabel(gift.name.vi),
      }),
    );

    await waitFor(() =>
      expect(screen.getByText(messages.storage.saveError)).toBeInTheDocument(),
    );
    expect(saveSelectionMock.mock.calls.length).toBeLessThanOrEqual(4);
  });

  it("saves immediately when the signed-in traveler selects or removes a gift", async () => {
    const user = userEvent.setup();
    render(<GiftPlanner catalog={catalog} currentPerson={currentPerson} />);

    await waitFor(() =>
      expect(screen.queryByText(messages.storage.loading)).not.toBeInTheDocument(),
    );
    await user.click(
      screen.getByRole("button", {
        name: messages.giftCard.addLabel(gift.name.vi),
      }),
    );

    await waitFor(() =>
      expect(saveSelectionMock).toHaveBeenCalledWith(
        "traveler-2",
        [
          {
            giftId: gift.id,
            quantity: 1,
            unitPriceCny: gift.priceCny,
            note: "",
          },
        ],
        null,
      ),
    );

    await user.click(
      screen.getByRole("button", {
        name: messages.giftCard.removeLabel(gift.name.vi),
      }),
    );
    await waitFor(() =>
      expect(saveSelectionMock).toHaveBeenLastCalledWith("traveler-2", [], "etag-1"),
    );
    expect(
      screen.queryByRole("button", { name: "Lưu danh sách" }),
    ).not.toBeInTheDocument();
  });

  it("serializes rapid changes and saves the latest selection", async () => {
    const firstGift = giftCatalog.gifts[0];
    const secondGift = giftCatalog.gifts[1];
    const firstEntry: SelectionEntry = {
      giftId: firstGift.id,
      quantity: 1,
      unitPriceCny: firstGift.priceCny,
      note: "",
    };
    const secondEntry: SelectionEntry = {
      giftId: secondGift.id,
      quantity: 1,
      unitPriceCny: secondGift.priceCny,
      note: "",
    };
    let resolveFirstSave: ((value: StoredSelection) => void) | undefined;

    saveSelectionMock.mockReset();
    saveSelectionMock
      .mockImplementationOnce(
        () =>
          new Promise<StoredSelection>((resolve) => {
            resolveFirstSave = resolve;
          }),
      )
      .mockResolvedValueOnce({
        selection: {
          schemaVersion: 1,
          personId: "traveler-2",
          updatedAt: "2026-08-24T12:01:00.000Z",
          entries: [firstEntry, secondEntry],
        },
        etag: "etag-2",
      });

    const user = userEvent.setup();
    render(
      <GiftPlanner
        catalog={{ ...giftCatalog, gifts: [firstGift, secondGift] }}
        currentPerson={currentPerson}
      />,
    );

    await waitFor(() =>
      expect(screen.queryByText(messages.storage.loading)).not.toBeInTheDocument(),
    );
    await user.click(
      screen.getByRole("button", {
        name: messages.giftCard.addLabel(firstGift.name.vi),
      }),
    );
    await waitFor(() => expect(saveSelectionMock).toHaveBeenCalledTimes(1));

    await user.click(
      screen.getByRole("button", {
        name: messages.giftCard.addLabel(secondGift.name.vi),
      }),
    );
    expect(saveSelectionMock).toHaveBeenCalledTimes(1);

    act(() => {
      resolveFirstSave?.({
        selection: {
          schemaVersion: 1,
          personId: "traveler-2",
          updatedAt: "2026-08-24T12:00:00.000Z",
          entries: [firstEntry],
        },
        etag: "etag-1",
      });
    });

    await waitFor(() => expect(saveSelectionMock).toHaveBeenCalledTimes(2));
    expect(saveSelectionMock).toHaveBeenLastCalledWith(
      "traveler-2",
      [firstEntry, secondEntry],
      "etag-1",
    );
  });
});
