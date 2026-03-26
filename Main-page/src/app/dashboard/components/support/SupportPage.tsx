import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router";
import { BODY_FONT, HEADLINE_FONT, OT } from "../home/overview/overviewTokens";
import { MsIcon } from "../home/overview/MsIcon";
import { FAQ_ITEMS, HELP_TOPICS, SUPPORT_EMAIL, SUPPORT_PHONE_TEL } from "./supportContent";

const chatMailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Buffer — Live chat request")}`;
const messageMailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Buffer — Support message")}`;

export function SupportPage() {
  return (
    <Stack
      component="main"
      role="main"
      aria-label="Support"
      spacing={0}
      sx={{
        px: { xs: 2, lg: 0 },
        py: { xs: 2.5, lg: 0 },
        maxWidth: { xs: "100%", lg: "min(1280px, 100%)" },
        mx: "auto",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        gap: { xs: 4, lg: 6 },
      }}
    >
      <Box component="header" sx={{ maxWidth: "42rem" }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: HEADLINE_FONT,
            fontSize: { xs: "2.5rem", md: "3rem" },
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: OT.onSurface,
            mb: 2,
          }}
        >
          Support
        </Typography>
        <Typography sx={{ fontFamily: BODY_FONT, fontSize: { xs: "1.125rem", md: "1.25rem" }, fontWeight: 500, lineHeight: 1.6, color: OT.onSurfaceVariant }}>
          Get help with payments, connected accounts, autopay, and your Buffer plan.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 8fr) minmax(0, 4fr)" },
          gap: { xs: 3, lg: 4 },
          alignItems: "stretch",
        }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: OT.cardRadius,
            bgcolor: OT.surfaceContainerLowest,
            boxShadow: OT.cardShadow,
            minWidth: 0,
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: { xs: "1.375rem", md: "1.5rem" }, letterSpacing: "-0.02em", color: OT.onSurface, mb: 4 }}>
              Help Topics
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              {HELP_TOPICS.map((topic) => (
                <Card
                  key={topic.title}
                  component={RouterLink}
                  to={topic.to}
                  elevation={0}
                  sx={{
                    borderRadius: OT.cardRadius,
                    bgcolor: OT.surfaceContainerLow,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": { transform: "scale(1.02)", boxShadow: OT.cardShadowHover },
                    "&:active": { transform: "scale(0.95)" },
                  }}
                >
                  <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                    <MsIcon name={topic.icon} sx={{ fontSize: 40, color: OT.primary, mb: 2 }} />
                    <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1rem", color: OT.onSurface, mb: 0.5 }}>
                      {topic.title}
                    </Typography>
                    <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", lineHeight: 1.45, color: OT.onSurfaceVariant }}>
                      {topic.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: OT.cardRadius,
            bgcolor: OT.surfaceContainerLowest,
            boxShadow: OT.cardShadow,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 }, display: "flex", flexDirection: "column", flex: 1, gap: 2 }}>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: { xs: "1.375rem", md: "1.5rem" }, letterSpacing: "-0.02em", color: OT.onSurface, mb: 2 }}>
              Contact Support
            </Typography>
            <Stack spacing={2} sx={{ flex: 1 }}>
              <Button
                component="a"
                href={chatMailto}
                fullWidth
                startIcon={<MsIcon name="chat" filled sx={{ fontSize: 22, color: "#fff" }} />}
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontFamily: BODY_FONT,
                  py: 2,
                  color: "#fff",
                  boxShadow: `0 8px 24px ${alpha(OT.primary, 0.2)}`,
                  background: `linear-gradient(135deg, ${OT.primary} 0%, ${OT.primaryContainer} 100%)`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${OT.primaryContainer} 0%, ${OT.primary} 100%)`,
                    boxShadow: `0 10px 28px ${alpha(OT.primary, 0.3)}`,
                    transform: "scale(1.02)",
                  },
                  "&:active": { transform: "scale(0.95)" },
                }}
              >
                Start Chat
              </Button>
              <Button
                component="a"
                href={messageMailto}
                fullWidth
                startIcon={<MsIcon name="mail" sx={{ fontSize: 22, color: OT.onSurface }} />}
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontFamily: BODY_FONT,
                  py: 2,
                  border: "none",
                  bgcolor: OT.surfaceContainerHigh,
                  color: OT.onSurface,
                  transition: "transform 0.2s ease, background-color 0.2s ease",
                  "&:hover": { bgcolor: OT.surfaceContainerHighest, transform: "scale(1.02)" },
                  "&:active": { transform: "scale(0.95)" },
                }}
              >
                Send Message
              </Button>
              <Button
                component="a"
                href={`tel:${SUPPORT_PHONE_TEL}`}
                fullWidth
                startIcon={<MsIcon name="call" sx={{ fontSize: 22, color: OT.onSurface }} />}
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontFamily: BODY_FONT,
                  py: 2,
                  border: "none",
                  bgcolor: OT.surfaceContainerHigh,
                  color: OT.onSurface,
                  transition: "transform 0.2s ease, background-color 0.2s ease",
                  "&:hover": { bgcolor: OT.surfaceContainerHighest, transform: "scale(1.02)" },
                  "&:active": { transform: "scale(0.95)" },
                }}
              >
                Call Support
              </Button>
            </Stack>
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", fontWeight: 500, color: OT.onSurfaceVariant, textAlign: "center", mt: 2 }}>
              Available 24/7 for urgent matters.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: OT.cardRadius,
          bgcolor: OT.surfaceContainerLowest,
          boxShadow: OT.cardShadow,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 }, "&:last-child": { pb: { xs: 3, md: 5 } } }}>
          <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: { xs: "1.75rem", md: "1.875rem" }, letterSpacing: "-0.02em", color: OT.onSurface, mb: 5 }}>
            Common Questions
          </Typography>
          {FAQ_ITEMS.map((item, i) => (
            <Accordion
              key={item.q}
              disableGutters
              elevation={0}
              sx={{
                borderTop: i === 0 ? "none" : `1px solid ${OT.surfaceContainerHigh}`,
                "&:before": { display: "none" },
                px: 0,
              }}
            >
              <AccordionSummary
                expandIcon={<MsIcon name="expand_more" sx={{ fontSize: 24, color: OT.outline }} />}
                sx={{
                  py: 2,
                  px: 0,
                  "& .MuiAccordionSummary-content": { my: 0 },
                  "&:hover .MuiAccordionSummary-expandIconWrapper": { color: OT.primary },
                }}
              >
                <Typography sx={{ fontFamily: BODY_FONT, fontWeight: 600, fontSize: "1.125rem", color: OT.onSurface, pr: 2 }}>
                  {item.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 3, px: 0 }}>
                <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.9375rem", lineHeight: 1.65, color: OT.onSurfaceVariant }}>
                  {item.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: OT.cardRadius,
          bgcolor: OT.primaryContainer,
          color: OT.onPrimaryContainer,
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 6 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          gap: 4,
          boxShadow: `0 16px 48px ${alpha(OT.primary, 0.1)}`,
        }}
      >
        <Box sx={{ position: "absolute", top: -64, right: -64, width: 256, height: 256, borderRadius: "50%", bgcolor: alpha(OT.primary, 0.2), filter: "blur(40px)" }} />
        <Box sx={{ position: "absolute", bottom: -48, left: -48, width: 192, height: 192, borderRadius: "50%", bgcolor: alpha("#3f6560", 0.12), filter: "blur(32px)" }} />
        <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: { xs: "1.5rem", md: "2.25rem" }, lineHeight: 1.25, flex: 1, position: "relative", zIndex: 1 }}>
          We&apos;re here to help you stay on track and make repayment easier to manage.
        </Typography>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: OT.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          <MsIcon name="security" filled sx={{ fontSize: 36, color: "#fff" }} />
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          pt: 3,
          pb: 2,
          mt: 2,
          borderTop: `1px solid ${alpha(OT.outlineVariant, 0.35)}`,
          bgcolor: OT.surfaceContainerLow,
          mx: { xs: -2, lg: 0 },
          px: { xs: 2, lg: 0 },
          py: 3,
          borderRadius: { lg: 0 },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          spacing={3}
        >
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: OT.outline }}>
            © {new Date().getFullYear()} Buffer Fintech. Member FDIC. Equal Housing Lender.
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={2} useFlexGap>
            {["Privacy Policy", "Terms of Service", "Cookie Policy", "Security", "Accessibility"].map((label) => (
              <Link
                key={label}
                href="#"
                onClick={(e) => e.preventDefault()}
                underline="hover"
                sx={{
                  fontFamily: BODY_FONT,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: OT.outline,
                  "&:hover": { color: OT.teal600 },
                }}
              >
                {label}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
