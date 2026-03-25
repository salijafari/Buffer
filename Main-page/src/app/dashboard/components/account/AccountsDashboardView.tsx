import { Box, Button, Card, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ChevronRight } from "lucide-react";
import { useDashboardShell } from "../../context/DashboardShellContext";
import { PlaidConnectButton } from "../plaid/PlaidConnectButton";
import { OVERVIEW_MOCK } from "../home/overview/overviewMock";
import { BODY_FONT, HEADLINE_FONT, OT } from "../home/overview/overviewTokens";
import { MsIcon } from "../home/overview/MsIcon";
import { ACCOUNTS_PAID_DOWN_CARDS } from "./accountsMock";

const money = (n: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

type SettingsNav = {
  onProfile: () => void;
  onNotifications: () => void;
  onSupport: () => void;
  onSignOut: () => void;
};

type Props = SettingsNav & {
  onManageConnections?: () => void;
};

function AccountsPageHeader() {
  return (
    <header style={{ marginBottom: "2rem", maxWidth: "48rem" }}>
      <Typography
        component="h1"
        sx={{
          fontFamily: HEADLINE_FONT,
          fontSize: { xs: "2rem", md: "2.5rem" },
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: OT.onSurface,
          mb: 1.5,
        }}
      >
        Accounts
      </Typography>
      <Typography
        sx={{
          fontFamily: BODY_FONT,
          fontSize: "1.125rem",
          lineHeight: 1.6,
          color: OT.onSurfaceVariant,
        }}
      >
        Manage your connected bank account and the credit cards Buffer paid down.
      </Typography>
    </header>
  );
}

function PrimaryBankCard({
  bankLinkHealthy,
  bankLinkBroken,
  onPlaidConnected,
}: {
  bankLinkHealthy: boolean;
  bankLinkBroken: boolean;
  onPlaidConnected?: () => void | Promise<void>;
}) {
  const healthy = bankLinkHealthy && !bankLinkBroken;
  const broken = bankLinkBroken;

  return (
    <Card
      elevation={0}
      id="accounts-primary-bank"
      sx={{
        borderRadius: OT.cardRadius,
        border: `1px solid ${OT.cardBorder}`,
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: OT.cardShadow,
        mb: 4,
      }}
    >
      <Box sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "flex-start" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2.5 }}
        >
          <Stack direction="row" alignItems="flex-start" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: OT.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 4px 14px ${alpha(OT.primary, 0.35)}`,
              }}
            >
              <MsIcon name="account_balance" sx={{ fontSize: 26, color: "#fff" }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.125rem", color: OT.onSurface }}>
                {OVERVIEW_MOCK.payment.bankLabel}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75, flexWrap: "wrap" }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: healthy ? "#22c55e" : broken ? "#f59e0b" : "#94a3b8",
                  }}
                />
                <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.8125rem", fontWeight: 600, color: healthy ? "#15803d" : broken ? "#b45309" : OT.outline }}>
                  {healthy ? "Connected" : broken ? "Reconnect needed" : "Checking…"}
                </Typography>
                <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.8125rem", color: OT.outline }}>
                  ••••{OVERVIEW_MOCK.payment.bankMask}
                </Typography>
              </Stack>
              <Typography
                sx={{
                  fontFamily: BODY_FONT,
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: OT.outline,
                  mt: 1,
                }}
              >
                DEFAULT PAYMENT ACCOUNT
              </Typography>
            </Box>
          </Stack>
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.8125rem", color: OT.outline, alignSelf: { sm: "flex-start" } }}>
            Last updated: {OVERVIEW_MOCK.accountsUpdatedLabel}
          </Typography>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 1 }}>
          {broken ? (
            <PlaidConnectButton
              variant="outlined"
              fullWidth={false}
              onConnected={onPlaidConnected}
              sx={{
                px: 2.5,
                py: 1.25,
                borderRadius: "14px",
                textTransform: "none",
                fontWeight: 700,
                fontFamily: BODY_FONT,
                borderColor: OT.cardBorder,
                color: OT.onSurfaceVariant,
                borderWidth: 2,
              }}
            >
              Reconnect
            </PlaidConnectButton>
          ) : null}
          <PlaidConnectButton
            variant="contained"
            color="primary"
            fullWidth={false}
            onConnected={onPlaidConnected}
            sx={{
              px: 2.5,
              py: 1.25,
              borderRadius: "14px",
              textTransform: "none",
              fontWeight: 700,
              fontFamily: BODY_FONT,
              boxShadow: "none",
              bgcolor: OT.primary,
              "&:hover": { bgcolor: OT.primaryContainer },
            }}
          >
            Update Bank Account
          </PlaidConnectButton>
        </Stack>
      </Box>
    </Card>
  );
}

function PaidDownCardRow({ row }: { row: (typeof ACCOUNTS_PAID_DOWN_CARDS)[number] }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: `1px solid ${OT.cardBorder}`,
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ p: 2.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              bgcolor: OT.surfaceContainer,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MsIcon name="credit_card" sx={{ fontSize: 24, color: "#94a3b8" }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "0.9375rem", color: OT.onSurface }}>
              {row.name} ••••{row.mask}
            </Typography>
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.8125rem", color: OT.outline, mt: 0.25 }}>
              Original balance: {money(row.originalBalance)}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={4} sx={{ alignSelf: { xs: "stretch", sm: "center" }, pl: { xs: 7, sm: 0 } }}>
          <Box>
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: OT.outline, mb: 0.5 }}>
              STATUS
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <MsIcon name="check_circle" filled sx={{ fontSize: 18, color: OT.primary }} />
              <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 700, color: OT.primary }}>
                Paid Down
              </Typography>
            </Stack>
          </Box>
          <Box>
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: OT.outline, mb: 0.5 }}>
              CONNECTION
            </Typography>
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 700, color: OT.onSurface }}>
              Connected
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
}

function ConnectionStatusCard({ onManageConnections }: { onManageConnections?: () => void }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: OT.cardRadius,
        border: `1px solid ${alpha(OT.primary, 0.2)}`,
        bgcolor: alpha(OT.primary, 0.06),
        boxShadow: "none",
        mb: 2.5,
      }}
    >
      <Box sx={{ p: 2.5, textAlign: "center" }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: alpha(OT.primary, 0.15),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 1.5,
          }}
        >
          <MsIcon name="sync" sx={{ fontSize: 26, color: OT.primary }} />
        </Box>
        <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "0.9375rem", color: OT.onSurface, mb: 2 }}>
          All accounts connected and syncing normally.
        </Typography>
        <Button
          fullWidth
          variant="outlined"
          onClick={onManageConnections}
          sx={{
            borderRadius: "14px",
            textTransform: "none",
            fontWeight: 700,
            fontFamily: BODY_FONT,
            borderColor: OT.cardBorder,
            bgcolor: OT.surfaceContainerLowest,
            color: OT.onSurfaceVariant,
            "&:hover": { borderColor: OT.outline, bgcolor: OT.surfaceContainerLow },
          }}
        >
          Manage Connections
        </Button>
      </Box>
    </Card>
  );
}

function WhyThisMattersCard() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: OT.cardRadius,
        border: `1px solid ${OT.cardBorder}`,
        bgcolor: OT.surfaceContainerLow,
        boxShadow: "none",
        mb: 2.5,
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <MsIcon name="info" sx={{ fontSize: 22, color: OT.primary }} />
          <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1rem", color: OT.onSurface }}>
            Why this matters
          </Typography>
        </Stack>
        <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", lineHeight: 1.6, color: OT.onSurfaceVariant }}>
          Keeping your bank and card details current helps Buffer process payments on time and keeps your payoff and credit-health insights accurate.
        </Typography>
      </Box>
    </Card>
  );
}

function AccountsGraphicCard() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: OT.cardRadius,
        overflow: "hidden",
        border: `1px solid ${alpha("#0f172a", 0.35)}`,
        bgcolor: "#0f172a",
        minHeight: 160,
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${alpha("#0891b2", 0.5)} 0%, ${alpha("#0f172a", 0.95)} 55%, #0f172a 100%)`,
        }}
      />
      <Stack
        direction="row"
        alignItems="flex-end"
        justifyContent="space-between"
        sx={{ position: "relative", p: 2.5, height: "100%", minHeight: 160 }}
      >
        <Stack spacing={0.5}>
          <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 800, fontSize: "0.75rem", color: alpha("#fff", 0.75), letterSpacing: "0.06em" }}>
            PROGRESS
          </Typography>
          <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 800, fontSize: "1.25rem", color: "#fff" }}>
            On track
          </Typography>
        </Stack>
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.6, opacity: 0.92, height: 72 }}>
          {[32, 52, 38, 64, 44].map((h, i) => (
            <Box
              key={i}
              sx={{
                width: 10,
                height: h,
                borderRadius: "4px 4px 0 0",
                bgcolor: alpha("#22d3ee", 0.85),
                boxShadow: `0 0 16px ${alpha("#22d3ee", 0.35)}`,
              }}
            />
          ))}
        </Box>
      </Stack>
    </Card>
  );
}

