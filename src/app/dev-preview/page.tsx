import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { GiftPlanner } from "@/components/planner/gift-planner";
import { BlobCatalogRepository } from "@/server/catalog/service";
import { PEOPLE } from "@/domain/people";

export const metadata: Metadata = {
  title: "Chongqing trip",
};

export default async function DevelopmentPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const giftCatalog = await new BlobCatalogRepository().read();

  return <GiftPlanner catalog={giftCatalog} currentPerson={PEOPLE[1]} />;
}
