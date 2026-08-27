import { CheckCircle2, Eye, UserRound } from "lucide-react";

import { BudgetMeter } from "@/components/planner/budget-meter";
import { PEOPLE, type PersonId } from "@/domain/people";
import type { StoredSelection } from "@/server/selections/service";
import { calculateBudgetCny } from "@/domain/selections";
import type { CurrencyRates, DisplayCurrency } from "@/lib/format";
import { messages } from "@/i18n";

type TravelerOverviewProps = {
  selections: Record<PersonId, StoredSelection>;
  exchangeRates: CurrencyRates;
  currency: DisplayCurrency;
  currentPersonId: PersonId;
  activePersonId: PersonId;
  onSelectPerson: (personId: PersonId) => void;
};

export function TravelerOverview({
  selections,
  exchangeRates,
  currency,
  currentPersonId,
  activePersonId,
  onSelectPerson,
}: TravelerOverviewProps) {
  return (
    <section
      className="traveler-overview"
      aria-label={messages.travelers.budgetLabel}
    >
      <div className="section-kicker">
        <UserRound size={16} aria-hidden="true" />
        <span>{messages.travelers.kicker}</span>
      </div>
      <div className="traveler-overview__grid">
        {PEOPLE.map((person) => {
          const selection = selections[person.id].selection;
          const totalCny = calculateBudgetCny(selection.entries);
          const isCurrent = currentPersonId === person.id;

          return (
            <button
              type="button"
              key={person.id}
              className="traveler-card"
              data-active={activePersonId === person.id}
              data-accent={person.accent}
              onClick={() => onSelectPerson(person.id)}
            >
              <span className="traveler-card__topline">
                <span className="traveler-card__avatar">
                  {person.displayName.charAt(0)}
                </span>
                <span>
                  <strong>{person.displayName}</strong>
                  <small>
                    {isCurrent ? (
                      <>
                        <CheckCircle2 size={13} aria-hidden="true" />{" "}
                        {messages.travelers.ownList}
                      </>
                    ) : (
                      <>
                        <Eye size={13} aria-hidden="true" /> {messages.travelers.view}
                      </>
                    )}
                  </small>
                </span>
                <b>{selection.entries.length.toString().padStart(2, "0")}</b>
              </span>
              <BudgetMeter
                totalCny={totalCny}
                exchangeRates={exchangeRates}
                currency={currency}
                compact
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
