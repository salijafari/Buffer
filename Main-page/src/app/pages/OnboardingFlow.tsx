import { useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "@clerk/react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MaterialShell } from "../material/MaterialShell";

// ─── Types ────────────────────────────────────────────────────────────────────

type Province = {
  code: string;
  name: string;
  creditLineEnabled: boolean;
};

const PROVINCES: Province[] = [
  { code: "AB", name: "Alberta", creditLineEnabled: true },
  { code: "BC", name: "British Columbia", creditLineEnabled: true },
  { code: "MB", name: "Manitoba", creditLineEnabled: true },
  { code: "NB", name: "New Brunswick", creditLineEnabled: false },
  { code: "NL", name: "Newfoundland", creditLineEnabled: false },
  { code: "NS", name: "Nova Scotia", creditLineEnabled: false },
  { code: "NT", name: "Northwest Territories", creditLineEnabled: false },
  { code: "NU", name: "Nunavut", creditLineEnabled: false },
  { code: "ON", name: "Ontario", creditLineEnabled: true },
  { code: "PE", name: "Prince Edward Island", creditLineEnabled: false },
  { code: "QC", name: "Quebec", creditLineEnabled: true },
  { code: "SK", name: "Saskatchewan", creditLineEnabled: true },
  { code: "YT", name: "Yukon", creditLineEnabled: false },
];

type KycData = {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  dob: string;
  idType: "passport" | "drivers_license" | "pr_card" | "";
  idFile: File | null;
};

type EligibilityOutcome = "A" | "B" | "C" | null;

const STEPS = [
  { id: 1, label: "Identity" },
  { id: 2, label: "Province" },
  { id: 3, label: "Bank" },
  { id: 4, label: "Verify" },
  { id: 5, label: "Eligibility" },
  { id: 6, label: "Credit Builder" },
  { id: 7, label: "Setup" },
] as const;

// ─── Root component ───────────────────────────────────────────────────────────

function OnboardingFlowContent() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [step, setStep] = useState(1);
  const [kyc, setKyc] = useState<KycData>({
    address: "",
    city: "",
    province: "",
    postalCode: "",
    dob: "",
    idType: "",
    idFile: null,
  });
  const [plaidConnected, setPlaidConnected] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityOutcome>(null);
  const [padAccepted, setPadAccepted] = useState(false);
  const [cbAcknowledged, setCbAcknowledged] = useState(false);
  const [finishing, setFinishing] = useState(false);

  function next() {
    setStep((s) => Math.min(s + 1, 7));
  }

  async function runEligibility() {
    setVerifyLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    const province = PROVINCES.find((p) => p.code === kyc.province);
    setEligibility(province?.creditLineEnabled ? "A" : "B");
    setVerifyLoading(false);
    next();
  }

  async function handleFinish() {
    setFinishing(true);
    if (user) {
      await user.update({ unsafeMetadata: { onboarding_completed: true } });
    }
    navigate("/dashboard", { replace: true });
  }

  const progress = (step / STEPS.length) * 100;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      <Box component="header" sx={{ px: 2, pt: 3, pb: 2, maxWidth: 512, mx: "auto", width: "100%" }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            aria-hidden
          >
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
              <path d="M6 22C6 22 10 6 14 6C18 6 22 22 22 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M9 16H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </Box>
          <Typography variant="body2" fontWeight={600} color="text.primary">
            Buffer
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 999,
            bgcolor: "grey.200",
            "& .MuiLinearProgress-bar": { borderRadius: 999, bgcolor: "primary.main" },
          }}
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-label="Onboarding progress"
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          Step {step} of {STEPS.length} — {STEPS[step - 1].label}
        </Typography>
      </Box>

      <Box component="main" sx={{ flex: 1, px: 2, pb: 4, maxWidth: 512, mx: "auto", width: "100%" }}>
        {step === 1 && <StepKyc kyc={kyc} setKyc={setKyc} onNext={next} />}
        {step === 2 && <StepProvince kyc={kyc} setKyc={setKyc} onNext={next} />}
        {step === 3 && (
          <StepPlaid connected={plaidConnected} onConnect={() => setPlaidConnected(true)} onNext={next} />
        )}
        {step === 4 && <StepVerify loading={verifyLoading} onRun={runEligibility} />}
        {step === 5 && <StepEligibility outcome={eligibility} onNext={next} />}
        {step === 6 && (
          <StepCreditBuilder
            acknowledged={cbAcknowledged}
            onAcknowledge={() => setCbAcknowledged(true)}
            onNext={next}
          />
        )}
        {step === 7 && (
          <StepPad
            accepted={padAccepted}
            onAccept={() => setPadAccepted(true)}
            onFinish={handleFinish}
            finishing={finishing}
          />
        )}
      </Box>
    </Box>
  );
}

