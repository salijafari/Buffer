import { Box, Card, Stack, Typography } from "@mui/material";
import type { OverviewConnectedAccountRow } from "./overviewMock";
import { PlaidConnectButton } from "../../plaid/PlaidConnectButton";
import { MsIcon } from "./MsIcon";
import { BODY_FONT, HEADLINE_FONT, OT } from "./overviewTokens";

type Props = {
  updatedLabel: string;
  accounts: OverviewConnectedAccountRow[];
  /** Live: true when Plaid reports an active connection. Demo: always treated as healthy. */
  bankLinkHealthy: boolean;
  /** Live: true when user should reconnect (broken / no active items). */
  bankLinkBroken: boolean;
  onPlaidConnected?: () => void | Promise<void>;
};

const GREEN_BG = "rgba(34, 197, 94, 0.12)";
const GREEN_BORDER = "rgba(34, 197, 94, 0.45)";
const AMBER_BG = "rgba(251, 191, 36, 0.18)";
const AMBER_BORDER = "rgba(245, 158, 11, 0.55)";

export function OverviewConnectedAccounts({
  updatedLabel,
  accounts,
  bankLinkHealthy,
  bankLinkBroken,
  onPlaidConnected,
}: Props) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: OT.cardRadius,
        border: `1px solid ${OT.cardBorder}`,
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: OT.cardShadow,
        height: "100%",
      }}
    >
      <Box sx={{ p: { xs: 3, md: 4 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }} flexWrap="wrap" gap={1}>
          <Typography sx={{ fontFamily: HEADLINE_FONT, fontSize: "1.25rem", fontWeight: 700, color: OT.onSurface }}>
            Connected Accounts
          </Typography>
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", color: OT.outline }}>Updated: {updatedLabel}</Typography>
        </Stack>
        <Stack spacing={2}>
          {accounts.map((row, i) => (
            <AccountRow
              key={`${row.kind}-${row.name}-${i}`}
              row={row}
              bankLinkHealthy={bankLinkHealthy}
              bankLinkBroken={bankLinkBroken}
            />
          ))}
        </Stack>

        <Stack spacing={1.5} sx={{ mt: 3, pt: 3, borderTop: `1px solid ${OT.surfaceContainer}` }}>
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", fontWeight: 600, color: OT.onSurfaceVariant }}>
            {bankLinkBroken ? "Reconnect or add accounts" : "Add more accounts"}
          </Typography>
          <PlaidConnectButton
            variant="outlined"
            color="primary"
            fullWidth
            onConnected={onPlaidConnected}
            sx={{
              py: 1.25,
              borderRadius: "16px",
              textTransform: "none",
              fontWeight: 700,
              fontFamily: BODY_FONT,
              borderWidth: 2,
            }}
          >
            Connect another bank or card
          </PlaidConnectButton>
        </Stack>
      </Box>
    </Card>
  );
}

function AccountRow({
  row,
  bankLinkHealthy,
  bankLinkBroken,
}: {
  row: OverviewConnectedAccountRow;
  bankLinkHealthy: boolean;
  bankLinkBroken: boolean;
}) {
  if (row.kind === "bank") {
    const healthy = bankLinkHealthy && !bankLinkBroken;
    const broken = bankLinkBroken;
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          p: 2,
          borderRadius: "16px",
          bgcolor: healthy ? GREEN_BG : broken ? AMBER_BG : OT.surfaceContainerLow,
          border: "2px solid",
          borderColor: healthy ? GREEN_BORDER : broken ? AMBER_BORDER : "transparent",
          boxShadow: healthy ? "0 1px 3px rgba(34, 197, 94, 0.15)" : "none",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "#fff",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MsIcon
              name="account_balance"
              sx={{ fontSize: 22, color: healthy ? "#16a34a" : broken ? "#d97706" : "#2563eb" }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: BODY_FONT, fontWeight: 700, fontSize: "0.875rem", color: OT.onSurface }}>
              {row.name}
            </Typography>
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", color: OT.outline }}>••••{row.mask}</Typography>
          </Box>
        </Stack>
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "0.7rem",
            fontWeight: 800,
            px: 1.25,
            py: 0.5,
            borderRadius: 999,
            bgcolor: healthy ? "rgba(34, 197, 94, 0.25)" : broken ? "rgba(251, 191, 36, 0.35)" : OT.secondaryContainer,
            color: healthy ? "#166534" : broken ? "#9a3412" : OT.onSecondaryContainer,
          }}
        >
          {healthy ? (
            <>
              <MsIcon name="check_circle" filled sx={{ fontSize: 14 }} />
              CONNECTED
            </>
          ) : broken ? (
            <>
              <MsIcon name="warning" sx={{ fontSize: 14 }} />
              RECONNECT
            </>
          ) : (
            "BANK"
          )}
        </Box>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        p: 2,
        borderRadius: "16px",
        border: `1px solid ${OT.cardBorder}`,
        opacity: 0.6,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MsIcon name="credit_card" sx={{ fontSize: 22, color: "#94a3b8" }} />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: BODY_FONT, fontWeight: 700, fontSize: "0.875rem", color: OT.onSurface }}>
            {row.name}
          </Typography>
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", color: OT.outline }}>••••{row.mask}</Typography>
        </Box>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: OT.primary, fontWeight: 700, fontSize: "0.75rem", fontFamily: BODY_FONT }}>
        <MsIcon name="check_circle" sx={{ fontSize: 18 }} />
        PAID
      </Stack>
    </Stack>
  );
}
