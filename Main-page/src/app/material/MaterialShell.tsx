import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { bufferMuiTheme } from "./bufferMuiTheme";

/** Light Material theme for dashboard + onboarding only (marketing site unchanged). */
export function MaterialShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={bufferMuiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
