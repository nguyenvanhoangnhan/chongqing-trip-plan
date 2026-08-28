import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  BlobExpenseRepository,
  LedgerConflictError,
  removeEntry,
} from "@/server/expenses/service";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.personId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const stored = await removeEntry(new BlobExpenseRepository(), id);

    if (!stored) {
      return NextResponse.json({ error: "EXPENSE_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json(stored, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof LedgerConflictError) {
      return NextResponse.json({ error: "LEDGER_CONFLICT" }, { status: 409 });
    }

    console.error("Failed to remove expense", error);
    return NextResponse.json(
      { error: "LEDGER_STORAGE_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
