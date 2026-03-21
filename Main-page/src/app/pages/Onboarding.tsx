import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import imgLogo from "@/assets/buffer-logo.png";
import { MaterialShell } from "../material/MaterialShell";
import { bootstrapOnboardingFromDb, ONBOARDING_GATE_TIMEOUT_MS } from "../lib/onboardingStatus";
import { useBffAuth } from "@/lib/BffAuthContext";
import { bffLoginUrl } from "@/lib/bffSession";

const LOGIN_ERROR_HELP: Record<string, string> = {
  exchange:
    "Auth0 rejected the token exchange (POST /oauth/token). Most often: AUTH0_CALLBACK_URL does not exactly match an entry in Auth0 → Application → Allowed Callback URLs (same scheme, host, path, no extra slash). Or AUTH0_CLIENT_SECRET is wrong. Check the terminal running the API for: [bff] /oauth/token exchange failed",
  verify:
    "The ID token could not be verified. Check AUTH0_DOMAIN matches your Auth0 host (e.g. auth.mybuffer.ca) and AUTH0_CLIENT_ID matches the same Auth0 application.",
  no_id_token:
    "Auth0 returned tokens without id_token. Ensure the app requests openid (and that the application is allowed to issue ID tokens).",
  auth: "Auth0 returned an error during login. Try Sign in again.",
  state: "Login state expired (try again; avoid multiple login tabs).",
  config: "Server OAuth env is incomplete. Set AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_CALLBACK_URL on the API.",
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const loginError = searchParams.get("error");
  const { state } = useBffAuth();
  const userId = state.status === "auth" ? state.user.sub : null;

  useEffect(() => {
    if (state.status === "loading" || state.status === "anon" || !userId) return;

    const ac = new AbortController();
    const timeoutId = setTimeout(() => ac.abort(), ONBOARDING_GATE_TIMEOUT_MS);

    bootstrapOnboardingFromDb(ac.signal)
      .then((result) => {
        navigate(result.onboarding_completed ? "/dashboard" : "/onboarding/flow", { replace: true });
      })
      .catch(() => {
        navigate("/onboarding/flow", { replace: true });
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      ac.abort();
      clearTimeout(timeoutId);
    };
  }, [state.status, userId, navigate]);

  const loading = state.status === "loading";

  return (
    <MaterialShell>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 2.5,
          bgcolor: "background.default",
        }}
      >
        <Box component="img" src={imgLogo} alt="Buffer" sx={{ height: 28, width: "auto", mb: 5 }} />

        <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ letterSpacing: "-0.02em", mb: 0.5 }}>
          Welcome to Buffer
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 5, maxWidth: 360 }}>
          Create an account or sign in to continue.
        </Typography>

        {loginError ? (
          <Alert
            severity="error"
            onClose={() => {
              setSearchParams({});
            }}
            sx={{ mb: 3, maxWidth: 520, textAlign: "left", width: "100%" }}
          >
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
              Sign-in could not finish ({loginError})
            </Typography>
            <Typography variant="body2" component="span">
              {LOGIN_ERROR_HELP[loginError] ??
                "Something went wrong after Auth0. Ensure the API is running (npm run dev:api) and env matches Auth0."}
            </Typography>
          </Alert>
        ) : null}

        <Stack spacing={1.5} sx={{ width: "100%", maxWidth: 340 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ py: 1.5, bgcolor: "grey.900", color: "#FFFFFF", "&:hover": { bgcolor: "grey.800" } }}
            onClick={() => {
              window.location.href = bffLoginUrl({ returnTo: "/onboarding", screenHint: "signup" });
            }}
          >
            Create account
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            size="large"
            disabled={loading}
            sx={{ py: 1.5, borderColor: "grey.900", color: "grey.900" }}
            onClick={() => {
              window.location.href = bffLoginUrl({ returnTo: "/onboarding" });
            }}
          >
            Sign in
          </Button>
        </Stack>

        <Typography
          component="a"
          href="/"
          variant="body2"
          sx={{ mt: 4, color: "text.disabled", textDecoration: "none", "&:hover": { color: "text.secondary" } }}
        >
          Back to home
        </Typography>
      </Box>
    </MaterialShell>
  );
}
