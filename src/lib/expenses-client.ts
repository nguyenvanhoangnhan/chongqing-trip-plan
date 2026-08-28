import type { ExpenseInput } from "@/domain/expenses";
import { SelectionApiError } from "@/lib/selections-client";
import type { StoredLedger } from "@/server/expenses/service";

async function parseError(response: Response): Promise<SelectionApiError> {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return new SelectionApiError(
    body?.error ?? "UNKNOWN_EXPENSE_ERROR",
    response.status,
  );
}

async function request(
  input: string,
  init?: RequestInit,
): Promise<StoredLedger> {
  const response = await fetch(input, {
    cache: "no-store",
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });

  if (!response.ok) throw await parseError(response);

  return response.json() as Promise<StoredLedger>;
}

export function loadLedger(): Promise<StoredLedger> {
  return request("/api/expenses");
}

export function addExpense(input: ExpenseInput): Promise<StoredLedger> {
  return request("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deleteExpense(id: string): Promise<StoredLedger> {
  return request(`/api/expenses/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
