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
  paidBy: "nhan",
  participants: ["duy", "nhan", "minh"],
  amountCny: 90,
  note: "Lẩu",
  createdBy: "nhan",
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

    expect(screen.getByText("Duy nợ Nhân")).toBeInTheDocument();
    expect(screen.getByText("Minh nợ Nhân")).toBeInTheDocument();
    expect(screen.getAllByText("¥30.00")).toHaveLength(2);
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
        name: "Duy",
      }),
    );
    await userEvent.type(screen.getByLabelText("Ghi chú"), "Lẩu");
    await userEvent.click(screen.getByRole("button", { name: "Lưu khoản" }));

    expect(addExpense).toHaveBeenCalledWith({
      paidBy: "nhan",
      participants: ["nhan", "minh"],
      amountCny: 90,
      note: "Lẩu",
    });
    await waitFor(() => expect(screen.getByText("Lẩu")).toBeInTheDocument());
  });

  it("prefills a settlement from a debt row", async () => {
    render(
      <ExpenseBoard currentPerson={nhan} rates={rates} initial={ledgerWith([hotpot])} />,
    );

    await userEvent.click(screen.getAllByRole("button", { name: "Đã trả" })[0]);

    expect(screen.getByLabelText("Số tiền (¥)")).toHaveValue("30.00");
    expect(screen.getByLabelText("Ghi chú")).toHaveValue("Trả nợ");
    expect(
      within(screen.getByRole("group", { name: "Ai trả" })).getByRole("button", {
        name: "Duy",
      }),
    ).toHaveAttribute("aria-pressed", "true");
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
