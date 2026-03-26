import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchDashboardOverview, type DashboardOverviewResponse } from "@/lib/dashboardApi";
import { useDashboardShell } from "../context/DashboardShellContext";

/**
 * Loads `/api/dashboard/overview` when Plaid is connected. `showLiveFinancials` is true only when
 * cards and timeline exist (real figures to show instead of **).
 */
export function useLiveFinancialDisplay() {
  const { plaidConnected } = useDashboardShell();
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [overviewPending, setOverviewPending] = useState(false);
  const [overviewAttempted, setOverviewAttempted] = useState(false);

  const reloadOverview = useCallback(() => {
    if (plaidConnected !== true) return;
    setOverviewPending(true);
    setOverviewAttempted(true);
    void fetchDashboardOverview().then((d) => {
      setOverview(d);
      setOverviewPending(false);
    });
  }, [plaidConnected]);

  useEffect(() => {
    if (plaidConnected !== true) {
      setOverview(null);
      setOverviewPending(false);
      setOverviewAttempted(false);
      return;
    }
    reloadOverview();
  }, [plaidConnected, reloadOverview]);

  const showLiveFinancials = useMemo(
    () => Boolean(plaidConnected === true && overview && overview.cards.length > 0 && overview.timeline),
    [plaidConnected, overview],
  );

  return {
    overview,
    showLiveFinancials,
    overviewPending,
    overviewAttempted,
    reloadOverview,
  };
}
