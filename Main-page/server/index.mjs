import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { registerBffAuthRoutes } from "./bff/registerAuth.mjs";
import { registerPlaidRoutes } from "./bff/registerPlaid.mjs";
import { registerPlaidDashboardRoutes } from "./bff/registerPlaidDashboard.mjs";
import { registerAdminRoutes } from "./bff/registerAdmin.mjs";
import { deleteAuth0UserBySub, runM2mAdminSmokeTest } from "./bff/auth0Management.mjs";
import { deleteSessionRecord } from "./bff/store.mjs";
import { requireBffSession, requireBffCsrf, cookieOptions, csrfCookieOptions } from "./bff/sessionAuth.mjs";

/**
 * Load env from `Main-page/.env` (path is next to `server/`, not CWD).
 * `.env.local` is only loaded when NODE_ENV !== "production" so a stray deployed
 * `.env.local` cannot override Railway/injected secrets.
 */
const __envDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(__envDir, ".env") });
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(__envDir, ".env.local"), override: true });
}

const app = express();
/** Railway / reverse proxy: correct client IP + Secure cookies behind TLS terminator */
app.set("trust proxy", 1);
const prisma = new PrismaClient();
const port = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // server/
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

const SESSION_COOKIE = "bff_sid";
const CSRF_COOKIE = "bff_csrf";

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
 * After account deletion the row is removed; the same email signing up again gets a **new** Auth0 `sub` and a **new** row.
 */
async function ensureUserOnboardingProfile(authSubject, issuer, accessToken) {
  const info = await fetchAuth0UserInfo(issuer, accessToken);
  const email = typeof info.email === "string" ? info.email : null;
  let firstName = typeof info.given_name === "string" ? info.given_name : null;
  let lastName = typeof info.family_name === "string" ? info.family_name : null;
  if (!firstName && !lastName && typeof info.name === "string") {
    const parts = info.name.trim().split(/\s+/);
    firstName = parts[0] || null;
    lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
  }

  const existing = await prisma.userOnboardingProfile.findUnique({
    where: { clerkUserId: authSubject },
  });
  if (existing) return existing;

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
registerPlaidRoutes(app, { prisma, ensureUserOnboardingProfile });
registerPlaidDashboardRoutes(app, { prisma, ensureUserOnboardingProfile });
registerAdminRoutes(app, { prisma });

/** Map Prisma errors to actionable hints (returned in API JSON). */
function prismaErrorPayload(e, message) {
  const code = e?.code;
  const msg = String(e?.message ?? e);
  let hint =
    "Check DATABASE_URL / DIRECT_URL on the server, run `npx prisma migrate deploy`, and `npx prisma generate`. See server logs for the full stack trace.";
  if (code === "P2021" || /relation .* does not exist/i.test(msg) || /table .* does not exist/i.test(msg)) {
    hint =
      "Database tables are missing. Run migrations against this DATABASE_URL: `npx prisma migrate deploy`. On Railway: add a Release command `npx prisma migrate deploy` (or run once from your machine with DATABASE_URL).";
  }
  if (code === "P1001") {
    hint = "Cannot reach the database server — wrong DATABASE_URL, firewall, or Postgres not running.";
  }
  if (code === "P1003") {
    hint = "The database name in DATABASE_URL does not exist on the server.";
  }
  if (code === "P1017") {
    hint = "Server closed the connection — try direct URL for migrations, or check connection pool limits.";
  }
  return {
    error: message,
    prismaCode: code ?? null,
    hint,
    ...(process.env.NODE_ENV !== "production" ? { detail: msg.slice(0, 500) } : {}),
  };
}

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
    plaid_connection_status: profile.plaidConnectionStatus ?? "disconnected",
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
 * M2M smoke test: client_credentials → Management API GET /users (no auth cookie).
 * Disabled in production unless ALLOW_ADMIN_TEST_M2M=true (e.g. Railway debugging).
 */
app.get("/api/admin/test-m2m", async (_req, res) => {
  res.set("Cache-Control", "no-store");
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_ADMIN_TEST_M2M !== "true") {
    return res.status(404).json({
      status: "error",
      error: "Not available",
      details: "Set ALLOW_ADMIN_TEST_M2M=true on the server to enable in production.",
    });
  }
  const result = await runM2mAdminSmokeTest();
  // Always 200 so the browser shows JSON (502 often hides the body behind a generic error page).
  if (result.status === "error") {
    console.error("[test-m2m]", result.error, result.details?.slice?.(0, 500) ?? result.details);
  }
  return res.status(200).json(result);
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
    return res.status(500).json(prismaErrorPayload(e, "Sync failed."));
  }
});

app.get("/api/onboarding-profile", requireSession, async (req, res) => {
  try {
    const profile = await ensureUserOnboardingProfile(req.auth.userId, req.auth.issuer, req.auth.accessToken);
    return res.json({ profile: sanitizeProfile(profile) });
  } catch (e) {
    console.error("[onboarding-profile GET]", e);
    return res.status(500).json(prismaErrorPayload(e, "Failed to load profile."));
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

/**
 * Deletes the Auth0 user (Management API), removes the onboarding profile row, clears BFF session.
 * Requires Auth0 Management API (M2M) with delete:users — see docs/BFF_AUTH.md.
 */
app.post("/api/account/delete", ...requireSessionWithCsrf, async (req, res) => {
  const authSubject = req.auth.userId;
  const sid = req.bffSessionId;

  try {
    await prisma.userOnboardingProfile.deleteMany({
      where: { clerkUserId: authSubject },
    });
  } catch (e) {
    console.error("[account/delete] DB delete failed:", e);
    return res.status(500).json(prismaErrorPayload(e, "Could not remove profile from database."));
  }

  try {
    await deleteAuth0UserBySub(authSubject);
  } catch (e) {
    console.error("[account/delete] Auth0 delete failed:", e?.message ?? e);
    deleteSessionRecord(sid);
    res.clearCookie(SESSION_COOKIE, { ...cookieOptions(), maxAge: 0 });
    res.clearCookie(CSRF_COOKIE, { ...csrfCookieOptions(), maxAge: 0 });
    return res.status(502).json({
      error: "Profile was removed but Auth0 could not delete the user. Sign in again; a new profile will be created.",
      hint: String(e?.message ?? e).slice(0, 400),
    });
  }

  deleteSessionRecord(sid);
  res.clearCookie(SESSION_COOKIE, { ...cookieOptions(), maxAge: 0 });
  res.clearCookie(CSRF_COOKIE, { ...csrfCookieOptions(), maxAge: 0 });
  return res.json({ ok: true, redirect: "/" });
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
