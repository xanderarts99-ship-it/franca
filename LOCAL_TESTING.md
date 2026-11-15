# Start testing locally

The Docker test database has its own password, port (55432), storage volume and admin account. It contains the ten property fixtures from the repository, not live bookings or customer accounts. Supabase is untouched.

1. Keep Docker Desktop running.
2. In this project folder run `npm run dev:local`. This starts the database if needed and opens the web server on port3000. It uses only the verified local database and disables outbound email/payment/upload credentials.
3. Open http://localhost:3000/admin/login. Your generated local-only email and password are in `.local-test/LOGIN.md`.
4. Open **Stay rules** and confirm **Usual minimum stay:2 nights**.
5. Open http://localhost:3000 in another tab. Choose a home, then future available dates. One night should be disabled; two nights should be allowed.
6. Change the usual minimum to4 in admin, save, and refresh the property. Now try three nights (blocked) and four nights (allowed). Restore2 afterward.
7. Add a busy period with a7-night minimum. Check the preview, save, and try six versus seven nights for an arrival during that period.

`npm run test:local:stop` stops only the test database and keeps its data. Stop the web server with Ctrl+C in its terminal. Restart with `npm run dev:local`.

`npm run test:local:setup` is the initial setup command, already run here. It creates `.env.local` and generated credentials if they do not exist, bootstraps the pre-change schema in an empty local database, applies `prisma/changes/minimum-stay.sql`, and seeds ten homes. On later runs it preserves existing test data. It refuses non-local database targets and does not overwrite an unrelated `.env.local`. Never run the original seed against production.

You do not need Supabase, Stripe, Resend or Cloudinary credentials for these booking/calendar/admin checks. Public property photos can still load from their existing image URLs. Actual email delivery, payment processing and photo uploads are not part of this local test setup. The existing payment-related product wording has been left unchanged as requested.

For broader feature tests, see `MINIMUM_STAY_GUIDE.md`. Its Supabase/staging deployment instructions are for a later release, not a prerequisite for using this local setup.
