import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ItineraryBoard } from "@/components/itinerary/itinerary-board";
import { AppHeader } from "@/components/planner/app-header";
import {
  getDefaultOpenDayIds,
  getItineraryProgress,
} from "@/domain/itinerary";
import { PEOPLE } from "@/domain/people";
import { isMobileUserAgent } from "@/lib/user-agent";
import { BlobItineraryRepository } from "@/server/itinerary/service";

export default async function HomePage() {
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

  const itinerary = await new BlobItineraryRepository().read();
  const now = new Date();
  const defaultOpenDayIds = getDefaultOpenDayIds(now, itinerary.days);
  const progress = getItineraryProgress(now, itinerary.days);
  const isMobile = isMobileUserAgent((await headers()).get("user-agent"));

  return (
    <div className="app-shell itinerary-shell">
      <AppHeader currentPerson={currentPerson} activePage="itinerary" />
      <ItineraryBoard
        itinerary={itinerary}
        defaultOpenDayIds={defaultOpenDayIds}
        progress={progress}
        isMobile={isMobile}
      />
    </div>
  );
}
