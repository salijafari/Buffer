/** Bootstrap admins — first login auto-creates AdminGrant row (see verify flow). */
export const INITIAL_ADMIN_EMAILS = ["ali@mybuffer.ca", "masoud@mybuffer.ca"];

export function normalizeAdminEmail(raw) {
  if (typeof raw !== "string") return "";
  return raw.trim().toLowerCase();
}

export function isInitialAdminEmail(norm) {
  return INITIAL_ADMIN_EMAILS.includes(norm);
}

/**
 * Ensures initial admins have a grant row; returns true if this email is an active admin.
 * @param {import("@prisma/client").PrismaClient} prisma
 */
export async function checkIsActiveAdmin(prisma, emailNorm) {
  if (!emailNorm) return false;

  if (isInitialAdminEmail(emailNorm)) {
    await prisma.adminGrant.upsert({
      where: { userEmail: emailNorm },
      create: { userEmail: emailNorm, grantedBy: "SYSTEM" },
      update: {},
    });
  }

  const grant = await prisma.adminGrant.findUnique({
    where: { userEmail: emailNorm },
  });
  return Boolean(grant && !grant.revokedAt);
}
