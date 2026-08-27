import {
  PERSONAL_BUDGET_MAX_VND,
  getBudgetState,
} from "@/domain/selections";
import {
  formatCnyInCurrency,
  type CurrencyRates,
  type DisplayCurrency,
} from "@/lib/format";
import { messages } from "@/i18n";

type BudgetMeterProps = {
  totalCny: number;
  exchangeRates: CurrencyRates;
  currency: DisplayCurrency;
  compact?: boolean;
};

export function BudgetMeter({
  totalCny,
  exchangeRates,
  currency,
  compact = false,
}: BudgetMeterProps) {
  const totalVnd = totalCny * exchangeRates.VND;
  const budgetState = getBudgetState(totalVnd);
  const progress = Math.min((totalVnd / PERSONAL_BUDGET_MAX_VND) * 100, 100);
  const statusText =
    budgetState === "below"
      ? messages.budget.status.below
      : budgetState === "above"
        ? messages.budget.status.above
        : messages.budget.status.within;

  return (
    <div className={`budget-meter budget-meter--${budgetState}`}>
      <div className="budget-meter__labels">
        <strong>{formatCnyInCurrency(totalCny, currency, exchangeRates)}</strong>
        {!compact && <span>{statusText}</span>}
      </div>
      <div
        className="budget-meter__track"
        role="progressbar"
        aria-label={messages.budget.progressLabel}
        aria-valuemin={0}
        aria-valuemax={PERSONAL_BUDGET_MAX_VND}
        aria-valuenow={Math.round(totalVnd)}
      >
        <span style={{ width: `${progress}%` }} />
        <i className="budget-meter__target-start" />
      </div>
      {compact && <span className="budget-meter__compact-status">{statusText}</span>}
    </div>
  );
}
