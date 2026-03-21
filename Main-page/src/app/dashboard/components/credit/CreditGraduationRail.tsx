import { Box, Stack, Typography } from "@mui/material";

const GRADUATION_PATH_ITEMS = [
  "Monthly on-time payments build positive history",
  "Score typically improves in 3–6 months",
  "Automatically graduates to full Credit Line when eligible",
] as const;

/** Desktop right-rail: graduation copy for Credit Builder path */
export function CreditGraduationRail() {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
        Graduation path
      </Typography>
      <Box
        sx={{
          borderRadius: 2,
          p: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack component="ol" spacing={1.25} sx={{ m: 0, pl: 2 }}>
          {GRADUATION_PATH_ITEMS.map((item, i) => (
            <Typography key={i} component="li" variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              {item}
            </Typography>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
