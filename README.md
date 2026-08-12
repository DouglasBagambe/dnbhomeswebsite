# Homes public website

Production-quality Next.js consumer property platform for **Homes**, operated by **dnb Homes**.

## Run locally

Requirements: Node.js 20.9+ and npm.

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
npm run dev -- --port 3001
```

The demo seed is development-only, deterministic and idempotent. It upserts exactly 50 illustrative records marked with the `demo:homes-v1` tag; it refuses to run with `NODE_ENV=production`. Photos are deterministic Unsplash development imagery and do not claim to depict the demo properties. Production never assumes localhost.

## Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright test
```

Playwright browser binaries are intentionally not installed by `npm install`; install Chromium separately only when E2E execution is required.

## Environment

See `.env.example`. Required in production:

- `NEXT_PUBLIC_API_BASE_URL=https://api.dnbhomes.com/api/v1`
- `NEXT_PUBLIC_SITE_URL=https://dnbhomes.com`

Optional:

- `NEXT_PUBLIC_MAPBOX_TOKEN` — enables a future map adapter; map controls stay hidden without it.
- `NEXT_PUBLIC_ANDROID_APP_URL` — enables the real Android download action.
- `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` — reserved for consent-aware adapters.
- `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE` — enables real contact actions.

## Backend gaps

Published property search/detail and viewing requests use the current V1 backend. Public representative directories require these additions before the prepared routes can display data:

- `GET /api/v1/agents` with public pagination/filtering
- `GET /api/v1/agents/:idOrSlug` with active published listings
- `GET /api/v1/agencies/:idOrSlug` with active published listings
- Optional `POST /api/v1/contact` for direct contact-form delivery
- Authenticated or guest-token booking retrieval before cross-device request history can be offered

The current site does not fake these capabilities.

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
