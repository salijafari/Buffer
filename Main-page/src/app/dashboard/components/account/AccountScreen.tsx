import { useState, type ReactNode } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useClerk } from "@clerk/react";
import { ChevronLeft } from "lucide-react";

type Section = "main" | "profile" | "notifications" | "security" | "subscription" | "support";

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton onClick={onClick} aria-label="Go back" size="small" sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
      <ChevronLeft size={20} />
    </IconButton>
  );
}

function ProfileSection({ onBack }: { onBack: () => void }) {
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Chen");
  const [email, setEmail] = useState("alex.chen@example.com");

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <BackButton onClick={onBack} />
        <Typography variant="h6" fontWeight={700}>
          Profile
        </Typography>
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth size="small" />
        <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth size="small" />
      </Stack>
      <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth size="small" />
    </Stack>
  );
}

function NotificationsSection({ onBack }: { onBack: () => void }) {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  return (
    <Stack spacing={2.5}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <BackButton onClick={onBack} />
        <Typography variant="h6" fontWeight={700}>
          Notifications
        </Typography>
      </Stack>
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

function SecuritySection({ onBack }: { onBack: () => void }) {
  return (
    <Stack spacing={2.5}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <BackButton onClick={onBack} />
        <Typography variant="h6" fontWeight={700}>
          Security
        </Typography>
      </Stack>
      <Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Typography variant="body2" color="text.secondary">
          Security settings are ready for integration.
        </Typography>
      </Box>
    </Stack>
  );
}

function SubscriptionSection({ onBack }: { onBack: () => void }) {
  return (
    <Stack spacing={2.5}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <BackButton onClick={onBack} />
        <Typography variant="h6" fontWeight={700}>
          Subscription
        </Typography>
      </Stack>
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

function SupportSection({ onBack }: { onBack: () => void }) {
  return (
    <Stack spacing={2.5}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <BackButton onClick={onBack} />
        <Typography variant="h6" fontWeight={700}>
          Help &amp; Support
        </Typography>
      </Stack>
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

export function AccountScreen() {
  const [section, setSection] = useState<Section>("main");
  const { signOut } = useClerk();

  if (section === "profile") return wrap(<ProfileSection onBack={() => setSection("main")} />);
  if (section === "notifications") return wrap(<NotificationsSection onBack={() => setSection("main")} />);
  if (section === "security") return wrap(<SecuritySection onBack={() => setSection("main")} />);
  if (section === "subscription") return wrap(<SubscriptionSection onBack={() => setSection("main")} />);
  if (section === "support") return wrap(<SupportSection onBack={() => setSection("main")} />);

  return (
    <Stack spacing={2.5} sx={{ px: 2, py: 2.5, maxWidth: 672, mx: "auto", width: "100%" }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main", color: "primary.contrastText", fontSize: "1.25rem", fontWeight: 700 }}>
          A
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            Alex Chen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            alex.chen@example.com
          </Typography>
        </Box>
      </Stack>

      <List disablePadding aria-label="Account sections" sx={{ borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "background.paper", overflow: "hidden" }}>
        {[
          { id: "profile" as const, label: "Profile", desc: "Name, email" },
          { id: "notifications" as const, label: "Notifications", desc: "Push, email, SMS" },
          { id: "security" as const, label: "Security", desc: "Password, passkey, 2FA" },
          { id: "subscription" as const, label: "Subscription", desc: "Plan, billing, PAD" },
          { id: "support" as const, label: "Help & Support", desc: "FAQ, contact" },
        ].map((item, i, arr) => (
          <Box key={item.id}>
            <ListItemButton onClick={() => setSection(item.id)} sx={{ py: 2, px: 2.5 }}>
              <ListItemText primary={item.label} secondary={item.desc} primaryTypographyProps={{ fontWeight: 500 }} secondaryTypographyProps={{ variant: "caption" }} />
            </ListItemButton>
            {i < arr.length - 1 ? <Divider /> : null}
          </Box>
        ))}
      </List>

      <Button variant="outlined" color="error" fullWidth sx={{ py: 1.5 }} onClick={() => void signOut()}>
        Sign Out
      </Button>
    </Stack>
  );
}
