import { describe, expect, it } from "vitest";

import {
  calculateBalances,
  createSettlementDraft,
  ExpenseInputSchema,
  splitEntryFen,
  toFen,
  type ExpenseEntry,
} from "@/domain/expenses";

function entry(
  overrides: Partial<ExpenseEntry> &
    Pick<ExpenseEntry, "paidBy" | "participants" | "amountCny">,
): ExpenseEntry {
  return {
    id: "00000000-0000-4000-8000-000000000000",
    note: "",
    kind: "expense",
    createdBy: overrides.paidBy,
    createdAt: "2026-08-29T10:00:00.000Z",
    ...overrides,
  };
}

describe("toFen", () => {
  it("rounds to whole fen", () => {
    expect(toFen(12.34)).toBe(1234);
    expect(toFen(0.1 + 0.2)).toBe(30);
  });
});

describe("splitEntryFen", () => {
  it("splits equally among participants", () => {
    expect(
      splitEntryFen({
        paidBy: "traveler-2",
        participants: ["traveler-1", "traveler-2", "traveler-3"],
        amountCny: 90,
      }),
    ).toEqual({ "traveler-1": 3000, "traveler-2": 3000, "traveler-3": 3000 });
  });

  it("gives the remainder to the payer when they take part", () => {
    expect(
      splitEntryFen({
        paidBy: "traveler-2",
        participants: ["traveler-1", "traveler-2", "traveler-3"],
        amountCny: 1,
      }),
    ).toEqual({ "traveler-1": 33, "traveler-2": 34, "traveler-3": 33 });
  });

  it("gives the remainder to the first participant when the payer does not", () => {
    expect(
      splitEntryFen({ paidBy: "traveler-2", participants: ["traveler-3", "traveler-1"], amountCny: 0.05 }),
    ).toEqual({ "traveler-1": 3, "traveler-3": 2 });
  });
});

describe("calculateBalances", () => {
  it("reports no debt for an empty ledger", () => {
    const { pairs, paidFen } = calculateBalances([]);

    expect(pairs.map((pair) => pair.debt)).toEqual([null, null, null]);
    expect(paidFen).toEqual({ "traveler-1": 0, "traveler-2": 0, "traveler-3": 0 });
  });

  it("makes each participant owe the payer their share", () => {
    const { pairs, paidFen } = calculateBalances([
      entry({ paidBy: "traveler-2", participants: ["traveler-1", "traveler-2", "traveler-3"], amountCny: 90 }),
    ]);

    expect(pairs).toEqual([
      { pair: ["traveler-1", "traveler-2"], debt: { from: "traveler-1", to: "traveler-2", amountFen: 3000 } },
      { pair: ["traveler-1", "traveler-3"], debt: null },
      { pair: ["traveler-2", "traveler-3"], debt: { from: "traveler-3", to: "traveler-2", amountFen: 3000 } },
    ]);
    expect(paidFen["traveler-2"]).toBe(9000);
  });

  it("nets debts in both directions", () => {
    const { pairs } = calculateBalances([
      entry({ paidBy: "traveler-2", participants: ["traveler-1"], amountCny: 50 }),
      entry({ paidBy: "traveler-1", participants: ["traveler-2"], amountCny: 20 }),
    ]);

    expect(pairs[0]).toEqual({
      pair: ["traveler-1", "traveler-2"],
      debt: { from: "traveler-1", to: "traveler-2", amountFen: 3000 },
    });
  });

  it("treats a settlement as a payment that cancels the debt", () => {
    const { pairs } = calculateBalances([
      entry({ paidBy: "traveler-2", participants: ["traveler-1"], amountCny: 50 }),
      entry({ paidBy: "traveler-1", participants: ["traveler-2"], amountCny: 50, note: "Trả nợ" }),
    ]);

    expect(pairs[0].debt).toBeNull();
  });
});

describe("createSettlementDraft", () => {
  it("prefills a payment from the debtor to the creditor", () => {
    expect(createSettlementDraft("traveler-3", "traveler-2", 4550)).toEqual({
      paidBy: "traveler-3",
      participants: ["traveler-2"],
      amountCny: 45.5,
      note: "Trả nợ",
      kind: "settlement",
    });
  });
});

describe("ExpenseInputSchema", () => {
  it("rejects duplicate participants and more than two decimals", () => {
    expect(
      ExpenseInputSchema.safeParse({
        paidBy: "traveler-2",
        participants: ["traveler-1", "traveler-1"],
        amountCny: 10,
        note: "",
      }).success,
    ).toBe(false);
    expect(
      ExpenseInputSchema.safeParse({
        paidBy: "traveler-2",
        participants: ["traveler-1"],
        amountCny: 10.005,
        note: "",
      }).success,
    ).toBe(false);
  });

  it("accepts a plain three-way split", () => {
    expect(
      ExpenseInputSchema.safeParse({
        paidBy: "traveler-2",
        participants: ["traveler-1", "traveler-2", "traveler-3"],
        amountCny: 88.8,
        note: "Lẩu tối 29/8",
      }).success,
    ).toBe(true);
  });
});
