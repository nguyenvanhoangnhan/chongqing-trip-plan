import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { CurrencySwitcher } from "@/components/planner/currency-switcher";
import { usePlannerStore } from "@/stores/planner-store";

describe("CurrencySwitcher", () => {
  beforeEach(() => {
    usePlannerStore.setState(usePlannerStore.getInitialState(), true);
    localStorage.clear();
  });

  it("uses VND for a first-time visit", () => {
    render(<CurrencySwitcher />);

    expect(screen.getByRole("radio", { name: "VND" })).toBeChecked();
  });

  it("switches the shared display currency", async () => {
    render(<CurrencySwitcher />);

    await userEvent.click(screen.getByRole("radio", { name: "JPY" }));

    expect(usePlannerStore.getState().currency).toBe("JPY");
    expect(screen.getByRole("radio", { name: "JPY" })).toBeChecked();
  });

  it("restores the selected currency after a page reload", async () => {
    const { unmount } = render(<CurrencySwitcher />);

    await userEvent.click(screen.getByRole("radio", { name: "JPY" }));

    const storageKey = localStorage.key(0);
    if (!storageKey) {
      throw new Error("Expected the currency preference to be persisted");
    }

    const persistedPreference = localStorage.getItem(storageKey);
    unmount();
    usePlannerStore.setState(usePlannerStore.getInitialState(), true);
    localStorage.setItem(storageKey, persistedPreference!);
    render(<CurrencySwitcher />);

    await waitFor(() => {
      expect(usePlannerStore.getState().currency).toBe("JPY");
      expect(screen.getByRole("radio", { name: "JPY" })).toBeChecked();
    });
  });
});
