import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { SignInButton, SignUpButton, useAuth, useUser } from "@clerk/react";
import { Box, Button, Stack, Typography } from "@mui/material";
import imgLogo from "@/assets/buffer-logo.png";
import { MaterialShell } from "../material/MaterialShell";

export default function Onboarding() {
  const navigate = useNavigate();

  const { isSignedIn, isLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !userLoaded) return;
    if (!isSignedIn || !user) return;

    const completed = user.unsafeMetadata?.onboarding_completed === true;
    navigate(completed ? "/dashboard" : "/onboarding/flow", { replace: true });
  }, [isLoaded, userLoaded, isSignedIn, user, navigate]);

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

        <Stack spacing={1.5} sx={{ width: "100%", maxWidth: 340 }}>
          {/*
            mode="modal" keeps Clerk on-page; after sign-in, useEffect navigates forward.
          */}
          <SignUpButton mode="modal">
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ py: 1.5, bgcolor: "grey.900", color: "#FFFFFF", "&:hover": { bgcolor: "grey.800" } }}
            >
              Create account
            </Button>
          </SignUpButton>

          <SignInButton mode="modal">
            <Button fullWidth variant="outlined" color="inherit" size="large" sx={{ py: 1.5, borderColor: "grey.900", color: "grey.900" }}>
              Sign in
            </Button>
          </SignInButton>
        </Stack>

        <Typography
          component={Link}
          to="/"
          variant="body2"
          sx={{ mt: 4, color: "text.disabled", textDecoration: "none", "&:hover": { color: "text.secondary" } }}
        >
          Back to home
        </Typography>
      </Box>
    </MaterialShell>
  );
}
