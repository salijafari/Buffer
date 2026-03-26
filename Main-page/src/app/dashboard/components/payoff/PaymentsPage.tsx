import { Box, Button, Card, CardContent, Link as MuiLink, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useCallback, useState } from "react";
import { Link as RouterLink } from "react-router";
import { useDashboardShell } from "../../context/DashboardShellContext";
import { useLiveFinancialDisplay } from "../../hooks/useLiveFinancialDisplay";
import { PlaidConnectButton } from "../plaid/PlaidConnectButton";
import { displayMoney, FINANCIAL_MASK } from "../../lib/financialDisplay";
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
    <header style={{ marginBottom: "3rem", width: "100%", maxWidth: "min(48rem, 100%)" }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: HEADLINE_FONT,
            fontSize: { xs: "2.5rem", md: "3rem" },
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: OT.onSurface,
            mb: 1,
          }}
        >
          Payments
        </Typography>
        <Typography
          sx={{
            fontFamily: BODY_FONT,
            fontSize: { xs: "1.0625rem", md: "1.125rem" },
            fontWeight: 500,
            lineHeight: 1.625,
            color: OT.onSurfaceVariant,
          }}
        >
          Manage your monthly Buffer bill and repayment settings.
        </Typography>
      </Box>
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
        border: highlight ? "none" : `1px solid ${alpha(OT.outlineVariant, 0.1)}`,
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: OT.cardShadow,
        color: highlight ? OT.onPrimaryContainer : "inherit",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        ...(!highlight
          ? {
              "&:hover": {
                boxShadow: OT.cardShadowHover,
              },
            }
          : {}),
        ...(highlight
          ? {
              background: `linear-gradient(135deg, ${OT.primary} 0%, ${OT.primaryContainer} 100%)`,
              boxShadow: `0 12px 32px ${alpha(OT.primary, 0.28)}`,
              "&:hover": {
                transform: "scale(1.01)",
                boxShadow: `0 16px 40px ${alpha(OT.primary, 0.32)}`,
              },
            }
          : {}),
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 }, "&:last-child": { pb: { xs: 3, md: 4 } } }}>{children}</CardContent>
    </Card>
  );
}

