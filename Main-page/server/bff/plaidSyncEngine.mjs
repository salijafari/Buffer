import { Prisma } from "@prisma/client";
import { decryptPlaidAccessToken, encryptPlaidAccessToken } from "./plaidCrypto.mjs";
import { getPlaidClient } from "./plaidClientFactory.mjs";

function toDec(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return new Prisma.Decimal(String(n));
}

function parsePlaidDate(d) {
  if (!d || typeof d !== "string") return null;
  const [y, m, day] = d.split("-").map(Number);
  if (!y || !m || !day) return null;
  return new Date(Date.UTC(y, m - 1, day, 12, 0, 0, 0));
}

/** Plaid JSON may be snake_case; TS SDK types often use camelCase — accept both. */
function pick(obj, ...keys) {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

/**
 * Upsert Plaid accounts from /accounts/get (balances + metadata).
 */
export async function upsertAccountsFromAccountsGet(prisma, profileId, itemRow, accounts) {
  const institutionId = itemRow.institutionId ?? null;
  for (const a of accounts ?? []) {
    const id = typeof a.account_id === "string" ? a.account_id : null;
    if (!id) continue;
    const cur = a.balances?.current;
    const avail = a.balances?.available;
    const limit = a.balances?.limit;
    await prisma.plaidAccount.upsert({
      where: {
        plaidItemId_accountId: { plaidItemId: itemRow.id, accountId: id },
      },
      create: {
        profileId,
        plaidItemId: itemRow.id,
        accountId: id,
        name: typeof a.name === "string" ? a.name : null,
        officialName: typeof a.official_name === "string" ? a.official_name : null,
        type: typeof a.type === "string" ? a.type : null,
        subtype: typeof a.subtype === "string" ? a.subtype : null,
        mask: typeof a.mask === "string" ? a.mask : null,
        institutionId,
        currentBalance: toDec(cur),
        availableBalance: toDec(avail),
        creditLimit: toDec(limit),
        isoCurrencyCode: typeof a.balances?.iso_currency_code === "string" ? a.balances.iso_currency_code : "CAD",
      },
      update: {
        name: typeof a.name === "string" ? a.name : null,
        officialName: typeof a.official_name === "string" ? a.official_name : null,
        type: typeof a.type === "string" ? a.type : null,
        subtype: typeof a.subtype === "string" ? a.subtype : null,
        mask: typeof a.mask === "string" ? a.mask : null,
        currentBalance: toDec(cur),
        availableBalance: toDec(avail),
        creditLimit: toDec(limit),
        isoCurrencyCode: typeof a.balances?.iso_currency_code === "string" ? a.balances.iso_currency_code : "CAD",
      },
    });
  }
}

/**
 * Phase 2: /liabilities/get → credit_card_liabilities + refresh balances on accounts.
 */
export async function syncLiabilitiesForItem(prisma, plaidClient, itemRow, profileId) {
  const accessToken = decryptPlaidAccessToken(itemRow.encryptedAccessToken);
  let data;
  try {
    const res = await plaidClient.liabilitiesGet({ access_token: accessToken });
    data = res.data;
  } catch (e) {
    console.warn("[plaid/sync] liabilitiesGet failed:", e?.response?.data ?? e?.message ?? e);
    return;
  }

  const accounts = data.accounts ?? [];
  await upsertAccountsFromAccountsGet(prisma, profileId, itemRow, accounts);

  const byPlaidAccountId = new Map(accounts.map((a) => [a.account_id, a]));
  const credits = data.liabilities?.credit ?? [];

  for (const credit of credits) {
    const plaidAcctId = pick(credit, "account_id", "accountId");
    const acc = plaidAcctId ? byPlaidAccountId.get(plaidAcctId) : null;
    if (!acc || acc.type !== "credit") continue;

    const pa = await prisma.plaidAccount.findUnique({
      where: {
        plaidItemId_accountId: { plaidItemId: itemRow.id, accountId: plaidAcctId },
      },
    });
    if (!pa) continue;

    const aprs = credit.aprs ?? [];
    const purchaseAprObj = aprs.find((x) => pick(x, "apr_type", "aprType") === "purchase_apr");
    const aprPct = pick(purchaseAprObj, "apr_percentage", "aprPercentage");
    const purchaseApr = aprPct != null ? toDec(Number(aprPct) / 100) : null;

    const btAprObj = aprs.find((x) => pick(x, "apr_type", "aprType") === "balance_transfer_apr");
    const btPct = pick(btAprObj, "apr_percentage", "aprPercentage");
    const balanceTransferApr = btPct != null ? toDec(Number(btPct) / 100) : null;

    const cashAprObj = aprs.find((x) => pick(x, "apr_type", "aprType") === "cash_apr");
    const cashPct = pick(cashAprObj, "apr_percentage", "aprPercentage");
    const cashApr = cashPct != null ? toDec(Number(cashPct) / 100) : null;

    const curBal = acc.balances?.current;
    const lim = acc.balances?.limit;
    const avail = acc.balances?.available;

    const balNum = curBal != null ? Number(curBal) : 0;
    const limNum = lim != null ? Number(lim) : 0;
    const utilPct = limNum > 0 ? Math.min(1, balNum / limNum) : null;

    const minPay = pick(credit, "minimum_payment_amount", "minimumPaymentAmount", "minimum_payment", "minimumPayment");
    const lastPayAmt = pick(credit, "last_payment_amount", "lastPaymentAmount");
    const lastStmtBal = pick(credit, "last_statement_balance", "lastStatementBalance");
    const nextDue = pick(credit, "next_payment_due_date", "nextPaymentDueDate");
    const lastPayDate = pick(credit, "last_payment_date", "lastPaymentDate");
    const isOverdue = Boolean(pick(credit, "is_overdue", "isOverdue"));

    await prisma.creditCardLiability.upsert({
      where: { plaidAccountId: pa.id },
      create: {
        profileId,
        plaidAccountId: pa.id,
        purchaseApr,
        balanceTransferApr,
        cashApr,
        currentBalance: toDec(curBal),
        creditLimit: toDec(lim),
        availableCredit: toDec(avail),
        utilizationPct: utilPct != null ? toDec(utilPct) : null,
        minimumPayment: toDec(minPay),
        nextPaymentDueDate: typeof nextDue === "string" ? parsePlaidDate(nextDue) : null,
        lastPaymentAmount: toDec(lastPayAmt),
        lastPaymentDate: typeof lastPayDate === "string" ? parsePlaidDate(lastPayDate) : null,
        lastStatementBalance: toDec(lastStmtBal),
        isOverdue,
        monthlyInterestCost:
          purchaseApr != null && curBal != null
            ? toDec((Number(curBal) * Number(purchaseApr.toString())) / 12)
            : null,
        fetchedAt: new Date(),
      },
      update: {
        purchaseApr,
        balanceTransferApr,
        cashApr,
        currentBalance: toDec(curBal),
        creditLimit: toDec(lim),
        availableCredit: toDec(avail),
        utilizationPct: utilPct != null ? toDec(utilPct) : null,
        minimumPayment: toDec(minPay),
        nextPaymentDueDate: typeof nextDue === "string" ? parsePlaidDate(nextDue) : null,
        lastPaymentAmount: toDec(lastPayAmt),
        lastPaymentDate: typeof lastPayDate === "string" ? parsePlaidDate(lastPayDate) : null,
        lastStatementBalance: toDec(lastStmtBal),
        isOverdue,
        monthlyInterestCost:
          purchaseApr != null && curBal != null
            ? toDec((Number(curBal) * Number(purchaseApr.toString())) / 12)
            : null,
        fetchedAt: new Date(),
      },
    });
  }
}

function mapTransactionRow(profileId, t) {
  const pfc = t.personal_finance_category ?? t.personalFinanceCategory;
  const primary = pfc?.primary ?? pfc?.detailed ?? null;
  const detailed = pfc?.detailed ?? null;
  const dateStr = pick(t, "date");
  const date = typeof dateStr === "string" ? parsePlaidDate(dateStr) : null;
  if (!date) return null;
  const name =
    typeof t.name === "string" && t.name.trim()
      ? t.name
      : typeof t.original_description === "string"
        ? t.original_description
        : "Transaction";
  const txId = pick(t, "transaction_id", "transactionId");
  const acctId = pick(t, "account_id", "accountId");
  if (!txId || !acctId) return null;

  return {
    profileId,
    plaidTransactionId: txId,
    plaidAccountId: acctId,
    amount: toDec(pick(t, "amount")) ?? new Prisma.Decimal(0),
    date,
    datetime: (() => {
      const dt = pick(t, "datetime");
      return dt ? new Date(dt) : null;
    })(),
    name,
    merchantName: (() => {
      const m = pick(t, "merchant_name", "merchantName");
      return typeof m === "string" ? m : null;
    })(),
    categoryPrimary: typeof primary === "string" ? primary : null,
    categoryDetailed: typeof detailed === "string" ? detailed : null,
    pending: Boolean(pick(t, "pending")),
    isoCurrencyCode: (() => {
      const c = pick(t, "iso_currency_code", "isoCurrencyCode");
      return typeof c === "string" ? c : "CAD";
    })(),
  };
}

/**
 * Phase 3: /transactions/sync with cursor on plaid_items.
 */
export async function syncTransactionsForItem(prisma, plaidClient, itemRow, profileId) {
  const accessToken = decryptPlaidAccessToken(itemRow.encryptedAccessToken);
  let cursor = itemRow.transactionsCursor ?? "";
  let hasMore = true;

  while (hasMore) {
    let data;
    try {
      const res = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor: cursor || undefined,
        count: 500,
      });
      data = res.data;
    } catch (e) {
      console.error("[plaid/sync] transactionsSync failed:", e?.response?.data ?? e?.message ?? e);
      throw e;
    }

    for (const t of data.added ?? []) {
      const row = mapTransactionRow(profileId, t);
      if (!row?.date) continue;
      await prisma.plaidTransaction.upsert({
        where: { plaidTransactionId: row.plaidTransactionId },
        create: row,
        update: {
          amount: row.amount,
          date: row.date,
          datetime: row.datetime,
          name: row.name,
          merchantName: row.merchantName,
          categoryPrimary: row.categoryPrimary,
          categoryDetailed: row.categoryDetailed,
          pending: row.pending,
          isoCurrencyCode: row.isoCurrencyCode,
        },
      });
    }

    for (const t of data.modified ?? []) {
      const row = mapTransactionRow(profileId, t);
      if (!row?.date) continue;
      await prisma.plaidTransaction.upsert({
        where: { plaidTransactionId: row.plaidTransactionId },
        create: row,
        update: {
          amount: row.amount,
          date: row.date,
          datetime: row.datetime,
          name: row.name,
          merchantName: row.merchantName,
          categoryPrimary: row.categoryPrimary,
          categoryDetailed: row.categoryDetailed,
          pending: row.pending,
          isoCurrencyCode: row.isoCurrencyCode,
        },
      });
    }

    const removed = data.removed ?? [];
    if (removed.length) {
      const ids = removed.map((r) => pick(r, "transaction_id", "transactionId")).filter(Boolean);
      await prisma.plaidTransaction.deleteMany({
        where: {
          profileId,
          plaidTransactionId: { in: ids },
        },
      });
    }

    cursor = data.next_cursor ?? cursor;
    hasMore = Boolean(data.has_more);
  }

  await prisma.plaidItem.update({
    where: { id: itemRow.id },
    data: {
      transactionsCursor: cursor,
      lastSuccessfulUpdate: new Date(),
    },
  });
}

