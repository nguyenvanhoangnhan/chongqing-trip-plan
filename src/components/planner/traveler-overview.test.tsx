import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TravelerOverview } from "@/components/planner/traveler-overview";
import { CATALOG_FIXTURE as giftCatalog } from "@/data/catalog-fixture";
import { PEOPLE, type PersonId } from "@/domain/people";
import type { StoredSelection } from "@/server/selections/service";

describe("TravelerOverview", () => {
  const selections = Object.fromEntries(
    PEOPLE.map((person) => [
      person.id,
      {
        selection: {
          schemaVersion: 1,
          personId: person.id,
          updatedAt: "2026-08-24T00:00:00.000Z",
          entries:
            person.id === PEOPLE[0].id
              ? [
                  {
                    giftId: giftCatalog.gifts[0].id,
                    quantity: 2,
                    unitPriceCny: giftCatalog.gifts[0].priceCny,
                    note: "",
                  },
                ]
              : [],
        },
        etag: null,
      },
    ]),
  ) as Record<PersonId, StoredSelection>;

  function renderOverview(isLoading: boolean) {
    return render(
      <TravelerOverview
        selections={selections}
        exchangeRates={giftCatalog.metadata.exchangeRates.rates}
        currency="CNY"
        currentPersonId={PEOPLE[0].id}
        activePersonId={PEOPLE[0].id}
        isLoading={isLoading}
        onSelectPerson={vi.fn()}
      />,
    );
  }

  it("shows count and budget placeholders instead of zeros while loading", () => {
    const { container } = renderOverview(true);

    const counts = container.querySelectorAll(".traveler-card__topline b");
    expect(counts).toHaveLength(PEOPLE.length);
    counts.forEach((count) => {
      expect(count).toHaveClass("skeleton-text");
      expect(count).toHaveAttribute("aria-hidden", "true");
    });
    expect(
      container.querySelectorAll(".budget-meter--loading"),
    ).toHaveLength(PEOPLE.length);
    expect(
      container.querySelector(".budget-meter__labels strong"),
    ).toHaveClass("skeleton-text");
  });

  it("shows the real counts once the lists have arrived", () => {
    const { container } = renderOverview(false);

    const counts = container.querySelectorAll(".traveler-card__topline b");
    expect(counts[0]?.textContent).toBe("01");
    expect(counts[1]?.textContent).toBe("00");
    counts.forEach((count) => expect(count).not.toHaveClass("skeleton-text"));
    expect(container.querySelector(".budget-meter--loading")).toBeNull();
  });
});
