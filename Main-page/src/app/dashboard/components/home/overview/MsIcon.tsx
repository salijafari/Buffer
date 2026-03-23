import { Box, type BoxProps } from "@mui/material";

/** Material Symbols Outlined — use Google Fonts link in index.html */
export function MsIcon({
  name,
  filled,
  sx,
  ...rest
}: { name: string; filled?: boolean } & Omit<BoxProps, "component" | "children">) {
  return (
    <Box
      component="span"
      className="material-symbols-outlined"
      sx={{
        fontSize: 24,
        lineHeight: 1,
        userSelect: "none",
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
        ...sx,
      }}
      aria-hidden
      {...rest}
    >
      {name}
    </Box>
  );
}
