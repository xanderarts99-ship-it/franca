import {
  addDays,
  parseStayDate,
  stayNights,
  todayAtProperty,
  formatStayDate,
} from "./stay-dates";

export const MAX_STAY_NIGHTS = 30;
export interface SeasonalStayRule {
  id: string;
  name: string;
  propertyId: string | null;
  startDate: string;
  endDate: string;
  minimumNights: number;
}
/** rules must already be filtered to the selected property and all-home rules. */
export interface StayPolicy {
  version?: number;
  defaultMinimum: number;
  propertyMinimum: number | null;
  rules: SeasonalStayRule[];
}
export interface MinimumStayResult {
  minimumNights: number;
  source: string;
}

export function resolveMinimumStay(
  policy: StayPolicy,
  arrival: string,
): MinimumStayResult {
  parseStayDate(arrival);
  const matching = policy.rules.filter(
    (rule) => rule.startDate <= arrival && rule.endDate >= arrival,
  );
  const specific = matching.filter((rule) => rule.propertyId !== null);
  const candidates = specific.length ? specific : matching;
  const winner = [...candidates].sort(
    (a, b) => b.minimumNights - a.minimumNights || a.id.localeCompare(b.id),
  )[0];
  return winner
    ? { minimumNights: winner.minimumNights, source: winner.name }
    : {
        minimumNights: policy.propertyMinimum ?? policy.defaultMinimum,
        source:
          policy.propertyMinimum === null
            ? "Usual minimum for all homes"
            : "This home's usual minimum",
      };
}

export class StayValidationError extends Error {
  readonly code: string;
  readonly minimumNights?: number;
  readonly earliestCheckout?: string;
  constructor(
    message: string,
    code = "INVALID_STAY",
    minimumNights?: number,
    earliestCheckout?: string,
  ) {
    super(message);
    this.name = "StayValidationError";
    this.code = code;
    this.minimumNights = minimumNights;
    this.earliestCheckout = earliestCheckout;
  }
}

export function validateStay(
  policy: StayPolicy,
  checkIn: string,
  checkOut: string,
  today = todayAtProperty(),
) {
  let nights: number;
  try {
    nights = stayNights(checkIn, checkOut);
  } catch {
    throw new StayValidationError(
      "Please choose real check-in and checkout dates.",
    );
  }
  if (checkIn < today)
    throw new StayValidationError("Check-in must be today or in the future.");
  if (nights <= 0)
    throw new StayValidationError("Check-out must be after check-in.");
  if (nights > MAX_STAY_NIGHTS)
    throw new StayValidationError("Maximum stay is 30 nights.");
  const result = resolveMinimumStay(policy, checkIn);
  if (nights < result.minimumNights) {
    const earliest = addDays(checkIn, result.minimumNights);
    throw new StayValidationError(
      `This arrival requires at least ${result.minimumNights} nights. Choose checkout on or after ${formatStayDate(earliest)}.`,
      "MINIMUM_STAY",
      result.minimumNights,
      earliest,
    );
  }
  return { ...result, nights };
}

export function checkoutAllowed(
  checkIn: string,
  checkOut: string,
  minimum: number,
  blockedDates: Iterable<string>,
): boolean {
  const nights = stayNights(checkIn, checkOut);
  if (nights < minimum || nights > MAX_STAY_NIGHTS) return false;
  for (const blocked of blockedDates)
    if (blocked >= checkIn && blocked < checkOut) return false;
  return true;
}
