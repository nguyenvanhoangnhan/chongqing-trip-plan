import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { giftCatalog } from "@/data/catalog";
import { GiftCard } from "@/components/planner/gift-card";
import { formatCnyAmount } from "@/lib/format";

describe("GiftCard", () => {
  const gift = giftCatalog.gifts[0];
  const purchaseLocations = gift.purchaseLocationIds.map(
    (locationId) =>
      giftCatalog.locations.find((location) => location.id === locationId)!,
  );

  it("lets the signed-in traveler mark a gift", async () => {
    const onToggle = vi.fn();
    render(
      <GiftCard
        gift={gift}
        purchaseLocations={purchaseLocations}
        currency="CNY"
        exchangeRates={giftCatalog.metadata.exchangeRates.rates}
        isSelected={false}
        selectedBy={[]}
        onToggle={onToggle}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /thêm vào danh sách/i }),
    );

    expect(onToggle).toHaveBeenCalledWith(gift.id);
    expect(screen.queryByText("Có gần Raffles")).not.toBeInTheDocument();
    expect(screen.getByText("Raffles City")).toBeInTheDocument();
    expect(screen.getByText("Bát Nhất Lộ")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: gift.images[0].altVi }),
    ).toBeInTheDocument();
    expect(screen.getByText(gift.brand)).toBeInTheDocument();
    expect(screen.getByText(gift.packVi)).toBeInTheDocument();
    expect(screen.getByText(formatCnyAmount(gift.priceCny))).toBeInTheDocument();
    expect(screen.getByText("≈ 45.625 ₫")).toBeInTheDocument();
    expect(screen.queryByText(/\d+-\d+/)).not.toBeInTheDocument();
  });

  it("shows who already selected the gift", () => {
    render(
      <GiftCard
        gift={gift}
        purchaseLocations={purchaseLocations}
        currency="CNY"
        exchangeRates={giftCatalog.metadata.exchangeRates.rates}
        isSelected
        selectedBy={["Duy", "Minh"]}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText("Duy, Minh đã chọn")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /bỏ khỏi danh sách/i }),
    ).toBeInTheDocument();
  });

  it("shows buying notes without purchase-question copy", () => {
    render(
      <GiftCard
        gift={gift}
        purchaseLocations={purchaseLocations}
        currency="CNY"
        exchangeRates={giftCatalog.metadata.exchangeRates.rates}
        isSelected={false}
        selectedBy={[]}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText("Xem lưu ý")).toBeInTheDocument();
    expect(screen.queryByText(gift.askInChinese)).not.toBeInTheDocument();
  });

  it("keeps the gallery controls hidden for a single-image gift", () => {
    const singleImageGift = { ...gift, images: [gift.images[0]] };

    render(
      <GiftCard
        gift={singleImageGift}
        purchaseLocations={purchaseLocations}
        currency="CNY"
        exchangeRates={giftCatalog.metadata.exchangeRates.rates}
        isSelected={false}
        selectedBy={[]}
        onToggle={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /xem ảnh/i }),
    ).not.toBeInTheDocument();
  });

  it("marks the image frame as loading until the photo arrives", async () => {
    const { container } = render(
      <GiftCard
        gift={gift}
        purchaseLocations={purchaseLocations}
        currency="CNY"
        exchangeRates={giftCatalog.metadata.exchangeRates.rates}
        isSelected={false}
        selectedBy={[]}
        onToggle={vi.fn()}
      />,
    );

    const frame = container.querySelector(".gift-card__image")!;
    expect(frame).toHaveAttribute("data-loading", "true");

    fireEvent.load(screen.getByRole("img", { name: gift.images[0].altVi }));

    await waitFor(() =>
      expect(frame).toHaveAttribute("data-loading", "false"),
    );
  });

  it("returns to the loading state when another image is picked", async () => {
    const galleryGift = {
      ...gift,
      images: [gift.images[0], giftCatalog.gifts[1].images[0]],
    };

    const { container } = render(
      <GiftCard
        gift={galleryGift}
        purchaseLocations={purchaseLocations}
        currency="CNY"
        exchangeRates={giftCatalog.metadata.exchangeRates.rates}
        isSelected={false}
        selectedBy={[]}
        onToggle={vi.fn()}
      />,
    );

    const frame = container.querySelector(".gift-card__image")!;
    fireEvent.load(screen.getByRole("img", { name: galleryGift.images[0].altVi }));
    await waitFor(() =>
      expect(frame).toHaveAttribute("data-loading", "false"),
    );

    await userEvent.click(screen.getByRole("button", { name: /xem ảnh 2/i }));

    expect(frame).toHaveAttribute("data-loading", "true");
  });

  it("shimmers each thumbnail until its own photo arrives", async () => {
    const galleryGift = {
      ...gift,
      images: [gift.images[0], giftCatalog.gifts[1].images[0]],
    };

    render(
      <GiftCard
        gift={galleryGift}
        purchaseLocations={purchaseLocations}
        currency="CNY"
        exchangeRates={giftCatalog.metadata.exchangeRates.rates}
        isSelected={false}
        selectedBy={[]}
        onToggle={vi.fn()}
      />,
    );

    const [firstThumb, secondThumb] = screen.getAllByRole("button", {
      name: /xem ảnh/i,
    });
    expect(firstThumb).toHaveAttribute("data-loading", "true");

    fireEvent.load(within(firstThumb).getByRole("presentation"));

    await waitFor(() =>
      expect(firstThumb).toHaveAttribute("data-loading", "false"),
    );
    expect(secondThumb).toHaveAttribute("data-loading", "true");
  });

  it("switches the main image when a thumbnail is picked", async () => {
    const galleryGift = {
      ...gift,
      images: [gift.images[0], giftCatalog.gifts[1].images[0]],
    };

    render(
      <GiftCard
        gift={galleryGift}
        purchaseLocations={purchaseLocations}
        currency="CNY"
        exchangeRates={giftCatalog.metadata.exchangeRates.rates}
        isSelected={false}
        selectedBy={[]}
        onToggle={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("img", { name: galleryGift.images[0].altVi }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /xem ảnh 2/i }));

    expect(
      screen.getByRole("img", { name: galleryGift.images[1].altVi }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: galleryGift.images[0].altVi }),
    ).not.toBeInTheDocument();
  });

  describe("gallery arrows", () => {
    const galleryGift = {
      ...gift,
      images: [
        gift.images[0],
        giftCatalog.gifts[1].images[0],
        giftCatalog.gifts[2].images[0],
      ],
    };

    function renderGallery(target = galleryGift) {
      return render(
        <GiftCard
          gift={target}
          purchaseLocations={purchaseLocations}
          currency="CNY"
          exchangeRates={giftCatalog.metadata.exchangeRates.rates}
          isSelected={false}
          selectedBy={[]}
          onToggle={vi.fn()}
        />,
      );
    }

    it("stays out of the way for a gift with a single image", () => {
      renderGallery({ ...gift, images: [gift.images[0]] });

      expect(
        screen.queryByRole("button", { name: /ảnh kế tiếp/i }),
      ).not.toBeInTheDocument();
    });

    it("steps forward to the next image", async () => {
      renderGallery();

      await userEvent.click(
        screen.getByRole("button", { name: /ảnh kế tiếp/i }),
      );

      expect(
        screen.getByRole("img", { name: galleryGift.images[1].altVi }),
      ).toBeInTheDocument();
    });

    it("wraps from the last image back to the first", async () => {
      renderGallery();
      const next = screen.getByRole("button", { name: /ảnh kế tiếp/i });

      await userEvent.click(next);
      await userEvent.click(next);
      await userEvent.click(next);

      expect(
        screen.getByRole("img", { name: galleryGift.images[0].altVi }),
      ).toBeInTheDocument();
    });

    it("wraps backwards from the first image to the last", async () => {
      renderGallery();

      await userEvent.click(
        screen.getByRole("button", { name: /ảnh trước/i }),
      );

      expect(
        screen.getByRole("img", { name: galleryGift.images[2].altVi }),
      ).toBeInTheDocument();
    });

    it("advances when the traveler swipes left", () => {
      const { container } = renderGallery();
      const frame = container.querySelector(".gift-card__image")!;

      fireEvent.pointerDown(frame, { clientX: 200, clientY: 100 });
      fireEvent.pointerUp(frame, { clientX: 120, clientY: 104 });

      expect(
        screen.getByRole("img", { name: galleryGift.images[1].altVi }),
      ).toBeInTheDocument();
    });

    it("ignores a mostly vertical drag so the page can still scroll", () => {
      const { container } = renderGallery();
      const frame = container.querySelector(".gift-card__image")!;

      fireEvent.pointerDown(frame, { clientX: 200, clientY: 100 });
      fireEvent.pointerUp(frame, { clientX: 190, clientY: 260 });

      expect(
        screen.getByRole("img", { name: galleryGift.images[0].altVi }),
      ).toBeInTheDocument();
    });
  });

  it("renders the visible prices as equal peers", () => {
    const { container } = render(
      <GiftCard
        gift={gift}
        purchaseLocations={purchaseLocations}
        currency="CNY"
        exchangeRates={giftCatalog.metadata.exchangeRates.rates}
        isSelected={false}
        selectedBy={[]}
        onToggle={vi.fn()}
      />,
    );

    const card = within(container);
    const cnyPrice = card.getByText(formatCnyAmount(gift.priceCny));
    const vndPrice = card.getByText("≈ 45.625 ₫");

    expect(cnyPrice).toHaveClass("gift-card__price");
    expect(vndPrice).toHaveClass("gift-card__price");
    expect(cnyPrice.parentElement).toBe(vndPrice.parentElement);
  });
});
