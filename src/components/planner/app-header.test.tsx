import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppHeader } from "@/components/planner/app-header";
import { PEOPLE } from "@/domain/people";

describe("AppHeader", () => {
  it("links to the expenses page and marks it current", () => {
    render(<AppHeader currentPerson={PEOPLE[1]} activePage="expenses" />);

    const link = screen.getByRole("link", { name: /Chia tiền/ });
    expect(link).toHaveAttribute("href", "/expenses");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("radiogroup", { name: "Đơn vị tiền" }),
    ).toBeInTheDocument();
  });

  it("keeps the currency switcher off the itinerary page", () => {
    render(<AppHeader currentPerson={PEOPLE[1]} activePage="itinerary" />);

    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });
});
