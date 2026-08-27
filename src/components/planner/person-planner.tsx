"use client";

import { useState } from "react";
import { Eye, Expand, LockKeyhole, ShoppingBasket } from "lucide-react";

import { BudgetMeter } from "@/components/planner/budget-meter";
import { FullCartModal } from "@/components/planner/full-cart-modal";
import { SelectionRow } from "@/components/planner/selection-row";
import type { Gift } from "@/domain/gifts";
import { PEOPLE, type PersonId } from "@/domain/people";
import { calculateBudgetCny, type SelectionEntry } from "@/domain/selections";
import type { StoredSelection } from "@/server/selections/service";
import { messages } from "@/i18n";
import {
  formatCnyInCurrency,
  type CurrencyRates,
  type DisplayCurrency,
} from "@/lib/format";

type PersonPlannerProps = {
  activePersonId: PersonId;
  currentPersonId: PersonId;
  selectionRecord: StoredSelection;
  giftById: ReadonlyMap<string, Gift>;
  exchangeRates: CurrencyRates;
  currency: DisplayCurrency;
  saveMessage: string | null;
  isLoading?: boolean;
  isSaving?: boolean;
  onSelectPerson: (personId: PersonId) => void;
  onChangeEntries: (entries: SelectionEntry[]) => void;
};

export function PersonPlanner({
  activePersonId,
  currentPersonId,
  selectionRecord,
  giftById,
  exchangeRates,
  currency,
  saveMessage,
  isLoading = false,
  isSaving = false,
  onSelectPerson,
  onChangeEntries,
}: PersonPlannerProps) {
  const [isFullCartOpen, setIsFullCartOpen] = useState(false);
  const activePerson = PEOPLE.find((person) => person.id === activePersonId)!;
  const entries = selectionRecord.selection.entries;
  const readOnly = activePersonId !== currentPersonId;
  const totalCny = calculateBudgetCny(entries);

  const updateEntry = (updatedEntry: SelectionEntry) => {
    onChangeEntries(
      entries.map((entry) =>
        entry.giftId === updatedEntry.giftId ? updatedEntry : entry,
      ),
    );
  };

  const removeEntry = (giftId: string) => {
    onChangeEntries(entries.filter((entry) => entry.giftId !== giftId));
  };

  return (
    <aside className="person-planner" aria-labelledby="planner-title">
      <div
        className="person-tabs"
        role="tablist"
        aria-label={messages.planner.tabsLabel}
      >
        {PEOPLE.map((person) => (
          <button
            type="button"
            role="tab"
            aria-selected={activePersonId === person.id}
            key={person.id}
            data-active={activePersonId === person.id}
            data-accent={person.accent}
            onClick={() => onSelectPerson(person.id)}
          >
            {person.displayName}
          </button>
        ))}
      </div>

      <div className="person-planner__heading">
        <div>
          <span className="section-kicker">
            {readOnly ? (
              <Eye size={15} aria-hidden="true" />
            ) : (
              <ShoppingBasket size={15} aria-hidden="true" />
            )}
            {readOnly ? messages.planner.viewing : messages.planner.ownCart}
          </span>
          <h2 id="planner-title">
            {messages.planner.listTitle(activePerson.displayName)}
          </h2>
        </div>
        {isLoading ? null : (
          <div className="person-planner__heading-actions">
            <button
              type="button"
              className="person-planner__expand"
              onClick={() => setIsFullCartOpen(true)}
              aria-label={messages.planner.openFullCartLabel(
                activePerson.displayName,
              )}
            >
              <Expand size={15} aria-hidden="true" />
              {messages.planner.openFullCart}
            </button>
            <span className="person-planner__count">{entries.length}</span>
          </div>
        )}
      </div>

      {readOnly && (
        <div className="readonly-notice">
          <LockKeyhole size={16} aria-hidden="true" />
          {messages.planner.readOnly(activePerson.displayName)}
        </div>
      )}

      {isLoading ? (
        <ul
          className="selection-list selection-list--loading"
          aria-hidden="true"
        >
          {[0, 1, 2].map((row) => (
            <li className="selection-row-skeleton" key={row}>
              <span className="selection-row-skeleton__thumb" />
              <span className="selection-row-skeleton__lines">
                <span />
                <span />
              </span>
            </li>
          ))}
        </ul>
      ) : entries.length === 0 ? (
        <div className="empty-selection">
          <ShoppingBasket size={28} aria-hidden="true" />
          <strong>{messages.planner.emptyTitle}</strong>
          <span>
            {readOnly
              ? messages.planner.emptyPerson(activePerson.displayName)
              : messages.planner.emptyOwn}
          </span>
        </div>
      ) : (
        <ul className="selection-list" aria-busy={isSaving}>
          {entries.map((entry) => {
            const gift = giftById.get(entry.giftId);
            if (!gift) return null;

            return (
              <SelectionRow
                key={entry.giftId}
                entry={entry}
                gift={gift}
                readOnly={readOnly}
                currency={currency}
                exchangeRates={exchangeRates}
                onChange={updateEntry}
                onRemove={() => removeEntry(entry.giftId)}
              />
            );
          })}
        </ul>
      )}

      <div className="person-planner__budget">
        <div className="person-planner__total">
          <span>
            {messages.planner.personalTotal(activePerson.displayName)}
          </span>
          <strong>
            {formatCnyInCurrency(totalCny, currency, exchangeRates)}
          </strong>
        </div>
        <BudgetMeter
          totalCny={totalCny}
          exchangeRates={exchangeRates}
          currency={currency}
        />
      </div>

      {!readOnly && saveMessage && (
        <div className="save-area">
          <p role="status">{saveMessage}</p>
        </div>
      )}

      {isFullCartOpen && (
        <FullCartModal
          personName={activePerson.displayName}
          entries={entries}
          giftById={giftById}
          readOnly={readOnly}
          currency={currency}
          exchangeRates={exchangeRates}
          totalCny={totalCny}
          onChangeEntries={onChangeEntries}
          onClose={() => setIsFullCartOpen(false)}
        />
      )}
    </aside>
  );
}
