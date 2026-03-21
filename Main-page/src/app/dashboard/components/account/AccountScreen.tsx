import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { bffLogout, deleteBffAccount } from "@/lib/bffSession";
import { ChevronLeft } from "lucide-react";
import { BffUserAvatar } from "../BffUserAvatar";
import { type AccountIdentity, useAccountIdentity } from "./useAccountIdentity";

type Section = "main" | "profile" | "notifications" | "security" | "subscription" | "support";

type NavItem = { id: Exclude<Section, "main">; label: string; desc: string };

const NAV_ITEMS_TAIL: NavItem[] = [
  { id: "notifications", label: "Notifications", desc: "Push, email, SMS" },
  { id: "security", label: "Security", desc: "Password, passkey, 2FA" },
  { id: "subscription", label: "Subscription", desc: "Plan, billing, PAD" },
  { id: "support", label: "Help & Support", desc: "FAQ, contact" },
];

/** Subtitle under "Profile" in the account nav — same merged identity as the header (BFF + onboarding profile). */
function profileNavSubtitle(identity: AccountIdentity, loading: boolean): string {
  if (loading) return "Loading…";
  const name = identity.displayName.trim();
  const email = identity.email.trim();
  if (name && email) return `${name}, ${email}`;
  if (email) return email;
  if (name) return name;
  return "—";
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton onClick={onClick} aria-label="Go back" size="small" sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
      <ChevronLeft size={20} />
    </IconButton>
  );
}

function ProfileSection({
  identity,
  loading,
  profileError,
  onBack,
  showBack = true,
}: {
  identity: AccountIdentity;
  loading: boolean;
  profileError: boolean;
  onBack: () => void;
  showBack?: boolean;
}) {
  const [firstName, setFirstName] = useState(identity.firstName);
  const [lastName, setLastName] = useState(identity.lastName);
  const [email, setEmail] = useState(identity.email);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(identity.firstName);
    setLastName(identity.lastName);
    setEmail(identity.email);
  }, [identity.firstName, identity.lastName, identity.email]);

  async function handleConfirmDeleteAccount() {
    setDeleteError(null);
    setDeleteBusy(true);
    const result = await deleteBffAccount();
    setDeleteBusy(false);
    if (result.ok) {
      window.location.href = result.redirect;
      return;
    }
    setDeleteError(
      result.hint ? `${result.error} (${result.hint})` : result.error,
    );
  }

  return (
    <Stack spacing={2.5}>
      {showBack ? (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <BackButton onClick={onBack} />
          <Typography variant="h6" fontWeight={700}>
            Profile
          </Typography>
        </Stack>
      ) : (
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.375rem" }}>
          Profile
        </Typography>
      )}
      {profileError ? (
        <Typography variant="body2" color="warning.main">
          Could not load saved profile from the server; showing your sign-in name and email only.
        </Typography>
      ) : null}
      {loading ? (
        <Box sx={{ py: 1 }}>
          <CircularProgress size={28} aria-label="Loading profile" />
        </Box>
      ) : null}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth size="small" />
        <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth size="small" />
      </Stack>
      <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth size="small" />
      <Typography variant="caption" color="text.secondary">
        Names and email come from your account when you signed in. Edits here are local until a profile save API is connected.
      </Typography>

      <Divider sx={{ my: 1 }} />
      <Typography variant="subtitle2" color="error" fontWeight={700}>
        Danger zone
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Deleting your account removes your ability to sign in with Auth0. Your app history stays in our database as a deleted record for compliance and support.
      </Typography>
      <Button
        variant="outlined"
        color="error"
        fullWidth
        onClick={() => {
          setDeleteError(null);
          setDeleteDialogOpen(true);
        }}
      >
        Delete account
      </Button>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => (deleteBusy ? undefined : setDeleteDialogOpen(false))}
        disableEscapeKeyDown={deleteBusy}
        aria-labelledby="delete-account-title"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="delete-account-title" color="error">
          Delete your account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Stack spacing={1.5}>
              <Typography variant="body2" component="p">
                This will <strong>permanently delete your Auth0 user</strong>. You won&apos;t be able to sign in with this account again.
              </Typography>
              <Typography variant="body2" component="p">
                We will <strong>keep your database record</strong> and mark it as deleted (we do not remove historical rows).
              </Typography>
              <Typography variant="body2" component="p" color="text.secondary">
                This action cannot be undone from the app. If you&apos;re sure, click Delete below.
              </Typography>
              {deleteError ? (
                <Typography variant="body2" color="error">
                  {deleteError}
                </Typography>
              ) : null}
            </Stack>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteBusy}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleConfirmDeleteAccount()}
            color="error"
            variant="contained"
            disabled={deleteBusy}
            autoFocus
          >
            {deleteBusy ? "Deleting…" : "Delete account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function NotificationsSection({ onBack, showBack = true }: { onBack: () => void; showBack?: boolean }) {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  return (
    <Stack spacing={2.5}>
      {showBack ? (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <BackButton onClick={onBack} />
          <Typography variant="h6" fontWeight={700}>
            Notifications
          </Typography>
        </Stack>
      ) : (
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.375rem" }}>
          Notifications
        </Typography>
      )}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Stack divider={<Divider />}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.75 }}>
            <Typography variant="body2" color="text.secondary">
              Push notifications
            </Typography>
            <Switch checked={push} onChange={(_, v) => setPush(v)} color="primary" inputProps={{ "aria-label": "Push notifications" }} />
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.75 }}>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Switch checked={email} onChange={(_, v) => setEmail(v)} color="primary" inputProps={{ "aria-label": "Email notifications" }} />
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.75 }}>
            <Typography variant="body2" color="text.secondary">
              SMS
            </Typography>
            <Switch checked={sms} onChange={(_, v) => setSms(v)} color="primary" inputProps={{ "aria-label": "SMS notifications" }} />
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}

