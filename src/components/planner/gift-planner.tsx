"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import { AppHeader } from "@/components/planner/app-header";
import { CatalogViewToggle } from "@/components/planner/catalog-view-toggle";
import { FilterPanel } from "@/components/planner/filter-panel";
import { GiftGrid } from "@/components/planner/gift-grid";
import { LocationGuide } from "@/components/planner/location-guide";
import { MobileNav } from "@/components/planner/mobile-nav";
import { PersonPlanner } from "@/components/planner/person-planner";
import { TravelerOverview } from "@/components/planner/traveler-overview";
import type { GiftCatalog } from "@/domain/gifts";
import { messages } from "@/i18n";
import { sortGifts } from "@/domain/gift-sort";
import { PEOPLE, type Person, type PersonId } from "@/domain/people";
import { createEmptySelection, type SelectionEntry } from "@/domain/selections";
import { useSelectionAutosave } from "@/hooks/use-selection-autosave";
import { loadSelections } from "@/lib/selections-client";
import type { StoredSelection } from "@/server/selections/service";
import { usePlannerStore } from "@/stores/planner-store";

type GiftPlannerProps = {
  catalog: GiftCatalog;
  currentPerson: Person;
};

function createInitialSelections(): Record<PersonId, StoredSelection> {
  return Object.fromEntries(
    PEOPLE.map((person) => [
      person.id,
      { selection: createEmptySelection(person.id), etag: null },
    ]),
  ) as Record<PersonId, StoredSelection>;
}

/**
 * Applies a server snapshot without discarding an edit the traveler made while
 * that snapshot was still in flight.
 */
function applyServerRecords(
  current: Record<PersonId, StoredSelection>,
  records: Record<PersonId, StoredSelection>,
  personId: PersonId,
  keepOwnEntries: boolean,
): Record<PersonId, StoredSelection> {
  if (!keepOwnEntries) return records;

  return {
    ...records,
    [personId]: {
      selection: {
        ...records[personId].selection,
        entries: current[personId].selection.entries,
      },
      etag: records[personId].etag,
    },
  };
}