export default function OnboardingFlow() {
  return (
    <MaterialShell>
      <OnboardingFlowContent />
    </MaterialShell>
  );
}

// ─── Step 1: KYC ─────────────────────────────────────────────────────────────

function StepKyc({
  kyc,
  setKyc,
  onNext,
}: {
  kyc: KycData;
  setKyc: React.Dispatch<React.SetStateAction<KycData>>;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof KycData, string>>>({});

  function set(key: keyof KycData, value: string | File | null) {
    setKyc((prev) => ({ ...prev, [key]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, idFile: "File must be under 10 MB" }));
      return;
    }
    set("idFile", file);
    setErrors((prev) => ({ ...prev, idFile: undefined }));
  }

  function handleNext() {
    const errs: typeof errors = {};
    if (!kyc.address.trim()) errs.address = "Required";
    if (!kyc.city.trim()) errs.city = "Required";
    if (!kyc.postalCode.trim()) errs.postalCode = "Required";
    if (!kyc.dob) {
      errs.dob = "Required";
    } else {
      const age = (Date.now() - new Date(kyc.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) errs.dob = "You must be at least 18 years old";
    }
    if (!kyc.idType) errs.idType = "Required";
    if (!kyc.idFile) errs.idFile = "Please upload your ID document";
    setErrors(errs);
    if (Object.keys(errs).length === 0) onNext();
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Verify your identity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Required by Canadian financial regulations. Your information is encrypted and never sold.
        </Typography>
      </Box>

      <Alert severity="info" icon={<LockIcon />} sx={{ alignItems: "flex-start" }}>
        <Typography variant="body2" fontWeight={600}>
          Your data is protected
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          256-bit encryption · SOC 2 Type II · PIPEDA compliant · No SIN collected
        </Typography>
      </Alert>

      <TextField
        label="Street address"
        autoComplete="street-address"
        value={kyc.address}
        onChange={(e) => set("address", e.target.value)}
        placeholder="123 Main St"
        error={Boolean(errors.address)}
        helperText={errors.address}
        fullWidth
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="City"
          autoComplete="address-level2"
          value={kyc.city}
          onChange={(e) => set("city", e.target.value)}
          placeholder="Vancouver"
          error={Boolean(errors.city)}
          helperText={errors.city}
          fullWidth
        />
        <TextField
          label="Postal code"
          autoComplete="postal-code"
          inputProps={{ inputMode: "text" }}
          value={kyc.postalCode}
          onChange={(e) =>
            set(
              "postalCode",
              e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6),
            )
          }
          placeholder="V6B1A1"
          error={Boolean(errors.postalCode)}
          helperText={errors.postalCode}
          fullWidth
        />
      </Stack>

      <TextField
        label="Date of birth"
        type="date"
        autoComplete="bday"
        value={kyc.dob}
        onChange={(e) => set("dob", e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ max: new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split("T")[0] }}
        error={Boolean(errors.dob)}
        helperText={errors.dob}
        fullWidth
      />

      <FormControl fullWidth error={Boolean(errors.idType)}>
        <InputLabel id="id-type-label">ID document type</InputLabel>
        <Select
          labelId="id-type-label"
          label="ID document type"
          value={kyc.idType}
          onChange={(e) => set("idType", e.target.value as KycData["idType"])}
        >
          <MenuItem value="">
            <em>Select document…</em>
          </MenuItem>
          <MenuItem value="passport">Canadian Passport</MenuItem>
          <MenuItem value="drivers_license">Driver&apos;s License</MenuItem>
          <MenuItem value="pr_card">Permanent Resident Card</MenuItem>
        </Select>
        {errors.idType ? <FormHelperText>{errors.idType}</FormHelperText> : null}
      </FormControl>

      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Upload document <Typography component="span" variant="caption">(JPG, PNG or PDF, max 10 MB)</Typography>
        </Typography>
        <Paper
          variant="outlined"
          component="label"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            py: 3,
            cursor: "pointer",
            borderStyle: "dashed",
            borderColor: errors.idFile ? "error.main" : "divider",
            "&:hover": { borderColor: "primary.light" },
          }}
        >
          <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} hidden />
          <UploadIcon />
          <Typography variant="body2" color="text.secondary">
            {kyc.idFile ? kyc.idFile.name : "Tap to upload"}
          </Typography>
          {kyc.idFile ? (
            <Typography variant="caption" color="text.disabled">
              {(kyc.idFile.size / 1024).toFixed(0)} KB
            </Typography>
          ) : null}
        </Paper>
        {errors.idFile ? (
          <FormHelperText error sx={{ mx: 1.75 }}>
            {errors.idFile}
          </FormHelperText>
        ) : null}
      </Box>

      <Typography variant="caption" color="text.secondary">
        <strong>Important:</strong> Buffer never collects your Social Insurance Number (SIN). Only the documents listed above are accepted.
      </Typography>

      <PrimaryButton onClick={handleNext}>Continue</PrimaryButton>
    </Stack>
  );
}