function SecuritySection({ onBack, showBack = true }: { onBack: () => void; showBack?: boolean }) {
  return (
    <Stack spacing={2.5}>
      {showBack ? (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <BackButton onClick={onBack} />
          <Typography variant="h6" fontWeight={700}>
            Security
          </Typography>
        </Stack>
      ) : (
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.375rem" }}>
          Security
        </Typography>
      )}
      <Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Typography variant="body2" color="text.secondary">
          Security settings are ready for integration.
        </Typography>
      </Box>
    </Stack>
  );
}

function SubscriptionSection({ onBack, showBack = true }: { onBack: () => void; showBack?: boolean }) {
  return (
    <Stack spacing={2.5}>
      {showBack ? (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <BackButton onClick={onBack} />
          <Typography variant="h6" fontWeight={700}>
            Subscription
          </Typography>
        </Stack>
      ) : (
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.375rem" }}>
          Subscription
        </Typography>
      )}
      <Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Buffer Pro
        </Typography>
        <Typography variant="body2" color="text.secondary">
          $14.99/month
        </Typography>
      </Box>
    </Stack>
  );
}

function SupportSection({ onBack, showBack = true }: { onBack: () => void; showBack?: boolean }) {
  return (
    <Stack spacing={2.5}>
      {showBack ? (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <BackButton onClick={onBack} />
          <Typography variant="h6" fontWeight={700}>
            Help &amp; Support
          </Typography>
        </Stack>
      ) : (
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.375rem" }}>
          Help &amp; Support
        </Typography>
      )}
      <Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Typography component="a" href="mailto:support@mybuffer.ca" variant="body2" color="primary.main" fontWeight={600}>
          support@mybuffer.ca
        </Typography>
      </Box>
    </Stack>
  );
}

const wrap = (node: ReactNode) => (
  <Box sx={{ px: 2, py: 2.5, maxWidth: 672, mx: "auto", width: "100%" }}>
    {node}
  </Box>
);

function renderDetailSection(
  section: Exclude<Section, "main">,
  onBack: () => void,
  showBack: boolean,
  identity: AccountIdentity,
  loading: boolean,
  profileError: boolean,
) {
  switch (section) {
    case "profile":
      return <ProfileSection identity={identity} loading={loading} profileError={profileError} onBack={onBack} showBack={showBack} />;
    case "notifications":
      return <NotificationsSection onBack={onBack} showBack={showBack} />;
    case "security":
      return <SecuritySection onBack={onBack} showBack={showBack} />;
    case "subscription":
      return <SubscriptionSection onBack={onBack} showBack={showBack} />;
    case "support":
      return <SupportSection onBack={onBack} showBack={showBack} />;
    default:
      return null;
  }
}

