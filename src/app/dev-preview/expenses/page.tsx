import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExpenseBoard } from "@/components/expenses/expense-board";
import { AppHeader } from "@/components/planner/app-header";
import { giftCatalog } from "@/data/catalog";
import type { ExpenseLedger } from "@/domain/expenses";
import { PEOPLE } from "@/domain/people";

export const metadata: Metadata = {
  title: "Chongqing trip",
};

// Fixture only: the preview never touches the shared ledger in Blob.
const previewLedger: ExpenseLedger = {
  schemaVersion: 1,
  updatedAt: "2026-08-29T12:00:00.000Z",
  entries: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      paidBy: "nhan",
      participants: ["duy", "nhan", "minh"],
      amountCny: 268,
      note: "Lẩu Cave Pavilion",
      kind: "expense" as const,
      createdBy: "nhan",
      createdAt: "2026-08-29T13:05:00.000Z",
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      paidBy: "duy",
      participants: ["duy", "minh"],
      amountCny: 38,
      note: "Taxi về khách sạn",
      kind: "expense" as const,
      createdBy: "duy",
      createdAt: "2026-08-29T14:10:00.000Z",
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      paidBy: "minh",
      participants: ["nhan"],
      amountCny: 50,
      note: "Trả nợ",
      kind: "settlement" as const,
      createdBy: "minh",
      createdAt: "2026-08-29T15:00:00.000Z",
    },
  ],
};

export default function DevelopmentExpensesPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div className="app-shell itinerary-shell">
      <AppHeader currentPerson={PEOPLE[1]} activePage="expenses" />
      <ExpenseBoard
        tripDays={[{ id: "day-1", date: "2026-08-29" }]}
        currentPerson={PEOPLE[1]}
        rates={giftCatalog.metadata.exchangeRates.rates}
        initial={{ ledger: previewLedger, etag: null }}
      />
    </div>
  );
}