function SettingsRow({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Stack
      component="button"
      type="button"
      onClick={onClick}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        width: "100%",
        minHeight: 0,
        py: 1.75,
        px: 0,
        border: "none",
        font: "inherit",
        cursor: "pointer",
        bgcolor: "transparent",
        textAlign: "left",
        borderBottom: `1px solid ${OT.surfaceContainer}`,
        "&:last-of-type": { borderBottom: "none" },
        "&:hover": { bgcolor: alpha(OT.primary, 0.04) },
      }}
    >
      <Typography sx={{ fontFamily: BODY_FONT, fontWeight: 600, fontSize: "0.9375rem", color: OT.onSurface }}>{label}</Typography>
      <ChevronRight size={18} color={OT.outline} aria-hidden />
    </Stack>
  );
}

function AccountSettingsCard({ onProfile, onNotifications, onSupport, onSignOut }: SettingsNav) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: OT.cardRadius,
        border: `1px solid ${OT.cardBorder}`,
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: OT.cardShadow,
        mt: 1,
      }}
    >
      <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1rem", color: OT.onSurface }}>
          Profile &amp; preferences
        </Typography>
        <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.8125rem", color: OT.outline, mt: 0.5 }}>
          Sign-in, notifications, and support
        </Typography>
      </Box>
      <Box sx={{ px: 2.5, pb: 2 }}>
        <SettingsRow label="Profile" onClick={onProfile} />
        <SettingsRow label="Notifications" onClick={onNotifications} />
        <SettingsRow label="Help &amp; Support" onClick={onSupport} />
        <SettingsRow label="Sign out" onClick={onSignOut} />
      </Box>
    </Card>
  );
}

