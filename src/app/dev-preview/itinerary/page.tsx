import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { ItineraryBoard } from "@/components/itinerary/itinerary-board";
import { AppHeader } from "@/components/planner/app-header";
import {
  getDefaultOpenDayIds,
  getItineraryProgress,
} from "@/domain/itinerary";
import { PEOPLE } from "@/domain/people";
import { isMobileUserAgent } from "@/lib/user-agent";
import { BlobItineraryRepository } from "@/server/itinerary/service";

export const metadata: Metadata = {
  title: "Chongqing trip",
};

export default async function DevelopmentItineraryPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const itinerary = await new BlobItineraryRepository().read();
  const isMobile = isMobileUserAgent((await headers()).get("user-agent"));

  return (
    <div className="app-shell itinerary-shell">
      <AppHeader currentPerson={PEOPLE[1]} activePage="itinerary" />
      <ItineraryBoard
        itinerary={itinerary}
        defaultOpenDayIds={getDefaultOpenDayIds(new Date(), itinerary.days)}
        progress={getItineraryProgress(new Date(), itinerary.days)}
        isMobile={isMobile}
      />
    </div>
  );
}
