# Minimum stays: deployment and testing

**Release status, November 15, 2026:** the production database change has already been applied to the Franca Supabase project as migration `20261115094644_add_minimum_stay_rules`. All original application records were verified unchanged. **Do not rerun this SQL on that project.** Code deployment is still pending your push/release workflow. See `RELEASE_NOTES.md` for the current release checklist; the general instructions below remain useful for other environments.

## What Franca can control

Open **Admin → Stay rules** (also available in the mobile menu).

- **Usual minimum stay:** starts at 2 nights and applies to every home without its own minimum.
- **Busy periods:** add a name, choose all homes or one home, select first/last arrival dates, and choose 1–30 nights. Both dates are included. Open **Preview this change before saving** to see the result for affected homes.
- **Individual homes:** expand this section only when a home needs its own usual minimum. Choose **Follow usual minimum** to remove that exception.
- **Preview a guest’s stay:** shows the saved minimum and earliest checkout for a chosen home/check-in date. It does not create a booking or check availability. On wide screens it sits beside the settings.

Busy-period rules depend on arrival, not every night occupied. A home-specific busy-period rule beats an all-home busy-period rule, including when it is shorter. If rules of the same scope overlap, the longest minimum wins. Without a matching period, the home's own usual minimum wins, then the all-home usual minimum. Periods do not repeat annually; enter next year's dates when needed.

Changes apply to newly accepted requests. Existing confirmed bookings and pending requests retain their original agreement and existing expiry/cancellation behavior. New bookings save `minimumStayApplied` for audit. Old bookings have a null snapshot and are grandfathered. No nightly rate, cleaning fee, pet fee, tax or cancellation-policy calculation is changed by a stay rule.

## Deploy safely

Initial development and manual tests used an isolated local Docker database. The production additive migration has now been applied and recorded after a verified application backup/restore rehearsal. No production payments or emails were sent, and application code has not been deployed by this task. No new production environment variables are required; retain your existing production configuration.

1. Back up the database and use a staging copy first. This repo has no tracked Prisma migration history. Inspect the live `_prisma_migrations` table and the actual schema before deciding whether to import this additive change into an existing migration process. Do **not** generate or run a new initial migration against existing tables, reset the database, or run the seed against production.
2. The supplied one-time additive change is `prisma/changes/minimum-stay.sql`. It adds `Property.minimumStayNights`, `Booking.minimumStayApplied`, three new tables and constraints, and seeds the shared 2-night default. Existing property overrides and booking snapshots are null. It also adds the nullable `Booking.reviewRequestSentAt` column if absent: existing review-email code already referenced it, but it was missing from the checked-in Prisma schema. Check that any already-existing column has the expected timestamp type.
3. Run the SQL through the existing controlled deployment process, or the Supabase SQL editor using the server database role. Prisma 7 also supports the following from the project root, with `DIRECT_URL` (preferred) or `DATABASE_URL` already exported in the process environment:

   ```powershell
   npx prisma db execute --file prisma/changes/minimum-stay.sql
   ```

   `prisma.config.ts` reads process environment variables; it does not automatically load `.env.local`. Never put credentials in command history. This command applies SQL transactionally but does not write Prisma migration history. If production already uses Prisma Migrate, have the deployer integrate and record the reviewed SQL in that history instead. Do not run both methods.
4. RLS is enabled on the three new tables. NextAuth remains the admin authentication mechanism; policy reads and writes go through server routes. The application database role must own the tables or have suitable server-only access/BYPASSRLS. If applying SQL in the Supabase editor under a different owner, verify access using the actual application role on staging before deployment. Do not grant anonymous rule edits. Also verify existing `Property` and `Booking` Data API grants/RLS do not allow guest writes; no direct Supabase browser client exists in this checkout.
5. Audit existing stay timestamps on staging before switching deployments: the new code uses the UTC calendar date of stay fields, while America/Chicago determines “today.” Existing data is not rewritten. Investigate historical non-midnight timestamps and compare stored check-in/check-out dates with old confirmations if the previous server used a different timezone. All seeded homes are in Katy, Texas; verify live homes use the same business timezone.
6. Apply the SQL **before routing traffic to the new code**. Old code will ignore the new rules, so keep the switch coordinated: use a short maintenance window or stop new submissions while migrating and replacing old instances. Once the new app is live, confirm all homes show 2 nights. The new code intentionally fails closed if settings cannot load; it does not silently allow shorter stays.
7. Install locked dependencies and verify:

   ```powershell
   npm ci
   npx prisma generate
   npm test
   npm run typecheck
   npm run build
   ```

   Deploy with the existing production environment. The old unsupported `migrations.adapter` Prisma config option was removed; the existing server-side PostgreSQL adapter in `lib/prisma.ts` remains.
