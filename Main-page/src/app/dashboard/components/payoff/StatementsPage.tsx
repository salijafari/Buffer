import { Box, Button, Card, CardContent, IconButton, Link, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router";
import { useLiveFinancialDisplay } from "../../hooks/useLiveFinancialDisplay";
import { displayMoney, FINANCIAL_MASK } from "../../lib/financialDisplay";
import { OVERVIEW_MOCK } from "../home/overview/overviewMock";
import { BODY_FONT, HEADLINE_FONT, OT } from "../home/overview/overviewTokens";
import { MsIcon } from "../home/overview/MsIcon";
import { fmtCurrency } from "../../lib/dashboardFormat";
import { STATEMENTS_LIST_MOCK, STATEMENTS_YTD_PAID } from "./statementsMock";

const PAYMENTS_HOME = "/dashboard/payoff";

/** Stitch `buffer_statements_page` decorative image */
const STATEMENTS_DECOR_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC4dpQ9x64RlxlhT-syDyoh5RITFJTcBPx1sgOhkgCCycIqP9NWwBqfURu-_8zUsO3LsNw0j-IF_pF1NI9FZHyfeWG1HQGjAHt6IUY8rlnzrMV0X9cglCCN6aPFOFxLNMOs4fZDc16k8IedkeCAUee_7q90ps8wh-es_frio6ARVatycA5c4vQVt7mmx8VBcYkMMkvBXs75wuvYhCVkiulgT8Bh1CjaXiKiUoHp09ddVuz62FwDwVORmi1Fdm2KEmJaQLbsQ5-9_Xo";

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function formatNextDue(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export function StatementsPage() {
  const p = OVERVIEW_MOCK.payment;
  const { showLiveFinancials } = useLiveFinancialDisplay();
  const live = showLiveFinancials;

  return (
    <Stack
      component="main"
      role="main"
      aria-label="Statements"
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

      <header style={{ marginBottom: "3rem", maxWidth: "48rem" }}>
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
          Statements
        </Typography>
        <Typography sx={{ fontFamily: BODY_FONT, fontSize: "1.125rem", fontWeight: 500, lineHeight: 1.625, color: OT.onSurfaceVariant }}>
          View your monthly Buffer statements and billing records.
        </Typography>
      </header>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(0, 1fr)" },
          gap: { xs: 3, lg: 4 },
          alignItems: "start",
        }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: OT.cardRadius,
            bgcolor: OT.surfaceContainerLowest,
            boxShadow: OT.cardShadow,
            minWidth: 0,
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
              <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: { xs: "1.375rem", md: "1.5rem" }, color: OT.onSurface }}>
                Statement List
              </Typography>
              <IconButton size="small" aria-label="Filter or sort statements" sx={{ color: OT.onSurfaceVariant }}>
                <MsIcon name="filter_list" sx={{ fontSize: 24 }} />
              </IconButton>
            </Stack>
            <Stack spacing={2}>
              {STATEMENTS_LIST_MOCK.map((row) => (
                <Stack
                  key={row.id}
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  spacing={2}
                  sx={{
                    p: 2.5,
                    borderRadius: OT.cardRadiusLg,
                    bgcolor: OT.surfaceContainerLow,
                    transition: "background-color 0.2s ease",
                    "&:hover": { bgcolor: OT.surfaceContainerHigh },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        bgcolor: alpha(OT.primaryContainer, 0.15),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <MsIcon name="calendar_today" sx={{ fontSize: 24, color: OT.primary }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1rem", color: OT.onSurface }}>
                        {row.periodLabel}
                      </Typography>
                      <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", color: OT.onSurfaceVariant, mt: 0.25 }}>
                        Amount due: {displayMoney(live, () => usd(row.amountDue))}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={3} flexWrap="wrap" useFlexGap>
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 999,
                        bgcolor: OT.secondaryContainer,
                        color: OT.onSecondaryContainer,
                        fontFamily: BODY_FONT,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      Paid
                    </Box>
                    <Link
                      component="button"
                      type="button"
                      onClick={(e) => e.preventDefault()}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.75,
                        fontFamily: BODY_FONT,
                        fontSize: "0.9375rem",
                        fontWeight: 600,
                        color: OT.primary,
                        cursor: "pointer",
                        border: "none",
                        bgcolor: "transparent",
                        p: 0,
                        textDecoration: "underline",
                        textDecorationThickness: 2,
                        textUnderlineOffset: 6,
                        "&:hover": { opacity: 0.9 },
                      }}
                    >
                      <MsIcon name="download" sx={{ fontSize: 18 }} />
                      Download PDF
                    </Link>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={4} sx={{ position: { lg: "sticky" }, top: { lg: 16 }, minWidth: 0 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: OT.cardRadius,
              bgcolor: OT.surfaceContainerLowest,
              boxShadow: OT.cardShadow,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.02em", color: OT.onSurface, mb: 3 }}>
                Billing Summary
              </Typography>
              <Stack spacing={3} divider={<Box sx={{ borderTop: `1px solid ${OT.surfaceContainerHigh}` }} />}>
                <Box>
                  <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: OT.onSurfaceVariant, mb: 0.5 }}>
                    Total paid this year
                  </Typography>
                  <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 800, fontSize: "1.875rem", color: OT.primary }}>
                    {displayMoney(live, () => usd(STATEMENTS_YTD_PAID))}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: OT.onSurfaceVariant, mb: 0.5 }}>
                    Current balance
                  </Typography>
                  <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 800, fontSize: "1.875rem", color: OT.onSurface }}>
                    {displayMoney(live, () => fmtCurrency(p.currentBalance, 0))}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: OT.onSurfaceVariant, mb: 0.5 }}>
                    Next due date
                  </Typography>
                  <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.25rem", color: OT.onSurface }}>
                    {live ? formatNextDue(p.nextPaymentDateIso) : FINANCIAL_MASK}
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
              background: `linear-gradient(135deg, ${OT.primary} 0%, ${OT.primaryContainer} 100%)`,
              color: OT.onPrimaryContainer,
              boxShadow: `0 16px 40px ${alpha(OT.primary, 0.35)}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: alpha("#fff", 0.12),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <MsIcon name="contact_support" sx={{ fontSize: 28, color: "#fff" }} />
              </Box>
              <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.25rem", mb: 1.5, color: "#fff" }}>
                Need help with a statement?
              </Typography>
              <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", lineHeight: 1.6, color: alpha(OT.onPrimaryContainer, 0.85), mb: 4 }}>
                If you have a question about a charge, payment, or statement, contact Buffer support.
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
                  py: 1.75,
                  bgcolor: "#fff",
                  color: OT.primary,
                  boxShadow: "none",
                  transition: "transform 0.2s ease, background-color 0.2s ease",
                  "&:hover": { bgcolor: alpha("#fff", 0.95), boxShadow: "none", transform: "scale(1.02)" },
                  "&:active": { transform: "scale(0.98)" },
                }}
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>

          <Box sx={{ height: 160, borderRadius: OT.cardRadius, overflow: "hidden", position: "relative" }}>
            <Box component="img" src={STATEMENTS_DECOR_IMAGE} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <Box sx={{ position: "absolute", inset: 0, bgcolor: alpha(OT.primary, 0.2), backdropFilter: "blur(2px)" }} />
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
