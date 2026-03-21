import { Avatar } from "@mui/material";

/** Match account header / Auth0-friendly initials */
export function bffAvatarInitials(name: string | null | undefined, email: string | null | undefined): string {
  const n = (name ?? "").trim();
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  if (parts.length === 1 && parts[0]!.length >= 2) return parts[0]!.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0]![0]!.toUpperCase();
  const e = (email ?? "").trim();
  if (e.length >= 1) return e[0]!.toUpperCase();
  return "?";
}

export type BffUserAvatarProps = {
  picture: string | null | undefined;
  name: string | null | undefined;
  email: string | null | undefined;
  size?: number;
};

/**
 * Avatar from Auth0 `picture` when present; otherwise initials from name/email.
 * Uses `referrerPolicy="no-referrer"` so provider CDNs (Google, Gravatar, Auth0) don’t block the image.
 */
export function BffUserAvatar({ picture, name, email, size = 36 }: BffUserAvatarProps) {
  const fontSize = size >= 52 ? "1.25rem" : size >= 40 ? "1rem" : "0.875rem";
  if (picture) {
    return (
      <Avatar
        src={picture}
        alt=""
        imgProps={{ referrerPolicy: "no-referrer" }}
        sx={{ width: size, height: size }}
      />
    );
  }
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        fontSize,
        fontWeight: 700,
      }}
    >
      {bffAvatarInitials(name, email)}
    </Avatar>
  );
}
