import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { registerBffAuthRoutes } from "./bff/registerAuth.mjs";
import { requireBffSession, requireBffCsrf } from "./bff/sessionAuth.mjs";

const app = express();
/** Railway / reverse proxy: correct client IP + Secure cookies behind TLS terminator */
app.set("trust proxy", 1);
const prisma = new PrismaClient();
const port = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "X-CSRF-Token", "Accept"],
  }),
);
app.use(express.json());

const requireSession = requireBffSession;
const requireSessionWithCsrf = [requireBffSession, requireBffCsrf];

async function fetchAuth0UserInfo(issuer, accessToken) {
  if (!accessToken) return {};
  try {
    const hostname = new URL(issuer).hostname;
    const res = await fetch(`https://${hostname}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return {};
    return await res.json();
  } catch (e) {
    console.error("[userinfo]", e?.message ?? e);
    return {};
  }
}

/**
 * Ensures a `UserOnboardingProfile` row exists (Auth0 `sub` stored in `clerk_user_id` column).
 */
async function ensureUserOnboardingProfile(authSubject, issuer, accessToken) {
  const existing = await prisma.userOnboardingProfile.findUnique({
    where: { clerkUserId: authSubject },
  });
  if (existing) return existing;

  let email = null;
  let firstName = null;
  let lastName = null;

  const info = await fetchAuth0UserInfo(issuer, accessToken);
  email = typeof info.email === "string" ? info.email : null;
  firstName = typeof info.given_name === "string" ? info.given_name : null;
  lastName = typeof info.family_name === "string" ? info.family_name : null;
  if (!firstName && !lastName && typeof info.name === "string") {
    const parts = info.name.trim().split(/\s+/);
    firstName = parts[0] || null;
    lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
  }

  try {
    return await prisma.userOnboardingProfile.create({
      data: {
        clerkUserId: authSubject,
        email,
        firstName,
        lastName,
        onboardingCompleted: false,
      },
    });
  } catch (e) {
    if (e?.code === "P2002") {
      const again = await prisma.userOnboardingProfile.findUnique({ where: { clerkUserId: authSubject } });
      if (again) return again;
    }
    throw e;
  }
}

registerBffAuthRoutes(app, { ensureUserOnboardingProfile });

function sanitizeProfile(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    clerk_user_id: profile.clerkUserId,
    email: profile.email ?? "",
    first_name: profile.firstName ?? "",
    last_name: profile.lastName ?? "",
    onboarding_completed: profile.onboardingCompleted,
    onboarding_step: profile.onboardingStep,
    interest_selection: profile.interestSelection,
    interest_custom_text: profile.interestCustomText ?? "",
    province_code: profile.provinceCode ?? "",
    province_name: profile.provinceName ?? "",
    credit_score: profile.creditScore,
    annual_pre_tax_income: profile.annualPreTaxIncome,
    heard_about_us: profile.heardAboutUs,
    heard_about_us_other: profile.heardAboutUsOther ?? "",
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  };
}

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ ok: true, database: "connected" });
  } catch (e) {
    console.error("[health] database check failed:", e?.message ?? e);
    return res.status(503).json({
      ok: false,
      database: "error",
      hint: "Check DATABASE_URL / DIRECT_URL in Main-page/.env and that migrations were applied (npx prisma migrate dev).",
    });
  }
});

/**
 * Idempotent "ensure user row exists" — GET so the onboarding bootstrap does not need CSRF
 * (session cookie + SameSite already constrain cross-site POST abuse).
 */
app.get("/api/auth/sync-user", requireSession, async (req, res) => {
  res.set("Cache-Control", "no-store");
  const userId = req.auth.userId;

  try {
    const profile = await ensureUserOnboardingProfile(userId, req.auth.issuer, req.auth.accessToken);
    return res.json({
      userId: profile.id,
      onboarding_completed: profile.onboardingCompleted,
    });
  } catch (e) {
    console.error("[sync-user]", e);
    return res.status(500).json({ error: "Sync failed." });
  }
});

app.get("/api/onboarding-profile", requireSession, async (req, res) => {
  try {
    const profile = await ensureUserOnboardingProfile(req.auth.userId, req.auth.issuer, req.auth.accessToken);
    return res.json({ profile: sanitizeProfile(profile) });
  } catch (e) {
    console.error("[onboarding-profile GET]", e);
    return res.status(500).json({ error: "Failed to load profile." });
  }
});

app.put("/api/onboarding-profile", ...requireSessionWithCsrf, async (req, res) => {
  const body = req.body ?? {};
  const onboardingStep = Number(body.onboarding_step ?? 1);

  const next = await prisma.userOnboardingProfile.upsert({
    where: { clerkUserId: req.auth.userId },
    update: {
      onboardingStep: Number.isFinite(onboardingStep) ? Math.min(Math.max(onboardingStep, 1), 5) : 1,
      interestSelection: body.interest_selection ?? null,
      interestCustomText: body.interest_custom_text ?? null,
      provinceCode: body.province_code ?? null,
      provinceName: body.province_name ?? null,
      creditScore: typeof body.credit_score === "number" ? body.credit_score : null,
      annualPreTaxIncome: typeof body.annual_pre_tax_income === "number" ? body.annual_pre_tax_income : null,
      heardAboutUs: body.heard_about_us ?? null,
      heardAboutUsOther: body.heard_about_us_other ?? null,
    },
    create: {
      clerkUserId: req.auth.userId,
      onboardingCompleted: false,
      onboardingStep: Number.isFinite(onboardingStep) ? Math.min(Math.max(onboardingStep, 1), 5) : 1,
      interestSelection: body.interest_selection ?? null,
      interestCustomText: body.interest_custom_text ?? null,
      provinceCode: body.province_code ?? null,
      provinceName: body.province_name ?? null,
      creditScore: typeof body.credit_score === "number" ? body.credit_score : null,
      annualPreTaxIncome: typeof body.annual_pre_tax_income === "number" ? body.annual_pre_tax_income : null,
      heardAboutUs: body.heard_about_us ?? null,
      heardAboutUsOther: body.heard_about_us_other ?? null,
    },
  });

  res.json({ profile: sanitizeProfile(next) });
});

app.post("/api/onboarding/complete", ...requireSessionWithCsrf, async (req, res) => {
  const userId = req.auth.userId;
  try {
    await prisma.userOnboardingProfile.upsert({
      where: { clerkUserId: userId },
      update: { onboardingCompleted: true },
      create: {
        clerkUserId: userId,
        onboardingCompleted: true,
      },
    });
    return res.json({ success: true, message: "Onboarding completed" });
  } catch (e) {
    console.error("[onboarding/complete]", e);
    return res.status(500).json({ error: "Failed to complete onboarding." });
  }
});

app.use(express.static(distPath));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`API+web server listening on :${port}`);
});
