import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
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
import {
  CANADIAN_PROVINCES,
  type AcquisitionSource,
  type InterestSelection,
  type UserOnboardingProfile,
} from "../lib/onboardingProfile";
import { postOnboardingComplete, saveOnboardingProfile } from "../lib/onboardingApi";

type StepId = 1 | 2 | 3 | 4 | 5;

const TOTAL_STEPS = 5;

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
  return 5;
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
      return score !== null && score >= 300 && score <= 900;
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

    return false;
  }, [step, draft]);

  const subtitle = useMemo(() => {
    if (step === 1) return "Select one option";
    if (step === 2) return "Choose your Canadian province or territory";
    if (step === 3) return "Your response is only used to offer the most relevant products.";
    if (step === 4) return "Your response is only used to offer the most relevant products.";
    return "Select one option";
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

  async function onNext() {
    if (saving || !canContinue) return;
    setFieldError("");

    if (step === 3) {
      const score = parseOptionalNumber(draft.credit_score_input);
      if (score === null || score < 300 || score > 900) {
        setFieldError("Enter a credit score between 300 and 900.");
        return;
      }
    }

    setSaving(true);
    try {
      if (step < 5) {
        const nextStep = (step + 1) as StepId;
        await persist(nextStep);
        setStep(nextStep);
      } else {
        await persist(5);
        await postOnboardingComplete();
        onCompletedNavigate?.();
        navigate("/dashboard", { replace: true });
      }
    } catch {
      setFieldError("We couldn't save your progress. Please try again.");
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

          <Stack direction="row" spacing={0.75} sx={{ flex: 1 }}>
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
        </Stack>

        <Box sx={{ pt: { xs: 1.5, sm: 2 }, pb: 0.5 }}>
          <Typography variant="h4" sx={{ fontSize: { xs: "2rem", sm: "2.2rem" }, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", mb: 1.25 }}>
            {step === 1 && "What interests you most?"}
            {step === 2 && "What's your province of residence?"}
            {step === 3 && "What's your credit score?"}
            {step === 4 && "What's your annual pre-tax income?"}
            {step === 5 && "How did you hear about us?"}
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
              <TextField
                value={draft.credit_score_input}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, credit_score_input: digitsOnly(e.target.value).slice(0, 3) }));
                  setFieldError("");
                }}
                placeholder="For example: 670"
                fullWidth
                inputProps={{ inputMode: "numeric" }}
                sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#FFFFFF", borderRadius: 2 } }}
              />
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

            {fieldError ? (
              <Typography sx={{ mt: 1.25, color: "error.main", fontSize: "0.9rem" }}>{fieldError}</Typography>
            ) : null}
          </Box>

          <Box sx={{ pt: 3, pb: { xs: 1, md: 0 } }}>
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
                // Mandatory step: gray + white label; MUI default disabled uses dark text + opacity — override.
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