8. Confirm **Admin → Stay rules**, a public property calendar, checkout, one staging request and its emails. Check the Stripe endpoint configuration. Manual Payment Links still require Franca to confirm payment in admin; the webhook does not automatically confirm them.

Rollback: retain the additive tables/columns and roll back application code only if necessary. Old application code does not enforce the new minimum, so pause new booking submissions during a rollback. Do not drop the policy records or booking snapshots as part of a routine rollback.

## Test it yourself on staging

Use future dates with enough availability. Use a test inbox and Stripe test mode; admin payment confirmation trusts Franca's action, so never confirm a real unpaid request just for testing.

1. **Default two nights.** With no periods or property exceptions, open a home and choose an arrival. The next day's checkout is disabled. Two nights is selectable; “2-night minimum” appears. Try another home to confirm inheritance. A one-night gap between unavailable dates cannot be selected as an arrival.
2. **Submit a valid request.** Select two available nights, check the per-night total, cleaning/pet fees and tax, and submit. Confirm it appears as awaiting payment in admin. Check the guest request email and owner notification show the correct dates and two nights.
3. **Change the usual minimum.** In Stay rules choose 4 nights and save. Refresh a public property: shorter checkout options are disabled; four nights is allowed. Refresh admin to confirm persistence. Restore 2 after testing.
4. **Peak period.** Add “Christmas test,” all homes, future dates December 20–31, 7 nights. Open the unsaved preview, then save. Use Preview a guest’s stay for December 20 and December 31: both require seven nights. December 19 and January 1 use the usual minimum. On a public home, confirm six nights is rejected and seven nights is allowed.
5. **Crossing into peak.** A December 19 arrival for two nights is allowed if available. A December 20 arrival needs seven nights. A checkout date is not an occupied night.
6. **Home exceptions and overlaps.** Give one home a 3-night usual minimum. A global change leaves it at 3 outside seasons, and admin explains this. Add an all-home 7-night season: it beats that usual 3. Add a matching 5-night season for just that home: the preview shows 5. Add another matching 6-night season for that home: it shows 6. Remove the seasonal rules and reset the home to Follow usual minimum; it inherits again.
7. **Calendar boundaries.** Arrange a blocked day immediately after a valid minimum stay: departure that day must be selectable, while stays occupying it are not. Test month/year boundaries. With a 30-night minimum and December/January displayed, a January 31 arrival cannot be selected if March 1 is blocked in a non-leap year. Navigating months must retain the selected arrival and still enforce intervening blocks.
8. **Try to bypass checkout.** Edit an existing checkout URL so checkout is only one day after arrival. The page must explain the minimum and provide Choose new dates. Changing `totalNights`, `totalAmount`, or inventing `minimumNights=1` in the URL must not change the rule.
9. **Call the API directly.** From the browser developer console on staging, use the example below. A too-short request must return HTTP 400, `code: "MINIMUM_STAY"`, the required number, and an earliest checkout. No booking or email should be created. Repeat with a six-night peak request. Impossible dates, same-day/reversed stays and stays over 30 nights also fail. Unauthenticated attempts to POST admin stay rules return 401.
10. **Rule changes while checkout is open.** Open valid two-night checkout, enter guest details, then raise the minimum to 7 in another admin window before submitting. Submission must explain the new rule and retain entered contact details. No request is accepted. If a request had already been submitted before the change, it keeps its accepted terms.
11. **Existing bookings and requests.** Use an existing confirmed one-night booking and an unexpired existing pending request. Changing the rule must not alter their dates, totals, status or night count. Franca can confirm the pending request using the existing payment workflow if its dates remain available. The booking detail explains its saved minimum or original agreement.
12. **Pricing and emails.** Test a stay with different daily prices plus cleaning fee, pets and tax. Compare the summary, stored breakdown, guest request email, admin notification and final confirmation email. After receiving a Stripe test payment and confirming in admin, verify the saved night count and amounts remain unchanged. Recheck an old confirmation. No new minimum should appear as an extra price or fee.
13. **Legacy Stripe bypass/retries.** In staging only, send a Stripe-signed `payment_intent.succeeded` test event with this old integration's complete property/guest/date metadata for a too-short stay. No booking or blocked date may be created. A Payments needing your attention warning appears in Stay rules and on the Bookings page. Replaying the event must not create a duplicate warning. Permanent date/availability/amount failures are recorded for review; transient database failures remain retryable. A valid payment event creates one booking and sends one confirmation even if delivered concurrently. Manual Payment Link events without legacy stay metadata are ignored by this handler and remain manually confirmable.
14. **Recovery and guardrails.** Try a reversed busy-period window, blank name, and invalid/fractional minimum through the API. All must fail. A 30-night setting warns that only exactly 30 nights qualify. Open two admin tabs, save in one, then save stale data in the other: it must request a reload. Simulate a policy/API outage: the guest cannot submit, and admin shows Retry/Reload rather than an empty successful screen. If a period saves but reloading fails, the new-period draft closes; reloading must show only one saved period.

