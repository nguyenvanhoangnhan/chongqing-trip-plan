import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { GiftPlanner } from "@/components/planner/gift-planner";
import { giftCatalog } from "@/data/catalog";
import { PEOPLE } from "@/domain/people";

export const metadata: Metadata = {
  title: "Chongqing trip",
};

export default function DevelopmentPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <GiftPlanner catalog={giftCatalog} currentPerson={PEOPLE[1]} />;
}
