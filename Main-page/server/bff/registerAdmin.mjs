import { normalizeAdminEmail, checkIsActiveAdmin } from "./adminAccess.mjs";
import { deleteAuth0UserBySub } from "./auth0Management.mjs";
import { requireBffSession, requireBffCsrf } from "./sessionAuth.mjs";

const ACTIVE_USER = { removedAt: null };

function mapUserRow(p) {
  return {
    id: p.id,
    email: p.email ?? "",
    firstName: p.firstName ?? "",
    lastName: p.lastName ?? "",
    clerkUserId: p.clerkUserId,
    registrationDate: p.createdAt.toISOString(),
    onboardingCompleted: p.onboardingCompleted,
    onboardingStep: p.onboardingStep,
    removedAt: p.removedAt ? p.removedAt.toISOString() : null,
  };
}

function mapUserDetail(p) {
  return {
    ...mapUserRow(p),
    interestSelection: p.interestSelection,
    interestCustomText: p.interestCustomText ?? "",
    provinceCode: p.provinceCode ?? "",
    provinceName: p.provinceName ?? "",
    creditScore: p.creditScore,
    annualPreTaxIncome: p.annualPreTaxIncome,
    heardAboutUs: p.heardAboutUs,
    heardAboutUsOther: p.heardAboutUsOther ?? "",
    updatedAt: p.updatedAt.toISOString(),
  };
}

/**
 * @param {import("express").Application} app
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps
 */
