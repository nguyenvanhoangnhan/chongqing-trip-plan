import { z } from "zod";

import type { PersonId } from "@/domain/people";

export const PERSONAL_BUDGET_MIN_VND = 1_500_000;
export const PERSONAL_BUDGET_MAX_VND = 2_000_000;

export const SelectionEntrySchema = z.object({
  giftId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  unitPriceCny: z.number().min(0).max(100_000),
  note: z.string().trim().max(240),
});

export const PersonSelectionSchema = z.object({
  schemaVersion: z.literal(1),
  personId: z.enum(["traveler-1", "traveler-2", "traveler-3"]),
  updatedAt: z.string().datetime(),
  entries: z.array(SelectionEntrySchema),
});

export type SelectionEntry = z.infer<typeof SelectionEntrySchema>;
export type PersonSelection = z.infer<typeof PersonSelectionSchema>;
export type BudgetState = "below" | "within" | "above";

export function createEmptySelection(personId: PersonId): PersonSelection {
  return {
    schemaVersion: 1,
    personId,
    updatedAt: new Date(0).toISOString(),
    entries: [],
  };
}

export function calculateBudgetCny(entries: readonly SelectionEntry[]): number {
  return entries.reduce(
    (total, entry) => total + entry.quantity * entry.unitPriceCny,
    0,
  );
}

export function calculateBudgetVnd(
  entries: readonly SelectionEntry[],
  exchangeRateVndPerCny: number,
): number {
  return calculateBudgetCny(entries) * exchangeRateVndPerCny;
}

export function getBudgetState(totalVnd: number): BudgetState {
  if (totalVnd < PERSONAL_BUDGET_MIN_VND) {
    return "below";
  }

  if (totalVnd > PERSONAL_BUDGET_MAX_VND) {
    return "above";
  }

  return "within";
}
