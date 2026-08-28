import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppHeader } from "@/components/planner/app-header";
import { PEOPLE } from "@/domain/people";

describe("AppHeader", () => {
  it("marks the open page in both the header and the bottom bar", () => {
    render(<AppHeader currentPerson={PEOPLE[1]} activePage="expenses" />);

    for (const nav of screen.getAllByRole("navigation", {
      name: "Khu vực chuyến đi",
    })) {
      const link = within(nav).getByRole("link", { name: /Chia tiền/ });
      expect(link).toHaveAttribute("href", "/expenses");
      expect(link).toHaveAttribute("aria-current", "page");
      expect(
        within(nav).getByRole("link", { name: /Lịch trình/ }),
      ).not.toHaveAttribute("aria-current");
    }
  });

  it("offers the same three pages in the bottom bar", () => {
    const { container } = render(
      <AppHeader currentPerson={PEOPLE[1]} activePage="gifts" />,
    );

    const tabbar = container.querySelector(".site-tabbar") as HTMLElement;
    expect(
      [...tabbar.querySelectorAll("a")].map((link) => link.getAttribute("href")),
    ).toEqual(["/", "/gifts", "/expenses"]);
  });

  it("shows the currency switcher on the gifts and expenses pages only", () => {
    const { rerender } = render(
      <AppHeader currentPerson={PEOPLE[1]} activePage="gifts" />,
    );
    expect(
      screen.getAllByRole("radiogroup", { name: "Đơn vị tiền" }).length,
    ).toBeGreaterThan(0);

    rerender(<AppHeader currentPerson={PEOPLE[1]} activePage="itinerary" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });
});
