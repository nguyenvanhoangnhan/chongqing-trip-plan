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
  /** Keeps the meter's footprint while the totals are still being fetched. */
  loading?: boolean;
};

export function BudgetMeter({
  totalCny,
  exchangeRates,
  currency,
  compact = false,
  loading = false,
}: BudgetMeterProps) {
  if (loading) {
    return <BudgetMeterSkeleton compact={compact} />;
  }

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

// Mirrors the loaded markup element for element so the line boxes keep the
// same height and nothing below jumps when the real numbers arrive.
function BudgetMeterSkeleton({ compact }: { compact: boolean }) {
  return (
    <div className="budget-meter budget-meter--loading" aria-hidden="true">
      <div className="budget-meter__labels">
        <strong className="skeleton-text">0.000.000 ₫</strong>
        {!compact && (
          <span className="skeleton-text">{messages.budget.status.below}</span>
        )}
      </div>
      <div className="budget-meter__track">
        <i className="budget-meter__target-start" />
      </div>
      {compact && (
        <span className="budget-meter__compact-status skeleton-text">
          {messages.budget.status.below}
        </span>
      )}
    </div>
  );
}
