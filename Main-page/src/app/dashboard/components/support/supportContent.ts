export const SUPPORT_EMAIL = "support@mybuffer.ca";
/** Placeholder — replace with real support line when available. */
export const SUPPORT_PHONE_TEL = "+18005550100";

export const HELP_TOPICS: {
  icon: string;
  title: string;
  description: string;
  to: string;
}[] = [
  { icon: "credit_card", title: "Payments", description: "Manage billing and history.", to: "/dashboard/payoff" },
  { icon: "autorenew", title: "Autopay", description: "Automatic payment settings.", to: "/dashboard/payoff" },
  { icon: "account_balance", title: "Bank Account", description: "Linked accounts and security.", to: "/dashboard/account" },
  { icon: "trending_up", title: "Credit Builder", description: "Improve your credit score.", to: "/dashboard/credit" },
  { icon: "description", title: "Statements", description: "Monthly report downloads.", to: "/dashboard/payoff/statements" },
];

export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "How does Buffer lower my interest cost?",
    a: "Buffer consolidates higher-APR card balances into one line at a lower rate where you qualify, so more of your payment goes to principal instead of interest.",
  },
  {
    q: "Can I make an extra payment?",
    a: "Yes. From Payments you can make an extra payment anytime. Extra payments reduce your balance and can shorten your payoff timeline.",
  },
  {
    q: "How do I update my bank account?",
    a: "Open Accounts or Payments and use Update Bank Account to reconnect or change your linked account through our secure bank connection flow.",
  },
  {
    q: "What happens if autopay fails?",
    a: "We’ll notify you and you can retry or update your payment method. Late fees may apply per your agreement if a scheduled payment doesn’t clear.",
  },
  {
    q: "How does Buffer help my credit profile?",
    a: "On-time payments and lower utilization can help over time. Credit Builder shows illustrative trends; actual bureau scores depend on your full credit file.",
  },
];
