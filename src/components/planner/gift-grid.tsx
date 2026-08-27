import { PackageSearch } from "lucide-react";

import { GiftCard } from "@/components/planner/gift-card";
import type { Gift, ShoppingLocation } from "@/domain/gifts";
import { messages } from "@/i18n";
import type { CurrencyRates, DisplayCurrency } from "@/lib/format";
import type { CatalogView } from "@/stores/planner-store";

type GiftGridProps = {
  gifts: readonly Gift[];
  locations: readonly ShoppingLocation[];
  selectedGiftIds: ReadonlySet<string>;
  selectedPeopleByGift: ReadonlyMap<string, readonly string[]>;
  onToggleGift: (giftId: string) => void;
  viewMode: CatalogView;
  currency: DisplayCurrency;
  exchangeRates: CurrencyRates;
};

export function GiftGrid({
  gifts,
  locations,
  selectedGiftIds,
  selectedPeopleByGift,
  onToggleGift,
  viewMode,
  currency,
  exchangeRates,
}: GiftGridProps) {
  if (gifts.length === 0) {
    return (
      <div className="empty-filter-state">
        <PackageSearch size={30} aria-hidden="true" />
        <strong>{messages.emptyCatalog.title}</strong>
        <span>{messages.emptyCatalog.hint}</span>
      </div>
    );
  }

  return (
    <div className={`gift-grid gift-grid--${viewMode}`}>
      {gifts.map((gift) => (
        <GiftCard
          key={gift.id}
          gift={gift}
          currency={currency}
          exchangeRates={exchangeRates}
          purchaseLocations={gift.purchaseLocationIds.flatMap((locationId) => {
            const location = locations.find((candidate) => candidate.id === locationId);
            return location ? [location] : [];
          })}
          isSelected={selectedGiftIds.has(gift.id)}
          selectedBy={selectedPeopleByGift.get(gift.id) ?? []}
          onToggle={onToggleGift}
        />
      ))}
    </div>
  );
}
