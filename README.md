# Homes public website

Production-quality Next.js consumer property platform for **Homes**, operated by **dnb Homes**.

## Run locally

Requirements: Node.js 22 (CI: 22.23.3) and npm. Install with `npm ci`.

Run the API first, then the website on a separate port:

```bash
cd "/home/dnb/Work/dnb Homes/dnbhomesbackend"
cp .env.example .env
# Replace the development JWT placeholders and ensure MongoDB is running.
npm run seed:demo
npm run dev

cd "/home/dnb/Work/dnb Homes/dnbhomeswebsite"
cp .env.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
npm run dev
```

From the workspace root, `./scripts/dev-homes.sh --seed` performs the same startup with explicit demo seeding. The seed is development-only, deterministic and idempotent. It upserts exactly 50 illustrative records marked with `demo:homes-v1`; both seeding and cleanup refuse production. Demo photos are committed local development assets, so local visual QA does not depend on internet access. Production never assumes localhost.

## Commands

```bash
npm run lint
HOMES_BUILD_PROFILE=local npm run typecheck
npm test
HOMES_BUILD_PROFILE=local npm run build
npx playwright test
```

Playwright browser binaries are intentionally not installed by `npm install`; install Chromium separately only when E2E execution is required.

Viewing dates and times use Uganda time (UTC+03:00), independent of the server timezone.

## Environment

Use `.env.example` for development and `.env.production.example` for the production input checklist. Required in production:

- `NEXT_PUBLIC_API_BASE_URL` — Douglas must supply the actual public HTTPS API `/api/v1` root. No hostname is assumed.
- `NEXT_PUBLIC_SITE_URL=https://dnbhomes.com` — canonical origin, without a path.
- `NEXT_PUBLIC_MEDIA_ORIGINS` — comma-separated exact HTTPS origins matching the production storage public URLs. Wildcards are not accepted.

Optional:

- `NEXT_PUBLIC_MAPBOX_TOKEN` — enables a future map adapter; map controls stay hidden without it.
- `NEXT_PUBLIC_ANDROID_APP_URL` — enables the real Android download action.
- `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` — reserved for consent-aware adapters.
- `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE` — enables real contact actions.

## Functional scope

Published discovery/detail, viewing requests, public agent and agency directories, contact messages, and property-onboarding leads use the V1 backend. Saved homes, comparison, and the guest viewing-request history are intentionally device-local; the UI says so and does not imply account sync.

## Deployment

The project is ready for Vercel or another standard Next.js host:

1. Import `DouglasBagambe/dnbhomeswebsite`.
2. Add the production environment variables above to Production and Preview as appropriate.
3. Deploy and verify `/`, a property page, `/robots.txt`, and `/sitemap.xml`.
4. Add `dnbhomes.com` and `www.dnbhomes.com` to the hosting project.
5. At the DNS provider, create the exact A/ALIAS and CNAME records shown by the host. Do not guess record values.
6. Choose `dnbhomes.com` as canonical and redirect `www.dnbhomes.com` to it.
7. Confirm TLS, then update backend CORS to allow both HTTPS origins if needed.

No deployment is performed by this repository setup.

## Production gate and local build validation

`next build`, `next start`, and route type generation load the production config. Missing URLs, localhost, reserved example/invalid hosts, URL credentials, and incomplete media origin configuration fail before a production build starts. Public settings are inlined by Next.js: set them at BUILD time and rebuild when changing them.

For local validation only, use `HOMES_BUILD_PROFILE=local npm run build` and `HOMES_BUILD_PROFILE=local npm start -- -p 3001` with explicit loopback API/site URLs from `.env.local`. This profile only accepts loopback endpoints and must never be deployed. CI uses that profile with a deliberately unavailable loopback API to test graceful failures. `HOMES_E2E` only adjusts timeouts; it cannot bypass the production config gate.

The image optimizer permits the named production media origins and the existing illustrative Unsplash host; replace illustrative marketing photos with approved genuine assets before launch. Production inventory must be created in Admin, never copied from the local demo database. The disabled Android download action stays disabled until a real HTTPS distribution URL is supplied. Contact actions remain optional; the contact form works without inventing Douglas's details. Douglas must approve the legal text and supply verified business/privacy contact details before launch.

For verified Android App Links, set `ANDROID_APP_LINK_FINGERPRINTS` to the final Play **app signing** certificate fingerprints (not upload/debug fingerprints). The `/.well-known/assetlinks.json` route publishes only `com.nilebitlabs.dnbhomes`; it returns 404 until fingerprints are configured. After DNS/TLS setup, verify this response directly on dnbhomes.com without redirects. Nothing is deployed by this change.
