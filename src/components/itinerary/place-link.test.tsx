import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";

import { MapProviderSwitcher } from "@/components/itinerary/map-provider-switcher";
import { PlaceLink } from "@/components/itinerary/place-link";
import { useMapProviderStore } from "@/stores/map-provider-store";

const place = {
  label: "Hồng Nhai Động",
  query: "洪崖洞民俗风貌区",
  uid: "fictional-baidu-uid",
};

beforeEach(() => {
  useMapProviderStore.setState({ provider: "baidu" });
});

describe("PlaceLink", () => {
  test("opens Baidu by default", () => {
    render(<PlaceLink place={place} isMobile={false} />);

    const url = new URL(
      screen.getByRole("link").getAttribute("href") ?? "",
    );
    expect(url.hostname).toBe("api.map.baidu.com");
    expect(url.searchParams.get("uid")).toBe("fictional-baidu-uid");
  });

  test("follows the traveler's switch to Amap", async () => {
    render(
      <>
        <MapProviderSwitcher />
        <PlaceLink place={place} isMobile={false} />
      </>,
    );

    await userEvent.click(screen.getByRole("radio", { name: /Amap/ }));

    const url = new URL(
      screen.getByRole("link").getAttribute("href") ?? "",
    );
    expect(url.hostname).toBe("uri.amap.com");
    expect(url.searchParams.get("keyword")).toBe("洪崖洞民俗风貌区");
  });

  test("asks Amap for the app on a phone and the site on a laptop", () => {
    useMapProviderStore.setState({ provider: "amap" });

    const { rerender } = render(<PlaceLink place={place} isMobile />);
    expect(
      new URL(screen.getByRole("link").getAttribute("href") ?? "").searchParams.get(
        "callnative",
      ),
    ).toBe("1");

    rerender(<PlaceLink place={place} isMobile={false} />);
    expect(
      new URL(screen.getByRole("link").getAttribute("href") ?? "").searchParams.get(
        "callnative",
      ),
    ).toBe("0");
  });

  test("opens in its own tab whichever map is chosen", () => {
    useMapProviderStore.setState({ provider: "amap" });
    render(<PlaceLink place={place} isMobile={false} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });
});

describe("MapProviderSwitcher", () => {
  test("shows which map the traveler is on", async () => {
    render(<MapProviderSwitcher />);

    const baidu = screen.getByRole("radio", { name: /Baidu/ });
    const amap = screen.getByRole("radio", { name: /Amap/ });
    expect(baidu).toBeChecked();

    await userEvent.click(amap);

    expect(amap).toBeChecked();
    expect(useMapProviderStore.getState().provider).toBe("amap");
  });
});
