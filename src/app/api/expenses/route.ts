import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { ExpenseInputSchema, type ExpenseEntry } from "@/domain/expenses";
import {
  appendEntry,
  BlobExpenseRepository,
  LedgerConflictError,
} from "@/server/expenses/service";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const session = await auth();

  if (!session?.user?.personId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const stored = await new BlobExpenseRepository().read();

    return NextResponse.json(stored, { headers: NO_STORE });
  } catch (error) {
    console.error("Failed to read expense ledger", error);
    return NextResponse.json(
      { error: "LEDGER_STORAGE_UNAVAILABLE" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.personId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const input = ExpenseInputSchema.parse(await request.json());
    const entry: ExpenseEntry = {
      ...input,
      id: crypto.randomUUID(),
      createdBy: session.user.personId,
      createdAt: new Date().toISOString(),
    };
    const stored = await appendEntry(new BlobExpenseRepository(), entry);

    return NextResponse.json(stored, { headers: NO_STORE });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "INVALID_EXPENSE", issues: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof LedgerConflictError) {
      return NextResponse.json({ error: "LEDGER_CONFLICT" }, { status: 409 });
    }

    console.error("Failed to append expense", error);
    return NextResponse.json(
      { error: "LEDGER_STORAGE_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
