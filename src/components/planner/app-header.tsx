import { CalendarDays, CloudOff, Gift } from "lucide-react";
import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { CurrencySwitcher } from "@/components/planner/currency-switcher";
import type { Person } from "@/domain/people";
import { messages } from "@/i18n";

type AppHeaderProps = {
  currentPerson: Person;
  activePage?: "itinerary" | "gifts";
};

export function AppHeader({
  currentPerson,
  activePage = "gifts",
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <Link
        className="brand"
        href="/"
        aria-label={messages.header.homeLabel}
      >
        <span className="brand__stamp" lang="zh-CN">
          {messages.header.cityMark}
        </span>
        <span>
          <strong>{messages.header.brand}</strong>
          <small>{messages.header.edition}</small>
        </span>
      </Link>

      <nav className="section-nav" aria-label="Khu vực chuyến đi">
        <Link href="/" aria-current={activePage === "itinerary" ? "page" : undefined}>
          <CalendarDays size={16} aria-hidden="true" /> Lịch trình
        </Link>
        <Link href="/gifts" aria-current={activePage === "gifts" ? "page" : undefined}>
          <Gift size={16} aria-hidden="true" /> Quà
        </Link>
      </nav>

      <div className="header-account">
        {activePage === "gifts" && <CurrencySwitcher />}
        <span className="header-account__avatar" data-accent={currentPerson.accent}>
          {currentPerson.displayName.charAt(0)}
        </span>
        <span>
          <small>{messages.header.account}</small>
          <strong>{currentPerson.displayName}</strong>
        </span>
        <SignOutButton />
      </div>
      <span className="no-realtime-note">
        <CloudOff size={14} aria-hidden="true" /> {messages.header.refreshNotice}
      </span>
    </header>
  );
}
