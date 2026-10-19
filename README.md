# GLOWY

New Next.js storefront with a PostgreSQL/Prisma catalog, role-gated admin catalog management, authenticated cart, and transactional cash-on-delivery checkout.

## Local setup

1. Create a PostgreSQL database and copy `.env.example` to `.env`. Set `DATABASE_URL` and a strong `AUTH_SECRET`.
2. Run `npm install`, then `npm run db:push` and `npm run db:generate`.
3. Optional sample catalog and initial owner: set `SEED_OWNER_EMAIL` and a 12+ character `SEED_OWNER_PASSWORD`, then run `npm run db:seed`. No default owner password is included.
4. Run `npm run dev`.

No mock API is used: pages and actions read/write PostgreSQL through Prisma. Images currently accept a validated public URL; a Supabase Storage bucket should be configured before production image uploads.

## Important production work remaining

Configure Supabase/PostgreSQL credentials, email verification/password recovery, upload storage, payment/shipping integrations, RLS policies, order-status administration, and a reviewed Egyptian legal/shipping policy before launch.

## Public trial deployment

`render.yaml` prepares the application for a Render Web Service. Add a managed PostgreSQL `DATABASE_URL` and let Render generate `AUTH_SECRET`. The free Render plan is only suitable for a public trial: it sleeps after inactivity and can take about a minute to wake. Use a paid host and a database with backups before accepting real customer orders.
