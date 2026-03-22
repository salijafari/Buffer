import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { SliderValueLabelProps } from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import { ChevronLeft, Check, MoreHorizontal } from "lucide-react";
import { FaLinkedin } from "react-icons/fa6";
import {
  SiAppstore,
  SiFacebook,
  SiGoogle,
  SiInstagram,
  SiReddit,
  SiTiktok,
  SiYoutube,
} from "react-icons/si";
import { MaterialShell } from "../material/MaterialShell";
import { PlaidConnectButton } from "../dashboard/components/plaid/PlaidConnectButton";
import {
  CANADIAN_PROVINCES,
  type AcquisitionSource,
  type InterestSelection,
  type UserOnboardingProfile,
} from "../lib/onboardingProfile";
import { postOnboardingComplete, saveOnboardingProfile } from "../lib/onboardingApi";

type StepId = 1 | 2 | 3 | 4 | 5 | 6;

const TOTAL_STEPS = 6;

/** Canadian / general FICO-style range used in validation and persist. */
const CREDIT_SCORE_MIN = 300;
const CREDIT_SCORE_MAX = 900;
const CREDIT_SCORE_DEFAULT = 600;

function ValueLabelComponent(props: SliderValueLabelProps) {
  const { children, value } = props;
  return (
    <Tooltip enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
}

const iOSBoxShadow =
  "0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)";

/** Material-style slider; track/thumb accent is black per product request. */
const CreditScoreSlider = styled(Slider)(({ theme }) => ({
  color: "#000000",
  height: 5,
  padding: "15px 0",
  "& .MuiSlider-thumb": {
    height: 20,
    width: 20,
    backgroundColor: "#fff",
    boxShadow: "0 0 2px 0px rgba(0, 0, 0, 0.1)",
    "&:focus, &:hover, &.Mui-active": {
      boxShadow: "0px 0px 3px 1px rgba(0, 0, 0, 0.1)",
      "@media (hover: none)": {
        boxShadow: iOSBoxShadow,
      },
    },
    "&:before": {
      boxShadow:
        "0px 0px 1px 0px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.14), 0px 0px 1px 0px rgba(0,0,0,0.12)",
    },
  },
  "& .MuiSlider-valueLabel": {
    fontSize: 12,
    fontWeight: "normal",
    top: -6,
    backgroundColor: "unset",
    color: theme.palette.text.primary,
    "&::before": {
      display: "none",
    },
    "& *": {
      background: "transparent",
      color: "#000",
      ...theme.applyStyles?.("dark", {
        color: "#fff",
      }),
    },
  },
  "& .MuiSlider-track": {
    border: "none",
    height: 5,
  },
  "& .MuiSlider-rail": {
    opacity: 0.5,
    boxShadow: "inset 0px 0px 4px -2px #000",
    backgroundColor: "#d0d0d0",
  },
  ...theme.applyStyles?.("dark", {
    color: "#ffffff",
    "& .MuiSlider-rail": {
      backgroundColor: "#555",
    },
  }),
}));

const INTEREST_OPTIONS: { value: InterestSelection; label: string }[] = [
  { value: "refinance_credit_card_balance", label: "Refinance credit card balance for lower interest rate" },
  { value: "build_credit_faster", label: "Building credit faster" },
  { value: "ai_debt_management_recommendation", label: "Get AI recommendation for my debt management" },
  { value: "none_of_the_above", label: "None of the above" },
];

const ACQUISITION_OPTIONS: { value: AcquisitionSource; label: string }[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "app_store", label: "App Store" },
  { value: "google", label: "Google" },
  { value: "reddit", label: "Reddit" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "other", label: "Other" },
];

