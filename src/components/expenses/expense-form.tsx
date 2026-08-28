"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";

import type { ExpenseInput } from "@/domain/expenses";
import { PEOPLE, type PersonId } from "@/domain/people";
import { messages } from "@/i18n";

export type ExpenseDraft = {
  amount: string;
  paidBy: PersonId;
  participants: PersonId[];
  note: string;
};

export type ExpenseFormStatus = "idle" | "saving" | "saved" | "error";

type ExpenseFormProps = {
  draft: ExpenseDraft;
  onDraftChange: (draft: ExpenseDraft) => void;
  onSubmit: (input: ExpenseInput) => Promise<void>;
  status: ExpenseFormStatus;
};

export function createDraft(paidBy: PersonId): ExpenseDraft {
  return {
    amount: "",
    paidBy,
    participants: PEOPLE.map((person) => person.id),
    note: "",
  };
}

function parseAmount(value: string): number | null {
  const normalized = value.replace(",", ".").trim();

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

  const amount = Number(normalized);

  return amount > 0 && amount <= 100_000 ? amount : null;
}

export function ExpenseForm({
  draft,
  onDraftChange,
  onSubmit,
  status,
}: ExpenseFormProps) {
  const [validation, setValidation] = useState<string | null>(null);
  const copy = messages.expenses.form;

  // Any edit clears the last validation message.
  const changeDraft = (next: ExpenseDraft) => {
    setValidation(null);
    onDraftChange(next);
  };

  const toggleParticipant = (id: PersonId) => {
    const next = draft.participants.includes(id)
      ? draft.participants.filter((current) => current !== id)
      : [...draft.participants, id];

    changeDraft({ ...draft, participants: next });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amountCny = parseAmount(draft.amount);

    if (amountCny === null) {
      setValidation(copy.invalidAmount);
      return;
    }

    const participants = PEOPLE.map((person) => person.id).filter((id) =>
      draft.participants.includes(id),
    );

    if (participants.length === 0) {
      setValidation(copy.noParticipants);
      return;
    }

    await onSubmit({
      paidBy: draft.paidBy,
      participants,
      amountCny,
      note: draft.note.trim(),
    });
  };

  const message =
    validation ??
    (status === "saved" ? copy.saved : status === "error" ? copy.error : "");

  return (
    <form className="expense-form" onSubmit={(event) => void submit(event)}>
      <h2>{copy.title}</h2>

      <label className="expense-form__amount">
        <span>{copy.amount}</span>
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder={copy.amountPlaceholder}
          value={draft.amount}
          onChange={(event) =>
            changeDraft({ ...draft, amount: event.target.value })
          }
        />
      </label>

      <fieldset
        className="expense-form__people"
        role="group"
        aria-label={copy.paidBy}
      >
        <legend>{copy.paidBy}</legend>
        {PEOPLE.map((person) => (
          <button
            key={person.id}
            type="button"
            aria-pressed={draft.paidBy === person.id}
            data-accent={person.accent}
            onClick={() => changeDraft({ ...draft, paidBy: person.id })}
          >
            {person.displayName}
          </button>
        ))}
      </fieldset>

      <fieldset
        className="expense-form__people"
        role="group"
        aria-label={copy.participants}
      >
        <legend>{copy.participants}</legend>
        {PEOPLE.map((person) => {
          const selected = draft.participants.includes(person.id);

          return (
            <button
              key={person.id}
              type="button"
              aria-pressed={selected}
              data-accent={person.accent}
              onClick={() => toggleParticipant(person.id)}
            >
              {selected && <Check size={14} aria-hidden="true" />}{" "}
              {person.displayName}
            </button>
          );
        })}
      </fieldset>

      <label className="expense-form__note">
        <span>{copy.note}</span>
        <input
          type="text"
          maxLength={120}
          placeholder={copy.notePlaceholder}
          value={draft.note}
          onChange={(event) =>
            changeDraft({ ...draft, note: event.target.value })
          }
        />
      </label>

      <button
        type="submit"
        className="expense-form__submit"
        disabled={status === "saving"}
      >
        {status === "saving" ? copy.saving : copy.submit}
      </button>

      <p
        className="expense-form__status"
        role="status"
        data-tone={validation || status === "error" ? "error" : "ok"}
      >
        {message}
      </p>
    </form>
  );
}
