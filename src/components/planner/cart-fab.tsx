"use client";

import { ShoppingBasket } from "lucide-react";

type CartFabProps = {
  count: number;
  label: string;
  onOpen: () => void;
};

/** Phone-only shortcut to the traveler's own list, floating above the tab bar. */
export function CartFab({ count, label, onOpen }: CartFabProps) {
  return (
    <button type="button" className="cart-fab" aria-label={label} onClick={onOpen}>
      <ShoppingBasket size={23} aria-hidden="true" />
      {count > 0 && <span className="cart-fab__count">{count}</span>}
    </button>
  );
}
