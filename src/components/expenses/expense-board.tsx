"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { BalanceSummary } from "@/components/expenses/balance-summary";
import {
  createDraft,
  ExpenseForm,
  type ExpenseDraft,
  type ExpenseFormStatus,
} from "@/components/expenses/expense-form";
import {
  ExpenseList,
  type TripDay,
} from "@/components/expenses/expense-list";
import { SettleDialog } from "@/components/expenses/settle-dialog";
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
  tripDays?: readonly TripDay[];
};

export function ExpenseBoard({
  currentPerson,
  rates,
  initial,
  tripDays,
}: ExpenseBoardProps) {
  const [stored, setStored] = useState(initial);
  const [draft, setDraft] = useState<ExpenseDraft>(() =>
    createDraft(currentPerson.id),
  );
  const [status, setStatus] = useState<ExpenseFormStatus>("idle");
  const [listError, setListError] = useState<string | null>(null);
  const [pendingSettlement, setPendingSettlement] = useState<PairDebt | null>(
    null,
  );
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

  const confirmSettlement = useCallback(async () => {
    if (!pendingSettlement) return;

    const { from, to, amountFen } = pendingSettlement;
    setStatus("saving");

    try {
      setStored(await addExpense(createSettlementDraft(from, to, amountFen)));
      setPendingSettlement(null);
      setStatus("saved");
    } catch (error) {
      console.error("Failed to record settlement", error);
      setStatus("error");
    }
  }, [pendingSettlement]);

  return (
    <main className="expense-main" id="main-content">
      <div className="itinerary-heading">
        <div>
          <h1>{messages.expenses.title}</h1>
        </div>
      </div>

      <BalanceSummary
        balances={balances}
        currency={currency}
        rates={rates}
        onSettle={setPendingSettlement}
      />

      <ExpenseForm
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={submit}
        status={status}
      />

      {pendingSettlement && (
        <SettleDialog
          debt={pendingSettlement}
          currency={currency}
          rates={rates}
          isSaving={status === "saving"}
          onConfirm={() => void confirmSettlement()}
          onCancel={() => setPendingSettlement(null)}
        />
      )}

      {listError && (
        <p className="expense-list__error" role="alert">
          {listError}
        </p>
      )}
      <ExpenseList
        entries={stored.ledger.entries}
        currency={currency}
        rates={rates}
        tripDays={tripDays}
        onRemove={remove}
      />
    </main>
  );
}