/**
 * Phase 4: /auth/get → encrypted EFT-style numbers (Canada).
 */
export async function syncAuthForItem(prisma, plaidClient, itemRow, profileId) {
  const accessToken = decryptPlaidAccessToken(itemRow.encryptedAccessToken);
  let data;
  try {
    const res = await plaidClient.authGet({ access_token: accessToken });
    data = res.data;
  } catch (e) {
    console.warn("[plaid/sync] authGet failed:", e?.response?.data ?? e?.message ?? e);
    return;
  }

  const eft = data.numbers?.eft ?? [];
  const institutionName = data.item?.institution_name ?? itemRow.institutionName ?? "";

  for (const row of eft) {
    const accountId = typeof row.account_id === "string" ? row.account_id : null;
    if (!accountId) continue;

    const acct = data.accounts?.find((a) => a.account_id === accountId);
    const instNum = row.institution_number != null ? String(row.institution_number) : "";
    const branch = row.branch != null ? String(row.branch) : "";
    const acctNum = row.account != null ? String(row.account) : "";

    const encInst = instNum ? encryptPlaidAccessToken(`${institutionName}|${instNum}`) : null;
    const encBranch = branch ? encryptPlaidAccessToken(branch) : null;
    const encAcct = acctNum ? encryptPlaidAccessToken(acctNum) : null;

    await prisma.bankAccountDetail.upsert({
      where: {
        profileId_plaidAccountId: { profileId, plaidAccountId: accountId },
      },
      create: {
        profileId,
        plaidAccountId: accountId,
        encryptedInstitution: encInst,
        encryptedBranch: encBranch,
        encryptedAccount: encAcct,
        accountMask: acct?.mask ?? null,
        accountName: acct?.name ?? null,
        accountType: acct?.subtype ?? acct?.type ?? null,
        isPrimary: true,
      },
      update: {
        encryptedInstitution: encInst,
        encryptedBranch: encBranch,
        encryptedAccount: encAcct,
        accountMask: acct?.mask ?? null,
        accountName: acct?.name ?? null,
        accountType: acct?.subtype ?? acct?.type ?? null,
      },
    });
  }
}

