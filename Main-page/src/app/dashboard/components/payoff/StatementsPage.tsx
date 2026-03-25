import { Box, Button, Card, CardContent, IconButton, Link, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router";
import { OVERVIEW_MOCK } from "../home/overview/overviewMock";
import { BODY_FONT, HEADLINE_FONT, OT } from "../home/overview/overviewTokens";
import { MsIcon } from "../home/overview/MsIcon";
import { fmtCurrency } from "../../lib/dashboardFormat";
import { STATEMENTS_LIST_MOCK, STATEMENTS_YTD_PAID } from "./statementsMock";

const PAYMENTS_HOME = "/dashboard/payoff";

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function formatNextDue(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export function StatementsPage() {
  const p = OVERVIEW_MOCK.payment;

  return (
    <Stack
      component="main"
      role="main"
      aria-label="Statements"
      sx={{
        px: { xs: 2, lg: 0 },
        py: { xs: 2.5, lg: 0 },
        maxWidth: { xs: "100%", lg: "min(1536px, 100%)" },
        mx: "auto",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <Typography
        component={RouterLink}
        to={PAYMENTS_HOME}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          mb: 2,
          fontFamily: BODY_FONT,
          fontWeight: 700,
          fontSize: "0.9375rem",
          color: OT.primary,
          textDecoration: "none",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        <MsIcon name="arrow_back" sx={{ fontSize: 20 }} />
        Back to Payments
      </Typography>

      <header style={{ marginBottom: "2rem", maxWidth: "48rem" }}>
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
          Statements
        </Typography>
        <Typography
          sx={{
            fontFamily: BODY_FONT,
            fontSize: "1.125rem",
            lineHeight: 1.625,
            color: OT.onSurfaceVariant,
          }}
        >
          View your monthly Buffer statements and billing records.
        </Typography>
      </header>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.65fr) minmax(0, 1fr)" },
          gap: { xs: 3, lg: 4 },
          alignItems: "start",
        }}
      >
        {/* Statement list */}
        <Card
          elevation={0}
          sx={{
            borderRadius: OT.cardRadius,
            border: `1px solid ${OT.cardBorder}`,
            bgcolor: OT.surfaceContainerLowest,
            boxShadow: OT.cardShadow,
            minWidth: 0,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
              <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.125rem", color: OT.onSurface }}>
                Statement List
              </Typography>
              <IconButton size="small" aria-label="Filter or sort statements" sx={{ color: OT.outline }}>
                <MsIcon name="filter_list" sx={{ fontSize: 22 }} />
              </IconButton>
            </Stack>
            <Stack spacing={1.5}>
              {STATEMENTS_LIST_MOCK.map((row) => (
                <Box
                  key={row.id}
                  sx={{
                    borderRadius: "16px",
                    bgcolor: OT.surfaceContainerLow,
                    border: `1px solid ${OT.cardBorder}`,
                    p: 2,
                  }}
                >
                  <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          bgcolor: alpha(OT.primary, 0.12),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <MsIcon name="calendar_month" sx={{ fontSize: 24, color: OT.primary }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1rem", color: OT.onSurface }}>
                          {row.periodLabel}
                        </Typography>
                        <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.8125rem", color: OT.outline, mt: 0.25 }}>
                          Amount due: {usd(row.amountDue)}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" useFlexGap>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.35,
                          borderRadius: 999,
                          bgcolor: alpha(OT.primary, 0.12),
                          color: OT.primary,
                          fontFamily: BODY_FONT,
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          letterSpacing: "0.06em",
                        }}
                      >
                        PAID
                      </Box>
                      <Link
                        component="button"
                        type="button"
                        onClick={(e) => e.preventDefault()}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
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
                        <MsIcon name="download" sx={{ fontSize: 18 }} />
                        Download PDF
                      </Link>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <Stack spacing={2.5} sx={{ position: { lg: "sticky" }, top: { lg: 16 }, minWidth: 0 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: OT.cardRadius,
              border: `1px solid ${OT.cardBorder}`,
              bgcolor: OT.surfaceContainerLowest,
              boxShadow: OT.cardShadow,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.0625rem", color: OT.onSurface, mb: 2 }}>
                Billing Summary
              </Typography>
              <Stack divider={<Box sx={{ borderTop: `1px solid ${OT.surfaceContainer}`, my: 1.5 }} />}>
                <Box>
                  <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: OT.outline, mb: 0.5 }}>
                    TOTAL PAID THIS YEAR
                  </Typography>
                  <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 800, fontSize: "1.5rem", color: OT.primary }}>
                    {usd(STATEMENTS_YTD_PAID)}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: OT.outline, mb: 0.5 }}>
                    CURRENT BALANCE
                  </Typography>
                  <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.125rem", color: OT.onSurface }}>
                    {fmtCurrency(p.currentBalance, 0)}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: OT.outline, mb: 0.5 }}>
                    NEXT DUE DATE
                  </Typography>
                  <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.0625rem", color: OT.onSurface }}>
                    {formatNextDue(p.nextPaymentDateIso)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: OT.cardRadius,
              border: "none",
              bgcolor: OT.primary,
              color: "#fff",
              boxShadow: `0 12px 28px ${alpha(OT.primary, 0.35)}`,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: alpha("#fff", 0.2),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MsIcon name="help" sx={{ fontSize: 22, color: "#fff" }} />
                </Box>
                <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.0625rem", lineHeight: 1.35 }}>
                  Need help with a statement?
                </Typography>
              </Stack>
              <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", lineHeight: 1.55, opacity: 0.95, mb: 2 }}>
                Our team can explain line items, due dates, or payment confirmations. Reach out anytime.
              </Typography>
              <Button
                component={RouterLink}
                to="/dashboard/support"
                fullWidth
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontFamily: BODY_FONT,
                  bgcolor: "#fff",
                  color: OT.primary,
                  py: 1.25,
                  boxShadow: "none",
                  "&:hover": { bgcolor: alpha("#fff", 0.92), boxShadow: "none" },
                }}
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: OT.cardRadius,
              overflow: "hidden",
              border: `1px solid ${alpha("#0f172a", 0.2)}`,
              minHeight: 140,
              bgcolor: "#0c4a6e",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0.9,
                background: `
                  linear-gradient(135deg, ${alpha("#0e7490", 0.5)} 0%, #0c4a6e 40%, #082f49 100%),
                  repeating-linear-gradient(0deg, transparent, transparent 11px, ${alpha("#fff", 0.04)} 11px, ${alpha("#fff", 0.04)} 12px),
                  repeating-linear-gradient(90deg, transparent, transparent 11px, ${alpha("#fff", 0.04)} 11px, ${alpha("#fff", 0.04)} 12px)
                `,
              }}
            />
            <Box sx={{ position: "relative", p: 2.5, height: "100%" }}>
              <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.08em", color: alpha("#fff", 0.75) }}>
                BILLING
              </Typography>
              <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 800, fontSize: "1rem", color: "#fff", mt: 0.5 }}>
                Records &amp; receipts
              </Typography>
            </Box>
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
}
