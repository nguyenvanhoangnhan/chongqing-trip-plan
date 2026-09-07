import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExpenseBoard } from "@/components/expenses/expense-board";
import type { ExpenseEntry } from "@/domain/expenses";
import { PEOPLE } from "@/domain/people";
import { addExpense, deleteExpense } from "@/lib/expenses-client";
import { usePlannerStore } from "@/stores/planner-store";

vi.mock("@/lib/expenses-client", () => ({
  addExpense: vi.fn(),
  deleteExpense: vi.fn(),
  loadLedger: vi.fn(),
}));

const rates = { CNY: 1, VND: 3860, JPY: 23.65 } as const;
const nhan = PEOPLE[1];

const hotpot: ExpenseEntry = {
  id: "11111111-1111-4111-8111-111111111111",
  paidBy: "traveler-2",
  participants: ["traveler-1", "traveler-2", "traveler-3"],
  amountCny: 90,
  note: "Lẩu",
  kind: "expense",
  createdBy: "traveler-2",
  createdAt: "2026-08-29T12:00:00.000Z",
};

function ledgerWith(entries: ExpenseEntry[]) {
  return {
    ledger: {
      schemaVersion: 1 as const,
      updatedAt: "2026-08-29T12:00:00.000Z",
      entries,
    },
    etag: '"e1"',
  };
}

beforeEach(() => {
  vi.mocked(addExpense).mockReset();
  vi.mocked(deleteExpense).mockReset();
  usePlannerStore.setState({ currency: "CNY" });
});

describe("ExpenseBoard", () => {
  it("shows who owes whom from the ledger", () => {
    render(
      <ExpenseBoard currentPerson={nhan} rates={rates} initial={ledgerWith([hotpot])} />,
    );

    expect(screen.getByText("Traveler 1 nợ Traveler 2")).toBeInTheDocument();
    expect(screen.getByText("Traveler 3 nợ Traveler 2")).toBeInTheDocument();
    expect(screen.getAllByText("¥30")).toHaveLength(2);
    expect(screen.getByText("Đã cân")).toBeInTheDocument();
  });

  it("saves a new entry with the chosen payer and participants", async () => {
    vi.mocked(addExpense).mockResolvedValue(ledgerWith([hotpot]));
    render(
      <ExpenseBoard currentPerson={nhan} rates={rates} initial={ledgerWith([])} />,
    );

    await userEvent.type(screen.getByLabelText("Số tiền (¥)"), "90");
    await userEvent.click(
      within(screen.getByRole("group", { name: "Trả cho" })).getByRole("button", {
        name: "Traveler 1",
      }),
    );
    await userEvent.type(screen.getByLabelText("Ghi chú"), "Lẩu");
    await userEvent.click(screen.getByRole("button", { name: "Lưu khoản" }));

    expect(addExpense).toHaveBeenCalledWith({
      paidBy: "traveler-2",
      participants: ["traveler-2", "traveler-3"],
      amountCny: 90,
      note: "Lẩu",
      kind: "expense",
    });
    await waitFor(() => expect(screen.getByText("Lẩu")).toBeInTheDocument());
  });

  it("asks before recording a settlement", async () => {
    vi.mocked(addExpense).mockResolvedValue(ledgerWith([]));
    render(
      <ExpenseBoard currentPerson={nhan} rates={rates} initial={ledgerWith([hotpot])} />,
    );

    await userEvent.click(screen.getAllByRole("button", { name: "Đã trả" })[0]);

    const dialog = screen.getByRole("dialog", { name: "Ghi khoản trả nợ" });
    expect(within(dialog).getByText("Traveler 1 trả Traveler 2 ¥30?")).toBeInTheDocument();
    expect(addExpense).not.toHaveBeenCalled();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Ghi khoản" }),
    );

    expect(addExpense).toHaveBeenCalledWith({
      paidBy: "traveler-1",
      participants: ["traveler-2"],
      amountCny: 30,
      note: "Trả nợ",
      kind: "settlement",
    });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("records nothing when the traveler backs out", async () => {
    render(
      <ExpenseBoard currentPerson={nhan} rates={rates} initial={ledgerWith([hotpot])} />,
    );

    await userEvent.click(screen.getAllByRole("button", { name: "Đã trả" })[0]);
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Huỷ" }),
    );

    expect(addExpense).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("marks a settlement in the log", () => {
    const settlement: ExpenseEntry = {
      id: "22222222-2222-4222-8222-222222222222",
      paidBy: "traveler-1",
      participants: ["traveler-2"],
      amountCny: 30,
      note: "Trả nợ",
      kind: "settlement",
      createdBy: "traveler-1",
      createdAt: "2026-08-29T13:00:00.000Z",
    };
    render(
      <ExpenseBoard
        currentPerson={nhan}
        rates={rates}
        initial={ledgerWith([hotpot, settlement])}
      />,
    );

    expect(screen.getByText("TRẢ NỢ")).toBeInTheDocument();
    expect(screen.getByText("Traveler 1 trả nợ cho Traveler 2")).toBeInTheDocument();
    expect(screen.getByText("Traveler 2 trả cho Traveler 1, Traveler 2, Traveler 3")).toBeInTheDocument();
  });

  it("asks twice before deleting", async () => {
    vi.mocked(deleteExpense).mockResolvedValue(ledgerWith([]));
    render(
      <ExpenseBoard currentPerson={nhan} rates={rates} initial={ledgerWith([hotpot])} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Xoá" }));
    expect(deleteExpense).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Xoá?" }));

    expect(deleteExpense).toHaveBeenCalledWith(hotpot.id);
    await waitFor(() =>
      expect(screen.getByText("Chưa có khoản nào.")).toBeInTheDocument(),
    );
  });
});