/** Brand marks via react-icons (Simple Icons). "Other" uses a neutral lucide icon. */
function AcquisitionOptionIcon({ source, size = 28 }: { source: AcquisitionSource; size?: number }) {
  const common = { size, "aria-hidden": true as const };
  if (source === "other") {
    return <MoreHorizontal size={size} strokeWidth={2.25} color="#6B7280" aria-hidden />;
  }
  switch (source) {
    case "facebook":
      return <SiFacebook {...common} color="#1877F2" />;
    case "instagram":
      return <SiInstagram {...common} color="#E4405F" />;
    case "tiktok":
      return <SiTiktok {...common} color="#000000" />;
    case "app_store":
      return <SiAppstore {...common} color="#0D96F6" />;
    case "google":
      return <SiGoogle {...common} />;
    case "reddit":
      return <SiReddit {...common} color="#FF4500" />;
    case "youtube":
      return <SiYoutube {...common} color="#FF0000" />;
    case "linkedin":
      // Simple Icons dropped LinkedIn in newer sets; Font Awesome brand mark still ships in react-icons.
      return <FaLinkedin {...common} color="#0A66C2" />;
    default:
      return null;
  }
}

type OnboardingDraft = {
  interest_selection: InterestSelection | null;
  interest_custom_text: string;
  province_code: string;
  province_name: string;
  credit_score_input: string;
  annual_pre_tax_income_input: string;
  heard_about_us: AcquisitionSource | null;
  heard_about_us_other: string;
};

const DEFAULT_DRAFT: OnboardingDraft = {
  interest_selection: null,
  interest_custom_text: "",
  province_code: "",
  province_name: "",
  credit_score_input: "",
  annual_pre_tax_income_input: "",
  heard_about_us: null,
  heard_about_us_other: "",
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-CA").format(value);
}

