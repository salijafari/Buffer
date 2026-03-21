import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  Typography,
} from "@mui/material";
import { Bell, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { MOCK_DASHBOARD_NOTIFICATIONS } from "../data/mockDashboard";

export type NotificationRow = {
  id: string;
  title: string;
  body: string;
  createdAtLabel: string;
  href?: string;
  read: boolean;
  dismissed: boolean;
};

function seedRows(): NotificationRow[] {
  return MOCK_DASHBOARD_NOTIFICATIONS.map((n) => ({
    ...n,
    read: false,
    dismissed: false,
  }));
}

export function DashboardNotificationsButton({ size = "medium" }: { size?: "small" | "medium" }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [rows, setRows] = useState<NotificationRow[]>(seedRows);

  const open = Boolean(anchorEl);

  const visible = useMemo(() => rows.filter((r) => !r.dismissed), [rows]);
  const unreadCount = useMemo(() => visible.filter((r) => !r.read).length, [visible]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAllRead = useCallback(() => {
    setRows((prev) => prev.map((r) => (r.dismissed ? r : { ...r, read: true })));
  }, []);

  const dismissOne = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, dismissed: true } : r)));
  }, []);

  const onRowClick = useCallback(
    (id: string, href?: string) => {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, read: true } : r)));
      if (href) {
        void navigate(href);
        handleClose();
      }
    },
    [navigate],
  );

  return (
    <>
      <IconButton
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        size={size}
        color="inherit"
        onClick={handleOpen}
      >
        <Badge color="error" badgeContent={unreadCount > 0 ? unreadCount : 0} invisible={unreadCount === 0} max={99} overlap="circular">
          <Bell size={size === "small" ? 20 : 22} strokeWidth={1.75} />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              width: { xs: "min(100vw - 24px, 380px)", sm: 380 },
              maxHeight: "min(70vh, 480px)",
              mt: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
          </Typography>
          {unreadCount > 0 ? (
            <Button size="small" onClick={markAllRead}>
              Mark all read
            </Button>
          ) : null}
        </Box>
        <Box sx={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
          {visible.length === 0 ? (
            <Box sx={{ px: 2, py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No notifications right now.
              </Typography>
            </Box>
          ) : (
            <List disablePadding aria-label="Notification list">
              {visible.map((n, i) => (
                <Box key={n.id}>
                  {i > 0 ? <Divider component="li" /> : null}
                  <ListItem
                    disablePadding
                    secondaryAction={
                      <IconButton edge="end" size="small" aria-label={`Dismiss ${n.title}`} onClick={(e) => dismissOne(n.id, e)} sx={{ mr: 0.5 }}>
                        <X size={16} />
                      </IconButton>
                    }
                    sx={{ alignItems: "flex-start", pr: 5 }}
                  >
                    <ListItemButton
                      onClick={() => onRowClick(n.id, n.href)}
                      sx={{
                        alignItems: "flex-start",
                        py: 1.5,
                        bgcolor: n.read ? "transparent" : "action.hover",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography component="span" variant="subtitle2" fontWeight={n.read ? 600 : 700}>
                            {n.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.secondary" display="block" sx={{ mt: 0.5, whiteSpace: "normal" }}>
                              {n.body}
                            </Typography>
                            <Typography component="span" variant="caption" color="text.disabled" display="block" sx={{ mt: 0.75 }}>
                              {n.createdAtLabel}
                              {n.href ? " · Tap to open" : ""}
                            </Typography>
                          </>
                        }
                        secondaryTypographyProps={{ component: "div" }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
