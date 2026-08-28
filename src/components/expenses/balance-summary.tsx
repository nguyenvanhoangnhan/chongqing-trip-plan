"use client";

import { ArrowRight, Scale } from "lucide-react";

import {
  formatFen,
  formatFenWithConversion,
} from "@/components/expenses/money";
import type { LedgerBalances, PairDebt } from "@/domain/expenses";
import { PEOPLE, type PersonId } from "@/domain/people";
import { messages } from "@/i18n";
import type { CurrencyRates, DisplayCurrency } from "@/lib/format";

type BalanceSummaryProps = {
  balances: LedgerBalances;
  currency: DisplayCurrency;
  rates: CurrencyRates;
  onSettle: (debt: PairDebt) => void;
};

const nameOf = (id: PersonId) =>
  PEOPLE.find((person) => person.id === id)?.displayName ?? id;

export function BalanceSummary({
  balances,
  currency,
  rates,
  onSettle,
}: BalanceSummaryProps) {
  return (
    <section
      className="expense-balances"
      aria-labelledby="expense-balances-title"
    >
      <h2 id="expense-balances-title">{messages.expenses.balancesTitle}</h2>
      <ul>
        {balances.pairs.map(({ pair, debt }) => (
          <li key={pair.join("-")} data-settled={debt === null}>
            {debt ? (
              <>
                <div>
                  <strong>
                    {messages.expenses.owes(nameOf(debt.from), nameOf(debt.to))}
                  </strong>
                  <span>
                    {formatFenWithConversion(debt.amountFen, currency, rates)}
                  </span>
                </div>
                <button type="button" onClick={() => onSettle(debt)}>
                  {messages.expenses.settle}{" "}
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </>
            ) : (
              <div>
                <strong>
                  {nameOf(pair[0])} · {nameOf(pair[1])}
                </strong>
                <span>
                  <Scale size={13} aria-hidden="true" />{" "}
                  {messages.expenses.settled}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
      <dl className="expense-balances__paid">
        {PEOPLE.map((person) => (
          <div key={person.id} data-accent={person.accent}>
            <dt>
              {messages.expenses.paidTotal} · {person.displayName}
            </dt>
            <dd>{formatFen(balances.paidFen[person.id])}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
