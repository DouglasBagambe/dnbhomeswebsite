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

## V2 consumer presentation

`revamp/v2-website` changes presentation on the production-readiness base; it does not migrate the API, storage keys, query schema, booking payloads, metadata or production validation. `src/styles/tokens.css` owns the light/dark palettes, spacing, radii and interaction duration. `globals.css` retains the existing class architecture for shared controls, discovery, cards, detail, content pages and responsive layouts. Inter remains locally bundled. Homes is the consumer identity; dnb remains the parent identity in the footer and existing legal/SEO information.

Marketing photography is illustrative, not Uganda inventory. The eight files in `public/images/` are local copies of the existing Unsplash images already referenced by this website, now delivered through Next/Image. Original image CDN sources:

- https://images.unsplash.com/photo-1600585154340-be6161a56a0c
- https://images.unsplash.com/photo-1522708323590-d24dbb6b0267
- https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea
- https://images.unsplash.com/photo-1600607687939-ce8a6c25118c
- https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde
- https://images.unsplash.com/photo-1486406146926-c627a92ad1ab
- https://images.unsplash.com/photo-1500382017468-9049fed747ef
- https://images.unsplash.com/photo-1497366754035-f200968a6e72

Replace these with approved genuine media before presenting them as real property/area photography. Location cards omit inventory totals because the homepage samples are not complete location counts. A healthy API with no inventory gets one honest empty state; unavailable inventory gets a distinct retry state. No demo inventory is introduced to production.

### Isolated populated browser QA

The existing `npx playwright test` suite retains the offline API profile and checks outages, navigation, empty states and retired routes. Additional responsive tests exercise populated cards, gallery, search, filters, removable chips, sorting, recent searches, browser-local saves/compare, keyboard restoration, viewing requests, contacts, secondary routes, contrast and light/dark modes. All synthetic POST requests terminate in `e2e/fixtures/server.mjs`, bound to loopback. It has no database or production connection. The fixtures are not included in app routes.

For this suite, build with `HOMES_BUILD_PROFILE=local`, `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3100/api/v1` and `NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3101` while the fixture API is running, then stop the fixture and run `npx playwright test --config playwright.visual.config.ts`. CI performs both builds and suites. Do not deploy the local validation build. Set `HOMES_SCREENSHOTS` to an output directory to export screenshots; otherwise they are saved in `test-results/v2-screenshots` and uploaded by CI.

The matrix covers 390×844, 430×932, 768×1024, 1024×768, 1280×800, 1440×900 and 1920×1080. Full screenshots at 390, 768 and 1440 cover home, discover and property detail in both themes. Manual visual review supplements overflow, image loading, hero collision and contrast checks.
