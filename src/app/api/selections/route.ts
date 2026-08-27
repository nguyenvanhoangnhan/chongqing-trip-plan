import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { PEOPLE } from "@/domain/people";
import { BlobSelectionRepository } from "@/server/selections/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();

  if (!session?.user?.personId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const repository = new BlobSelectionRepository();
    const items = await repository.readAll(PEOPLE.map((person) => person.id));

    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to read selections", error);
    return NextResponse.json(
      { error: "SELECTION_STORAGE_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
