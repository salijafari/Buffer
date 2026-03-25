import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import { fetchDashboardOverview, triggerPlaidFullSync, type DashboardOverviewResponse } from "@/lib/dashboardApi";
import { PaymentsPage } from "./PaymentsPage";

type PayoffPhase = "loading" | "demo" | "live" | "syncing" | "empty" | "error";

export function PayoffPostConnection({ usePlaidLiveDataOnly }: { usePlaidLiveDataOnly: boolean }) {
  const [phase, setPhase] = useState<PayoffPhase>(() => (usePlaidLiveDataOnly ? "loading" : "demo"));
  const [syncBusy, setSyncBusy] = useState(false);

  const applyLiveOverview = useCallback((d: DashboardOverviewResponse | null) => {
    if (!d) {
      setPhase("error");
      return;
    }
    if (d.cards.length > 0 && d.timeline) {
      setPhase("live");
    } else if (d.meta?.syncPending) {
      setPhase("syncing");
    } else {
      setPhase("empty");
    }
  }, []);

  useEffect(() => {
    if (!usePlaidLiveDataOnly) {
      setPhase("demo");
      return;
    }
    let cancelled = false;
    setPhase("loading");
    void fetchDashboardOverview().then((d) => {
      if (cancelled) return;
      applyLiveOverview(d);
    });
    return () => {
      cancelled = true;
    };
  }, [usePlaidLiveDataOnly, applyLiveOverview]);

  async function handleRefreshPlaidSync() {
    setSyncBusy(true);
    const r = await triggerPlaidFullSync();
    setSyncBusy(false);
    if (!r.ok) return;
    applyLiveOverview(await fetchDashboardOverview());
  }

  if (usePlaidLiveDataOnly && phase === "loading") {
    return (
      <Stack spacing={2} sx={{ px: { xs: 2, lg: 0 }, py: { xs: 2.5, lg: 0 }, maxWidth: { sm: 672 }, mx: "auto" }}>
        <Skeleton variant="text" width={220} height={40} />
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
      </Stack>
    );
  }

  if (usePlaidLiveDataOnly && phase === "error") {
    return (
      <Stack spacing={2} sx={{ px: { xs: 2, lg: 0 }, py: { xs: 2.5, lg: 0 }, maxWidth: { sm: 672 }, mx: "auto" }}>
        <Alert severity="error">Couldn&apos;t load account data.</Alert>
        <Button
          variant="contained"
          onClick={() => {
            setPhase("loading");
            void fetchDashboardOverview().then(applyLiveOverview);
          }}
        >
          Retry
        </Button>
      </Stack>
    );
  }

  if (usePlaidLiveDataOnly && phase === "syncing") {
    return (
      <Stack spacing={2} sx={{ px: { xs: 2, lg: 0 }, py: { xs: 2.5, lg: 0 }, maxWidth: { sm: 672 }, mx: "auto" }}>
        <Alert severity="info">
          Importing your credit cards from Plaid…
          <Button size="small" sx={{ ml: 1 }} disabled={syncBusy} onClick={() => void handleRefreshPlaidSync()}>
            {syncBusy ? "Syncing…" : "Run sync"}
          </Button>
        </Alert>
      </Stack>
    );
  }

  if (usePlaidLiveDataOnly && phase === "empty") {
    return (
      <Stack spacing={2} sx={{ px: { xs: 2, lg: 0 }, py: { xs: 2.5, lg: 0 }, maxWidth: { sm: 672 }, mx: "auto" }}>
        <Alert severity="warning">No linked credit cards yet. Payments below reflect your plan; connect accounts for live data.</Alert>
        <PaymentsPage />
      </Stack>
    );
  }

  return <PaymentsPage />;
}
