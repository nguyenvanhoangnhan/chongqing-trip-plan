import { ArrowDown, MapPin } from "lucide-react";

import type { GiftCatalog } from "@/domain/gifts";
import { messages } from "@/i18n";
import {
  formatCnyInCurrency,
  type DisplayCurrency,
} from "@/lib/format";

type CatalogHeroProps = {
  catalog: GiftCatalog;
  currency: DisplayCurrency;
};

export function CatalogHero({ catalog, currency }: CatalogHeroProps) {
  const rates = catalog.metadata.exchangeRates.rates;
  const minCny = catalog.metadata.budget.minVnd / rates.VND;
  const maxCny = catalog.metadata.budget.maxVnd / rates.VND;

  return (
    <section
      className="catalog-hero"
      aria-labelledby="catalog-title"
      data-city-mark={messages.catalogHero.cityMark}
    >
      <div className="catalog-hero__eyebrow">
        <MapPin size={16} aria-hidden="true" />
        <span>{messages.catalogHero.nearby}</span>
      </div>
      <div className="catalog-hero__grid">
        <div>
          <p className="catalog-hero__route">{messages.catalogHero.route}</p>
          <h1 id="catalog-title">{messages.catalogHero.title}</h1>
        </div>
        <div className="catalog-hero__brief">
          <p>{messages.catalogHero.giftSummary(catalog.gifts.length)}</p>
          <dl>
            <div>
              <dt>{messages.catalogHero.perPerson}</dt>
              <dd>
                {formatCnyInCurrency(minCny, currency, rates)}–
                {formatCnyInCurrency(maxCny, currency, rates)}
              </dd>
            </div>
            <div>
              <dt>{messages.catalogHero.updated}</dt>
              <dd>{catalog.metadata.updatedAt}</dd>
            </div>
          </dl>
        </div>
      </div>
      <a href="#gift-catalog" className="hero-jump">
        {messages.catalogHero.jump} <ArrowDown size={16} aria-hidden="true" />
      </a>
    </section>
  );
}
