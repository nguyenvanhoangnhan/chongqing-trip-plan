import { z } from "zod";

import type { PersonId } from "@/domain/people";

export const PERSON_IDS = ["duy", "nhan", "minh"] as const;

const PersonIdSchema = z.enum(PERSON_IDS);

const hasAtMostTwoDecimals = (value: number) =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;

export const ExpenseInputSchema = z.object({
  paidBy: PersonIdSchema,
  participants: z
    .array(PersonIdSchema)
    .min(1)
    .max(3)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Mỗi người chỉ được chọn một lần",
    }),
  amountCny: z
    .number()
    .positive()
    .max(100_000)
    .refine(hasAtMostTwoDecimals, { message: "Tối đa hai chữ số lẻ" }),
  note: z.string().trim().max(120),
  // Older entries predate the field, so they read as ordinary spending.
  kind: z.enum(["expense", "settlement"]).default("expense"),
});

export const ExpenseEntrySchema = ExpenseInputSchema.extend({
  id: z.uuid(),
  createdBy: PersonIdSchema,
  createdAt: z.string().datetime(),
});

export const ExpenseLedgerSchema = z.object({
  schemaVersion: z.literal(1),
  updatedAt: z.string().datetime(),
  entries: z.array(ExpenseEntrySchema),
});

export type ExpenseInput = z.infer<typeof ExpenseInputSchema>;
export type ExpenseEntry = z.infer<typeof ExpenseEntrySchema>;
export type ExpenseLedger = z.infer<typeof ExpenseLedgerSchema>;

export type PairDebt = { from: PersonId; to: PersonId; amountFen: number };
export type PairBalance = { pair: [PersonId, PersonId]; debt: PairDebt | null };
export type LedgerBalances = {
  pairs: PairBalance[];
  paidFen: Record<PersonId, number>;
};

const PAIRS: readonly [PersonId, PersonId][] = [
  ["duy", "nhan"],
  ["duy", "minh"],
  ["nhan", "minh"],
];

export function createEmptyLedger(): ExpenseLedger {
  return {
    schemaVersion: 1,
    updatedAt: new Date(0).toISOString(),
    entries: [],
  };
}

export function toFen(amountCny: number): number {
  return Math.round(amountCny * 100);
}

/**
 * Equal split in fen. The remainder goes to the payer when they take part,
 * otherwise to the first participant in duy, nhan, minh order.
 */
export function splitEntryFen(
  entry: Pick<ExpenseEntry, "paidBy" | "participants" | "amountCny">,
): Partial<Record<PersonId, number>> {
  const ordered = PERSON_IDS.filter((id) => entry.participants.includes(id));
  const total = toFen(entry.amountCny);
  const share = Math.floor(total / ordered.length);
  const remainder = total - share * ordered.length;
  const remainderTaker = ordered.includes(entry.paidBy)
    ? entry.paidBy
    : ordered[0];

  return Object.fromEntries(
    ordered.map((id) => [id, share + (id === remainderTaker ? remainder : 0)]),
  );
}

export function calculateBalances(
  entries: readonly ExpenseEntry[],
): LedgerBalances {
  const owed: Record<PersonId, Record<PersonId, number>> = {
    duy: { duy: 0, nhan: 0, minh: 0 },
    nhan: { duy: 0, nhan: 0, minh: 0 },
    minh: { duy: 0, nhan: 0, minh: 0 },
  };
  const paidFen: Record<PersonId, number> = { duy: 0, nhan: 0, minh: 0 };

  for (const entry of entries) {
    paidFen[entry.paidBy] += toFen(entry.amountCny);

    for (const [id, share] of Object.entries(splitEntryFen(entry)) as [
      PersonId,
      number,
    ][]) {
      if (id !== entry.paidBy) owed[id][entry.paidBy] += share;
    }
  }

  const pairs = PAIRS.map(([a, b]): PairBalance => {
    const net = owed[a][b] - owed[b][a];

    if (net === 0) return { pair: [a, b], debt: null };

    return {
      pair: [a, b],
      debt:
        net > 0
          ? { from: a, to: b, amountFen: net }
          : { from: b, to: a, amountFen: -net },
    };
  });

  return { pairs, paidFen };
}

export function createSettlementDraft(
  from: PersonId,
  to: PersonId,
  amountFen: number,
): ExpenseInput {
  return {
    paidBy: from,
    participants: [to],
    amountCny: amountFen / 100,
    note: "Trả nợ",
    kind: "settlement",
  };
}
