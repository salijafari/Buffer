import { useEffect, useState } from "react";
import { Skeleton, Stack, useMediaQuery, useTheme } from "@mui/material";
import { useDashboardShell } from "../../context/DashboardShellContext";
import { OverviewPreConnection } from "./overview/OverviewPreConnection";
import { OverviewPostConnection } from "./overview/OverviewPostConnection";

export function HomeScreen() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { connectionMode, profile, profileLoading } = useDashboardShell();
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

  return connectionMode === "pre" ? (
    <OverviewPreConnection profile={profile} />
  ) : (
    <OverviewPostConnection profile={profile} />
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
      <Skeleton variant="rounded" height={144} sx={{ borderRadius: 2 }} />
      {!isDesktop && (
        <Stack direction="row" spacing={1.5}>
          <Skeleton variant="rounded" height={88} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={88} sx={{ flex: 1 }} />
        </Stack>
      )}
      {isDesktop && <Skeleton variant="rounded" height={260} />}
      {isDesktop ? (
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rounded" height={200} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={200} sx={{ flex: 1 }} />
        </Stack>
      ) : (
        <>
          <Skeleton variant="rounded" height={96} />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={64} />
          ))}
        </>
      )}
    </Stack>
  );
}
