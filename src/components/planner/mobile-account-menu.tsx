"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { CurrencySwitcher } from "@/components/planner/currency-switcher";
import type { Person } from "@/domain/people";
import { messages } from "@/i18n";

type MobileAccountMenuProps = {
  currentPerson: Person;
  showCurrency?: boolean;
};

export function MobileAccountMenu({
  currentPerson,
  showCurrency = false,
}: MobileAccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <div className="mobile-account-menu">
      <button
        ref={triggerRef}
        type="button"
        className="mobile-account-menu__trigger"
        aria-label="Mở menu tài khoản"
        aria-controls="mobile-account-drawer"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={23} aria-hidden="true" />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="mobile-account-menu__backdrop"
            aria-label="Đóng menu tài khoản"
            onClick={closeMenu}
          />
          <aside
            id="mobile-account-drawer"
            className="mobile-account-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-account-title"
          >
            <div className="mobile-account-drawer__heading">
              <span>
                <small>MENU · 个人</small>
                <strong id="mobile-account-title">{messages.header.account}</strong>
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                className="mobile-account-drawer__close"
                aria-label="Đóng menu tài khoản"
                onClick={closeMenu}
              >
                <X size={21} aria-hidden="true" />
              </button>
            </div>

            <div className="mobile-account-drawer__person">
              <span
                className="header-account__avatar"
                data-accent={currentPerson.accent}
                aria-hidden="true"
              >
                {currentPerson.displayName.charAt(0)}
              </span>
              <span>
                <small>{messages.header.account}</small>
                <strong>{currentPerson.displayName}</strong>
              </span>
            </div>

            {showCurrency && (
              <div className="mobile-account-drawer__currency">
                <span>Đơn vị hiển thị</span>
                <CurrencySwitcher />
              </div>
            )}

            <SignOutButton />
          </aside>
        </>
      )}
    </div>
  );
}
