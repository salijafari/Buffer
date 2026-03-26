import { Box, Card, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { FINANCIAL_MASK } from "../../../lib/financialDisplay";
import type { OverviewConnectedAccountRow } from "./overviewMock";
import { PlaidConnectButton } from "../../plaid/PlaidConnectButton";
import { MsIcon } from "./MsIcon";
import { BODY_FONT, HEADLINE_FONT, OT } from "./overviewTokens";

type Props = {
  updatedLabel: string;
  accounts: OverviewConnectedAccountRow[];
  /** Live: true when user should reconnect (broken / no active items). */
  bankLinkBroken: boolean;
  showLiveFinancials: boolean;
  onPlaidConnected?: () => void | Promise<void>;
};

export function OverviewConnectedAccounts({
  updatedLabel,
  accounts,
  bankLinkBroken,
  showLiveFinancials,
  onPlaidConnected,
}: Props) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: OT.cardRadius,
        border: `1px solid ${OT.surfaceContainer}`,
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: OT.cardShadow,
        height: "100%",
      }}
    >
      <Box sx={{ p: { xs: 3, md: 5 } }}>
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
              bankLinkBroken={bankLinkBroken}
              showLiveFinancials={showLiveFinancials}
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
              borderRadius: OT.cardRadius,
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
  bankLinkBroken,
  showLiveFinancials,
}: {
  row: OverviewConnectedAccountRow;
  bankLinkBroken: boolean;
  showLiveFinancials: boolean;
}) {
  if (row.kind === "bank") {
    const broken = bankLinkBroken;
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          p: 2,
          borderRadius: OT.cardRadius,
          bgcolor: OT.surfaceContainerLow,
          border: broken ? `1px solid ${alpha("#f59e0b", 0.45)}` : "none",
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
            <MsIcon name="account_balance" sx={{ fontSize: 22, color: "#2563eb" }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: BODY_FONT, fontWeight: 700, fontSize: "0.875rem", color: OT.onSurface }}>
              {row.name}
            </Typography>
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", color: OT.outline }}>
              {showLiveFinancials ? `••••${row.mask}` : FINANCIAL_MASK}
            </Typography>
          </Box>
        </Stack>
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "0.75rem",
            fontWeight: 700,
            px: 1.25,
            py: 0.35,
            borderRadius: 999,
            bgcolor: OT.secondaryContainer,
            color: OT.onSecondaryContainer,
          }}
        >
          {broken ? (
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
        borderRadius: OT.cardRadius,
        border: `1px solid ${OT.surfaceContainer}`,
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
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", color: OT.outline }}>
            {showLiveFinancials ? `••••${row.mask}` : FINANCIAL_MASK}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: OT.primary, fontWeight: 700, fontSize: "0.75rem", fontFamily: BODY_FONT }}>
        <MsIcon name="check_circle" sx={{ fontSize: 18 }} />
        PAID
      </Stack>
    </Stack>
  );
}
