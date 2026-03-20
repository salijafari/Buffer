import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { verifyToken, createClerkClient } from "@clerk/backend";

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

function getClerkBackend() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;
  return createClerkClient({ secretKey });
}

app.use(cors());
app.use(express.json());

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

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!token) return res.status(401).json({ error: "Missing bearer token." });
  if (!secretKey) return res.status(500).json({ error: "Missing CLERK_SECRET_KEY." });

  try {
    const payload = await verifyToken(token, { secretKey });
    if (!payload?.sub) {
      return res.status(401).json({ error: "Invalid token payload." });
    }
    req.auth = { userId: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized." });
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

/** Ensures a DB row exists; fills identity from Clerk on create only. */
app.post("/api/auth/sync-user", requireAuth, async (req, res) => {
  const clerkUserId = req.auth.userId;

  try {
    const existing = await prisma.userOnboardingProfile.findUnique({
      where: { clerkUserId },
    });

    if (existing) {
      return res.json({
        userId: existing.id,
        onboarding_completed: existing.onboardingCompleted,
      });
    }

    let email = null;
    let firstName = null;
    let lastName = null;

    const clerk = getClerkBackend();
    if (clerk) {
      try {
        const cu = await clerk.users.getUser(clerkUserId);
        const primaryEmail =
          cu.emailAddresses?.find((e) => e.id === cu.primaryEmailAddressId)?.emailAddress ??
          cu.emailAddresses?.[0]?.emailAddress ??
          null;
        email = primaryEmail;
        firstName = cu.firstName ?? null;
        lastName = cu.lastName ?? null;
      } catch (e) {
        console.error("[sync-user] Clerk users.getUser failed:", e?.message ?? e);
      }
    }

    const created = await prisma.userOnboardingProfile.create({
      data: {
        clerkUserId,
        email,
        firstName,
        lastName,
        onboardingCompleted: false,
      },
    });

    return res.json({
      userId: created.id,
      onboarding_completed: created.onboardingCompleted,
    });
  } catch (e) {
    console.error("[sync-user]", e);
    return res.status(500).json({ error: "Sync failed." });
  }
});

app.get("/api/onboarding-profile", requireAuth, async (req, res) => {
  const profile = await prisma.userOnboardingProfile.findUnique({
    where: { clerkUserId: req.auth.userId },
  });
  if (!profile) {
    return res.status(404).json({ error: "Profile not found." });
  }
  return res.json({ profile: sanitizeProfile(profile) });
});

/** Step saves — never sets onboardingCompleted from the client; use POST /api/onboarding/complete for that. */
app.put("/api/onboarding-profile", requireAuth, async (req, res) => {
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

app.post("/api/onboarding/complete", requireAuth, async (req, res) => {
  const clerkUserId = req.auth.userId;
  try {
    await prisma.userOnboardingProfile.upsert({
      where: { clerkUserId },
      update: { onboardingCompleted: true },
      create: {
        clerkUserId,
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
