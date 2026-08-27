import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";

import { MapProviderSwitcher } from "@/components/itinerary/map-provider-switcher";
import { RouteLinks } from "@/components/itinerary/route-links";
import { useMapProviderStore } from "@/stores/map-provider-store";

const route = {
  origin: { name: "解放碑" },
  destination: { name: "磁器口古镇" },
  preferredMode: "transit" as const,
};

beforeEach(() => {
  useMapProviderStore.setState({ provider: "baidu" });
});

describe("RouteLinks", () => {
  test("routes through Baidu by default", () => {
    render(<RouteLinks route={route} />);

    expect(screen.getByText("Chỉ đường Baidu")).toBeInTheDocument();
    const driving = new URL(
      screen.getByRole("link", { name: "Ô tô" }).getAttribute("href") ?? "",
    );
    const transit = new URL(
      screen.getByRole("link", { name: "Công cộng" }).getAttribute("href") ?? "",
    );
    expect(driving.hostname).toBe("api.map.baidu.com");
    expect(driving.searchParams.get("mode")).toBe("driving");
    expect(transit.searchParams.get("mode")).toBe("transit");
  });

  test("follows the traveler's switch to Amap", async () => {
    render(
      <>
        <MapProviderSwitcher />
        <RouteLinks route={route} />
      </>,
    );

    await userEvent.click(screen.getByRole("radio", { name: /Amap/ }));

    expect(screen.getByText("Chỉ đường Amap")).toBeInTheDocument();
    const driving = new URL(
      screen.getByRole("link", { name: "Ô tô" }).getAttribute("href") ?? "",
    );
    const transit = new URL(
      screen.getByRole("link", { name: "Công cộng" }).getAttribute("href") ?? "",
    );
    expect(driving.hostname).toBe("www.amap.com");
    expect(driving.searchParams.get("type")).toBe("car");
    expect(transit.searchParams.get("type")).toBe("bus");
    expect(transit.searchParams.get("to[name]")).toBe("磁器口古镇");
  });

  test("opens every route in its own tab", () => {
    render(<RouteLinks route={route} />);

    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    }
  });
});
