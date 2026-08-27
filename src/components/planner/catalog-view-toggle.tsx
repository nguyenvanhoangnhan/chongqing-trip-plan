import { Grid2X2, List } from "lucide-react";

import { usePlannerStore } from "@/stores/planner-store";
import { messages } from "@/i18n";

export function CatalogViewToggle() {
  const { catalogView, setCatalogView } = usePlannerStore();

  return (
    <div className="catalog-view-toggle" aria-label={messages.catalogView.label}>
      <button
        type="button"
        aria-label={messages.catalogView.grid}
        aria-pressed={catalogView === "grid"}
        data-active={catalogView === "grid"}
        onClick={() => setCatalogView("grid")}
      >
        <Grid2X2 size={16} aria-hidden="true" />
        <span>{messages.catalogView.grid}</span>
      </button>
      <button
        type="button"
        aria-label={messages.catalogView.list}
        aria-pressed={catalogView === "list"}
        data-active={catalogView === "list"}
        onClick={() => setCatalogView("list")}
      >
        <List size={17} aria-hidden="true" />
        <span>{messages.catalogView.list}</span>
      </button>
    </div>
  );
}
