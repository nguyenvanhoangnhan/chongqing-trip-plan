import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { GiftPlanner } from "@/components/planner/gift-planner";
import { BlobCatalogRepository } from "@/server/catalog/service";
import { PEOPLE } from "@/domain/people";

export const metadata: Metadata = {
  title: "Chongqing trip",
  description: "Lập danh sách quà riêng cho chuyến đi Trùng Khánh.",
};

export default async function GiftsPage() {
  const giftCatalog = await new BlobCatalogRepository().read();
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

  return <GiftPlanner catalog={giftCatalog} currentPerson={currentPerson} />;
}
