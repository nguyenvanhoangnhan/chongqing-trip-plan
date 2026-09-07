import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PersonPlanner } from "@/components/planner/person-planner";
import { CATALOG_FIXTURE as giftCatalog } from "@/data/catalog-fixture";
import { PEOPLE } from "@/domain/people";

describe("PersonPlanner full cart", () => {
  it("opens the active traveler's complete cart in a modal", async () => {
    const person = PEOPLE[1];
    const gift = giftCatalog.gifts[0];

    render(
      <PersonPlanner
        activePersonId={person.id}
        currentPersonId={person.id}
        selectionRecord={{
          selection: {
            schemaVersion: 1,
            personId: person.id,
            updatedAt: "2026-08-24T00:00:00.000Z",
            entries: [
              {
                giftId: gift.id,
                quantity: 2,
                unitPriceCny: gift.priceCny,
                note: "",
              },
            ],
          },
          etag: "etag-1",
        }}
        giftById={new Map([[gift.id, gift]])}
        exchangeRates={giftCatalog.metadata.exchangeRates.rates}
        currency="VND"
        saveMessage={null}
        onSelectPerson={vi.fn()}
        onChangeEntries={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /xem toàn bộ giỏ của traveler 2/i }),
    );

    const dialog = screen.getByRole("dialog", { name: "Giỏ của Traveler 2" });
    expect(
      within(dialog).getByRole("img", { name: gift.images[0].altVi }),
    ).toBeInTheDocument();
    expect(within(dialog).queryByText("Ghi chú")).not.toBeInTheDocument();
    expect(
      within(dialog).queryByText("Giá thực tế (¥)"),
    ).not.toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole("button", { name: "Đóng" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
