import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { WulongGuide } from "@/components/itinerary/wulong-guide";
import { AppHeader } from "@/components/planner/app-header";
import { PEOPLE } from "@/domain/people";
import { isMobileUserAgent } from "@/lib/user-agent";
import { BlobItineraryRepository } from "@/server/itinerary/service";

export const metadata: Metadata = {
  title: "Chongqing trip",
  description: "Hướng dẫn chi tiết chuyến đi Vũ Long trong ngày.",
};

/** The guide walks through the day the itinerary holds for Wulong. */
const WULONG_DAY_ID = "day-3";

export default async function WulongPage() {
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
  const day = itinerary.days.find((entry) => entry.id === WULONG_DAY_ID);

  if (!day) {
    notFound();
  }

  const isMobile = isMobileUserAgent((await headers()).get("user-agent"));

  return (
    <div className="app-shell itinerary-shell">
      <AppHeader currentPerson={currentPerson} activePage="itinerary" />
      <WulongGuide day={day} isMobile={isMobile} />
    </div>
  );
}

export const dynamic = "force-dynamic";
