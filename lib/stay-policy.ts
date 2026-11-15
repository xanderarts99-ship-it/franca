import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";
import { dateKey } from "./stay-dates";
import { validateStay, type StayPolicy } from "./stay-rules";

type PolicyClient = Pick<
  Prisma.TransactionClient,
  "staySettings" | "stayRule" | "property"
>;

export async function getStayPolicy(
  propertyId: string,
  db: PolicyClient = prisma,
): Promise<StayPolicy> {
  const [settings, property, rules] = await Promise.all([
    db.staySettings.findUniqueOrThrow({ where: { id: "default" } }),
    db.property.findUniqueOrThrow({
      where: { id: propertyId },
      select: { minimumStayNights: true },
    }),
    db.stayRule.findMany({
      where: { OR: [{ propertyId: null }, { propertyId }] },
    }),
  ]);
  return {
    version: settings.version,
    defaultMinimum: settings.minimumNights,
    propertyMinimum: property.minimumStayNights,
    rules: rules.map((r) => ({
      ...r,
      startDate: dateKey(r.startDate),
      endDate: dateKey(r.endDate),
    })),
  };
}

/** Both rule edits and booking acceptance take this lock, so each booking uses one committed policy. */
export async function lockStaySettings(tx: Prisma.TransactionClient) {
  const rows = await tx.$queryRaw<
    { id: string }[]
  >`SELECT "id" FROM "StaySettings" WHERE "id" = 'default' FOR UPDATE`;
  if (rows.length !== 1)
    throw new Error(
      "Stay settings are missing. Apply the minimum-stay database change.",
    );
}

export async function validateBookingStay(
  tx: Prisma.TransactionClient,
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
) {
  return validateStay(
    await getStayPolicy(propertyId, tx),
    dateKey(checkIn),
    dateKey(checkOut),
  );
}
