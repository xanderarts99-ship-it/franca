import { prisma } from "./prisma";

export interface NightlyBreakdownItem {
  date: string;
  price: number;
}

export interface NightlyTotalResult {
  total: number;
  breakdown: NightlyBreakdownItem[];
  hasCustomPricing: boolean;
}

export interface BookingTotalResult {
  nightlyTotal: number;
  nightlyBreakdown: NightlyBreakdownItem[];
  cleaningFee: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  hasCustomPricing: boolean;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function calculateNightlyTotal(
  propertyId: string,
  checkIn: Date,
  checkOut: Date
): Promise<NightlyTotalResult> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { nightlyRate: true },
  });
  if (!property) throw new Error("Property not found");

  const baseRate = Number(property.nightlyRate);

  // Generate all night dates (check-in date to day before check-out)
  const nights: Date[] = [];
  const cur = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
  const end = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
  while (cur < end) {
    nights.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  if (nights.length === 0) throw new Error("No nights in range");

  // Fetch custom pricing for the date range
  const customPricingRecords = await prisma.propertyPricing.findMany({
    where: {
      propertyId,
      date: { gte: checkIn, lt: checkOut },
    },
    select: { date: true, price: true },
  });

  const customPricingMap = new Map<string, number>(
    customPricingRecords.map((r) => [toDateKey(r.date), Number(r.price)])
  );

  const breakdown: NightlyBreakdownItem[] = nights.map((night) => ({
    date: toDateKey(night),
    price: customPricingMap.get(toDateKey(night)) ?? baseRate,
  }));

  const total = round2(breakdown.reduce((sum, item) => sum + item.price, 0));
  const hasCustomPricing = customPricingRecords.length > 0;

  return { total, breakdown, hasCustomPricing };
}

export async function calculateBookingTotal(
  propertyId: string,
  checkIn: Date,
  checkOut: Date
): Promise<BookingTotalResult> {
  const [nightlyResult, property] = await Promise.all([
    calculateNightlyTotal(propertyId, checkIn, checkOut),
    prisma.property.findUnique({
      where: { id: propertyId },
      select: { cleaningFee: true, taxRate: true },
    }),
  ]);

  if (!property) throw new Error("Property not found");

  const nightlyTotal = nightlyResult.total;
  const cleaningFee = round2(Number(property.cleaningFee ?? 0));
  const taxRate = round2(Number(property.taxRate ?? 0.06));
  const taxAmount = round2((nightlyTotal + cleaningFee) * taxRate);
  const totalAmount = round2(nightlyTotal + cleaningFee + taxAmount);

  return {
    nightlyTotal,
    nightlyBreakdown: nightlyResult.breakdown,
    cleaningFee,
    taxRate,
    taxAmount,
    totalAmount,
    hasCustomPricing: nightlyResult.hasCustomPricing,
  };
}

export async function validateBookingAmount(
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
  submittedTotal: number
): Promise<boolean> {
  const result = await calculateBookingTotal(propertyId, checkIn, checkOut);
  return Math.abs(result.totalAmount - submittedTotal) <= 1.0;
}
