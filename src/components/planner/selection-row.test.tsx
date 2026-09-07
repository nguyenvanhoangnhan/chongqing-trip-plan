import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { SelectionRow } from "@/components/planner/selection-row";
import { CATALOG_FIXTURE as giftCatalog } from "@/data/catalog-fixture";
import type { SelectionEntry } from "@/domain/selections";

describe("SelectionRow", () => {
  it("shows a thumbnail without note or actual-price fields", () => {
    const gift = giftCatalog.gifts[0];

    render(
      <SelectionRow
        entry={{
          giftId: gift.id,
          quantity: 1,
          unitPriceCny: gift.priceCny,
          note: "",
        }}
        gift={gift}
        readOnly={false}
        currency="VND"
        exchangeRates={giftCatalog.metadata.exchangeRates.rates}
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("img", { name: gift.images[0].altVi }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: /số lượng/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/giá thực tế/i)).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/tặng (bố|mẹ)/i),
    ).not.toBeInTheDocument();
  });

  describe("quantity field", () => {
    const gift = giftCatalog.gifts[0];

    function EditableRow({ onChange }: { onChange: (entry: SelectionEntry) => void }) {
      const [entry, setEntry] = useState<SelectionEntry>({
        giftId: gift.id,
        quantity: 5,
        unitPriceCny: gift.priceCny,
        note: "",
      });

      return (
        <SelectionRow
          entry={entry}
          gift={gift}
          readOnly={false}
          currency="CNY"
          exchangeRates={giftCatalog.metadata.exchangeRates.rates}
          onChange={(updated) => {
            setEntry(updated);
            onChange(updated);
          }}
          onRemove={vi.fn()}
        />
      );
    }

    it("lets the field go empty instead of snapping back to one", async () => {
      const onChange = vi.fn();
      render(<EditableRow onChange={onChange} />);
      const field = screen.getByRole("spinbutton", { name: /số lượng/i });

      await userEvent.clear(field);

      expect(field).toHaveValue(null);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("keeps the typed number after the field was cleared", async () => {
      const onChange = vi.fn();
      render(<EditableRow onChange={onChange} />);
      const field = screen.getByRole("spinbutton", { name: /số lượng/i });

      await userEvent.clear(field);
      await userEvent.type(field, "10");

      expect(field).toHaveValue(10);
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ quantity: 10 }),
      );
    });

    it("restores the last good quantity when the field is left empty", async () => {
      const onChange = vi.fn();
      render(<EditableRow onChange={onChange} />);
      const field = screen.getByRole("spinbutton", { name: /số lượng/i });

      await userEvent.clear(field);
      await userEvent.tab();

      expect(field).toHaveValue(5);
    });

    it("still refuses a quantity beyond the allowed range", async () => {
      const onChange = vi.fn();
      render(<EditableRow onChange={onChange} />);
      const field = screen.getByRole("spinbutton", { name: /số lượng/i });

      await userEvent.clear(field);
      await userEvent.type(field, "250");

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ quantity: 99 }),
      );
    });
  });
});
