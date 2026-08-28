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
        paidBy: "nhan",
        participants: ["duy", "nhan", "minh"],
        amountCny: 90,
      }),
    ).toEqual({ duy: 3000, nhan: 3000, minh: 3000 });
  });

  it("gives the remainder to the payer when they take part", () => {
    expect(
      splitEntryFen({
        paidBy: "nhan",
        participants: ["duy", "nhan", "minh"],
        amountCny: 1,
      }),
    ).toEqual({ duy: 33, nhan: 34, minh: 33 });
  });

  it("gives the remainder to the first participant when the payer does not", () => {
    expect(
      splitEntryFen({ paidBy: "nhan", participants: ["minh", "duy"], amountCny: 0.05 }),
    ).toEqual({ duy: 3, minh: 2 });
  });
});

describe("calculateBalances", () => {
  it("reports no debt for an empty ledger", () => {
    const { pairs, paidFen } = calculateBalances([]);

    expect(pairs.map((pair) => pair.debt)).toEqual([null, null, null]);
    expect(paidFen).toEqual({ duy: 0, nhan: 0, minh: 0 });
  });

  it("makes each participant owe the payer their share", () => {
    const { pairs, paidFen } = calculateBalances([
      entry({ paidBy: "nhan", participants: ["duy", "nhan", "minh"], amountCny: 90 }),
    ]);

    expect(pairs).toEqual([
      { pair: ["duy", "nhan"], debt: { from: "duy", to: "nhan", amountFen: 3000 } },
      { pair: ["duy", "minh"], debt: null },
      { pair: ["nhan", "minh"], debt: { from: "minh", to: "nhan", amountFen: 3000 } },
    ]);
    expect(paidFen.nhan).toBe(9000);
  });

  it("nets debts in both directions", () => {
    const { pairs } = calculateBalances([
      entry({ paidBy: "nhan", participants: ["duy"], amountCny: 50 }),
      entry({ paidBy: "duy", participants: ["nhan"], amountCny: 20 }),
    ]);

    expect(pairs[0]).toEqual({
      pair: ["duy", "nhan"],
      debt: { from: "duy", to: "nhan", amountFen: 3000 },
    });
  });

  it("treats a settlement as a payment that cancels the debt", () => {
    const { pairs } = calculateBalances([
      entry({ paidBy: "nhan", participants: ["duy"], amountCny: 50 }),
      entry({ paidBy: "duy", participants: ["nhan"], amountCny: 50, note: "Trả nợ" }),
    ]);

    expect(pairs[0].debt).toBeNull();
  });
});

describe("createSettlementDraft", () => {
  it("prefills a payment from the debtor to the creditor", () => {
    expect(createSettlementDraft("minh", "nhan", 4550)).toEqual({
      paidBy: "minh",
      participants: ["nhan"],
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
        paidBy: "nhan",
        participants: ["duy", "duy"],
        amountCny: 10,
        note: "",
      }).success,
    ).toBe(false);
    expect(
      ExpenseInputSchema.safeParse({
        paidBy: "nhan",
        participants: ["duy"],
        amountCny: 10.005,
        note: "",
      }).success,
    ).toBe(false);
  });

  it("accepts a plain three-way split", () => {
    expect(
      ExpenseInputSchema.safeParse({
        paidBy: "nhan",
        participants: ["duy", "nhan", "minh"],
        amountCny: 88.8,
        note: "Lẩu tối 29/8",
      }).success,
    ).toBe(true);
  });
});
