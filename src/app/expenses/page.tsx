import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ExpenseBoard } from "@/components/expenses/expense-board";
import { AppHeader } from "@/components/planner/app-header";
import { BlobCatalogRepository } from "@/server/catalog/service";
import { PEOPLE } from "@/domain/people";
import { BlobExpenseRepository } from "@/server/expenses/service";
import { BlobItineraryRepository } from "@/server/itinerary/service";

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

  const giftCatalog = await new BlobCatalogRepository().read();

  const initial = await new BlobExpenseRepository().read();
  // The log labels each day by its place in the trip. A missing itinerary only
  // costs the label, so it must not take the page down.
  const tripDays = await new BlobItineraryRepository()
    .read()
    .then((itinerary) => itinerary.days.map(({ id, date }) => ({ id, date })))
    .catch((error) => {
      console.error("Failed to read the itinerary for expense day labels", error);
      return [];
    });

  return (
    <div className="app-shell itinerary-shell">
      <AppHeader currentPerson={currentPerson} activePage="expenses" />
      <ExpenseBoard
        currentPerson={currentPerson}
        rates={giftCatalog.metadata.exchangeRates.rates}
        initial={initial}
        tripDays={tripDays}
      />
    </div>
  );
}
