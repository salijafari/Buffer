import { CountryCode } from "plaid";
import { decryptPlaidAccessToken } from "./plaidCrypto.mjs";
import { getPlaidClient } from "./plaidClientFactory.mjs";
import { requireBffSession, requireBffCsrf } from "./sessionAuth.mjs";
import {
  buildDashboardOverviewPayload,
  buildTransactionSummary,
  estimateIncomeFromTransactions,
} from "./dashboardPayloads.mjs";
import { runPostLinkSync, runTransactionsSyncForItem } from "./plaidSyncEngine.mjs";

const requireSessionWithCsrf = [requireBffSession, requireBffCsrf];

function linkLanguageForProfile(profile) {
  const code = profile?.provinceCode?.toUpperCase?.() ?? "";
  return code === "QC" ? "fr" : "en";
}

async function processPlaidWebhookPayload(prisma, body) {
  const webhookType = typeof body.webhook_type === "string" ? body.webhook_type : "";
  const webhookCode = typeof body.webhook_code === "string" ? body.webhook_code : "";
  const plaidItemId = typeof body.item_id === "string" ? body.item_id : null;

  const itemRow = plaidItemId
    ? await prisma.plaidItem.findUnique({ where: { itemId: plaidItemId } })
    : null;

  try {
    await prisma.plaidWebhookLog.create({
      data: {
        itemId: plaidItemId,
        webhookType,
        webhookCode,
        payload: body,
        profileId: itemRow?.profileId ?? null,
        processed: false,
      },
    });
  } catch (e) {
    console.warn("[webhooks/plaid] log insert skipped:", e?.code ?? e?.message ?? e);
  }

  if (!itemRow) return;

  if (webhookType === "ITEM") {
    if (webhookCode === "ERROR") {
      const errCode = body.error?.error_code ?? "UNKNOWN";
      await prisma.plaidItem.update({
        where: { id: itemRow.id },
        data: { status: "error", errorCode: String(errCode) },
      });
      return;
    }
    if (webhookCode === "PENDING_EXPIRATION" || webhookCode === "USER_PERMISSION_REVOKED") {
      await prisma.plaidItem.update({
        where: { id: itemRow.id },
        data: { status: "login_required", errorCode: webhookCode },
      });
      return;
    }
  }

  if (webhookType === "TRANSACTIONS") {
    if (webhookCode === "DEFAULT_UPDATE" || webhookCode === "SYNC_UPDATES_AVAILABLE") {
      try {
        await runTransactionsSyncForItem(prisma, itemRow.id);
      } catch (e) {
        console.error("[webhooks/plaid] transaction sync failed:", e?.message ?? e);
      }
    }
  }

  if (webhookType === "HOLDINGS" || webhookType === "INVESTMENTS_TRANSACTIONS") {
    /* no-op for credit-card scope */
  }
}