function recordsFromItems(
  items: readonly StoredSelection[],
): Record<PersonId, StoredSelection> {
  const nextSelections = createInitialSelections();

  for (const item of items) {
    nextSelections[item.selection.personId] = item;
  }

  return nextSelections;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function GiftPlanner({ catalog, currentPerson }: GiftPlannerProps) {
  const [selections, setSelections] = useState(createInitialSelections);
  const [isLoading, setIsLoading] = useState(true);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const {
    search,
    category,
    priority,
    nearRafflesOnly,
    sort,
    activePersonId,
    mobileView,
    catalogView,
    currency,
    setActivePersonId,
    setMobileView,
  } = usePlannerStore();

  const handleStoredSelection = useCallback(
    (stored: StoredSelection, hasPendingChanges: boolean) => {
      setSelections((current) => ({
        ...current,
        [currentPerson.id]: hasPendingChanges
          ? {
              selection: {
                ...stored.selection,
                entries: current[currentPerson.id].selection.entries,
              },
              etag: stored.etag,
            }
          : stored,
      }));
    },
    [currentPerson.id],
  );

  const reloadOwnSelectionAfterConflict = useCallback(async () => {
    const items = await loadSelections();
    const records = recordsFromItems(items);

    // The conflict is resolved in the traveler's favour, so the refreshed copy
    // updates everyone else while their own list keeps the change they made.
    setSelections((current) =>
      applyServerRecords(current, records, currentPerson.id, true),
    );

    return records[currentPerson.id];
  }, [currentPerson.id]);

  const {
    reset: resetSelectionAutosave,
    save: autosaveSelection,
    statusMessage: saveMessage,
    isSaving,
    changeRevision,
  } = useSelectionAutosave({
    personId: currentPerson.id,
    onStored: handleStoredSelection,
    onConflict: reloadOwnSelectionAfterConflict,
  });

  const refreshSelections = useCallback(async () => {
    setIsLoading(true);
    setStorageMessage(null);

    try {
      const items = await loadSelections();
      const records = recordsFromItems(items);
      setSelections(records);
      resetSelectionAutosave(records[currentPerson.id]);
    } catch (error) {
      console.error("Failed to load traveler selections", error);
      setStorageMessage(messages.storage.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [currentPerson.id, resetSelectionAutosave]);

  useEffect(() => {
    setActivePersonId(currentPerson.id);
    let cancelled = false;
    const revisionBeforeLoad = changeRevision();

    loadSelections()
      .then((items) => {
        if (cancelled) return;
        const records = recordsFromItems(items);
        // Read before the state updater runs: React defers the updater to the
        // render phase, by which point resetSelectionAutosave has moved on.
        const editedDuringLoad = changeRevision() !== revisionBeforeLoad;

        setSelections((current) =>
          applyServerRecords(current, records, currentPerson.id, editedDuringLoad),
        );
        resetSelectionAutosave(records[currentPerson.id]);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("Failed to load traveler selections", error);
        setStorageMessage(messages.storage.loadError);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    changeRevision,
    currentPerson.id,
    resetSelectionAutosave,
    setActivePersonId,
  ]);

  const giftById = useMemo(
    () => new Map(catalog.gifts.map((gift) => [gift.id, gift])),
    [catalog.gifts],
  );

  const filteredGifts = useMemo(() => {
    const query = normalizeSearchText(search.trim());

    const gifts = catalog.gifts.filter((gift) => {
      const searchable = normalizeSearchText(
        [
          gift.name.vi,
          gift.name.zh,
          gift.name.pinyin,
          gift.recipientsVi.join(" "),
          gift.tags.join(" "),
        ].join(" "),
      );

      return (
        (!query || searchable.includes(query)) &&
        (category === "all" || gift.category === category) &&
        (priority === "all" || gift.priority === priority) &&
        (!nearRafflesOnly || gift.nearRaffles)
      );
    });

    return sortGifts(gifts, sort);
  }, [catalog.gifts, category, nearRafflesOnly, priority, search, sort]);

  const ownEntries = selections[currentPerson.id].selection.entries;
  const selectedGiftIds = useMemo(
    () => new Set(ownEntries.map((entry) => entry.giftId)),
    [ownEntries],
  );

  const selectedPeopleByGift = useMemo(() => {
    const map = new Map<string, string[]>();

    for (const person of PEOPLE) {
      for (const entry of selections[person.id].selection.entries) {
        const people = map.get(entry.giftId) ?? [];
        people.push(person.displayName);
        map.set(entry.giftId, people);
      }
    }

    return map;
  }, [selections]);

  const changeOwnEntries = (entries: SelectionEntry[]) => {
    setSelections((current) => ({
      ...current,
      [currentPerson.id]: {
        ...current[currentPerson.id],
        selection: {
          ...current[currentPerson.id].selection,
          entries,
        },
      },
    }));
    autosaveSelection(entries);
  };

  const toggleGift = (giftId: string) => {
    const alreadySelected = ownEntries.some((entry) => entry.giftId === giftId);
    const gift = giftById.get(giftId);

    if (!gift) return;

    const nextEntries = alreadySelected
      ? ownEntries.filter((entry) => entry.giftId !== giftId)
      : [
          ...ownEntries,
          {
            giftId,
            quantity: 1,
            unitPriceCny: gift.priceCny,
            note: "",
          },
        ];

    changeOwnEntries(nextEntries);
    setActivePersonId(currentPerson.id);
  };

  return (
    <div className="app-shell">
      <AppHeader currentPerson={currentPerson} activePage="gifts" />
      <main id="main-content">
        <TravelerOverview
          selections={selections}
          exchangeRates={catalog.metadata.exchangeRates.rates}
          currency={currency}
          currentPersonId={currentPerson.id}
          activePersonId={activePersonId}
          onSelectPerson={(personId) => {
            setActivePersonId(personId);
            setMobileView("lists");
          }}
        />

        {(storageMessage || isLoading) && (
          <div className="storage-status" role="status">
            <span>{isLoading ? messages.storage.loading : storageMessage}</span>
            {!isLoading && (
              <button type="button" onClick={() => void refreshSelections()}>
                <RefreshCw size={15} aria-hidden="true" />{" "}
                {messages.storage.reload}
              </button>
            )}
          </div>
        )}

        <div className="planner-layout">
          <section
            className="catalog-workspace"
            id="gift-catalog"
            data-mobile-visible={mobileView === "catalog"}
          >
            <FilterPanel resultCount={filteredGifts.length} />
            <div className="catalog-results">
              <div className="catalog-results__heading">
                <div>
                  <span className="section-kicker">
                    {messages.catalog.kicker}
                  </span>
                  <h1>{messages.catalog.title}</h1>
                </div>
                <div className="catalog-results__actions">
                  <CatalogViewToggle />
                </div>
              </div>
              <GiftGrid
                gifts={filteredGifts}
                locations={catalog.locations}
                selectedGiftIds={selectedGiftIds}
                selectedPeopleByGift={selectedPeopleByGift}
                onToggleGift={toggleGift}
                viewMode={catalogView}
                currency={currency}
                exchangeRates={catalog.metadata.exchangeRates.rates}
              />
            </div>
          </section>

          <div
            className="planner-sidebar"
            data-mobile-visible={mobileView === "lists"}
          >
            <PersonPlanner
              activePersonId={activePersonId}
              currentPersonId={currentPerson.id}
              selectionRecord={selections[activePersonId]}
              giftById={giftById}
              exchangeRates={catalog.metadata.exchangeRates.rates}
              currency={currency}
              saveMessage={saveMessage}
              isLoading={isLoading}
              isSaving={isSaving}
              onSelectPerson={setActivePersonId}
              onChangeEntries={changeOwnEntries}
            />
          </div>
        </div>

        <div data-mobile-visible={mobileView === "locations"}>
          <LocationGuide locations={catalog.locations} />
        </div>

        <footer className="page-footer">
          <span>{messages.catalog.footerBrand}</span>
          <p>
            {messages.catalog.footerRates(
              catalog.metadata.updatedAt,
              catalog.metadata.exchangeRates.rates.VND,
              catalog.metadata.exchangeRates.rates.JPY,
            )}
          </p>
        </footer>
      </main>
      <MobileNav />
    </div>
  );
}
