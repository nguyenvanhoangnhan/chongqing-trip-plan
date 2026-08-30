import {
  AlertTriangle,
  BookOpen,
  CheckSquare,
  ExternalLink,
  HelpCircle,
  Mountain,
  Phone,
  Ticket,
  TrainFront,
  Users,
} from "lucide-react";

import { PlaceChineseName } from "@/components/itinerary/place-chinese-name";
import { PlaceLink } from "@/components/itinerary/place-link";
import { RouteLinks } from "@/components/itinerary/route-links";
import { WULONG_GUIDE, type GuideCheck, type GuideFact } from "@/data/wulong-guide";
import type { ItineraryDay } from "@/domain/itinerary";

type WulongGuideProps = {
  day: ItineraryDay;
  isMobile?: boolean;
};

function FactList({ facts }: { facts: readonly GuideFact[] }) {
  return (
    <dl className="guide-facts">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function CheckList({
  checks,
  numbered = false,
}: {
  checks: readonly GuideCheck[];
  numbered?: boolean;
}) {
  return (
    <ol className="guide-checks" data-numbered={numbered}>
      {checks.map((check, index) => (
        <li key={check.title}>
          {numbered && <b>{String(index + 1).padStart(2, "0")}</b>}
          <div>
            <strong>{check.title}</strong>
            <p>{check.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function WulongGuide({ day, isMobile = false }: WulongGuideProps) {
  const guide = WULONG_GUIDE;

  return (
    <main className="guide-main" id="main-content">
      <header className="guide-header">
        <span className="trip-kicker">
          <Mountain size={15} aria-hidden="true" /> {guide.date} · 武隆
        </span>
        <h1>{guide.headline}</h1>

        <a
          className="guide-featured"
          href={guide.featured.url}
          target="_blank"
          rel="noreferrer"
        >
          <BookOpen size={16} aria-hidden="true" />
          <span>
            <strong>{guide.featured.label}</strong>
            <small>{guide.featured.note}</small>
          </span>
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </header>

      <section aria-labelledby="guide-timeline-title" className="guide-section">
        <h2 id="guide-timeline-title">Từng bước trong ngày</h2>
        <ol className="guide-timeline">
          {day.items.map((item) => (
            <li key={item.id}>
              <div className="guide-timeline__when">
                <b>{item.time}</b>
                {item.duration && <span>{item.duration}</span>}
              </div>

              <div className="guide-timeline__what">
                <strong>{item.activity}</strong>

                {item.transport && (
                  <span className="guide-timeline__transport">{item.transport}</span>
                )}

                {item.note && <p className="guide-timeline__note">{item.note}</p>}

                {item.places && item.places.length > 0 && (
                  <div className="guide-timeline__places">
                    {item.places.map((place) => (
                      <div key={place.uid ?? place.query ?? place.label}>
                        <PlaceLink place={place} isMobile={isMobile} />
                        {place.query && <PlaceChineseName name={place.query} />}
                      </div>
                    ))}
                  </div>
                )}

                {item.route && <RouteLinks route={item.route} />}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="guide-trains-title" className="guide-section">
        <h2 id="guide-trains-title">
          <TrainFront size={16} aria-hidden="true" /> Tàu
        </h2>
        <FactList facts={guide.trains} />
      </section>

      <section aria-labelledby="guide-tickets-title" className="guide-section">
        <h2 id="guide-tickets-title">
          <Ticket size={16} aria-hidden="true" /> Vé và giá
        </h2>
        <FactList facts={guide.tickets} />
      </section>

      <section aria-labelledby="guide-checklist-title" className="guide-section">
        <h2 id="guide-checklist-title">
          <CheckSquare size={16} aria-hidden="true" /> Làm trước khi đi
        </h2>
        <CheckList checks={guide.checklist} numbered />
      </section>

      <section aria-labelledby="guide-confirm-title" className="guide-section">
        <h2 id="guide-confirm-title">
          <HelpCircle size={16} aria-hidden="true" /> Gọi {guide.hotline} xác nhận
        </h2>
        <CheckList checks={guide.confirm} />
        <a className="guide-call" href={`tel:${guide.hotline}`}>
          <Phone size={15} aria-hidden="true" /> Gọi {guide.hotline}
        </a>
      </section>

      <section aria-labelledby="guide-travellers-title" className="guide-section">
        <h2 id="guide-travellers-title">
          <Users size={16} aria-hidden="true" /> Người đi trước kể
        </h2>
        <CheckList checks={guide.fromTravellers} />
      </section>

      <section aria-labelledby="guide-risks-title" className="guide-section">
        <h2 id="guide-risks-title">
          <AlertTriangle size={16} aria-hidden="true" /> Chỗ dễ vỡ
        </h2>
        <CheckList checks={guide.risks} />
      </section>

      <footer className="guide-sources">
        <h2>Nguồn</h2>
        <ul>
          {guide.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </main>
  );
}