export function AccountsDashboardView({
  onProfile,
  onNotifications,
  onSupport,
  onSignOut,
  onManageConnections,
}: Props) {
  const { connectionMode, plaidConnected, refreshPlaidConnection, refreshProfile } = useDashboardShell();
  const usePlaidLiveDataOnly = connectionMode === "post" && plaidConnected === true;
  const bankLinkHealthy = !usePlaidLiveDataOnly || plaidConnected === true;
  const bankLinkBroken = usePlaidLiveDataOnly && plaidConnected === false;

  async function handlePlaidConnected() {
    await refreshPlaidConnection();
    await refreshProfile();
  }

  const scrollToBank = () => {
    document.getElementById("accounts-primary-bank")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.75fr) minmax(0, 1fr)" },
        gap: { xs: 3, lg: 4 },
        alignItems: "start",
        width: "100%",
        minWidth: 0,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <AccountsPageHeader />
        <PrimaryBankCard
          bankLinkHealthy={bankLinkHealthy}
          bankLinkBroken={bankLinkBroken}
          onPlaidConnected={handlePlaidConnected}
        />
        <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.125rem", color: OT.onSurface, mb: 2 }}>
          Credit Cards Paid Down
        </Typography>
        <Stack spacing={2} sx={{ mb: 1 }}>
          {ACCOUNTS_PAID_DOWN_CARDS.map((row) => (
            <PaidDownCardRow key={`${row.name}-${row.mask}`} row={row} />
          ))}
        </Stack>
        <AccountSettingsCard
          onProfile={onProfile}
          onNotifications={onNotifications}
          onSupport={onSupport}
          onSignOut={onSignOut}
        />
      </Box>

      <Box sx={{ minWidth: 0, position: { lg: "sticky" }, top: { lg: 16 } }}>
        <ConnectionStatusCard onManageConnections={onManageConnections ?? scrollToBank} />
        <WhyThisMattersCard />
        <AccountsGraphicCard />
      </Box>
    </Box>
  );
}
