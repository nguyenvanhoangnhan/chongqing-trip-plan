import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WulongGuide } from "@/components/itinerary/wulong-guide";
import { AppHeader } from "@/components/planner/app-header";
import { PEOPLE } from "@/domain/people";
import { BlobItineraryRepository } from "@/server/itinerary/service";

export const metadata: Metadata = {
  title: "Chongqing trip",
};

export default async function DevelopmentWulongPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const itinerary = await new BlobItineraryRepository().read();
  const day = itinerary.days.find((entry) => entry.id === "day-3");

  if (!day) {
    notFound();
  }

  return (
    <div className="app-shell itinerary-shell">
      <AppHeader currentPerson={PEOPLE[1]} activePage="itinerary" />
      <WulongGuide day={day} />
    </div>
  );
}
