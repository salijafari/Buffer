import { Stack, type StackProps } from "@mui/material";
import type { ReactNode } from "react";

/** Main column cap aligned with shell (`max-w-screen-2xl` ≈ 1536px). */
export const MAIN_MAX_OVERVIEW = 1536;

const baselineSx = {
  px: { xs: 2, lg: 0 },
  py: { xs: 2.5, lg: 0 },
  maxWidth: { xs: "100%", lg: `min(${MAIN_MAX_OVERVIEW}px, 100%)` },
  mx: "auto",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
};

export type DashboardPageMainProps = Omit<StackProps, "component" | "role" | "spacing"> & {
  "aria-label": string;
  children: ReactNode;
};

/** Shared outer column for dashboard pages (matches Overview horizontal width / padding delegation). */
export function DashboardPageMain({ "aria-label": ariaLabel, sx, children, ...rest }: DashboardPageMainProps) {
  return (
    <Stack component="main" role="main" aria-label={ariaLabel} spacing={0} sx={[baselineSx, sx]} {...rest}>
      {children}
    </Stack>
  );
}
