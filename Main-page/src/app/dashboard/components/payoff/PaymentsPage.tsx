import { Box, Button, Card, CardContent, Link as MuiLink, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useCallback, useState } from "react";
import { Link as RouterLink } from "react-router";
import { useDashboardShell } from "../../context/DashboardShellContext";
import { PlaidConnectButton } from "../plaid/PlaidConnectButton";
import { fmtCurrency } from "../../lib/dashboardFormat";
import { OVERVIEW_MOCK } from "../home/overview/overviewMock";
import { BODY_FONT, HEADLINE_FONT, OT } from "../home/overview/overviewTokens";
import { MsIcon } from "../home/overview/MsIcon";
import { PAYMENTS_HISTORY_MOCK } from "./paymentsMock";
import { PAYMENTS_STATEMENTS_PATH } from "./statementsMock";

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n % 1 === 0 ? 0 : 2 }).format(n);

function formatDueDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function formatHistoryDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function PaymentsHeader() {
  return (
    <header style={{ marginBottom: "2.5rem", width: "100%", maxWidth: "min(48rem, 100%)" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} sx={{ mb: 0 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: HEADLINE_FONT,
              fontSize: { xs: "2.25rem", md: "2.75rem" },
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: OT.onSurface,
              mb: 2,
            }}
          >
            Payments
          </Typography>
          <Typography
            sx={{
              fontFamily: BODY_FONT,
              fontSize: "1.125rem",
              lineHeight: 1.625,
              color: OT.onSurfaceVariant,
            }}
          >
            Manage your monthly Buffer bill and repayment settings.
          </Typography>
        </Box>
        <Typography
          component={RouterLink}
          to={PAYMENTS_STATEMENTS_PATH}
          sx={{
            fontFamily: BODY_FONT,
            fontWeight: 700,
            fontSize: "0.9375rem",
            color: OT.primary,
            textDecoration: "none",
            flexShrink: 0,
            pt: { xs: 0, sm: 1 },
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Statements
        </Typography>
      </Stack>
    </header>
  );
}

function SummaryCard({
  children,
  highlight,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: OT.cardRadius,
        border: highlight ? "none" : `1px solid ${OT.cardBorder}`,
        bgcolor: highlight ? OT.primary : OT.surfaceContainerLowest,
        boxShadow: highlight ? `0 12px 32px ${alpha(OT.primary, 0.28)}` : OT.cardShadow,
        color: highlight ? "#fff" : "inherit",
      }}
    >
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>{children}</CardContent>
    </Card>
  );
}

export function PaymentsPage() {
  const p = OVERVIEW_MOCK.payment;
  const [autopayOn, setAutopayOn] = useState(p.autopayOn);
  const { refreshPlaidConnection, refreshProfile } = useDashboardShell();

  const bankLine = `${p.bankLabel} ••••${p.bankMask}`;

  const handlePlaidDone = useCallback(async () => {
    await Promise.all([refreshPlaidConnection(), refreshProfile()]);
  }, [refreshPlaidConnection, refreshProfile]);

  const downloadCsv = () => {
    const blob = new Blob(
      ["date,amount,description\n" + PAYMENTS_HISTORY_MOCK.map((r) => `${r.dateIso},${r.amount},${r.description}`).join("\n")],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buffer-payments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack
      component="main"
      role="main"
      aria-label="Payments"
      spacing={0}
      sx={{
        px: { xs: 2, lg: 0 },
        py: { xs: 2.5, lg: 0 },
        maxWidth: { xs: "100%", sm: 672, lg: "min(1536px, 100%)" },
        mx: "auto",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <PaymentsHeader />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
          mb: 3,
        }}
      >
        <SummaryCard>
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: OT.outline, mb: 1 }}>
            CURRENT BILL
          </Typography>
          <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 800, fontSize: { xs: "1.75rem", sm: "2rem" }, color: OT.onSurface }}>
            {usd(p.nextPaymentAmount)} USD
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 2 }}>
            <MsIcon name="calendar_month" sx={{ fontSize: 18, color: OT.primary }} />
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.8125rem", color: OT.onSurfaceVariant }}>
              Due {formatDueDate(p.nextPaymentDateIso)}
            </Typography>
          </Stack>
        </SummaryCard>

        <SummaryCard>
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: OT.outline, mb: 1 }}>
            AUTOPAY
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 800, fontSize: { xs: "1.75rem", sm: "2rem" }, color: OT.primary }}>
              {autopayOn ? "ON" : "OFF"}
            </Typography>
            {autopayOn ? (
              <Box
                sx={{
                  px: 1.25,
                  py: 0.25,
                  borderRadius: 999,
                  bgcolor: alpha(OT.primary, 0.12),
                  color: OT.primary,
                  fontFamily: BODY_FONT,
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                }}
              >
                ACTIVE
              </Box>
            ) : null}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 2 }}>
            <MsIcon name="account_balance" sx={{ fontSize: 18, color: OT.primary }} />
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.8125rem", color: OT.onSurfaceVariant }}>{bankLine}</Typography>
          </Stack>
        </SummaryCard>

        <SummaryCard highlight>
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", opacity: 0.85, mb: 1 }}>
            CURRENT BALANCE
          </Typography>
          <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 800, fontSize: { xs: "1.75rem", sm: "2rem" } }}>
            {fmtCurrency(p.currentBalance, 0)}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 2, opacity: 0.9 }}>
            <MsIcon name="sync" sx={{ fontSize: 18 }} />
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.8125rem" }}>Remaining to repay</Typography>
          </Stack>
        </SummaryCard>
      </Box>

      <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.125rem", color: OT.onSurface, mb: 1.5 }}>
        Payment Actions
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1.5} useFlexGap sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<MsIcon name="add" sx={{ fontSize: 20 }} />}
          sx={{
            borderRadius: "999px",
            textTransform: "none",
            fontWeight: 700,
            fontFamily: BODY_FONT,
            px: 2.5,
            py: 1.25,
            bgcolor: OT.primary,
            boxShadow: "none",
            "&:hover": { bgcolor: OT.primaryContainer, boxShadow: "none" },
          }}
        >
          Make Extra Payment
        </Button>
        <Button
          variant="outlined"
          sx={{
            borderRadius: "999px",
            textTransform: "none",
            fontWeight: 700,
            fontFamily: BODY_FONT,
            px: 2.5,
            py: 1.25,
            borderColor: OT.cardBorder,
            color: OT.onSurface,
            bgcolor: OT.surfaceContainerLow,
            "&:hover": { borderColor: OT.outline, bgcolor: OT.surfaceContainer },
          }}
        >
          Change Payment Date
        </Button>
        <PlaidConnectButton
          variant="outlined"
          onConnected={handlePlaidDone}
          sx={{
            borderRadius: "999px",
            textTransform: "none",
            fontWeight: 700,
            fontFamily: BODY_FONT,
            px: 2.5,
            py: 1.25,
            borderColor: OT.cardBorder,
            color: OT.onSurface,
            bgcolor: OT.surfaceContainerLow,
            borderWidth: 1,
            "&:hover": { borderColor: OT.outline, bgcolor: OT.surfaceContainer },
          }}
        >
          Update Payment Account
        </PlaidConnectButton>
        <Button
          variant="outlined"
          onClick={() => setAutopayOn((v) => !v)}
          sx={{
            borderRadius: "999px",
            textTransform: "none",
            fontWeight: 700,
            fontFamily: BODY_FONT,
            px: 2.5,
            py: 1.25,
            borderColor: OT.cardBorder,
            color: OT.onSurface,
            bgcolor: OT.surfaceContainerLow,
            "&:hover": { borderColor: OT.outline, bgcolor: OT.surfaceContainer },
          }}
        >
          {autopayOn ? "Turn Autopay Off" : "Turn Autopay On"}
        </Button>
      </Stack>

      <Card
        elevation={0}
        sx={{
          borderRadius: OT.cardRadius,
          border: `1px solid ${OT.cardBorder}`,
          bgcolor: OT.surfaceContainerLowest,
          boxShadow: OT.cardShadow,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 2.5 }}>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.125rem", color: OT.onSurface }}>
              Payment History
            </Typography>
            <MuiLink
              component="button"
              type="button"
              onClick={downloadCsv}
              sx={{
                fontFamily: BODY_FONT,
                fontSize: "0.875rem",
                fontWeight: 700,
                color: OT.primary,
                cursor: "pointer",
                border: "none",
                bgcolor: "transparent",
                p: 0,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Download All CSV
            </MuiLink>
          </Stack>
          <Stack spacing={0} divider={<Box sx={{ borderBottom: `1px solid ${OT.surfaceContainer}` }} />}>
            {PAYMENTS_HISTORY_MOCK.map((row) => (
              <Stack
                key={row.dateIso}
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={2}
                sx={{ py: 2 }}
              >
                <Stack direction="row" alignItems="flex-start" spacing={2}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      bgcolor: alpha(OT.primary, 0.12),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <MsIcon name="check" sx={{ fontSize: 22, color: OT.primary }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "0.9375rem", color: OT.onSurface }}>
                      {formatHistoryDate(row.dateIso)}
                    </Typography>
                    <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.8125rem", color: OT.outline, mt: 0.25 }}>
                      {row.description}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={3} flexWrap="wrap" useFlexGap>
                  <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                    <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "0.9375rem", color: OT.onSurface }}>
                      {usd(row.amount)}
                    </Typography>
                    <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.06em", color: OT.primary, mt: 0.25 }}>
                      PAID
                    </Typography>
                  </Box>
                  <Button
                    component={RouterLink}
                    to={PAYMENTS_STATEMENTS_PATH}
                    variant="outlined"
                    size="small"
                    startIcon={<MsIcon name="description" sx={{ fontSize: 18 }} />}
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 700,
                      fontFamily: BODY_FONT,
                      borderColor: OT.cardBorder,
                      color: OT.onSurfaceVariant,
                    }}
                  >
                    View Statement
                  </Button>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          borderRadius: OT.cardRadius,
          border: `1px solid ${OT.cardBorder}`,
          bgcolor: OT.surfaceContainerLowest,
          boxShadow: OT.cardShadow,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack direction={{ xs: "column", lg: "row" }} alignItems={{ xs: "flex-start", lg: "center" }} justifyContent="space-between" spacing={2}>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.125rem", color: OT.onSurface }}>
              Payment Settings
            </Typography>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={{ xs: 2, md: 4 }}
              flexWrap="wrap"
              useFlexGap
              sx={{ flex: 1, justifyContent: { lg: "center" } }}
            >
              <Box>
                <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: OT.outline, mb: 0.5 }}>
                  BANK ACCOUNT
                </Typography>
                <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 600, color: OT.onSurface }}>{bankLine}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: OT.outline, mb: 0.5 }}>
                  PAYMENT DATE
                </Typography>
                <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 600, color: OT.onSurface }}>12th of each month</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: OT.outline, mb: 0.5 }}>
                  AUTOPAY STATUS
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: autopayOn ? OT.primary : OT.outline }} />
                  <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 600, color: OT.onSurface }}>
                    {autopayOn ? "Enabled" : "Disabled"}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
            <Button
              variant="outlined"
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                fontFamily: BODY_FONT,
                borderColor: OT.cardBorder,
                bgcolor: OT.surfaceContainerLow,
                color: OT.onSurfaceVariant,
                flexShrink: 0,
              }}
            >
              Edit Settings
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          borderRadius: "999px",
          border: `1px solid ${OT.cardBorder}`,
          bgcolor: OT.surfaceContainerLow,
          px: { xs: 2, sm: 3 },
          py: 2,
          mb: 3,
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: alpha(OT.primary, 0.12),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MsIcon name="verified_user" sx={{ fontSize: 22, color: OT.primary }} />
          </Box>
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", lineHeight: 1.55, color: OT.onSurfaceVariant, textAlign: { xs: "center", sm: "left" } }}>
            On-time payments help keep your plan on track and make repayment easier to manage. We&apos;ll notify you 3 days before any scheduled withdrawal.
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}