// ─── Step 2: Province ─────────────────────────────────────────────────────────

function StepProvince({
  kyc,
  setKyc,
  onNext,
}: {
  kyc: KycData;
  setKyc: React.Dispatch<React.SetStateAction<KycData>>;
  onNext: () => void;
}) {
  const [error, setError] = useState("");
  const selected = PROVINCES.find((p) => p.code === kyc.province);

  function handleNext() {
    if (!kyc.province) {
      setError("Please select your province");
      return;
    }
    setError("");
    onNext();
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Where are you located?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Buffer is available across Canada. Some features vary by province.
        </Typography>
      </Box>

      <FormControl fullWidth error={Boolean(error)}>
        <InputLabel id="province-label">Province or territory</InputLabel>
        <Select
          labelId="province-label"
          label="Province or territory"
          value={kyc.province}
          onChange={(e) => {
            setKyc((prev) => ({ ...prev, province: e.target.value }));
            setError("");
          }}
        >
          <MenuItem value="">
            <em>Select province…</em>
          </MenuItem>
          {PROVINCES.map((p) => (
            <MenuItem key={p.code} value={p.code}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
        {error ? <FormHelperText>{error}</FormHelperText> : null}
      </FormControl>

      {selected ? (
        <Alert severity={selected.creditLineEnabled ? "success" : "warning"}>
          {selected.creditLineEnabled ? (
            <>
              <Typography variant="body2" fontWeight={600}>
                Buffer Credit Line available in {selected.name}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                You can access all Buffer features including the revolving credit line.
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body2" fontWeight={600}>
                Credit Line coming soon to {selected.name}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                You&apos;ll be enrolled in Credit Builder to start improving your score right away.
              </Typography>
            </>
          )}
        </Alert>
      ) : null}

      <PrimaryButton onClick={handleNext}>Continue</PrimaryButton>
    </Stack>
  );
}

// ─── Step 3: Plaid ────────────────────────────────────────────────────────────

function StepPlaid({
  connected,
  onConnect,
  onNext,
}: {
  connected: boolean;
  onConnect: () => void;
  onNext: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    onConnect();
    setLoading(false);
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Connect your bank
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Buffer uses Plaid to securely read your income and transaction history. We never store your credentials.
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        {[
          { icon: "🔒", title: "Read-only access", desc: "Buffer can never move money without your PAD authorization." },
          { icon: "🏦", title: "Bank-grade encryption", desc: "Plaid is trusted by millions of Canadians and used by major banks." },
          { icon: "🗑️", title: "Delete anytime", desc: "Revoke access instantly from your account settings." },
        ].map((item) => (
          <Paper key={item.title} variant="outlined" sx={{ p: 2, display: "flex", gap: 1.5 }}>
            <Typography sx={{ fontSize: "1.25rem", lineHeight: 1 }} aria-hidden>
              {item.icon}
            </Typography>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {item.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                {item.desc}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Stack>

      {connected ? (
        <Alert severity="success" icon={<CheckCircleIcon />}>
          Bank account connected
        </Alert>
      ) : null}

      {!connected ? (
        <PrimaryButton onClick={handleConnect} disabled={loading}>
          {loading ? (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
              <CircularProgress size={18} color="inherit" />
              <span>Connecting…</span>
            </Stack>
          ) : (
            "Connect with Plaid"
          )}
        </PrimaryButton>
      ) : (
        <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
      )}
    </Stack>
  );
}

// ─── Step 4: Verify ───────────────────────────────────────────────────────────

function StepVerify({ loading, onRun }: { loading: boolean; onRun: () => void }) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Verify income &amp; credit
        </Typography>
        <Typography variant="body2" color="text.secondary">
          We&apos;ll run a <strong>soft credit pull</strong> (never affects your score) and verify your income from connected accounts.
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        {[
          { label: "Soft credit check", note: "Equifax & TransUnion · No score impact" },
          { label: "Income verification", note: "Analysing 90 days of transactions" },
          { label: "Debt analysis", note: "Existing balances & interest rates" },
        ].map((item) => (
          <Paper key={item.label} variant="outlined" sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                flexShrink: 0,
                bgcolor: loading ? "primary.main" : "grey.300",
                animation: loading ? "pulse 1.5s ease-in-out infinite" : "none",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.4 },
                },
              }}
            />
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {item.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.note}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Stack>

      <PrimaryButton onClick={onRun} disabled={loading}>
        {loading ? (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <CircularProgress size={18} color="inherit" />
            <span>Analysing…</span>
          </Stack>
        ) : (
          "Run Verification"
        )}
      </PrimaryButton>
    </Stack>
  );
}

// ─── Step 5: Eligibility ──────────────────────────────────────────────────────

function StepEligibility({ outcome, onNext }: { outcome: EligibilityOutcome; onNext: () => void }) {
  if (!outcome) return null;
  const isA = outcome === "A";

  return (
    <Stack spacing={3}>
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          textAlign: "center",
          borderColor: isA ? "primary.light" : "warning.light",
          bgcolor: isA ? (t) => `${t.palette.primary.main}12` : (t) => `${t.palette.warning.main}12`,
        }}
      >
        <Typography sx={{ fontSize: "2.25rem" }} aria-hidden>
          {isA ? "🎉" : "🌱"}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
          {isA ? "You're approved!" : "Let's build your credit first"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.6 }}>
          {isA
            ? "You qualify for a Buffer Credit Line. We'll set up your account so you can start paying down debt faster."
            : "Based on your credit profile, we'll enrol you in Credit Builder — a proven path to improve your score and unlock the full credit line."}
        </Typography>
      </Paper>

      {!isA ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Your Credit Builder path
          </Typography>
          <Stack component="ol" spacing={1} sx={{ m: 0, pl: 2 }}>
            {[
              "Monthly on-time payments build positive history",
              "Score typically improves in 3–6 months",
              "Automatically graduates to full Credit Line when eligible",
            ].map((item, i) => (
              <Typography key={i} component="li" variant="body2" color="text.secondary">
                {item}
              </Typography>
            ))}
          </Stack>
        </Paper>
      ) : null}

      <PrimaryButton onClick={onNext}>{isA ? "Set up my account" : "Start Credit Builder"}</PrimaryButton>
    </Stack>
  );
}

