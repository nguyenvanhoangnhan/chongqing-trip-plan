import { render } from "@testing-library/react";
import { act } from "react";
import { describe, expect, test } from "vitest";

import { PrintAllDays } from "@/components/itinerary/print-all-days";

function renderDays(openStates: readonly boolean[]) {
  const { container } = render(
    <div>
      <PrintAllDays />
      {openStates.map((open, index) => (
        <details className="itinerary-day" key={index} open={open}>
          <summary>Ngày {index + 1}</summary>
          <p>Chặng</p>
        </details>
      ))}
    </div>,
  );

  return () =>
    [...container.querySelectorAll("details")].map((day) => day.open);
}

const fireWindow = (type: string) =>
  act(() => {
    window.dispatchEvent(new Event(type));
  });

describe("PrintAllDays", () => {
  test("opens every collapsed day so the whole trip reaches paper", () => {
    const openStates = renderDays([false, true, false, false, false]);

    fireWindow("beforeprint");

    expect(openStates()).toEqual([true, true, true, true, true]);
  });

  test("puts the days back the way the traveler had them", () => {
    const openStates = renderDays([false, true, false, false, false]);

    fireWindow("beforeprint");
    fireWindow("afterprint");

    expect(openStates()).toEqual([false, true, false, false, false]);
  });

  test("survives printing twice in a row", () => {
    const openStates = renderDays([false, true, false]);

    fireWindow("beforeprint");
    fireWindow("afterprint");
    fireWindow("beforeprint");

    expect(openStates()).toEqual([true, true, true]);

    fireWindow("afterprint");

    expect(openStates()).toEqual([false, true, false]);
  });
});
