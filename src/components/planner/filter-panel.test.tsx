import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { FilterPanel } from "@/components/planner/filter-panel";
import { usePlannerStore } from "@/stores/planner-store";

describe("FilterPanel", () => {
  beforeEach(() => {
    usePlannerStore.getState().resetFilters();
  });

  it("prompts for a gift name without suggesting a recipient", () => {
    render(<FilterPanel resultCount={36} />);

    expect(screen.getByPlaceholderText("Tên món quà…")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/bố mẹ/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xóa lọc" })).toBeInTheDocument();
  });

  it("lets travelers sort the catalog", async () => {
    const { container } = render(<FilterPanel resultCount={36} />);

    const sort = within(container).getByRole("combobox", { name: "Sắp xếp" });
    expect(sort).toHaveValue("default");

    await userEvent.selectOptions(sort, "price-asc");

    expect(usePlannerStore.getState().sort).toBe("price-asc");
  });

  it("lets travelers filter decorative gifts", async () => {
    render(<FilterPanel resultCount={74} />);

    await userEvent.click(screen.getByRole("button", { name: "Trang trí" }));

    expect(usePlannerStore.getState().category).toBe("decor");
  });
});