export function registerAdminRoutes(app, { prisma }) {
  const requireSession = requireBffSession;
  const requireSessionWithCsrf = [requireBffSession, requireBffCsrf];

  async function resolveRequestAdminEmail(req) {
    let email = req.auth?.email ?? null;
    if (!email) {
      const row = await prisma.userOnboardingProfile.findUnique({
        where: { clerkUserId: req.auth.userId },
        select: { email: true },
      });
      email = row?.email ?? null;
    }
    return normalizeAdminEmail(email ?? "");
  }

  async function requireAdmin(req, res, next) {
    try {
      const emailNorm = await resolveRequestAdminEmail(req);
      if (!emailNorm) {
        return res.status(403).json({ error: "Forbidden", detail: "No email on profile or session." });
      }
      const ok = await checkIsActiveAdmin(prisma, emailNorm);
      if (!ok) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.adminEmail = emailNorm;
      return next();
    } catch (e) {
      console.error("[admin] requireAdmin", e);
      return res.status(500).json({ error: "Admin check failed." });
    }
  }

  const adminRead = [requireSession, requireAdmin];
  const adminWrite = [...requireSessionWithCsrf, requireAdmin];

  app.get("/api/admin/verify", requireSession, async (req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      const emailNorm = await resolveRequestAdminEmail(req);
      let displayEmail = req.auth?.email ?? null;
      if (!displayEmail) {
        const row = await prisma.userOnboardingProfile.findUnique({
          where: { clerkUserId: req.auth.userId },
          select: { email: true },
        });
        displayEmail = row?.email ?? null;
      }
      const isAdmin = emailNorm ? await checkIsActiveAdmin(prisma, emailNorm) : false;
      return res.json({
        isAdmin,
        email: displayEmail ?? "",
      });
    } catch (e) {
      console.error("[admin/verify]", e);
      return res.status(500).json({ error: "Verify failed." });
    }
  });

  app.get("/api/admin/stats", ...adminRead, async (_req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      const base = { ...ACTIVE_USER };
      const totalUsers = await prisma.userOnboardingProfile.count({ where: base });
      const completedOnboarding = await prisma.userOnboardingProfile.count({
        where: { ...base, onboardingCompleted: true },
      });
      const inProgress = await prisma.userOnboardingProfile.count({
        where: { ...base, onboardingCompleted: false },
      });
      const notStarted = await prisma.userOnboardingProfile.count({
        where: {
          ...base,
          onboardingCompleted: false,
          onboardingStep: 1,
          interestSelection: null,
        },
      });
      const byStep = {};
      for (let s = 1; s <= 5; s++) {
        byStep[String(s)] = await prisma.userOnboardingProfile.count({
          where: { ...base, onboardingCompleted: false, onboardingStep: s },
        });
      }
      const completionRate =
        totalUsers > 0 ? Math.round((completedOnboarding / totalUsers) * 1000) / 10 : 0;

      const avgStepAgg = await prisma.userOnboardingProfile.aggregate({
        where: { ...base, onboardingCompleted: false },
        _avg: { onboardingStep: true },
      });

      return res.json({
        totalUsers,
        completedOnboarding,
        inProgress,
        notStarted,
        byStep,
        completionRate,
        avgStepInProgress: avgStepAgg._avg.onboardingStep ?? 0,
      });
    } catch (e) {
      console.error("[admin/stats]", e);
      return res.status(500).json({ error: "Failed to load stats." });
    }
  });

  app.get("/api/admin/users", ...adminRead, async (req, res) => {
    res.set("Cache-Control", "no-store");
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const sort = typeof req.query.sort === "string" ? req.query.sort : "createdAt";
    const order = req.query.order === "asc" ? "asc" : "desc";

    const orderBy = (() => {
      if (sort === "email") return { email: order };
      if (sort === "onboardingStep") return { onboardingStep: order };
      if (sort === "onboardingCompleted") return { onboardingCompleted: order };
      return { createdAt: order };
    })();

    const where = {
      ...ACTIVE_USER,
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    try {
      const [users, total] = await Promise.all([
        prisma.userOnboardingProfile.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            clerkUserId: true,
            createdAt: true,
            onboardingCompleted: true,
            onboardingStep: true,
            removedAt: true,
          },
        }),
        prisma.userOnboardingProfile.count({ where }),
      ]);

      return res.json({
        users: users.map(mapUserRow),
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      });
    } catch (e) {
      console.error("[admin/users]", e);
      return res.status(500).json({ error: "Failed to list users." });
    }
  });

  app.get("/api/admin/users/:userId", ...adminRead, async (req, res) => {
    res.set("Cache-Control", "no-store");
    const { userId } = req.params;
    try {
      const p = await prisma.userOnboardingProfile.findFirst({
        where: { id: userId, ...ACTIVE_USER },
      });
      if (!p) {
        return res.status(404).json({ error: "User not found." });
      }
      return res.json({ user: mapUserDetail(p) });
    } catch (e) {
      console.error("[admin/users/:id]", e);
      return res.status(500).json({ error: "Failed to load user." });
    }
  });

  app.delete("/api/admin/users/:userId", ...adminWrite, async (req, res) => {
    const { userId } = req.params;
    try {
      const p = await prisma.userOnboardingProfile.findFirst({
        where: { id: userId, ...ACTIVE_USER },
      });
      if (!p) {
        return res.status(404).json({ error: "User not found." });
      }

      try {
        await deleteAuth0UserBySub(p.clerkUserId);
      } catch (e) {
        console.error("[admin delete user] Auth0", e);
        return res.status(502).json({
          error: "Could not delete Auth0 user.",
          hint: String(e?.message ?? e).slice(0, 400),
        });
      }

      await prisma.userOnboardingProfile.update({
        where: { id: p.id },
        data: { removedAt: new Date() },
      });

      return res.json({ ok: true });
    } catch (e) {
      console.error("[admin delete user]", e);
      return res.status(500).json({ error: "Delete failed." });
    }
  });

  app.get("/api/admin/admins", ...adminRead, async (_req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      const grants = await prisma.adminGrant.findMany({
        where: { revokedAt: null },
        orderBy: { grantedAt: "asc" },
      });
      return res.json({
        admins: grants.map((g) => ({
          email: g.userEmail,
          grantedAt: g.grantedAt.toISOString(),
          grantedBy: g.grantedBy,
        })),
      });
    } catch (e) {
      console.error("[admin/admins GET]", e);
      return res.status(500).json({ error: "Failed to list admins." });
    }
  });

  app.post("/api/admin/admins", ...adminWrite, async (req, res) => {
    const emailNorm = normalizeAdminEmail(req.body?.email ?? "");
    if (!emailNorm) {
      return res.status(400).json({ error: "Valid email required." });
    }

    try {
      const existing = await prisma.adminGrant.findUnique({
        where: { userEmail: emailNorm },
      });

      if (existing && !existing.revokedAt) {
        await prisma.userOnboardingProfile.updateMany({
          where: { email: { equals: emailNorm, mode: "insensitive" } },
          data: { isAdmin: true },
        });
        return res.json({ ok: true, email: emailNorm, alreadyAdmin: true });
      }

      if (existing?.revokedAt) {
        await prisma.adminGrant.update({
          where: { userEmail: emailNorm },
          data: { revokedAt: null, grantedBy: req.adminEmail, grantedAt: new Date() },
        });
      } else {
        await prisma.adminGrant.create({
          data: { userEmail: emailNorm, grantedBy: req.adminEmail },
        });
      }

      await prisma.userOnboardingProfile.updateMany({
        where: { email: { equals: emailNorm, mode: "insensitive" } },
        data: { isAdmin: true },
      });

      return res.json({ ok: true, email: emailNorm });
    } catch (e) {
      console.error("[admin/admins POST]", e);
      return res.status(500).json({ error: "Could not grant admin." });
    }
  });

  app.delete("/api/admin/admins/:emailEnc", ...adminWrite, async (req, res) => {
    let target;
    try {
      target = normalizeAdminEmail(decodeURIComponent(req.params.emailEnc));
    } catch {
      return res.status(400).json({ error: "Invalid email parameter." });
    }
    if (!target) {
      return res.status(400).json({ error: "Invalid email." });
    }
    if (target === req.adminEmail) {
      return res.status(400).json({ error: "You cannot revoke your own admin access." });
    }

    try {
      await prisma.adminGrant.updateMany({
        where: { userEmail: target, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      await prisma.userOnboardingProfile.updateMany({
        where: { email: { equals: target, mode: "insensitive" } },
        data: { isAdmin: false },
      });

      return res.json({ ok: true });
    } catch (e) {
      console.error("[admin/admins DELETE]", e);
      return res.status(500).json({ error: "Could not revoke admin." });
    }
  });
}