export function PaymentsPage() {
  const p = OVERVIEW_MOCK.payment;
  const [autopayOn, setAutopayOn] = useState(p.autopayOn);
  const { refreshPlaidConnection, refreshProfile } = useDashboardShell();
  const { showLiveFinancials } = useLiveFinancialDisplay();
  const live = showLiveFinancials;

  const bankLine = live ? `${p.bankLabel} ••••${p.bankMask}` : `${p.bankLabel} ${FINANCIAL_MASK}`;

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
        maxWidth: { xs: "100%", lg: "min(1280px, 100%)" },
        mx: "auto",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        gap: { xs: 4, lg: 6 },
      }}
    >
      <PaymentsHeader />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: { xs: 2, md: 4 },
          mb: { xs: 3, md: 4 },
        }}
      >
        <SummaryCard>
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: OT.onSurfaceVariant, mb: 2 }}>
            Current Bill
          </Typography>
          <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 800, fontSize: { xs: "2.25rem", sm: "2.5rem" }, color: OT.onSurface }}>
              {displayMoney(live, () => usd(p.nextPaymentAmount))}
            </Typography>
            <Typography sx={{ fontFamily: BODY_FONT, fontWeight: 500, color: OT.onSurfaceVariant }}>USD</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 3, color: OT.primary }}>
            <MsIcon name="calendar_today" sx={{ fontSize: 18 }} />
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 600 }}>
              {live ? `Due ${formatDueDate(p.nextPaymentDateIso)}` : `Due ${FINANCIAL_MASK}`}
            </Typography>
          </Stack>
        </SummaryCard>

        <SummaryCard>
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: OT.onSurfaceVariant, mb: 2 }}>
            Autopay
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 800, fontSize: { xs: "2.25rem", sm: "2.5rem" }, color: OT.primary }}>
              {autopayOn ? "ON" : "OFF"}
            </Typography>
            {autopayOn ? (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999,
                  bgcolor: OT.secondaryContainer,
                  color: OT.onSecondaryContainer,
                  fontFamily: BODY_FONT,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Active
              </Box>
            ) : null}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 3, color: OT.onSurfaceVariant }}>
            <MsIcon name="account_balance" sx={{ fontSize: 18 }} />
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 600 }}>{bankLine}</Typography>
          </Stack>
        </SummaryCard>

        <SummaryCard highlight>
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.85, mb: 2 }}>
            Current Balance
          </Typography>
          <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 800, fontSize: { xs: "2.25rem", sm: "2.5rem" } }}>
            {displayMoney(live, () => fmtCurrency(p.currentBalance, 0))}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 3, opacity: 0.9 }}>
            <MsIcon name="info" sx={{ fontSize: 18 }} />
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 500 }}>Remaining to repay</Typography>
          </Stack>
        </SummaryCard>
      </Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: OT.cardRadius,
          bgcolor: OT.surfaceContainerLowest,
          boxShadow: OT.cardShadow,
          mb: { xs: 3, md: 4 },
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 }, "&:last-child": { pb: { xs: 3, md: 5 } } }}>
          <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: { xs: "1.375rem", md: "1.5rem" }, color: OT.onSurface, mb: 4 }}>
            Payment Actions
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={2} useFlexGap>
        <Button
          variant="contained"
          startIcon={<MsIcon name="add_card" sx={{ fontSize: 22, color: "#fff" }} />}
          sx={{
            borderRadius: "999px",
            textTransform: "none",
            fontWeight: 700,
            fontFamily: BODY_FONT,
            fontSize: "1rem",
            px: 4,
            py: 2,
            bgcolor: OT.primary,
            boxShadow: `0 10px 24px ${alpha(OT.primary, 0.2)}`,
            transition: "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
            "&:hover": {
              bgcolor: OT.primaryContainer,
              boxShadow: `0 12px 28px ${alpha(OT.primary, 0.28)}`,
              transform: "scale(1.02)",
            },
            "&:active": { transform: "scale(0.95)" },
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
            fontSize: "1rem",
            px: 4,
            py: 2,
            border: "none",
            color: OT.onSurface,
            bgcolor: OT.surfaceContainerHigh,
            "&:hover": { bgcolor: OT.surfaceContainerHighest },
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
            fontSize: "1rem",
            px: 4,
            py: 2,
            border: "none",
            color: OT.onSurface,
            bgcolor: OT.surfaceContainerHigh,
            "&:hover": { bgcolor: OT.surfaceContainerHighest },
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
            fontSize: "1rem",
            px: 4,
            py: 2,
            border: "none",
            color: OT.onSurface,
            bgcolor: OT.surfaceContainerHigh,
            "&:hover": { bgcolor: OT.surfaceContainerHighest },
          }}
        >
          {autopayOn ? "Turn Autopay Off" : "Turn Autopay On"}
        </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          borderRadius: OT.cardRadius,
          bgcolor: OT.surfaceContainerLowest,
          boxShadow: OT.cardShadow,
          mb: { xs: 3, md: 4 },
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 5 }}>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: { xs: "1.375rem", md: "1.5rem" }, color: OT.onSurface }}>
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
          <Stack spacing={0.5}>
            {PAYMENTS_HISTORY_MOCK.map((row) => (
              <Stack
                key={row.dateIso}
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={2}
                sx={{
                  py: 3,
                  px: 3,
                  borderRadius: OT.cardRadius,
                  transition: "background-color 0.2s ease",
                  "&:hover": { bgcolor: OT.surfaceContainerLow },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: OT.secondaryContainer,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <MsIcon name="check_circle" sx={{ fontSize: 26, color: OT.primary }} />
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
                      {displayMoney(live, () => usd(row.amount))}
                    </Typography>
                    <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", color: OT.primary, mt: 0.25 }}>
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
                      borderRadius: "999px",
                      textTransform: "none",
                      fontWeight: 600,
                      fontFamily: BODY_FONT,
                      border: `1px solid ${alpha(OT.outlineVariant, 0.3)}`,
                      borderColor: alpha(OT.outlineVariant, 0.3),
                      color: OT.onSurfaceVariant,
                      py: 1,
                      px: 2,
                      "&:hover": { borderColor: OT.primary, color: OT.primary, bgcolor: alpha(OT.primary, 0.04) },
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
          bgcolor: OT.surfaceContainerLowest,
          boxShadow: OT.cardShadow,
          borderLeft: `4px solid ${OT.primary}`,
          mb: { xs: 3, md: 4 },
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" spacing={4}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: { xs: "1.375rem", md: "1.5rem" }, color: OT.onSurface, mb: 3 }}>
                Payment Settings
              </Typography>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={{ xs: 3, md: 6 }}
                flexWrap="wrap"
                useFlexGap
                sx={{ justifyContent: { md: "flex-start" } }}
              >
                <Box>
                  <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", color: OT.onSurfaceVariant, mb: 0.5 }}>
                    Bank Account
                  </Typography>
                  <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.9375rem", fontWeight: 600, color: OT.onSurface }}>{bankLine}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", color: OT.onSurfaceVariant, mb: 0.5 }}>
                    Payment Date
                  </Typography>
                  <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.9375rem", fontWeight: 600, color: OT.onSurface }}>12th of each month</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", color: OT.onSurfaceVariant, mb: 0.5 }}>
                    Autopay Status
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: autopayOn ? OT.primary : OT.outline }} />
                    <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.9375rem", fontWeight: 600, color: OT.onSurface }}>
                      {autopayOn ? "Enabled" : "Disabled"}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Box>
            <Button
              variant="outlined"
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                fontFamily: BODY_FONT,
                px: 5,
                py: 2,
                border: "none",
                bgcolor: OT.surfaceContainerHigh,
                color: OT.onSurface,
                flexShrink: 0,
                alignSelf: { xs: "stretch", md: "center" },
                whiteSpace: "nowrap",
                transition: "transform 0.2s ease, background-color 0.2s ease",
                "&:hover": { bgcolor: OT.surfaceContainerHighest },
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              Edit Settings
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          maxWidth: 768,
          mx: "auto",
          textAlign: "center",
          py: 6,
          px: 4,
          mb: 3,
          borderRadius: OT.cardRadiusLg,
          border: `1px solid ${alpha(OT.outlineVariant, 0.2)}`,
          bgcolor: OT.surfaceContainerLow,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: "#fff",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <MsIcon name="verified_user" filled sx={{ fontSize: 28, color: OT.primary }} />
        </Box>
        <Typography sx={{ fontFamily: BODY_FONT, fontSize: "1rem", fontWeight: 500, lineHeight: 1.7, color: OT.onSurfaceVariant }}>
          On-time payments help keep your plan on track and make repayment easier to manage.
          <Box component="br" sx={{ display: { xs: "none", md: "block" } }} />
          We&apos;ll notify you 3 days before any scheduled withdrawal.
        </Typography>
      </Box>
    </Stack>
  );
}
