# Minimum-stay release

Production database preparation completed on November 15, 2026. The website code still needs to be pushed and deployed before Franca and guests see the feature.

## What is already done

- Inspected the live Franca database schema and Supabase migration history.
- Saved a private logical backup of all eight application tables, their schema, constraints, indexes, triggers, policies, grants and migration history.
- Restored that backup into a temporary local PostgreSQL database and compared every existing row. Applied the migration to that restored copy and verified the old data was unchanged and the new Prisma client could read it. Removed the temporary verification database afterward.
- Applied `add_minimum_stay_rules` to the live Franca project (`rzrnzfuflmlrefcofhjr`). Supabase recorded migration **20261115094644**.
- Verified the live default is **2 nights**, all **10 homes** inherit it, and all **5 existing bookings** have null policy snapshots and keep their original agreement.
- Compared fingerprints of all eight original application tables before/after migration; all original values and counts matched. There are no production seasonal rules or payment-review records yet.
- Enabled RLS on all three new tables; they are owned by `postgres`, like the existing server-managed tables. Browser roles have no new write policy.
- Full production build against the isolated local PostgreSQL database passed. Build-only placeholder credentials satisfied the existing legacy integration configuration; no real external services were called. Independent TypeScript checking and **37 automated tests** passed, along with the manual local acceptance tests and desktop/mobile UI checks.

## Your next steps

1. Push the feature branch and merge it into whichever branch your existing hosting setup deploys. This work is on `codex/minimum-stay-rules`. A feature-branch push may create a preview rather than update production; use your normal release workflow.
2. Keep the existing production environment variables. No new production variable is required. Do not upload `.env.local`, `.local-test/`, Docker credentials, private backups or the locally generated build output.
3. **Do not rerun the production SQL or run `prisma db push` against production.** The database migration has already been applied and recorded. The normal build command is still `npm run build`; Prisma client generation is included.
4. Wait for the deployment to succeed. Sign into the live admin, open **Stay rules**, and check that the usual minimum is 2 nights. Open a live home in a guest window and verify one-night checkout is disabled and two nights is allowed. Also verify an edited one-night checkout URL shows the minimum-stay message. These checks do not require submitting a real booking.
5. Once those live checks pass, let Franca know using the draft below.

## Message you can send after deployment

The minimum-stay update is live. All homes now start with a 2-night minimum. You can change it whenever you need under Admin → Stay rules, add longer minimums for busy periods, or give an individual home its own minimum. There is a preview to show what guests will need for a chosen home and check-in date. Existing bookings and requests keep their original agreement.

## Backup and rollback

The private backup is under `.local-test/production-backups/2026-11-15-minimum-stay/`. `before.json` contains application data and schema metadata, `restore.sql` is the verified logical restore script, and verification/checksum files record the rehearsal and live checks. These files include personal data and password hashes and are intentionally ignored by Git; keep a secure private copy.

This is an **application-table backup**, not a full Supabase project or Storage/Auth backup. Restore SQL is for a reviewed empty target with the expected Supabase roles; do not execute it over the live populated database.

If the new code must be rolled back, leave the additive database tables/columns in place. Old code can still operate with them, but it will not enforce minimum stays. Pause new requests during a rollback or until the rule is enforced again. Never use the original seed against production.

## Existing unrelated checks

Whole-repository lint still has five pre-existing errors in unrelated files. Lint for the changed TypeScript files passed. The existing Next middleware deprecation warning remains. Supabase's existing `update_updated_at` function has a mutable-search-path advisory; this release did not modify that function. The new RLS tables intentionally have no public policies because access is through authenticated server routes, so Supabase's informational "RLS enabled, no policy" notices are expected.

The local `.env.local`, generated admin password and test bookings remain local. Payment-provider changes were left alone as requested. Email delivery was accepted as working based on your confirmation.
