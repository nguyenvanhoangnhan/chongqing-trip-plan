import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { CatalogViewToggle } from "@/components/planner/catalog-view-toggle";
import { usePlannerStore } from "@/stores/planner-store";

describe("CatalogViewToggle", () => {
  beforeEach(() => {
    usePlannerStore.setState({ catalogView: "grid" });
  });

  it("switches the catalog from grid to horizontal list cards", async () => {
    render(<CatalogViewToggle />);

    expect(screen.getByRole("button", { name: "Lưới" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await userEvent.click(screen.getByRole("button", { name: "Danh sách" }));

    expect(usePlannerStore.getState().catalogView).toBe("list");
    expect(screen.getByRole("button", { name: "Danh sách" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
