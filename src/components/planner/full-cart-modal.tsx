"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { LockKeyhole, X } from "lucide-react";

import { BudgetMeter } from "@/components/planner/budget-meter";
import { SelectionRow } from "@/components/planner/selection-row";
import type { Gift } from "@/domain/gifts";
import type { SelectionEntry } from "@/domain/selections";
import { messages } from "@/i18n";
import {
  formatCnyInCurrency,
  type CurrencyRates,
  type DisplayCurrency,
} from "@/lib/format";

type FullCartModalProps = {
  personName: string;
  entries: readonly SelectionEntry[];
  giftById: ReadonlyMap<string, Gift>;
  readOnly: boolean;
  currency: DisplayCurrency;
  exchangeRates: CurrencyRates;
  totalCny: number;
  onChangeEntries: (entries: SelectionEntry[]) => void;
  onClose: () => void;
};

export function FullCartModal({
  personName,
  entries,
  giftById,
  readOnly,
  currency,
  exchangeRates,
  totalCny,
  onChangeEntries,
  onClose,
}: FullCartModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [onClose]);

  const updateEntry = (updatedEntry: SelectionEntry) => {
    onChangeEntries(
      entries.map((entry) =>
        entry.giftId === updatedEntry.giftId ? updatedEntry : entry,
      ),
    );
  };

  const removeEntry = (giftId: string) => {
    onChangeEntries(entries.filter((entry) => entry.giftId !== giftId));
  };

  return createPortal(
    <div
      className="full-cart-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="full-cart-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="full-cart-modal__header">
          <div>
            <span className="section-kicker">
              {messages.planner.itemCount(entries.length)}
            </span>
            <h2 id={titleId}>{messages.planner.fullCart(personName)}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="full-cart-modal__close"
            onClick={onClose}
            aria-label={messages.planner.closeFullCart}
          >
            <X size={20} aria-hidden="true" />
            <span>{messages.planner.closeFullCart}</span>
          </button>
        </header>

        {readOnly && (
          <div className="full-cart-modal__readonly">
            <LockKeyhole size={15} aria-hidden="true" />
            {messages.planner.readOnly(personName)}
          </div>
        )}

        {entries.length === 0 ? (
          <div className="full-cart-modal__empty">
            {messages.planner.emptyPerson(personName)}
          </div>
        ) : (
          <ul className="full-cart-modal__list">
            {entries.map((entry) => {
              const gift = giftById.get(entry.giftId);
              if (!gift) return null;

              return (
                <SelectionRow
                  key={entry.giftId}
                  entry={entry}
                  gift={gift}
                  readOnly={readOnly}
                  currency={currency}
                  exchangeRates={exchangeRates}
                  onChange={updateEntry}
                  onRemove={() => removeEntry(entry.giftId)}
                />
              );
            })}
          </ul>
        )}

        <footer className="full-cart-modal__footer">
          <div className="person-planner__total">
            <span>{messages.planner.personalTotal(personName)}</span>
            <strong>
              {formatCnyInCurrency(totalCny, currency, exchangeRates)}
            </strong>
          </div>
          <BudgetMeter
            totalCny={totalCny}
            exchangeRates={exchangeRates}
            currency={currency}
          />
        </footer>
      </section>
    </div>,
    document.body,
  );
}
