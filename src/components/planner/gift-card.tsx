"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Plus,
  ShoppingBag,
} from "lucide-react";

import type { Gift, GiftImage, ShoppingLocation } from "@/domain/gifts";
import { messages } from "@/i18n";
import {
  formatCnyInCurrency,
  type CurrencyRates,
  type DisplayCurrency,
} from "@/lib/format";

const SWIPE_THRESHOLD_PX = 40;

type GiftCardProps = {
  gift: Gift;
  purchaseLocations: readonly ShoppingLocation[];
  currency: DisplayCurrency;
  exchangeRates: CurrencyRates;
  isSelected: boolean;
  selectedBy: readonly string[];
  onToggle: (giftId: string) => void;
};

export function GiftCard({
  gift,
  purchaseLocations,
  currency,
  exchangeRates,
  isSelected,
  selectedBy,
  onToggle,
}: GiftCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loadedImageSrc, setLoadedImageSrc] = useState<string | null>(null);
  const swipeOriginRef = useRef<{ x: number; y: number } | null>(null);
  const activeImage = gift.images[activeImageIndex] ?? gift.images[0];
  const isImageLoading = loadedImageSrc !== activeImage.src;
  const hasGallery = gift.images.length > 1;

  const stepImage = (step: number) => {
    setActiveImageIndex(
      (current) =>
        (current + step + gift.images.length) % gift.images.length,
    );
  };

  const beginSwipe = (event: React.PointerEvent) => {
    swipeOriginRef.current = { x: event.clientX, y: event.clientY };
  };

  const endSwipe = (event: React.PointerEvent) => {
    const origin = swipeOriginRef.current;
    swipeOriginRef.current = null;

    if (!origin || !hasGallery) return;

    const deltaX = event.clientX - origin.x;
    const deltaY = event.clientY - origin.y;

    // A drag that is mostly vertical belongs to the page, not the gallery.
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

    stepImage(deltaX < 0 ? 1 : -1);
  };
  const [year, month, day] = gift.priceCheckedAt.split("-");
  const cnyPrice = formatCnyInCurrency(gift.priceCny, "CNY", exchangeRates);
  const vndPrice = formatCnyInCurrency(gift.priceCny, "VND", exchangeRates);
  const referencePrice =
    currency === "CNY"
      ? vndPrice
      : currency === "VND"
        ? cnyPrice
        : `${cnyPrice} · ${vndPrice}`;

  return (
    <article
      className="gift-card"
      data-selected={isSelected}
      data-selected-label={messages.giftCard.selectedRibbon}
    >
      <div
        className="gift-card__image"
        data-loading={isImageLoading}
        onPointerDown={beginSwipe}
        onPointerUp={endSwipe}
      >
        <Image
          src={activeImage.src}
          alt={activeImage.altVi}
          fill
          sizes="(max-width: 460px) 34vw, (max-width: 1380px) 34vw, 24vw"
          unoptimized
          onLoad={() => setLoadedImageSrc(activeImage.src)}
        />
        {hasGallery ? (
          <>
            <button
              type="button"
              className="gift-card__arrow gift-card__arrow--previous"
              aria-label={messages.giftCard.previousImage}
              onClick={() => stepImage(-1)}
            >
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="gift-card__arrow gift-card__arrow--next"
              aria-label={messages.giftCard.nextImage}
              onClick={() => stepImage(1)}
            >
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </>
        ) : null}
        {hasGallery ? (
          <ul className="gift-card__thumbs">
            {gift.images.map((image, index) => (
              <li key={image.src}>
                <GiftThumbnail
                  image={image}
                  label={messages.giftCard.viewImage(index + 1)}
                  isActive={index === activeImageIndex}
                  onPick={() => setActiveImageIndex(index)}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="gift-card__body">
        <div className="gift-card__meta">
          <span className={`priority priority--${gift.priority}`}>
            {messages.giftCard.priority[gift.priority]}
          </span>
          <span>{messages.giftCard.categories[gift.category]}</span>
          <span>{gift.sku}</span>
        </div>

        <div className="gift-card__product-line">
          <strong>{gift.brand}</strong>
          <span>{gift.packVi}</span>
        </div>

        <h3>{gift.name.vi}</h3>
        <p className="gift-card__zh">
          {gift.name.zh} · {gift.name.pinyin}
        </p>

        <div className="gift-card__price-block">
          <span className="gift-card__price-values">
            <strong className="gift-card__price">
              {formatCnyInCurrency(gift.priceCny, currency, exchangeRates)}
            </strong>
            <strong className="gift-card__price">{referencePrice}</strong>
          </span>
          <a href={gift.priceSourceUrl} target="_blank" rel="noreferrer">
            {messages.giftCard.priceChecked(
              Number(day),
              Number(month),
              year,
            )}
            <ExternalLink size={11} aria-hidden="true" />
          </a>
        </div>

        <p className="gift-card__reason">{gift.whyBuyVi}</p>

        <div className="gift-card__facts">
          <span>
            <ShoppingBag size={15} aria-hidden="true" />
            {messages.giftCard.portability[gift.portability]}
          </span>
          {purchaseLocations.map((location) => (
            <span className="gift-card__location" key={location.id}>
              <MapPin size={14} aria-hidden="true" />
              {location.tagVi}
            </span>
          ))}
        </div>

        <details className="gift-card__details">
          <summary>{messages.giftCard.details}</summary>
          <div>
            <p>{gift.customs.noteVi}</p>
            <ul>
              {gift.buyingTipsVi.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </details>
      </div>

      <footer className="gift-card__footer">
        <span className="gift-card__people">
          {selectedBy.length > 0
            ? messages.giftCard.selectedBy(selectedBy)
            : messages.giftCard.nobodySelected}
        </span>
        <button
          type="button"
          className="gift-toggle"
          data-selected={isSelected}
          onClick={() => onToggle(gift.id)}
          aria-label={
            isSelected
              ? messages.giftCard.removeLabel(gift.name.vi)
              : messages.giftCard.addLabel(gift.name.vi)
          }
        >
          {isSelected ? (
            <Check size={18} aria-hidden="true" />
          ) : (
            <Plus size={18} aria-hidden="true" />
          )}
          {isSelected ? messages.giftCard.selected : messages.giftCard.select}
        </button>
      </footer>
    </article>
  );
}

type GiftThumbnailProps = {
  image: GiftImage;
  label: string;
  isActive: boolean;
  onPick: () => void;
};

function GiftThumbnail({ image, label, isActive, onPick }: GiftThumbnailProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <button
      type="button"
      className="gift-card__thumb"
      data-loading={isLoading}
      aria-label={label}
      aria-current={isActive ? "true" : undefined}
      onClick={onPick}
    >
      <Image
        src={image.src}
        alt=""
        width={44}
        height={44}
        unoptimized
        onLoad={() => setIsLoading(false)}
      />
    </button>
  );
}
