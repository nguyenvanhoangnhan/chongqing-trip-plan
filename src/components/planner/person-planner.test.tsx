import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PersonPlanner } from "@/components/planner/person-planner";
import { giftCatalog } from "@/data/catalog";
import { PEOPLE } from "@/domain/people";

describe("PersonPlanner", () => {
  const person = PEOPLE[1];
  const giftById = new Map(giftCatalog.gifts.map((gift) => [gift.id, gift]));

  function renderPlanner(overrides: {
    isLoading: boolean;
    isSaving?: boolean;
    entries?: { giftId: string; quantity: number; unitPriceCny: number; note: string }[];
  }) {
    const { entries = [], ...rest } = overrides;
    return render(
      <PersonPlanner
        activePersonId={person.id}
        currentPersonId={person.id}
        selectionRecord={{
          selection: {
            schemaVersion: 1,
            personId: person.id,
            updatedAt: "2026-08-24T00:00:00.000Z",
            entries,
          },
          etag: null,
        }}
        giftById={giftById}
        exchangeRates={giftCatalog.metadata.exchangeRates.rates}
        currency="CNY"
        saveMessage={null}
        isSaving={false}
        onSelectPerson={vi.fn()}
        onChangeEntries={vi.fn()}
        {...rest}
      />,
    );
  }

  it("shows placeholder rows instead of the empty state while loading", () => {
    const { container } = renderPlanner({ isLoading: true });

    expect(container.querySelectorAll(".selection-row-skeleton")).toHaveLength(
      3,
    );
    expect(screen.queryByText("Chưa có quà")).not.toBeInTheDocument();
  });

  it("hides the item count until the list has arrived", () => {
    const { container } = renderPlanner({ isLoading: true });

    expect(
      container.querySelector(".person-planner__count"),
    ).not.toBeInTheDocument();
  });

  it("marks the list busy while a save is in flight", () => {
    const entries = [
      {
        giftId: giftCatalog.gifts[0].id,
        quantity: 1,
        unitPriceCny: giftCatalog.gifts[0].priceCny,
        note: "",
      },
    ];

    const { container } = renderPlanner({
      isLoading: false,
      isSaving: true,
      entries,
    });

    expect(container.querySelector(".selection-list")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("leaves the list idle when nothing is being saved", () => {
    const entries = [
      {
        giftId: giftCatalog.gifts[0].id,
        quantity: 1,
        unitPriceCny: giftCatalog.gifts[0].priceCny,
        note: "",
      },
    ];

    const { container } = renderPlanner({
      isLoading: false,
      isSaving: false,
      entries,
    });

    expect(container.querySelector(".selection-list")).toHaveAttribute(
      "aria-busy",
      "false",
    );
  });

  it("shows the empty state once loading finishes", () => {
    const { container } = renderPlanner({ isLoading: false });

    expect(container.querySelectorAll(".selection-row-skeleton")).toHaveLength(
      0,
    );
    expect(screen.getByText("Chưa có quà")).toBeInTheDocument();
    expect(container.querySelector(".person-planner__count")?.textContent).toBe(
      "0",
    );
  });
});
