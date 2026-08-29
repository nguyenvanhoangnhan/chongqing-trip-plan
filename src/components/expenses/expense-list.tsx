"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import {
  formatFen,
  formatFenWithConversion,
} from "@/components/expenses/money";
import { splitEntryFen, toFen, type ExpenseEntry } from "@/domain/expenses";
import { PEOPLE, type Person, type PersonId } from "@/domain/people";
import { messages } from "@/i18n";
import type { CurrencyRates, DisplayCurrency } from "@/lib/format";

export type TripDay = { id: string; date: string };

type ExpenseListProps = {
  entries: readonly ExpenseEntry[];
  currency: DisplayCurrency;
  rates: CurrencyRates;
  tripDays?: readonly TripDay[];
  onRemove: (id: string) => Promise<void>;
};

const personOf = (id: PersonId): Person | undefined =>
  PEOPLE.find((person) => person.id === id);

const nameOf = (id: PersonId) => personOf(id)?.displayName ?? id;

const chinaTime = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Shanghai",
  hour: "2-digit",
  minute: "2-digit",
});

/** A trip date reads as 29/08, the way the itinerary writes it. */
const dayMonth = (key: string) => {
  const [, month, day] = key.split("-");
  return `${day}/${month}`;
};

/** The calendar date in Chongqing, which is where the spending happens. */
const dateKeyOf = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));

function RemoveButton({ onRemove }: { onRemove: () => Promise<void> }) {
  const [armed, setArmed] = useState(false);
  const copy = messages.expenses.list;

  useEffect(() => {
    if (!armed) return;

    const timer = window.setTimeout(() => setArmed(false), 3_000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  return (
    <button
      type="button"
      className="expense-row__remove"
      data-armed={armed}
      aria-label={armed ? copy.confirmRemove : copy.remove}
      onClick={() => {
        if (!armed) {
          setArmed(true);
          return;
        }

        setArmed(false);
        void onRemove();
      }}
    >
      {armed ? (
        <span aria-hidden="true">{copy.confirmRemove}</span>
      ) : (
        <Trash2 size={15} aria-hidden="true" />
      )}
    </button>
  );
}

export function ExpenseList({
  entries,
  currency,
  rates,
  tripDays,
  onRemove,
}: ExpenseListProps) {
  const copy = messages.expenses.list;
  const newestFirst = [...entries].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  // One group per calendar day, newest first, so the log reads back as the
  // trip did.
  const days = new Map<string, ExpenseEntry[]>();
  for (const entry of newestFirst) {
    const key = dateKeyOf(entry.createdAt);
    days.set(key, [...(days.get(key) ?? []), entry]);
  }

  const tripDayLabel = (key: string) => {
    const index = tripDays?.findIndex((day) => day.date === key) ?? -1;
    return index >= 0 ? copy.tripDay(index + 1) : null;
  };

  return (
    <section className="expense-list" aria-labelledby="expense-list-title">
      <h2 id="expense-list-title">{copy.title}</h2>

      {newestFirst.length === 0 ? (
        <p className="expense-list__empty">{copy.empty}</p>
      ) : (
        [...days].map(([key, dayEntries]) => {
          const dayTotalFen = dayEntries
            .filter((entry) => entry.kind !== "settlement")
            .reduce((total, entry) => total + toFen(entry.amountCny), 0);

          return (
            <div className="expense-day" key={key}>
              <div className="expense-day__heading">
                <span>
                  {tripDayLabel(key) ? `${tripDayLabel(key)} · ` : ""}
                  {dayMonth(key)}
                </span>
                <b>{formatFen(dayTotalFen)}</b>
              </div>

              <ul>
                {dayEntries.map((entry) => {
                  const payer = personOf(entry.paidBy);
                  const share = Math.min(...Object.values(splitEntryFen(entry)));
                  const names = PEOPLE.filter((person) =>
                    entry.participants.includes(person.id),
                  )
                    .map((person) => person.displayName)
                    .join(", ");
                  const isSettlement = entry.kind === "settlement";

                  return (
                    <li
                      className="expense-row"
                      key={entry.id}
                      data-settlement={isSettlement}
                    >
                      <span
                        className="expense-row__payer"
                        data-accent={payer?.accent}
                        aria-hidden="true"
                      >
                        {payer?.displayName.charAt(0)}
                      </span>

                      <strong className="expense-row__title">
                        {isSettlement ? copy.settlementTag : entry.note || copy.noNote}
                      </strong>

                      <span className="expense-row__amount">
                        {formatFenWithConversion(
                          toFen(entry.amountCny),
                          currency,
                          rates,
                        )}
                      </span>

                      <span className="expense-row__people">
                        {isSettlement
                          ? copy.settled(nameOf(entry.paidBy), names)
                          : copy.paidFor(nameOf(entry.paidBy), names)}
                      </span>

                      <span className="expense-row__meta">
                        {chinaTime.format(new Date(entry.createdAt))}
                        {entry.participants.length > 1
                          ? ` · ${copy.each(formatFen(share))}`
                          : ""}
                      </span>

                      <RemoveButton onRemove={() => onRemove(entry.id)} />
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })
      )}
    </section>
  );
}
