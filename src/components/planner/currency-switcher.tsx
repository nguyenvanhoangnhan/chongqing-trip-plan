"use client";

import { useEffect } from "react";

import type { DisplayCurrency } from "@/lib/format";
import { messages } from "@/i18n";
import { usePlannerStore } from "@/stores/planner-store";

const currencies: readonly DisplayCurrency[] = ["CNY", "VND", "JPY"];

export function CurrencySwitcher() {
  const { currency, setCurrency } = usePlannerStore();

  useEffect(() => {
    void usePlannerStore.persist.rehydrate();
  }, []);

  return (
    <fieldset className="currency-switcher">
      <legend>{messages.currency.label}</legend>
      <div role="radiogroup" aria-label={messages.currency.label}>
        {currencies.map((item) => (
          <label key={item} data-active={currency === item}>
            <input
              type="radio"
              name="display-currency"
              value={item}
              checked={currency === item}
              onChange={() => setCurrency(item)}
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
