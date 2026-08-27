import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

import type { Gift } from "@/domain/gifts";
import type { SelectionEntry } from "@/domain/selections";
import { messages } from "@/i18n";
import {
  formatCnyInCurrency,
  type CurrencyRates,
  type DisplayCurrency,
} from "@/lib/format";

type SelectionRowProps = {
  entry: SelectionEntry;
  gift: Gift;
  readOnly: boolean;
  currency: DisplayCurrency;
  exchangeRates: CurrencyRates;
  onChange: (entry: SelectionEntry) => void;
  onRemove: () => void;
};

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

function clampQuantity(quantity: number): number {
  return Math.max(MIN_QUANTITY, Math.min(MAX_QUANTITY, quantity));
}

export function SelectionRow({
  entry,
  gift,
  readOnly,
  currency,
  exchangeRates,
  onChange,
  onRemove,
}: SelectionRowProps) {
  const subtotal = entry.quantity * entry.unitPriceCny;
  const image = gift.images[0];

  // While the field is being edited it keeps the raw text, so clearing it to
  // type a new number does not get rewritten to the clamped value mid-keystroke.
  const [quantityDraft, setQuantityDraft] = useState<string | null>(null);

  const updateQuantity = (quantity: number) => {
    setQuantityDraft(null);
    onChange({ ...entry, quantity: clampQuantity(quantity) });
  };

  const editQuantity = (raw: string) => {
    setQuantityDraft(raw);

    if (raw.trim() === "") return;

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;

    onChange({ ...entry, quantity: clampQuantity(Math.trunc(parsed)) });
  };

  return (
    <li className="selection-row" data-readonly={readOnly}>
      <div className="selection-row__thumbnail">
        <Image
          src={image.src}
          alt={image.altVi}
          fill
          sizes="64px"
          unoptimized
        />
      </div>

      <div className="selection-row__content">
        <div className="selection-row__title">
          <div>
            <strong>{gift.name.vi}</strong>
            <span lang="zh-CN">{gift.name.zh}</span>
          </div>
          {!readOnly && (
            <button
              type="button"
              className="icon-button"
              onClick={onRemove}
              aria-label={messages.selection.remove(gift.name.vi)}
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="selection-row__controls">
          {readOnly ? (
            <span className="selection-row__quantity">
              {entry.quantity} ×{" "}
              {formatCnyInCurrency(entry.unitPriceCny, currency, exchangeRates)}
            </span>
          ) : (
            <span className="quantity-control">
              <button
                type="button"
                onClick={() => updateQuantity(entry.quantity - 1)}
                aria-label={messages.selection.decreaseQuantity(gift.name.vi)}
              >
                <Minus size={14} aria-hidden="true" />
              </button>
              <input
                type="number"
                min={1}
                max={99}
                value={quantityDraft ?? String(entry.quantity)}
                onChange={(event) => editQuantity(event.target.value)}
                onBlur={() => setQuantityDraft(null)}
                aria-label={messages.selection.quantityFor(gift.name.vi)}
              />
              <button
                type="button"
                onClick={() => updateQuantity(entry.quantity + 1)}
                aria-label={messages.selection.increaseQuantity(gift.name.vi)}
              >
                <Plus size={14} aria-hidden="true" />
              </button>
            </span>
          )}
          <strong className="selection-row__subtotal">
            {formatCnyInCurrency(subtotal, currency, exchangeRates)}
          </strong>
        </div>
      </div>
    </li>
  );
}
