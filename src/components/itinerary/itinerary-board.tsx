import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Footprints,
  MapPin,
  Route,
  TrainFront,
} from "lucide-react";

import { MapProviderSwitcher } from "@/components/itinerary/map-provider-switcher";
import { PlaceChineseName } from "@/components/itinerary/place-chinese-name";
import { PlaceLink } from "@/components/itinerary/place-link";
import { PrintAllDays } from "@/components/itinerary/print-all-days";
import { RouteLinks } from "@/components/itinerary/route-links";
import type { Itinerary, ItineraryProgress } from "@/domain/itinerary";

type ItineraryBoardProps = {
  itinerary: Itinerary;
  defaultOpenDayIds: readonly string[];
  progress?: ItineraryProgress;
  isMobile?: boolean;
};

const NO_PROGRESS: ItineraryProgress = {
  currentItemId: null,
  nextItemId: null,
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Shanghai",
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
});

export function ItineraryBoard({
  itinerary,
  defaultOpenDayIds,
  progress = NO_PROGRESS,
  isMobile = false,
}: ItineraryBoardProps) {
  const currentDayId =
    defaultOpenDayIds.length === 1 ? defaultOpenDayIds[0] : null;

  return (
    <>
      <PrintAllDays />
      <section className="trip-hero" aria-labelledby="trip-title">
        <div className="trip-hero__route" aria-hidden="true">
          <span>CKG</span>
          <i />
          <span>DAY 1-5</span>
        </div>
        <div className="trip-hero__title">
          <span className="trip-kicker">
            <MapPin size={15} aria-hidden="true" /> 重庆 · PRIVATE ROUTE
          </span>
          <h1 id="trip-title">{itinerary.title}</h1>
        </div>

        <nav className="trip-day-jump" aria-label="Đi đến ngày">
          {itinerary.days.map((day, index) => (
            <a
              key={day.id}
              href={`#${day.id}`}
              data-current={day.id === currentDayId}
            >
              <span>0{index + 1}</span>
              Ngày {index + 1}
            </a>
          ))}
        </nav>
      </section>

      <main className="itinerary-main" id="main-content">
        <div className="itinerary-heading">
          <span className="trip-kicker">
            <Route size={15} aria-hidden="true" /> LỊCH TRÌNH · 行程
          </span>
          <div>
            <h2>Đi theo từng ngày</h2>
            <p>Chạm vào tiêu đề ngày để thu gọn hoặc mở lại.</p>
          </div>
        </div>

        <MapProviderSwitcher />

        <section className="itinerary-days" aria-label="Lịch trình năm ngày">
          {itinerary.days.map((day, dayIndex) => {
            const isCurrent = day.id === currentDayId;
            const isOpen = defaultOpenDayIds.includes(day.id);
            const dateLabel = dateFormatter.format(
              new Date(`${day.date}T00:00:00+08:00`),
            );

            return (
              <details
                className="itinerary-day"
                data-current={isCurrent}
                id={day.id}
                key={day.id}
                open={isOpen}
              >
                <summary className="itinerary-day__summary">
                  <span className="itinerary-day__index">0{dayIndex + 1}</span>
                  <span className="itinerary-day__title">
                    <small>{isCurrent ? "HÔM NAY · CHINA TIME" : dateLabel}</small>
                    <strong>Ngày {dayIndex + 1}</strong>
                    {day.headline && <span>{day.headline}</span>}
                  </span>
                  <span className="itinerary-day__count">
                    {day.items.length} chặng
                  </span>
                  <ChevronDown
                    className="itinerary-day__chevron"
                    size={24}
                    aria-hidden="true"
                  />
                </summary>

                <div className="itinerary-day__body">
                  {day.items.map((item, itemIndex) => {
                    const stopProgress =
                      item.id === progress.currentItemId
                        ? "current"
                        : item.id === progress.nextItemId
                          ? "next"
                          : undefined;

                    return (
                    <article
                      className="itinerary-stop"
                      data-progress={stopProgress}
                      key={item.id}
                    >
                      <div className="itinerary-stop__time">
                        <Clock3 size={15} aria-hidden="true" />
                        <time>{item.time}</time>
                        {stopProgress && (
                          <span className="itinerary-stop__badge">
                            {stopProgress === "current"
                              ? "Đang ở đây"
                              : "Tiếp theo"}
                          </span>
                        )}
                      </div>
                      <div className="itinerary-stop__rail" aria-hidden="true">
                        <span>{String(itemIndex + 1).padStart(2, "0")}</span>
                      </div>
                      <div className="itinerary-stop__card">
                        <div className="itinerary-stop__topline">
                          <h3>{item.activity}</h3>
                          <span>{item.duration || "-"}</span>
                        </div>

                        {item.transport && item.transport !== "-" && (
                          <p className="itinerary-stop__transport">
                            {item.transport.toLowerCase().includes("walk") ||
                            item.transport.toLowerCase().includes("đi bộ") ? (
                              <Footprints size={15} aria-hidden="true" />
                            ) : (
                              <TrainFront size={15} aria-hidden="true" />
                            )}
                            {item.transport}
                          </p>
                        )}

                        {item.note && (
                          <p className="itinerary-stop__note">{item.note}</p>
                        )}

                        {item.places && item.places.length > 0 && (
                          <div className="itinerary-stop__places">
                            <span>Địa điểm</span>
                            {item.places.map((place) => (
                              <div
                                className="itinerary-stop__place"
                                key={`${item.id}-${place.uid ?? place.query ?? place.label}`}
                              >
                                <PlaceLink place={place} isMobile={isMobile} />
                                {place.query && (
                                  <PlaceChineseName name={place.query} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {item.route && <RouteLinks route={item.route} />}
                      </div>
                    </article>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </section>

        <aside className="itinerary-map-note">
          <CalendarDays size={20} aria-hidden="true" />
          <p>
            <strong>Chỉ đường mở trang hoạch định tuyến của bản đồ đang chọn.</strong>
            Chọn Ô tô hoặc Công cộng tại đây, rồi vẫn có thể đổi phương tiện
            trong ứng dụng bản đồ.
          </p>
        </aside>
      </main>
    </>
  );
}
