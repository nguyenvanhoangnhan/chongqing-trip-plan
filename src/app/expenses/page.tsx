import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ExpenseBoard } from "@/components/expenses/expense-board";
import { AppHeader } from "@/components/planner/app-header";
import { giftCatalog } from "@/data/catalog";
import { PEOPLE } from "@/domain/people";
import { BlobExpenseRepository } from "@/server/expenses/service";

export const metadata: Metadata = {
  title: "Chongqing trip",
  description: "Ghi khoản trả hộ và xem ai nợ ai trong chuyến đi Trùng Khánh.",
};

export default async function ExpensesPage() {
  const session = await auth();

  if (!session?.user?.personId) {
    redirect("/login");
  }

  const currentPerson = PEOPLE.find(
    (person) => person.id === session.user.personId,
  );

  if (!currentPerson) {
    redirect("/login");
  }

  const initial = await new BlobExpenseRepository().read();

  return (
    <div className="app-shell itinerary-shell">
      <AppHeader currentPerson={currentPerson} activePage="expenses" />
      <ExpenseBoard
        currentPerson={currentPerson}
        rates={giftCatalog.metadata.exchangeRates.rates}
        initial={initial}
      />
    </div>
  );
}
