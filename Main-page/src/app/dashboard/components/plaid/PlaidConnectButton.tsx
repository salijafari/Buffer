import { Button, type ButtonProps, CircularProgress, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { createPlaidLinkToken, exchangePlaidPublicToken } from "@/lib/plaidApi";

type PlaidConnectButtonProps = {
  onConnected?: () => void;
  children?: React.ReactNode;
} & Omit<ButtonProps, "onClick" | "disabled">;

/**
 * Opens Plaid Link: fetches link_token from BFF, exchanges public_token after success.
 * Requires Auth0 BFF session + CSRF cookie (same as other mutations).
 */
export function PlaidConnectButton({ onConnected, children, ...buttonProps }: PlaidConnectButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingOpen = useRef(false);

  const handleSuccess = useCallback(
    async (publicToken: string, metadata: unknown) => {
      setError(null);
      setBusy(true);
      try {
        const result = await exchangePlaidPublicToken(publicToken, metadata);
        if (!result.success) {
          setError(result.error ?? "Could not complete bank connection.");
          return;
        }
        setLinkToken(null);
        onConnected?.();
      } finally {
        setBusy(false);
      }
    },
    [onConnected],
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      void handleSuccess(public_token, metadata as unknown);
    },
    onExit: (err) => {
      setLinkToken(null);
      pendingOpen.current = false;
      if (err) {
        console.warn("[Plaid Link exit]", err.error_code, err.error_message);
        setError(err.display_message || err.error_message || "Connection was cancelled or failed.");
      }
    },
  });

  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    if (linkToken && ready && pendingOpen.current) {
      pendingOpen.current = false;
      openRef.current();
    }
  }, [linkToken, ready]);

  const handleClick = async () => {
    setError(null);
    setBusy(true);
    try {
      const token = await createPlaidLinkToken();
      pendingOpen.current = true;
      setLinkToken(token);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not start Plaid Link.";
      setError(msg);
      pendingOpen.current = false;
    } finally {
      setBusy(false);
    }
  };

  const disabled = Boolean(buttonProps.disabled) || busy || (linkToken !== null && !ready);

  return (
    <>
      <Button {...buttonProps} onClick={() => void handleClick()} disabled={disabled} startIcon={busy ? <CircularProgress size={18} color="inherit" /> : undefined}>
        {children ?? "Connect my accounts"}
      </Button>
      {error ? (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
          {error}
        </Typography>
      ) : null}
    </>
  );
}
