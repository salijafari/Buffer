import { createTheme } from "@mui/material/styles";

/** BUFFER spec brand teal — dashboard + onboarding Material shell */
const BUFFER_TEAL = "#1A9E8F";
const BUFFER_TEAL_DARK = "#158A7D";

export const bufferMuiTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1024,
      /** Spec: desktop layouts 1280px+ */
      xl: 1280,
    },
  },
  palette: {
    mode: "light",
    primary: {
      main: BUFFER_TEAL,
      dark: BUFFER_TEAL_DARK,
      contrastText: "#0F1117",
    },
    secondary: {
      main: "#475569",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },
    divider: "#E2E8F0",
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: "inherit",
      },
      styleOverrides: {
        root: {
          backgroundColor: "#fff",
          borderBottom: "1px solid",
          borderColor: "#E2E8F0",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
          border: "1px solid #E2E8F0",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
  },
});
