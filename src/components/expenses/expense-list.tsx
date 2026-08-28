"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import {
  formatFen,
  formatFenWithConversion,
} from "@/components/expenses/money";
import { splitEntryFen, toFen, type ExpenseEntry } from "@/domain/expenses";
import { PEOPLE, type PersonId } from "@/domain/people";
import { messages } from "@/i18n";
import type { CurrencyRates, DisplayCurrency } from "@/lib/format";

type ExpenseListProps = {
  entries: readonly ExpenseEntry[];
  currency: DisplayCurrency;
  rates: CurrencyRates;
  onRemove: (id: string) => Promise<void>;
};

const nameOf = (id: PersonId) =>
  PEOPLE.find((person) => person.id === id)?.displayName ?? id;

const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Shanghai",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function RemoveButton({ onRemove }: { onRemove: () => Promise<void> }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;

    const timer = window.setTimeout(() => setArmed(false), 3_000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  return (
    <button
      type="button"
      className="expense-list__remove"
      data-armed={armed}
      onClick={() => {
        if (!armed) {
          setArmed(true);
          return;
        }

        setArmed(false);
        void onRemove();
      }}
    >
      <Trash2 size={14} aria-hidden="true" />{" "}
      {armed
        ? messages.expenses.list.confirmRemove
        : messages.expenses.list.remove}
    </button>
  );
}

export function ExpenseList({
  entries,
  currency,
  rates,
  onRemove,
}: ExpenseListProps) {
  const copy = messages.expenses.list;
  const newestFirst = [...entries].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <section className="expense-list" aria-labelledby="expense-list-title">
      <h2 id="expense-list-title">{copy.title}</h2>
      {newestFirst.length === 0 ? (
        <p className="expense-list__empty">{copy.empty}</p>
      ) : (
        <ul>
          {newestFirst.map((entry) => {
            const share = Math.min(...Object.values(splitEntryFen(entry)));
            const names = PEOPLE.filter((person) =>
              entry.participants.includes(person.id),
            )
              .map((person) => person.displayName)
              .join(", ");
            const isSettlement = entry.kind === "settlement";

            return (
              <li key={entry.id}>
                <div className="expense-list__main">
                  <strong>
                    {isSettlement ? (
                      <em className="expense-list__tag">{copy.settlementTag}</em>
                    ) : (
                      entry.note || copy.noNote
                    )}
                  </strong>
                  <span>
                    {isSettlement
                      ? copy.settled(nameOf(entry.paidBy), names)
                      : copy.paidFor(nameOf(entry.paidBy), names)}
                  </span>
                  <small>
                    {timeFormatter.format(new Date(entry.createdAt))} ·{" "}
                    {entry.participants.length > 1
                      ? copy.each(formatFen(share))
                      : formatFen(toFen(entry.amountCny))}
                  </small>
                </div>
                <div className="expense-list__amount">
                  {formatFenWithConversion(
                    toFen(entry.amountCny),
                    currency,
                    rates,
                  )}
                </div>
                <RemoveButton onRemove={() => onRemove(entry.id)} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
