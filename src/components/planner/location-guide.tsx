import { Navigation, Store } from "lucide-react";

import { LocationMapAction } from "@/components/planner/location-map-action";
import type { ShoppingLocation } from "@/domain/gifts";
import { messages } from "@/i18n";

type LocationGuideProps = {
  locations: readonly ShoppingLocation[];
};

export function LocationGuide({ locations }: LocationGuideProps) {
  const orderedLocations = [...locations].sort(
    (left, right) => left.itineraryOrder - right.itineraryOrder,
  );

  return (
    <section
      aria-labelledby="location-title"
      className="location-guide"
      id="shopping-locations"
    >
      <div className="location-guide__heading">
        <span className="section-kicker">
          <Navigation size={16} aria-hidden="true" /> {messages.locations.kicker}
        </span>
        <h2 id="location-title">{messages.locations.title}</h2>
        <p>{messages.locations.subtitle}</p>
      </div>

      <div className="location-list">
        {orderedLocations.map((location, index) => {
          const titleId = `location-${location.id}`;
          const compactDate = location.visitPlan.dateVi.split(" + ")[0];

          return (
            <article
              aria-labelledby={titleId}
              className="location-card"
              key={location.id}
            >
              <div className="location-card__marker">
                <span className="location-card__number">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <span className="location-card__date">{compactDate}</span>
              </div>
              <div className="location-card__summary">
                <span className="location-card__proximity">
                  {location.visitPlan.dedicatedShoppingStop
                    ? messages.locations.nearHotel
                    : messages.locations.inItinerary}
                </span>
                <h3 id={titleId}>{location.name.vi}</h3>
                <p className="location-card__name-zh" lang="zh-CN">
                  {location.name.zh}
                </p>
                <p className="location-card__purpose">{location.bestForVi}</p>
              </div>
              <dl>
                <div>
                  <dt>{messages.locations.travel}</dt>
                  <dd>
                    {messages.locations.travelTime(
                      location.travelMinutes.min,
                      location.travelMinutes.max,
                    )}
                  </dd>
                </div>
              </dl>
              <LocationMapAction mapQuery={location.mapQuery} />
              <p className="location-card__note">
                <Store size={14} aria-hidden="true" />{" "}
                {location.visitPlan.itineraryNoteVi}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
