import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { PlaidConnectButton } from "../../plaid/PlaidConnectButton";
import { MsIcon } from "./MsIcon";
import { BODY_FONT, HEADLINE_FONT, OT } from "./overviewTokens";

type Props = {
  onPlaidConnected?: () => void;
};

/** Screenshot: white pill-shaped rows on surface-container-low panel */
export function OverviewQuickActions({ onPlaidConnected }: Props) {
  const navigate = useNavigate();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: OT.cardRadius,
        border: `1px solid ${OT.cardBorder}`,
        bgcolor: OT.surfaceContainerLow,
        boxShadow: OT.cardShadow,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 }, "&:last-child": { pb: { xs: 3, md: 4 } } }}>
        <Typography sx={{ fontFamily: HEADLINE_FONT, fontSize: "1.25rem", fontWeight: 700, color: OT.onSurface, mb: 3 }}>
          Quick Actions
        </Typography>
        <Stack spacing={1.25}>
          <ActionRow icon="add_circle" label="Make Extra Payment" onClick={() => void navigate("/dashboard/payoff")} />
          <ActionRow icon="description" label="View Statements" onClick={() => void navigate("/dashboard/account")} />
          <ActionRow icon="event" label="Change Payment Date" onClick={() => void navigate("/dashboard/account")} />
          <Box sx={{ width: "100%" }}>
            <PlaidConnectButton
              variant="text"
              onConnected={onPlaidConnected}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                fontFamily: BODY_FONT,
                minHeight: 48,
                py: 1.5,
                px: 2.5,
                borderRadius: 9999,
                bgcolor: "#fff",
                color: OT.onSurface,
                border: "none",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05)",
                transition: "background-color 0.2s ease",
                gap: 2,
                "&:hover": { bgcolor: "#f1f5f9" },
              }}
            >
              <Box className="qa-icon" sx={{ display: "inline-flex", transition: "transform 0.2s ease", flexShrink: 0, mr: 0.5 }}>
                <MsIcon name="account_balance" sx={{ fontSize: 22, color: OT.primary }} />
              </Box>
              <Box component="span" sx={{ flex: 1, textAlign: "left" }}>
                Update Bank Account
              </Box>
            </PlaidConnectButton>
          </Box>
          <ActionRow icon="link" label="Manage Connected Accounts" onClick={() => void navigate("/dashboard/account")} />
          <ActionRow
            icon="support_agent"
            label="Contact Support"
            onClick={() => {
              window.location.href = "mailto:hello@mybuffer.ca";
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function ActionRow({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      className="group"
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        border: "none",
        borderRadius: 9999,
        minHeight: 48,
        py: 1.5,
        px: 2.5,
        bgcolor: "#fff",
        fontFamily: BODY_FONT,
        fontWeight: 500,
        fontSize: "0.875rem",
        color: OT.onSurface,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05)",
        transition: "background-color 0.2s ease, transform 0.15s ease",
        "&:hover": {
          bgcolor: "#f1f5f9",
          "& .qa-icon": { transform: "scale(1.1)" },
        },
        "&:active": { transform: "scale(0.98)" },
      }}
    >
      <Box className="qa-icon" sx={{ display: "inline-flex", mr: 1.5, transition: "transform 0.2s ease" }}>
        <MsIcon name={icon} sx={{ fontSize: 22, color: OT.primary }} />
      </Box>
      {label}
    </Box>
  );
}