function parseOptionalNumber(value: string): number | null {
  const cleaned = digitsOnly(value);
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapStep(value: number): StepId {
  if (value <= 1) return 1;
  if (value === 2) return 2;
  if (value === 3) return 3;
  if (value === 4) return 4;
  if (value === 5) return 5;
  return 6;
}

function draftFromProfile(profile: UserOnboardingProfile): OnboardingDraft {
  return {
    interest_selection: profile.interest_selection,
    interest_custom_text: profile.interest_custom_text,
    province_code: profile.province_code,
    province_name: profile.province_name,
    credit_score_input: profile.credit_score ? String(profile.credit_score) : "",
    annual_pre_tax_income_input: profile.annual_pre_tax_income ? formatNumber(profile.annual_pre_tax_income) : "",
    heard_about_us: profile.heard_about_us,
    heard_about_us_other: profile.heard_about_us_other,
  };
}

export type OnboardingFlowProps = {
  profile: UserOnboardingProfile | null;
  onRetryBootstrap: () => void;
  onCompletedNavigate?: () => void;
  /** From bootstrap API failure (shown when profile is null). */
  bootstrapError?: string;
};

function OnboardingFlowContent({
  profile,
  onRetryBootstrap,
  onCompletedNavigate,
  bootstrapError,
}: OnboardingFlowProps) {
  const navigate = useNavigate();

  const [step, setStep] = useState<StepId>(() => (profile ? mapStep(profile.onboarding_step || 1) : 1));
  const [draft, setDraft] = useState<OnboardingDraft>(() => (profile ? draftFromProfile(profile) : DEFAULT_DRAFT));
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<string>("");

  /** Slider needs a numeric value in range; seed a sensible default when landing on step 3. */
  useEffect(() => {
    if (step !== 3) return;
    setDraft((prev) => {
      const score = parseOptionalNumber(prev.credit_score_input);
      if (
        prev.credit_score_input !== "" &&
        score !== null &&
        score >= CREDIT_SCORE_MIN &&
        score <= CREDIT_SCORE_MAX
      ) {
        return prev;
      }
      return { ...prev, credit_score_input: String(CREDIT_SCORE_DEFAULT) };
    });
  }, [step]);

  const canContinue = useMemo(() => {
    if (step === 1) {
      if (!draft.interest_selection) return false;
      if (draft.interest_selection === "none_of_the_above") {
        return draft.interest_custom_text.trim().length > 0;
      }
      return true;
    }

    if (step === 2) {
      return CANADIAN_PROVINCES.some((p) => p.code === draft.province_code);
    }

    if (step === 3) {
      const score = parseOptionalNumber(draft.credit_score_input);
      return score !== null && score >= CREDIT_SCORE_MIN && score <= CREDIT_SCORE_MAX;
    }

    if (step === 4) {
      const income = parseOptionalNumber(draft.annual_pre_tax_income_input);
      return income !== null && income > 0;
    }

    if (step === 5) {
      if (!draft.heard_about_us) return false;
      if (draft.heard_about_us === "other") return draft.heard_about_us_other.trim().length > 0;
      return true;
    }

    if (step === 6) {
      return true;
    }

    return false;
  }, [step, draft]);

  const subtitle = useMemo(() => {
    if (step === 1) return "Select one option";
    if (step === 2) return "Choose your Canadian province or territory";
    if (step === 3) return "Your response is only used to offer the most relevant products.";
    if (step === 4) return "Your response is only used to offer the most relevant products.";
    if (step === 5) {
      return "Select one option. Next, you can connect your bank with Plaid (or skip and do it later).";
    }
    return "Securely link your accounts with Plaid, or skip and connect later from your dashboard.";
  }, [step]);

  async function persist(forStep: StepId) {
    const selectedProvince = CANADIAN_PROVINCES.find((p) => p.code === draft.province_code);
    const payload = {
      onboarding_step: forStep,
      interest_selection: draft.interest_selection,
      interest_custom_text: draft.interest_selection === "none_of_the_above" ? draft.interest_custom_text.trim() : "",
      province_code: selectedProvince?.code ?? "",
      province_name: selectedProvince?.name ?? "",
      credit_score: parseOptionalNumber(draft.credit_score_input),
      annual_pre_tax_income: parseOptionalNumber(draft.annual_pre_tax_income_input),
      heard_about_us: draft.heard_about_us,
      heard_about_us_other: draft.heard_about_us === "other" ? draft.heard_about_us_other.trim() : "",
    };

    await saveOnboardingProfile(payload);
  }

  async function completeOnboardingAndGoDashboard() {
    await persist(6);
    await postOnboardingComplete();
    onCompletedNavigate?.();
    navigate("/dashboard", { replace: true });
  }

  async function onNext() {
    if (saving || !canContinue) return;
    setFieldError("");

    if (step === 3) {
      const score = parseOptionalNumber(draft.credit_score_input);
      if (score === null || score < CREDIT_SCORE_MIN || score > CREDIT_SCORE_MAX) {
        setFieldError(`Enter a credit score between ${CREDIT_SCORE_MIN} and ${CREDIT_SCORE_MAX}.`);
        return;
      }
    }

    setSaving(true);
    try {
      if (step < 6) {
        const nextStep = (step + 1) as StepId;
        await persist(nextStep);
        setStep(nextStep);
      } else {
        await completeOnboardingAndGoDashboard();
      }
    } catch {
      setFieldError("We couldn't save your progress. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function onSkipPlaid() {
    if (saving) return;
    setFieldError("");
    setSaving(true);
    try {
      await completeOnboardingAndGoDashboard();
    } catch {
      setFieldError("We couldn't finish onboarding. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function onPlaidLinked() {
    if (saving) return;
    setFieldError("");
    setSaving(true);
    try {
      await completeOnboardingAndGoDashboard();
    } catch {
      setFieldError("Bank linked, but we couldn't finish setup. Try Continue from the dashboard.");
    } finally {
      setSaving(false);
    }
  }

  function onBack() {
    if (saving) return;
    setFieldError("");
    setStep((current) => (current > 1 ? ((current - 1) as StepId) : current));
  }

  if (!profile) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "#F3F4F6", px: 2 }}>
        <Paper elevation={0} sx={{ p: 3, maxWidth: 520, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
            Can&apos;t load your profile
          </Typography>
          {bootstrapError ? (
            <Paper
              variant="outlined"
              sx={{ p: 1.5, mb: 2, bgcolor: "grey.50", borderColor: "divider", wordBreak: "break-word" }}
            >
              <Typography component="pre" sx={{ m: 0, fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "pre-wrap" }}>
                {bootstrapError}
              </Typography>
            </Paper>
          ) : null}
          <Typography sx={{ color: "text.secondary", mb: 2 }}>
            Common causes: API not running, <strong>DATABASE_URL</strong> missing or migrations not applied, BFF session lost (use{" "}
            <strong>1 Railway replica</strong> with in-memory sessions, or Redis later), or <strong>401</strong> after login (Auth0
            refresh token / env). Dev: run <Box component="span" sx={{ fontFamily: "monospace" }}>npm run dev:api</Box> on port 3000
            with Vite proxying <Box component="span" sx={{ fontFamily: "monospace" }}>/api</Box>.
          </Typography>
          <Button variant="contained" onClick={onRetryBootstrap} sx={{ textTransform: "none" }}>
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F3F4F6", display: "flex", justifyContent: "center", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 5 } }}>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: { xs: 560, md: 760, lg: 900 },
          minHeight: { xs: "calc(100vh - 16px)", sm: 760, md: 700 },
          borderRadius: { xs: 4, md: 5 },
          bgcolor: "#F3F4F6",
          p: { xs: 2, sm: 3, md: 4 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ pt: 0.5 }}>
          <Button
            variant="text"
            onClick={onBack}
            disabled={step === 1 || saving}
            sx={{ minWidth: 32, p: 0.25, color: "#1F2937" }}
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </Button>

          <Stack direction="row" spacing={0.75} sx={{ flex: 1 }} aria-label={`Onboarding progress, step ${step} of ${TOTAL_STEPS}`}>
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
              const active = index + 1 <= step;
              return (
                <Box
                  key={index}
                  sx={{
                    height: 5,
                    borderRadius: 999,
                    flex: 1,
                    bgcolor: active ? "#111827" : "#D1D5DB",
                  }}
                />
              );
            })}
          </Stack>

          <Typography
            component="span"
            variant="caption"
            sx={{ color: "#6B7280", fontWeight: 700, minWidth: "fit-content", flexShrink: 0 }}
          >
            {step}/{TOTAL_STEPS}
          </Typography>
        </Stack>

        <Box sx={{ pt: { xs: 1.5, sm: 2 }, pb: 0.5 }}>
          <Typography variant="h4" sx={{ fontSize: { xs: "2rem", sm: "2.2rem" }, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", mb: 1.25 }}>
            {step === 1 && "What interests you most?"}
            {step === 2 && "What's your province of residence?"}
            {step === 3 && "What's your credit score?"}
            {step === 4 && "What's your annual pre-tax income?"}
            {step === 5 && "How did you hear about us?"}
            {step === 6 && "Connect your bank or credit card"}
          </Typography>
          <Typography sx={{ color: "#6B7280", fontSize: { xs: "1rem", sm: "1.06rem" } }}>{subtitle}</Typography>
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: { xs: 380, sm: 420, md: 440 } }}>
          <Box>
            {step === 1 && (
              <Stack spacing={1.25}>
                {INTEREST_OPTIONS.map((option) => {
                  const selected = draft.interest_selection === option.value;
                  return (
                    <SelectableRow
                      key={option.value}
                      selected={selected}
                      onClick={() => {
                        setDraft((prev) => ({ ...prev, interest_selection: option.value }));
                        setFieldError("");
                      }}
                      label={option.label}
                    />
                  );
                })}

                {draft.interest_selection === "none_of_the_above" ? (
                  <TextField
                    value={draft.interest_custom_text}
                    onChange={(e) => setDraft((prev) => ({ ...prev, interest_custom_text: e.target.value.slice(0, 120) }))}
                    placeholder="Tell us what you're looking for"
                    fullWidth
                    size="small"
                    sx={{
                      mt: 0.5,
                      "& .MuiOutlinedInput-root": { bgcolor: "#FFFFFF", borderRadius: 2 },
                    }}
                  />
                ) : null}
              </Stack>
            )}

            {step === 2 && (
              <FormControl fullWidth>
                <Select
                  value={draft.province_code}
                  displayEmpty
                  onChange={(e) => {
                    const province = CANADIAN_PROVINCES.find((p) => p.code === String(e.target.value));
                    setDraft((prev) => ({
                      ...prev,
                      province_code: province?.code ?? "",
                      province_name: province?.name ?? "",
                    }));
                    setFieldError("");
                  }}
                  sx={{ bgcolor: "#FFFFFF", borderRadius: 2, minHeight: 56 }}
                >
                  <MenuItem value="" disabled>
                    Select province or territory
                  </MenuItem>
                  {CANADIAN_PROVINCES.map((province) => (
                    <MenuItem key={province.code} value={province.code}>
                      {province.code} - {province.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {step === 3 && (
              <Box sx={{ px: { xs: 0.5, sm: 1 }, pt: 0.5 }}>
                <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: "#111827", mb: 0.5 }}>
                  {parseOptionalNumber(draft.credit_score_input) ?? CREDIT_SCORE_DEFAULT}
                </Typography>
                <Typography sx={{ color: "#6B7280", fontSize: "0.9rem", mb: 2 }}>
                  Drag to set your approximate score ({CREDIT_SCORE_MIN}–{CREDIT_SCORE_MAX}).
                </Typography>
                <CreditScoreSlider
                  aria-label="Credit score"
                  value={
                    Math.min(
                      CREDIT_SCORE_MAX,
                      Math.max(
                        CREDIT_SCORE_MIN,
                        parseOptionalNumber(draft.credit_score_input) ?? CREDIT_SCORE_DEFAULT,
                      ),
                    )
                  }
                  min={CREDIT_SCORE_MIN}
                  max={CREDIT_SCORE_MAX}
                  step={1}
                  valueLabelDisplay="on"
                  slots={{ valueLabel: ValueLabelComponent }}
                  onChange={(_, value) => {
                    const n = Array.isArray(value) ? value[0] : value;
                    const clamped = Math.min(
                      CREDIT_SCORE_MAX,
                      Math.max(CREDIT_SCORE_MIN, Math.round(Number(n))),
                    );
                    setDraft((prev) => ({ ...prev, credit_score_input: String(clamped) }));
                    setFieldError("");
                  }}
                />
                <Stack direction="row" justifyContent="space-between" sx={{ mt: -0.5 }}>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    {CREDIT_SCORE_MIN}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    {CREDIT_SCORE_MAX}
                  </Typography>
                </Stack>
              </Box>
            )}

            {step === 4 && (
              <TextField
                value={draft.annual_pre_tax_income_input}
                onChange={(e) => {
                  const raw = digitsOnly(e.target.value).slice(0, 8);
                  setDraft((prev) => ({
                    ...prev,
                    annual_pre_tax_income_input: raw ? formatNumber(Number(raw)) : "",
                  }));
                  setFieldError("");
                }}
                placeholder="For example: $100,000"
                fullWidth
                inputProps={{ inputMode: "numeric" }}
                sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#FFFFFF", borderRadius: 2 } }}
              />
            )}

            {step === 5 && (
              <Stack spacing={1.25}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(3, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
                    gap: 1.25,
                  }}
                >
                  {ACQUISITION_OPTIONS.map((option) => {
                    const selected = draft.heard_about_us === option.value;
                    return (
                      <Paper
                        key={option.value}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setDraft((prev) => ({ ...prev, heard_about_us: option.value }));
                          setFieldError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setDraft((prev) => ({ ...prev, heard_about_us: option.value }));
                            setFieldError("");
                          }
                        }}
                        elevation={0}
                        sx={{
                          p: { xs: 1.25, sm: 1.5 },
                          minHeight: { xs: 108, sm: 118 },
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: selected ? "#0284C7" : "#E5E7EB",
                          bgcolor: selected ? "rgba(2,132,199,0.08)" : "#EEF0F2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ width: "100%" }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minHeight: 32,
                              flexShrink: 0,
                            }}
                          >
                            <AcquisitionOptionIcon source={option.value} size={option.value === "other" ? 26 : 30} />
                          </Box>
                          <Typography
                            sx={{
                              fontSize: { xs: "0.8rem", sm: "0.9rem" },
                              color: "#1F2937",
                              fontWeight: 600,
                              lineHeight: 1.2,
                              px: 0.25,
                            }}
                          >
                            {option.label}
                          </Typography>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Box>

                {draft.heard_about_us === "other" ? (
                  <TextField
                    value={draft.heard_about_us_other}
                    onChange={(e) => setDraft((prev) => ({ ...prev, heard_about_us_other: e.target.value.slice(0, 120) }))}
                    placeholder="Please tell us"
                    fullWidth
                    size="small"
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#FFFFFF", borderRadius: 2 } }}
                  />
                ) : null}
              </Stack>
            )}

            {step === 6 && (
              <Stack spacing={2.5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 2,
                    border: "1px solid #E5E7EB",
                    bgcolor: "#FFFFFF",
                  }}
                >
                  <Typography sx={{ color: "#374151", fontSize: "0.95rem", lineHeight: 1.55, mb: 2 }}>
                    Link your accounts with <strong>Plaid</strong> to see balances, APRs, and a personalized payoff plan. Your credentials are never stored on our
                    servers.
                  </Typography>
                  <PlaidConnectButton
                    variant="contained"
                    fullWidth
                    disabled={saving}
                    onConnected={() => void onPlaidLinked()}
                    sx={{
                      minHeight: 52,
                      borderRadius: 2,
                      fontSize: "1.05rem",
                      textTransform: "none",
                      bgcolor: "#0E2430",
                      color: "#FFFFFF",
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#0B1D27", color: "#FFFFFF", boxShadow: "none" },
                    }}
                  >
                    Connect bank or credit card
                  </PlaidConnectButton>
                  {saving ? (
                    <Typography variant="caption" sx={{ display: "block", mt: 1.5, color: "#6B7280", textAlign: "center" }}>
                      Finishing setup…
                    </Typography>
                  ) : null}
                </Paper>
              </Stack>
            )}

            {fieldError ? (
              <Typography sx={{ mt: 1.25, color: "error.main", fontSize: "0.9rem" }}>{fieldError}</Typography>
            ) : null}
          </Box>

          <Box sx={{ pt: 3, pb: { xs: 1, md: 0 } }}>
            {step === 6 ? (
              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                  <Button
                    variant="text"
                    onClick={() => void onSkipPlaid()}
                    disabled={saving}
                    sx={{
                      textTransform: "none",
                      color: "#6B7280",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                    }}
                  >
                    Skip for now
                  </Button>
                </Box>
              </Stack>
            ) : (
              <Button
                fullWidth
                variant="contained"
                onClick={() => void onNext()}
                disabled={!canContinue || saving}
                sx={{
                  minHeight: 52,
                  borderRadius: 2,
                  fontSize: "1.15rem",
                  textTransform: "none",
                  bgcolor: "#0E2430",
                  color: "#FFFFFF",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#0B1D27",
                    color: "#FFFFFF",
                    boxShadow: "none",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#9CA3AF",
                    color: "#FFFFFF",
                    WebkitTextFillColor: "#FFFFFF",
                    opacity: 1,
                  },
                }}
              >
                {saving ? <CircularProgress size={20} color="inherit" /> : "Next"}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

function SelectableRow({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <Paper
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 1.75 },
        borderRadius: 2,
        border: "1px solid",
        borderColor: selected ? "#111827" : "#E5E7EB",
        bgcolor: "#EEF0F2",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        cursor: "pointer",
      }}
    >
      <Typography sx={{ color: "#1F2937", fontSize: { xs: "1.02rem", sm: "1.05rem" }, lineHeight: 1.35 }}>{label}</Typography>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 1.25,
          border: "1px solid",
          borderColor: selected ? "#111827" : "#D1D5DB",
          bgcolor: selected ? "#111827" : "#F9FAFB",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        {selected ? <Check size={16} color="#FFFFFF" /> : null}
      </Box>
    </Paper>
  );
}

export default function OnboardingFlow(props: OnboardingFlowProps) {
  return (
    <MaterialShell>
      <OnboardingFlowContent {...props} />
    </MaterialShell>
  );
}
