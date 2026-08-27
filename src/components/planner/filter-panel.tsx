import { RotateCcw, Search } from "lucide-react";

import type { Gift } from "@/domain/gifts";
import { messages } from "@/i18n";
import { usePlannerStore } from "@/stores/planner-store";

type FilterPanelProps = {
  resultCount: number;
};

const categories: Array<{ value: "all" | Gift["category"]; label: string }> = [
  { value: "all", label: messages.filters.categories.all },
  { value: "food", label: messages.filters.categories.food },
  { value: "tea", label: messages.filters.categories.tea },
  { value: "craft", label: messages.filters.categories.craft },
  { value: "souvenir", label: messages.filters.categories.souvenir },
  { value: "decor", label: messages.filters.categories.decor },
  { value: "stationery", label: messages.filters.categories.stationery },
  { value: "homeware", label: messages.filters.categories.homeware },
];

export function FilterPanel({ resultCount }: FilterPanelProps) {
  const {
    search,
    category,
    priority,
    nearRafflesOnly,
    sort,
    setSearch,
    setCategory,
    setPriority,
    setNearRafflesOnly,
    setSort,
    resetFilters,
  } = usePlannerStore();

  return (
    <aside className="filter-panel" aria-label={messages.filters.label}>
      <div className="filter-panel__heading">
        <span>{messages.filters.heading}</span>
        <strong>{messages.filters.resultCount(resultCount)}</strong>
      </div>

      <label className="search-field">
        <span>{messages.filters.searchLabel}</span>
        <span className="search-field__control">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={messages.filters.searchPlaceholder}
          />
        </span>
      </label>

      <fieldset className="filter-group filter-group--category">
        <legend>{messages.filters.categoryLabel}</legend>
        <div className="filter-chips">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              data-active={category === item.value}
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group filter-group--priority">
        <legend>{messages.filters.priorityLabel}</legend>
        <label className="radio-row">
          <input
            type="radio"
            name="priority"
            checked={priority === "all"}
            onChange={() => setPriority("all")}
          />
          <span>{messages.filters.priorities.all}</span>
        </label>
        <label className="radio-row">
          <input
            type="radio"
            name="priority"
            checked={priority === "high"}
            onChange={() => setPriority("high")}
          />
          <span>{messages.filters.priorities.high}</span>
        </label>
      </fieldset>

      <label className="sort-field">
        <span>{messages.filters.sortLabel}</span>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as typeof sort)}
        >
          <option value="default">{messages.filters.sortOptions.default}</option>
          <option value="price-asc">{messages.filters.sortOptions.priceAsc}</option>
          <option value="price-desc">{messages.filters.sortOptions.priceDesc}</option>
          <option value="priority">{messages.filters.sortOptions.priority}</option>
        </select>
      </label>

      <label className="switch-row">
        <span>
          <strong>{messages.filters.nearbyTitle}</strong>
          <small>{messages.filters.nearbyHint}</small>
        </span>
        <input
          type="checkbox"
          checked={nearRafflesOnly}
          onChange={(event) => setNearRafflesOnly(event.target.checked)}
        />
      </label>

      <button type="button" className="reset-button" onClick={resetFilters}>
        <RotateCcw size={15} aria-hidden="true" /> {messages.filters.reset}
      </button>
    </aside>
  );
}
