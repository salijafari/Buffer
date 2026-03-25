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
import { ChevronDown } from "lucide-react";
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
        maxWidth: { xs: "100%", lg: "min(1536px, 100%)" },
        mx: "auto",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <Box component="header" sx={{ mb: 3, maxWidth: "48rem" }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: HEADLINE_FONT,
            fontSize: { xs: "2.25rem", md: "2.75rem" },
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: OT.onSurface,
            mb: 2,
          }}
        >
          Support
        </Typography>
        <Typography
          sx={{
            fontFamily: BODY_FONT,
            fontSize: "1.125rem",
            lineHeight: 1.625,
            color: OT.onSurfaceVariant,
          }}
        >
          Get help with payments, connected accounts, autopay, and your Buffer plan.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.55fr) minmax(0, 1fr)" },
          gap: 3,
          alignItems: "start",
          mb: 3,
        }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: OT.cardRadius,
            border: `1px solid ${OT.cardBorder}`,
            bgcolor: OT.surfaceContainerLowest,
            boxShadow: OT.cardShadow,
            minWidth: 0,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.125rem", color: OT.onSurface, mb: 2.5 }}>
              Help Topics
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: 1.5,
              }}
            >
              {HELP_TOPICS.map((topic) => (
                <Card
                  key={topic.title}
                  component={RouterLink}
                  to={topic.to}
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    border: `1px solid ${OT.cardBorder}`,
                    bgcolor: OT.surfaceContainerLow,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                    "&:hover": {
                      borderColor: alpha(OT.primary, 0.45),
                      boxShadow: `0 4px 20px ${alpha(OT.primary, 0.12)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "12px",
                        bgcolor: alpha(OT.primary, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1.25,
                      }}
                    >
                      <MsIcon name={topic.icon} sx={{ fontSize: 22, color: OT.primary }} />
                    </Box>
                    <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "0.9375rem", color: OT.onSurface, mb: 0.5 }}>
                      {topic.title}
                    </Typography>
                    <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.8125rem", lineHeight: 1.45, color: OT.outline }}>
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
            border: `1px solid ${OT.cardBorder}`,
            bgcolor: OT.surfaceContainerLowest,
            boxShadow: OT.cardShadow,
            position: { lg: "sticky" },
            top: { lg: 16 },
            minWidth: 0,
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2.5, md: 3 },
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.125rem", color: OT.onSurface }}>
              Contact Support
            </Typography>
            <Button
              component="a"
              href={chatMailto}
              fullWidth
              variant="contained"
              startIcon={<MsIcon name="chat" sx={{ fontSize: 20, color: "#fff" }} />}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                fontFamily: BODY_FONT,
                py: 1.35,
                bgcolor: OT.primary,
                boxShadow: "none",
                "&:hover": { bgcolor: OT.primaryContainer, boxShadow: "none" },
              }}
            >
              Start Chat
            </Button>
            <Button
              component="a"
              href={messageMailto}
              fullWidth
              variant="outlined"
              startIcon={<MsIcon name="mail" sx={{ fontSize: 20, color: OT.onSurface }} />}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                fontFamily: BODY_FONT,
                py: 1.35,
                borderColor: OT.cardBorder,
                color: OT.onSurface,
                bgcolor: OT.surfaceContainerLow,
                "&:hover": { borderColor: OT.outline, bgcolor: OT.surfaceContainer },
              }}
            >
              Send Message
            </Button>
            <Button
              component="a"
              href={`tel:${SUPPORT_PHONE_TEL}`}
              fullWidth
              variant="outlined"
              startIcon={<MsIcon name="call" sx={{ fontSize: 20, color: OT.onSurface }} />}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                fontFamily: BODY_FONT,
                py: 1.35,
                borderColor: OT.cardBorder,
                color: OT.onSurface,
                bgcolor: OT.surfaceContainerLow,
                "&:hover": { borderColor: OT.outline, bgcolor: OT.surfaceContainer },
              }}
            >
              Call Support
            </Button>
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", color: OT.outline, textAlign: "center", mt: 0 }}>
              Available 24/7 for urgent matters.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: OT.cardRadius,
          border: `1px solid ${OT.cardBorder}`,
          bgcolor: OT.surfaceContainerLowest,
          boxShadow: OT.cardShadow,
          mb: 3,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.125rem", color: OT.onSurface, px: { xs: 2.5, md: 3 }, pt: { xs: 2.5, md: 3 }, pb: 1 }}>
            Common Questions
          </Typography>
          {FAQ_ITEMS.map((item, i) => (
            <Accordion
              key={item.q}
              disableGutters
              elevation={0}
              sx={{
                borderTop: i === 0 ? "none" : `1px solid ${OT.surfaceContainer}`,
                "&:before": { display: "none" },
                px: { xs: 1, md: 2 },
              }}
            >
              <AccordionSummary expandIcon={<ChevronDown size={20} color={OT.outline} />} sx={{ py: 1, px: { xs: 1.5, md: 1 } }}>
                <Typography sx={{ fontFamily: BODY_FONT, fontWeight: 600, fontSize: "0.9375rem", color: OT.onSurface, pr: 1 }}>
                  {item.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 2, px: { xs: 1.5, md: 1 } }}>
                <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", lineHeight: 1.6, color: OT.onSurfaceVariant }}>
                  {item.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      <Box
        sx={{
          borderRadius: OT.cardRadius,
          bgcolor: OT.primary,
          color: "#fff",
          px: { xs: 2.5, md: 4 },
          py: { xs: 2.5, md: 3 },
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          boxShadow: `0 12px 32px ${alpha(OT.primary, 0.25)}`,
        }}
      >
        <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: { xs: "1rem", md: "1.125rem" }, maxWidth: 720 }}>
          We&apos;re here to help you stay on track and make repayment easier to manage.
        </Typography>
        <MsIcon
          name="shield"
          sx={{
            fontSize: 28,
            color: "#fff",
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: alpha("#fff", 0.15),
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        />
      </Box>

      <Box
        component="footer"
        sx={{
          pt: 2,
          pb: 1,
          mt: "auto",
          borderTop: `1px solid ${OT.cardBorder}`,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={3}
        >
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.05em", color: OT.outline, maxWidth: 520 }}>
            © {new Date().getFullYear()} BUFFER FINTECH. MEMBER FDIC. EQUAL HOUSING LENDER.
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
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: OT.outline,
                }}
              >
                {label.toUpperCase()}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