/**
 * Refresh accounts only (cheap) — used when metadata exchange missed accounts.
 */
export async function syncAccountsForItem(prisma, plaidClient, itemRow, profileId) {
  const accessToken = decryptPlaidAccessToken(itemRow.encryptedAccessToken);
  const { data } = await plaidClient.accountsGet({ access_token: accessToken });
  await upsertAccountsFromAccountsGet(prisma, profileId, itemRow, data.accounts ?? []);
}

/**
 * Full post-link / webhook sync for one item.
 */
export async function runPostLinkSync(prisma, profileId, internalItemId) {
  const item = await prisma.plaidItem.findFirst({
    where: { id: internalItemId, profileId, status: "active" },
  });
  if (!item) {
    console.warn("[plaid/sync] item not found or inactive", { profileId, internalItemId });
    return;
  }

  let plaidClient;
  try {
    plaidClient = getPlaidClient();
  } catch (e) {
    console.error("[plaid/sync] Plaid client unavailable:", e?.message ?? e);
    return;
  }

  try {
    await syncAccountsForItem(prisma, plaidClient, item, profileId);
    await syncLiabilitiesForItem(prisma, plaidClient, item, profileId);
    await syncTransactionsForItem(prisma, plaidClient, item, profileId);
    const fresh = await prisma.plaidItem.findUnique({ where: { id: item.id } });
    if (fresh) await syncAuthForItem(prisma, plaidClient, fresh, profileId);
  } catch (e) {
    console.error("[plaid/sync] runPostLinkSync error:", e?.response?.data ?? e?.message ?? e);
    throw e;
  }
}

/**
 * Sync transactions only (webhook DEFAULT_UPDATE).
 */
export async function runTransactionsSyncForItem(prisma, internalItemId) {
  const item = await prisma.plaidItem.findUnique({ where: { id: internalItemId } });
  if (!item || item.status !== "active") return;

  let plaidClient;
  try {
    plaidClient = getPlaidClient();
  } catch (e) {
    console.error("[plaid/sync] Plaid client unavailable:", e?.message ?? e);
    return;
  }

  try {
    await syncTransactionsForItem(prisma, plaidClient, item, item.profileId);
  } catch (e) {
    console.error("[plaid/sync] transactions-only sync failed:", e?.response?.data ?? e?.message ?? e);
    throw e;
  }
}
