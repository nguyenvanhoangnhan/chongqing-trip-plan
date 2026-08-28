"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Coins } from "lucide-react";

import { BalanceSummary } from "@/components/expenses/balance-summary";
import {
  createDraft,
  ExpenseForm,
  type ExpenseDraft,
  type ExpenseFormStatus,
} from "@/components/expenses/expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import {
  calculateBalances,
  createSettlementDraft,
  type ExpenseInput,
  type PairDebt,
} from "@/domain/expenses";
import type { Person } from "@/domain/people";
import { messages } from "@/i18n";
import { addExpense, deleteExpense } from "@/lib/expenses-client";
import type { CurrencyRates } from "@/lib/format";
import type { StoredLedger } from "@/server/expenses/service";
import { usePlannerStore } from "@/stores/planner-store";

type ExpenseBoardProps = {
  currentPerson: Person;
  rates: CurrencyRates;
  initial: StoredLedger;
};

export function ExpenseBoard({
  currentPerson,
  rates,
  initial,
}: ExpenseBoardProps) {
  const [stored, setStored] = useState(initial);
  const [draft, setDraft] = useState<ExpenseDraft>(() =>
    createDraft(currentPerson.id),
  );
  const [status, setStatus] = useState<ExpenseFormStatus>("idle");
  const [listError, setListError] = useState<string | null>(null);
  const currency = usePlannerStore((state) => state.currency);

  useEffect(() => {
    void usePlannerStore.persist.rehydrate();
  }, []);

  const balances = useMemo(
    () => calculateBalances(stored.ledger.entries),
    [stored],
  );

  const submit = useCallback(
    async (input: ExpenseInput) => {
      setStatus("saving");

      try {
        setStored(await addExpense(input));
        setDraft(createDraft(currentPerson.id));
        setStatus("saved");
      } catch (error) {
        console.error("Failed to add expense", error);
        setStatus("error");
      }
    },
    [currentPerson.id],
  );

  const remove = useCallback(async (id: string) => {
    setListError(null);

    try {
      setStored(await deleteExpense(id));
    } catch (error) {
      console.error("Failed to delete expense", error);
      setListError(messages.expenses.list.removeError);
    }
  }, []);

  const settle = useCallback((debt: PairDebt) => {
    const settlement = createSettlementDraft(debt.from, debt.to, debt.amountFen);

    setDraft({
      amount: String(settlement.amountCny),
      paidBy: settlement.paidBy,
      participants: settlement.participants,
      note: settlement.note,
    });
    setStatus("idle");
    document
      .getElementById("expense-form-anchor")
      ?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <main className="expense-main" id="main-content">
      <div className="itinerary-heading">
        <span className="trip-kicker">
          <Coins size={15} aria-hidden="true" /> {messages.expenses.kicker}
        </span>
        <div>
          <h2>{messages.expenses.title}</h2>
        </div>
      </div>

      <BalanceSummary
        balances={balances}
        currency={currency}
        rates={rates}
        onSettle={settle}
      />

      <div id="expense-form-anchor" />
      <ExpenseForm
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={submit}
        status={status}
      />

      {listError && (
        <p className="expense-list__error" role="alert">
          {listError}
        </p>
      )}
      <ExpenseList
        entries={stored.ledger.entries}
        currency={currency}
        rates={rates}
        onRemove={remove}
      />
    </main>
  );
}
