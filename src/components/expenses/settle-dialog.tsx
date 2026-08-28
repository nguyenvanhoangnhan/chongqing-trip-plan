"use client";

import { useEffect, useId, useRef } from "react";

import { formatFenWithConversion } from "@/components/expenses/money";
import type { PairDebt } from "@/domain/expenses";
import { PEOPLE, type PersonId } from "@/domain/people";
import { messages } from "@/i18n";
import type { CurrencyRates, DisplayCurrency } from "@/lib/format";

type SettleDialogProps = {
  debt: PairDebt;
  currency: DisplayCurrency;
  rates: CurrencyRates;
  isSaving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const nameOf = (id: PersonId) =>
  PEOPLE.find((person) => person.id === id)?.displayName ?? id;

export function SettleDialog({
  debt,
  currency,
  rates,
  isSaving,
  onConfirm,
  onCancel,
}: SettleDialogProps) {
  const titleId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const copy = messages.expenses.settleConfirm;

  useEffect(() => {
    confirmRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="settle-dialog">
      <div role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h2 id={titleId}>{copy.title}</h2>
        <p>
          {copy.question(
            nameOf(debt.from),
            nameOf(debt.to),
            formatFenWithConversion(debt.amountFen, currency, rates),
          )}
        </p>
        <div className="settle-dialog__actions">
          <button type="button" onClick={onCancel}>
            {copy.cancel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            data-primary="true"
            disabled={isSaving}
            onClick={onConfirm}
          >
            {isSaving ? copy.saving : copy.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
