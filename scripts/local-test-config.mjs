/** Local tooling deliberately accepts exactly one loopback database target. */
export function assertLocalTestUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "postgresql:" || url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/rammies_test") {
    throw new Error("Refusing to use anything except the isolated local test database on 127.0.0.1:55432.");
  }
}

/** Bootstrap a fresh local database before exercising the real minimum-stay SQL. */
export function baselineSchema(schema) {
  return schema
    .replace(/^model (StaySettings|StayRule|PaymentReview) \{[\s\S]*?^\}\r?\n/gm, "")
    .replace(/model Property \{[\s\S]*?^\}/m, (model) => model.replace(/^\s*(minimumStayNights|stayRules)\s+.*$/gm, ""))
    .replace(/model Booking \{[\s\S]*?^\}/m, (model) => model.replace(/^\s*(minimumStayApplied|reviewRequestSentAt)\s+.*$/gm, ""));
}