export function registerPlaidDashboardRoutes(app, { prisma, ensureUserOnboardingProfile }) {
  app.get("/api/dashboard/overview", requireBffSession, async (req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      const profile = await ensureUserOnboardingProfile(req.auth.userId, req.auth.issuer, req.auth.accessToken);
      const payload = await buildDashboardOverviewPayload(prisma, profile);
      return res.json(payload);
    } catch (e) {
      console.error("[dashboard/overview]", e);
      return res.status(500).json({ error: "Failed to build overview." });
    }
  });

  app.get("/api/plaid/liabilities", requireBffSession, async (req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      const profile = await ensureUserOnboardingProfile(req.auth.userId, req.auth.issuer, req.auth.accessToken);
      const rows = await prisma.creditCardLiability.findMany({
        where: { profileId: profile.id },
        include: { plaidAccount: { include: { plaidItem: true } } },
        orderBy: { fetchedAt: "desc" },
      });
      const liabilities = rows.map((r) => ({
        id: r.id,
        plaid_account_internal_id: r.plaidAccountId,
        account_name: r.plaidAccount?.name,
        institution: r.plaidAccount?.plaidItem?.institutionName,
        purchase_apr: r.purchaseApr?.toString() ?? null,
        current_balance: r.currentBalance?.toString() ?? null,
        credit_limit: r.creditLimit?.toString() ?? null,
        minimum_payment: r.minimumPayment?.toString() ?? null,
        next_payment_due_date: r.nextPaymentDueDate,
        fetched_at: r.fetchedAt,
      }));
      return res.json({ liabilities });
    } catch (e) {
      console.error("[plaid/liabilities]", e);
      return res.status(500).json({ error: "Failed to load liabilities." });
    }
  });

  app.post("/api/plaid/sync", ...requireSessionWithCsrf, async (req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      const profile = await ensureUserOnboardingProfile(req.auth.userId, req.auth.issuer, req.auth.accessToken);
      const items = await prisma.plaidItem.findMany({
        where: { profileId: profile.id, status: "active" },
      });
      const results = [];
      for (const item of items) {
        try {
          await runPostLinkSync(prisma, profile.id, item.id);
          results.push({ item_id: item.itemId, ok: true });
        } catch (e) {
          console.error("[plaid/sync] item failed", item.itemId, e?.message ?? e);
          results.push({ item_id: item.itemId, ok: false, error: String(e?.message ?? e).slice(0, 200) });
        }
      }
      return res.json({ ok: true, items: results });
    } catch (e) {
      console.error("[plaid/sync]", e);
      return res.status(500).json({ error: "Sync failed." });
    }
  });

  app.get("/api/transactions/summary", requireBffSession, async (req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      const profile = await ensureUserOnboardingProfile(req.auth.userId, req.auth.issuer, req.auth.accessToken);
      const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
      const summary = await buildTransactionSummary(prisma, profile.id, days);
      return res.json(summary);
    } catch (e) {
      console.error("[transactions/summary]", e);
      return res.status(500).json({ error: "Failed to load summary." });
    }
  });

  app.get("/api/transactions/income", requireBffSession, async (req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      const profile = await ensureUserOnboardingProfile(req.auth.userId, req.auth.issuer, req.auth.accessToken);
      const est = await estimateIncomeFromTransactions(prisma, profile.id);
      return res.json(est);
    } catch (e) {
      console.error("[transactions/income]", e);
      return res.status(500).json({ error: "Failed to estimate income." });
    }
  });

  app.get("/api/plaid/auth", requireBffSession, async (req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      const profile = await ensureUserOnboardingProfile(req.auth.userId, req.auth.issuer, req.auth.accessToken);
      const rows = await prisma.bankAccountDetail.findMany({
        where: { profileId: profile.id },
        orderBy: { createdAt: "desc" },
      });
      return res.json({
        accounts: rows.map((r) => ({
          plaid_account_id: r.plaidAccountId,
          mask: r.accountMask,
          name: r.accountName,
          type: r.accountType,
          has_encrypted_pad: Boolean(r.encryptedAccount),
        })),
      });
    } catch (e) {
      console.error("[plaid/auth]", e);
      return res.status(500).json({ error: "Failed to load auth metadata." });
    }
  });

  app.get("/api/plaid/balance", requireBffSession, async (req, res) => {
    res.set("Cache-Control", "no-store");
    res.set("X-Buffer-Plaid-Balance", "on-demand; do not poll faster than 1/min per user in production");

    let plaidClient;
    try {
      plaidClient = getPlaidClient();
    } catch (e) {
      if (e.code === "PLAID_NOT_CONFIGURED") {
        return res.status(503).json({ error: "Plaid is not configured on this server." });
      }
      throw e;
    }

    try {
      const profile = await ensureUserOnboardingProfile(req.auth.userId, req.auth.issuer, req.auth.accessToken);
      const items = await prisma.plaidItem.findMany({
        where: { profileId: profile.id, status: "active" },
      });
      const accounts = [];
      for (const item of items) {
        let accessToken;
        try {
          accessToken = decryptPlaidAccessToken(item.encryptedAccessToken);
        } catch (e2) {
          console.warn("[plaid/balance] decrypt failed", e2?.message ?? e2);
          continue;
        }
        try {
          const { data } = await plaidClient.accountsBalanceGet({ access_token: accessToken });
          for (const a of data.accounts ?? []) {
            accounts.push({
              item_id: item.itemId,
              institution: item.institutionName,
              account_id: a.account_id,
              name: a.name,
              type: a.type,
              subtype: a.subtype,
              current: a.balances?.current ?? null,
              available: a.balances?.available ?? null,
              limit: a.balances?.limit ?? null,
              iso_currency_code: a.balances?.iso_currency_code ?? "CAD",
            });
          }
        } catch (e3) {
          console.error("[plaid/balance] accountsBalanceGet failed", e3?.response?.data ?? e3?.message ?? e3);
        }
      }
      return res.json({ accounts });
    } catch (e) {
      console.error("[plaid/balance]", e);
      return res.status(500).json({ error: "Failed to refresh balances." });
    }
  });

  app.post("/api/plaid/create-update-link-token", ...requireSessionWithCsrf, async (req, res) => {
    res.set("Cache-Control", "no-store");
    const body = req.body ?? {};
    const targetPlaidItemId = typeof body.item_id === "string" ? body.item_id : null;

    let plaidClient;
    try {
      plaidClient = getPlaidClient();
    } catch (e) {
      if (e.code === "PLAID_NOT_CONFIGURED") {
        return res.status(503).json({ error: "Plaid is not configured on this server." });
      }
      throw e;
    }

    try {
      const profile = await ensureUserOnboardingProfile(req.auth.userId, req.auth.issuer, req.auth.accessToken);
      const item = targetPlaidItemId
        ? await prisma.plaidItem.findFirst({
            where: { profileId: profile.id, itemId: targetPlaidItemId },
          })
        : await prisma.plaidItem.findFirst({
            where: { profileId: profile.id, status: { in: ["error", "login_required"] } },
            orderBy: { updatedAt: "desc" },
          });

      if (!item) {
        return res.status(404).json({ error: "No Plaid item found for update mode." });
      }

      const accessToken = decryptPlaidAccessToken(item.encryptedAccessToken);
      const request = {
        user: { client_user_id: profile.id },
        client_name: "Buffer",
        country_codes: [CountryCode.Ca],
        language: linkLanguageForProfile(profile),
        access_token: accessToken,
        ...(process.env.PLAID_WEBHOOK_URL ? { webhook: process.env.PLAID_WEBHOOK_URL } : {}),
      };

      const { data } = await plaidClient.linkTokenCreate(request);
      return res.json({ link_token: data.link_token });
    } catch (e) {
      console.error("[plaid/create-update-link-token]", e?.response?.data ?? e);
      const msg = e?.response?.data?.error_message || e?.message || "link_token failed";
      return res.status(502).json({ error: msg });
    }
  });

  /**
   * Plaid webhooks — no session. Optionally verify JWT in production (PLAID webhook verification).
   */
  app.post("/webhooks/plaid", async (req, res) => {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    try {
      void processPlaidWebhookPayload(prisma, body).catch((err) =>
        console.error("[webhooks/plaid] async handler:", err?.message ?? err),
      );
    } catch (e) {
      console.error("[webhooks/plaid]", e);
    }
    return res.status(200).json({ received: true });
  });
}