// ─── Step 6: Credit Builder ───────────────────────────────────────────────────

function StepCreditBuilder({
  acknowledged,
  onAcknowledge,
  onNext,
}: {
  acknowledged: boolean;
  onAcknowledge: () => void;
  onNext: () => void;
}) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          About Credit Builder
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please read this important information before proceeding.
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          maxHeight: 256,
          overflowY: "auto",
          bgcolor: "grey.50",
        }}
      >
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            <strong>What is Credit Builder?</strong> Buffer Credit Builder is a secured credit facility that reports monthly payments to Equifax and TransUnion. Each on-time payment adds a positive trade line to your credit report.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            <strong>How it works:</strong> A small monthly amount (as low as $10) is held in a secured account. This amount is reported as a credit obligation and paid monthly, building your history. No interest is charged on the secured portion.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            <strong>Fees:</strong> Buffer charges a flat monthly subscription fee (see your plan details). There are no hidden fees. The secured deposit is returned if you close your account in good standing.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            <strong>Cancellation:</strong> You may cancel Credit Builder with 30 days&apos; written notice. PAD payments during the notice period will continue. See your Pre-Authorized Debit agreement for full terms.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            <strong>Credit impact:</strong> Late or missed payments will be reported negatively. Buffer is not responsible for changes to your credit score. Past results do not guarantee future score improvements.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            <strong>Graduation:</strong> When your score meets the threshold for your province, Buffer will notify you and automatically offer a transition to the full Credit Line. You are not obligated to accept.
          </Typography>
        </Stack>
      </Paper>

      <FormControlLabel
        control={
          <Checkbox
            checked={acknowledged}
            onChange={(e) => {
              if (e.target.checked) onAcknowledge();
            }}
            color="primary"
          />
        }
        label="I have read and understood the Credit Builder terms, including the 30-day cancellation notice requirement."
      />

      <PrimaryButton onClick={onNext} disabled={!acknowledged}>
        I understand — Continue
      </PrimaryButton>
    </Stack>
  );
}

