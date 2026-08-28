import { CalendarDays, CloudOff, Coins, Gift } from "lucide-react";
import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { CurrencySwitcher } from "@/components/planner/currency-switcher";
import { MobileAccountMenu } from "@/components/planner/mobile-account-menu";
import type { Person } from "@/domain/people";
import { messages } from "@/i18n";

export type ActivePage = "itinerary" | "gifts" | "expenses";

type AppHeaderProps = {
  currentPerson: Person;
  activePage?: ActivePage;
};

const SITE_TABS = [
  { page: "itinerary", href: "/", label: "Lịch trình", Icon: CalendarDays },
  { page: "gifts", href: "/gifts", label: "Quà", Icon: Gift },
  {
    page: "expenses",
    href: "/expenses",
    label: messages.expenses.tab,
    Icon: Coins,
  },
] as const;

const NAV_LABEL = "Khu vực chuyến đi";

export function AppHeader({
  currentPerson,
  activePage = "gifts",
}: AppHeaderProps) {
  const tabs = SITE_TABS.map(({ page, href, label, Icon }) => ({
    page,
    href,
    label,
    icon: <Icon size={16} aria-hidden="true" />,
    current: activePage === page ? ("page" as const) : undefined,
  }));

  return (
    <>
      <header className="app-header">
        <Link className="brand" href="/" aria-label={messages.header.homeLabel}>
          <span className="brand__stamp" lang="zh-CN">
            {messages.header.cityMark}
          </span>
          <span>
            <strong>{messages.header.brand}</strong>
            <small>{messages.header.edition}</small>
          </span>
        </Link>

        <nav className="section-nav" aria-label={NAV_LABEL}>
          {tabs.map((tab) => (
            <Link key={tab.page} href={tab.href} aria-current={tab.current}>
              {tab.icon} {tab.label}
            </Link>
          ))}
        </nav>

        <div className="header-account">
          {(activePage === "gifts" || activePage === "expenses") && (
            <CurrencySwitcher />
          )}
          <span
            className="header-account__avatar"
            data-accent={currentPerson.accent}
          >
            {currentPerson.displayName.charAt(0)}
          </span>
          <span>
            <small>{messages.header.account}</small>
            <strong>{currentPerson.displayName}</strong>
          </span>
          <SignOutButton />
        </div>
        <MobileAccountMenu
          currentPerson={currentPerson}
          showCurrency={activePage === "gifts" || activePage === "expenses"}
        />
        <span className="no-realtime-note">
          <CloudOff size={14} aria-hidden="true" />{" "}
          {messages.header.refreshNotice}
        </span>
      </header>

      {/* Phones navigate from the bottom bar, where a thumb already rests. */}
      <nav className="site-tabbar" aria-label={NAV_LABEL}>
        {tabs.map((tab) => (
          <Link key={tab.page} href={tab.href} aria-current={tab.current}>
            {tab.icon}
            {tab.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
