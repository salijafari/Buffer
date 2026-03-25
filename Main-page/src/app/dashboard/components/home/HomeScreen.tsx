import { useEffect, useState } from "react";
import { Box, Skeleton, Stack, useMediaQuery, useTheme } from "@mui/material";
import { useDashboardShell } from "../../context/DashboardShellContext";
import { OverviewPreConnection } from "./overview/OverviewPreConnection";
import { OverviewPostConnection } from "./overview/OverviewPostConnection";

export function HomeScreen() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { connectionMode, plaidConnected, profile, profileLoading } = useDashboardShell();
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (!profileLoading) {
      const t = setTimeout(() => setShowSkeleton(false), 200);
      return () => clearTimeout(t);
    }
    setShowSkeleton(true);
    return undefined;
  }, [profileLoading]);

  if (profileLoading || showSkeleton) {
    return <SkeletonHome isDesktop={isDesktop} />;
  }

  const usePlaidLiveDataOnly = connectionMode === "post" && plaidConnected === true;

  return connectionMode === "pre" ? (
    <OverviewPreConnection profile={profile} />
  ) : (
    <OverviewPostConnection profile={profile} usePlaidLiveDataOnly={usePlaidLiveDataOnly} />
  );
}

function SkeletonHome({ isDesktop }: { isDesktop: boolean }) {
  return (
    <Stack
      spacing={2}
      sx={{
        px: { xs: 2, lg: 0 },
        py: { xs: 2.5, lg: 0 },
        maxWidth: { xs: "100%", sm: 672, lg: "none" },
        mx: "auto",
        width: "100%",
        minWidth: 0,
      }}
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <Skeleton variant="rounded" height={48} width="55%" sx={{ borderRadius: 1 }} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={isDesktop ? 168 : 140} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
      {isDesktop ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { lg: "repeat(12, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2, gridColumn: { lg: "span 8" } }} />
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2, gridColumn: { lg: "span 4" } }} />
        </Box>
      ) : (
        <>
          <Skeleton variant="rounded" height={260} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
        </>
      )}
      {isDesktop ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { lg: "repeat(12, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <Skeleton variant="rounded" height={260} sx={{ borderRadius: 2, gridColumn: { lg: "span 7" } }} />
          <Skeleton variant="rounded" height={260} sx={{ borderRadius: 2, gridColumn: { lg: "span 5" } }} />
        </Box>
      ) : (
        <>
          <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
        </>
      )}
      <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
    </Stack>
  );
}