### Direct API example

Run only on staging, replacing the home ID and future dates. A too-short request should fail without sending an email. The amount is deliberately just a placeholder; use the real server-calculated total if testing a valid request.

```javascript
const response = await fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    propertyId: 'REPLACE_WITH_HOME_ID',
    guestName: 'Minimum stay test',
    guestEmail: 'YOUR_TEST_INBOX@example.com',
    guestPhone: '+15555550123',
    checkIn: '2027-12-20',
    checkOut: '2027-12-21',
    totalAmount: 100,
    minimumNights: 1,
    petCount: 0
  })
});
console.log(response.status, await response.json());
```

The server checks minimum stays before price validation and again inside the booking transaction. The submitted `minimumNights` field is ignored. Valid requests must still use the server-calculated price.

## Verification record

37 automated tests passed, including rule resolution, direct booking/API rejection, stale admin edits, legacy payment retries/reconciliation, grandfathered requests, the actual rendered guest emails, per-day pricing/fees, additive SQL in an isolated PostgreSQL-compatible PGlite database, and local-database safeguards. TypeScript checking passed. A full production build also passed against the isolated Docker database with build-only placeholders for external services. No outbound payment/email/upload calls were made. The live database migration was separately verified through Supabase MCP.

Earlier build checks stopped because no accessible database had been configured; the later complete build with Docker passed. Lint for all changed TypeScript files passed. Whole-repository lint still reports existing errors in the review-submission page, the admin pricing calendar, PropertyAmenities and the populate-property-data script; these unrelated files were left unchanged.

Local browser checks used ten fixture homes, intercepted API responses and offline font fixtures. They verified desktop/mobile layout, default and seasonal edits, unsaved previews, saved-property shortcuts, save/reload recovery without duplicate rules, and the real guest calendar (including blocked departure dates and January/March lookahead). They did not exercise live Supabase, Stripe or Resend delivery. No actual emails, charges or refunds were sent by these tests.

## Changed files

Database/config:
- `.gitignore`
- `eslint.config.mjs`
- `compose.local-test.yml`
- `prisma/schema.prisma`
- `prisma/changes/minimum-stay.sql`
- `prisma/seed.ts`
- `prisma.config.ts`
- `package.json`
- `package-lock.json`
- `vitest.config.ts`

Shared logic:
- `lib/stay-dates.ts`
- `lib/stay-rules.ts`
- `lib/stay-policy.ts`
- `lib/stay-admin.ts`
- `lib/bookings.ts`
- `lib/availability.ts`
- `lib/pricing.ts`
- `lib/email.ts`

Admin:
- `app/(admin)/admin/stay-rules/page.tsx`
- `app/api/admin/stay-rules/route.ts`
- `components/admin/StayRulesManager.tsx`
- `components/admin/AdminSidebar.tsx`
- `components/admin/AdminMobileHeader.tsx`
- `app/(admin)/admin/page.tsx`
- `app/(admin)/admin/bookings/[id]/page.tsx`
- `app/(admin)/admin/properties/[id]/edit/page.tsx`

Guest/payment:
- `app/api/properties/[id]/stay-rules/route.ts`
- `app/api/properties/[id]/pricing/route.ts`
- `app/api/payments/create-intent/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `app/(public)/properties/[id]/page.tsx`
- `app/(public)/checkout/page.tsx`
- `app/(public)/booking-confirmation/page.tsx`
- `components/public/PropertyCalendar.tsx`
- `components/public/BookingWidget.tsx`
- `components/public/CheckoutForm.tsx`

Tests/documentation:
- `scripts/local-test.mjs`
- `scripts/local-test-config.mjs`
- `tests/local-test-config.test.ts`
- `tests/stay-rules.test.ts`
- `tests/booking-stay.test.ts`
- `tests/stay-admin.test.ts`
- `tests/stay-api.test.ts`
- `tests/stripe-stay.test.ts`
- `tests/stay-migration.test.ts`
- `tests/stay-pricing.test.ts`
- `tests/stay-emails.test.ts`
- `PRODUCT.md`
- `MINIMUM_STAY_GUIDE.md`
- `LOCAL_TESTING.md`
- `RELEASE_NOTES.md`

The pre-existing untracked `MINIMUM_STAY_POLICY_DESIGN.md` is unchanged. Implementation planning and local screenshots are under the already-ignored `docs/` folder and are not deployment inputs.