// ─── Step 7: PAD ──────────────────────────────────────────────────────────────

function StepPad({
  accepted,
  onAccept,
  onFinish,
  finishing,
}: {
  accepted: boolean;
  onAccept: () => void;
  onFinish: () => void;
  finishing: boolean;
}) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Authorize payments
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Set up Pre-Authorized Debit (PAD) to automate your monthly Buffer payments.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "grey.50" }}>
        <Stack spacing={1.5}>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            <strong>Pre-Authorized Debit Agreement</strong>
            <br />
            By accepting, you authorize Buffer Financial Inc. to debit your connected bank account for the agreed monthly amount on the payment date each month. This PAD is for <strong>personal use</strong>.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            <strong>Your rights:</strong> You have the right to cancel this PAD agreement at any time with a minimum of <strong>30 days&apos; written notice</strong> before the next scheduled debit. Contact support@mybuffer.ca.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            For reimbursement of debits made in error, contact us within 90 days. This PAD is governed by the Payments Canada Rule H1. Powered by VoPay.
          </Typography>
        </Stack>
      </Paper>

      <FormControlLabel
        control={
          <Checkbox
            checked={accepted}
            onChange={(e) => {
              if (e.target.checked) onAccept();
            }}
            color="primary"
          />
        }
        label="I authorize Buffer Financial Inc. to debit my account as described above and confirm I have read the PAD agreement including the 30-day cancellation notice requirement."
      />

      <PrimaryButton onClick={onFinish} disabled={!accepted || finishing}>
        {finishing ? (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <CircularProgress size={18} color="inherit" />
            <span>Setting up your account…</span>
          </Stack>
        ) : (
          "Authorize & Finish Setup"
        )}
      </PrimaryButton>
    </Stack>
  );
}

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function PrimaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <Button variant="contained" color="primary" size="large" fullWidth onClick={onClick} disabled={disabled} sx={{ mt: 1, py: 1.5 }}>
      {children}
    </Button>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}