export function AccountScreen() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [section, setSection] = useState<Section>("main");
  const { identity, loading, profileError } = useAccountIdentity();

  const navItems = useMemo<NavItem[]>(
    () => [
      { id: "profile", label: "Profile", desc: profileNavSubtitle(identity, loading) },
      ...NAV_ITEMS_TAIL,
    ],
    [identity, loading],
  );

  const goMain = () => setSection("main");

  if (!isDesktop) {
    if (section === "profile") {
      return wrap(<ProfileSection identity={identity} loading={loading} profileError={profileError} onBack={goMain} />);
    }
    if (section === "notifications") return wrap(<NotificationsSection onBack={goMain} />);
    if (section === "security") return wrap(<SecuritySection onBack={goMain} />);
    if (section === "subscription") return wrap(<SubscriptionSection onBack={goMain} />);
    if (section === "support") return wrap(<SupportSection onBack={goMain} />);

    return (
      <Stack spacing={2.5} sx={{ px: 2, py: 2.5, maxWidth: 672, mx: "auto", width: "100%" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <BffUserAvatar picture={identity.picture} name={identity.displayName} email={identity.email} size={56} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {identity.displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {identity.email || "—"}
            </Typography>
          </Box>
        </Stack>

        <List disablePadding aria-label="Account sections" sx={{ borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "background.paper", overflow: "hidden" }}>
          {navItems.map((item, i, arr) => (
            <Box key={item.id}>
              <ListItemButton onClick={() => setSection(item.id)} sx={{ py: 2, px: 2.5 }}>
                <ListItemText primary={item.label} secondary={item.desc} primaryTypographyProps={{ fontWeight: 500 }} secondaryTypographyProps={{ variant: "caption" }} />
              </ListItemButton>
              {i < arr.length - 1 ? <Divider /> : null}
            </Box>
          ))}
        </List>

        <Button
          variant="outlined"
          color="error"
          fullWidth
          sx={{ py: 1.5 }}
          onClick={() => void bffLogout()}
        >
          Sign Out
        </Button>
      </Stack>
    );
  }

  const detailKey: Exclude<Section, "main"> = section === "main" ? "profile" : section;

  return (
    <Stack
      direction="row"
      spacing={3}
      sx={{
        px: { lg: 0 },
        py: { lg: 0 },
        width: "100%",
        maxWidth: { lg: "none" },
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          flex: { lg: "0 0 30%" },
          maxWidth: { lg: 280 },
          minWidth: { lg: 200 },
          width: "100%",
        }}
      >
        <Stack spacing={2} sx={{ position: { lg: "sticky" }, top: { lg: 16 } }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ px: 1 }}>
            <BffUserAvatar picture={identity.picture} name={identity.displayName} email={identity.email} size={48} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={600} noWrap>
                {identity.displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {identity.email || "—"}
              </Typography>
            </Box>
          </Stack>
          <List disablePadding aria-label="Account sections" sx={{ borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "background.paper", overflow: "hidden" }}>
            {navItems.map((item, i, arr) => (
              <Box key={item.id}>
                <ListItemButton
                  selected={detailKey === item.id}
                  onClick={() => setSection(item.id)}
                  sx={{ py: 1.75, px: 2 }}
                >
                  <ListItemText primary={item.label} secondary={item.desc} primaryTypographyProps={{ fontWeight: 500 }} secondaryTypographyProps={{ variant: "caption" }} />
                </ListItemButton>
                {i < arr.length - 1 ? <Divider /> : null}
              </Box>
            ))}
          </List>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ py: 1.25 }}
            onClick={() => void bffLogout()}
          >
            Sign Out
          </Button>
        </Stack>
      </Box>

      <Box sx={{ flex: { lg: "1 1 70%" }, minWidth: 0, width: "100%" }}>
        <Paper variant="outlined" sx={{ p: { lg: 3 }, borderRadius: 2 }}>
          {renderDetailSection(detailKey, goMain, false, identity, loading, profileError)}
        </Paper>
      </Box>
    </Stack>
  );
}
