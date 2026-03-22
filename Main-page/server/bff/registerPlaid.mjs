import { Products, CountryCode } from "plaid";
import { decryptPlaidAccessToken, encryptPlaidAccessToken } from "./plaidCrypto.mjs";
import { getPlaidClient } from "./plaidClientFactory.mjs";
import { runPostLinkSync } from "./plaidSyncEngine.mjs";
import { requireBffSession, requireBffCsrf } from "./sessionAuth.mjs";

const requireSessionWithCsrf = [requireBffSession, requireBffCsrf];

function linkLanguageForProfile(profile) {
  const code = profile?.provinceCode?.toUpperCase?.() ?? "";
  return code === "QC" ? "fr" : "en";
}

export function registerPlaidRoutes(app, { prisma, ensureUserOnboardingProfile }) {
  app.get("/api/plaid/connection-status", requireBffSession, async (req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      const profile = await prisma.userOnboardingProfile.findUnique({
        where: { clerkUserId: req.auth.userId },
        select: { id: true, plaidConnectionStatus: true },
      });
      if (!profile) {
        return res.json({ connected: false, status: "disconnected" });
      }
      const activeItems = await prisma.plaidItem.count({
        where: { profileId: profile.id, status: "active" },
      });
      const connected = profile.plaidConnectionStatus === "connected" && activeItems > 0;
      return res.json({
        connected,
        status: profile.plaidConnectionStatus ?? "disconnected",
      });
    } catch (e) {
      console.error("[plaid/connection-status]", e);
      return res.status(500).json({ error: "Failed to load connection status." });
    }
  });

  app.post("/api/plaid/create-link-token", ...requireSessionWithCsrf, async (req, res) => {
    res.set("Cache-Control", "no-store");
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

      // Phase 7: Link update mode (re-auth) uses access_token only — no products list.
      const erroredItem = await prisma.plaidItem.findFirst({
        where: { profileId: profile.id, status: { in: ["error", "login_required"] } },
        orderBy: { updatedAt: "desc" },
      });
      let updateAccessToken = null;
      if (erroredItem) {
        try {
          updateAccessToken = decryptPlaidAccessToken(erroredItem.encryptedAccessToken);
        } catch (decErr) {
          console.warn("[plaid/create-link-token] could not decrypt item for update mode:", decErr?.message ?? decErr);
        }
      }

      const request =
        updateAccessToken != null
          ? {
              user: { client_user_id: profile.id },
              client_name: "Buffer",
              country_codes: [CountryCode.Ca],
              language: linkLanguageForProfile(profile),
              access_token: updateAccessToken,
              ...(process.env.PLAID_WEBHOOK_URL ? { webhook: process.env.PLAID_WEBHOOK_URL } : {}),
            }
          : {
              user: { client_user_id: profile.id },
              client_name: "Buffer",
              products: [Products.Transactions, Products.Liabilities, Products.Auth],
              country_codes: [CountryCode.Ca],
              language: linkLanguageForProfile(profile),
              transactions: { days_requested: 365 },
              ...(process.env.PLAID_WEBHOOK_URL ? { webhook: process.env.PLAID_WEBHOOK_URL } : {}),
            };

      const { data } = await plaidClient.linkTokenCreate(request);
      return res.json({ link_token: data.link_token });
    } catch (e) {
      console.error("[plaid/create-link-token]", e?.response?.data ?? e);
      const msg = e?.response?.data?.error_message || e?.message || "link_token failed";
      return res.status(502).json({ error: msg });
    }
  });

  app.post("/api/plaid/exchange-token", ...requireSessionWithCsrf, async (req, res) => {
    res.set("Cache-Control", "no-store");
    const body = req.body ?? {};
    const publicToken = typeof body.public_token === "string" ? body.public_token : null;
    const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};

    if (!publicToken) {
      return res.status(400).json({ error: "public_token is required." });
    }

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

      const { data } = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
      const accessToken = data.access_token;
      const itemId = data.item_id;

      const encrypted = encryptPlaidAccessToken(accessToken);
      const institution = metadata.institution ?? {};
      const accounts = Array.isArray(metadata.accounts) ? metadata.accounts : [];

      const item = await prisma.$transaction(async (tx) => {
        const row = await tx.plaidItem.upsert({
          where: { itemId },
          create: {
            profileId: profile.id,
            encryptedAccessToken: encrypted,
            itemId,
            institutionId: typeof institution.institution_id === "string" ? institution.institution_id : null,
            institutionName: typeof institution.name === "string" ? institution.name : null,
            status: "active",
            errorCode: null,
            linkMetadata: metadata,
          },
          update: {
            encryptedAccessToken: encrypted,
            institutionId: typeof institution.institution_id === "string" ? institution.institution_id : null,
            institutionName: typeof institution.name === "string" ? institution.name : null,
            status: "active",
            errorCode: null,
            linkMetadata: metadata,
          },
        });

        await tx.userOnboardingProfile.update({
          where: { id: profile.id },
          data: { plaidConnectionStatus: "connected" },
        });

        for (const acc of accounts) {
          const id = typeof acc.id === "string" ? acc.id : null;
          if (!id) continue;
          await tx.plaidAccount.upsert({
            where: {
              plaidItemId_accountId: { plaidItemId: row.id, accountId: id },
            },
            create: {
              profileId: profile.id,
              plaidItemId: row.id,
              accountId: id,
              name: typeof acc.name === "string" ? acc.name : null,
              officialName: typeof acc.official_name === "string" ? acc.official_name : null,
              type: typeof acc.type === "string" ? acc.type : null,
              subtype: typeof acc.subtype === "string" ? acc.subtype : null,
              mask: typeof acc.mask === "string" ? acc.mask : null,
              institutionId: typeof institution.institution_id === "string" ? institution.institution_id : null,
              isoCurrencyCode: "CAD",
            },
            update: {
              name: typeof acc.name === "string" ? acc.name : null,
              officialName: typeof acc.official_name === "string" ? acc.official_name : null,
              type: typeof acc.type === "string" ? acc.type : null,
              subtype: typeof acc.subtype === "string" ? acc.subtype : null,
              mask: typeof acc.mask === "string" ? acc.mask : null,
            },
          });
        }

        return row;
      });

      void runPostLinkSync(prisma, profile.id, item.id).catch((err) =>
        console.error("[plaid/exchange-token] initial sync failed:", err),
      );

      return res.json({ success: true, item_id: itemId });
    } catch (e) {
      console.error("[plaid/exchange-token]", e?.response?.data ?? e);
      const msg = e?.response?.data?.error_message || e?.message || "exchange failed";
      return res.status(502).json({ error: msg });
    }
  });
}
