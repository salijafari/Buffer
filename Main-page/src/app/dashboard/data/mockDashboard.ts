import type { CardData } from "../types/timeline";
import { SHOW_CREDIT_BUILDER_IN_DASHBOARD } from "../featureFlags";

/** Post-connection mock cards (Plaid-shaped). */
export const MOCK_CONNECTED_CARDS: CardData[] = [
  { id: "1", name: "TD Cashback Visa", last4: "4242", balance: 6800, apr: 0.1999, limit: 10000, institution: "TD", color: "#00A651" },
  { id: "2", name: "Scotiabank Gold Amex", last4: "8891", balance: 3200, apr: 0.2114, limit: 5000, institution: "BNS", color: "#EC0926" },
  { id: "3", name: "CIBC Visa Dividend", last4: "3377", balance: 1500, apr: 0.1999, limit: 3000, institution: "CIBC", color: "#C31E2E" },
];

/**
 * Pre-connection: no API for card count — illustrative placeholder count (spec).
 * Copy on UI discloses estimates are illustrative until accounts are linked.
 */
export const MOCK_PRE_CONNECTION_CARD_COUNT = 3;

/** Illustrative total debt (CAD) when not derivable from API. */
export const MOCK_ILLUSTRATIVE_DEBT = 15_000;

/** Illustrative “your pace” monthly payment (CAD) pre-connection. */
export const MOCK_ILLUSTRATIVE_MONTHLY_PAYMENT = 450;

/** User has Buffer credit line product (mock; replace when API exists). */
export const MOCK_HAS_BUFFER_CREDIT_LINE = true;

/** Credit Builder only — hide Buffer line blocks when false. */
export const MOCK_CREDIT_BUILDER_ONLY = false;

/** Force Credit Builder graduation section on Credit page (UI demo; independent of line flags). */
export const MOCK_SHOW_CREDIT_GRADUATION_SECTION = true;

/** Cohort copy (static stub until aggregate API). */
export function cohortStatLine(provinceName: string, debtBracket: string): string {
  return `Canadians in ${provinceName || "Canada"} with ${debtBracket} in credit card debt are paying 8.2% less interest with Buffer on average.`;
}

export const MOCK_AI_INSIGHT_OVERVIEW =
  "Your TD card is at 85% utilization — moving $2,400 to Buffer would drop it below 30%.";

export const MOCK_REWARDS_POINTS = 214;
export const MOCK_REWARDS_POINTS_TO_MILESTONE = 86;

/** Nav badge counts (mock). */
export const MOCK_AI_UNREAD_INSIGHTS = 2;
export const MOCK_CREDIT_REPORT_EVENTS = 1;

/** In-app notification feed (mock until API). Shown in dashboard bell menu. */
export type DashboardNotificationSeed = {
  id: string;
  title: string;
  body: string;
  /** Relative label for list UI */
  createdAtLabel: string;
  /** Optional in-app route when the row is pressed */
  href?: string;
};

const MOCK_DASHBOARD_NOTIFICATIONS_ALL: DashboardNotificationSeed[] = [
  {
    id: "pay-util",
    title: "High utilization alert",
    body: MOCK_AI_INSIGHT_OVERVIEW,
    createdAtLabel: "2h ago",
    href: "/dashboard",
  },
  {
    id: "ai-insights",
    title: "New AI insights",
    body: "You have 2 proactive suggestions based on your connected accounts (mock).",
    createdAtLabel: "Today",
    href: "/dashboard/ai",
  },
  {
    id: "credit-report",
    title: "Credit report activity",
    body: "A balance update was reported to Equifax on your TD Cashback Visa (mock).",
    createdAtLabel: "Yesterday",
    href: "/dashboard/credit",
  },
  {
    id: "payoff-reminder",
    title: "Payment reminder",
    body: "Buffer autopay of $430 is scheduled for Mar 15 (mock).",
    createdAtLabel: "Mar 12",
    href: "/dashboard/payoff",
  },
];

export const MOCK_DASHBOARD_NOTIFICATIONS = SHOW_CREDIT_BUILDER_IN_DASHBOARD
  ? MOCK_DASHBOARD_NOTIFICATIONS_ALL
  : MOCK_DASHBOARD_NOTIFICATIONS_ALL.filter((n) => n.href !== "/dashboard/credit");
