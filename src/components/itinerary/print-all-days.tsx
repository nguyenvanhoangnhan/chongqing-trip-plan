"use client";

import { useEffect } from "react";

/**
 * A day the traveler has collapsed is still part of the trip, but a browser
 * prints only what a `details` element has open. Modern engines are covered by
 * `::details-content` in the print stylesheet; this opens the days for the rest,
 * then hands them back exactly as they were.
 */
export function PrintAllDays() {
  useEffect(() => {
    let opened: HTMLDetailsElement[] = [];

    const expand = () => {
      opened = [
        ...document.querySelectorAll<HTMLDetailsElement>(
          "details.itinerary-day",
        ),
      ].filter((day) => !day.open);

      for (const day of opened) {
        day.open = true;
      }
    };

    const restore = () => {
      for (const day of opened) {
        day.open = false;
      }

      opened = [];
    };

    window.addEventListener("beforeprint", expand);
    window.addEventListener("afterprint", restore);

    return () => {
      window.removeEventListener("beforeprint", expand);
      window.removeEventListener("afterprint", restore);
    };
  }, []);

  return null;
}
