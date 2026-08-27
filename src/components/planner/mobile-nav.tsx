import { ListChecks, MapPinned, PackageSearch } from "lucide-react";

import { usePlannerStore, type MobileView } from "@/stores/planner-store";
import { messages } from "@/i18n";

const items: Array<{
  id: MobileView;
  label: string;
  icon: typeof PackageSearch;
}> = [
  { id: "catalog", label: messages.mobileNav.catalog, icon: PackageSearch },
  { id: "lists", label: messages.mobileNav.lists, icon: ListChecks },
  { id: "locations", label: messages.mobileNav.locations, icon: MapPinned },
];

export function MobileNav() {
  const { mobileView, setMobileView } = usePlannerStore();

  return (
    <nav className="mobile-nav" aria-label={messages.mobileNav.label}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            data-active={mobileView === item.id}
            onClick={() => setMobileView(item.id)}
          >
            <Icon size={19} aria-hidden="true" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
