# Homes V2 visual QA

Branch: `revamp/v2-website`. Base: `587d4a9987127b76a371cb473cf17b449733f11d`.

The main branch is unchanged. Backend, Admin and Android repositories were not modified. API helpers, query schema, storage keys, booking payload conversion, route paths, JSON-LD, metadata, sitemap, Android association and production guards retain their existing contracts.

## Design

Centralized emerald/ivory and intentional dark tokens; locally bundled Inter; 1408px container; 4–128px spacing scale; restrained 10/16/24px radii; subtle interactions and reduced-motion support. Homes dominates the consumer header/footer, with dnb as the understated parent. The cinematic hero contains a real search control, including every existing field on mobile. Editorial category composition, scannable property prices, grouped sticky/collapsible filters, removable query chips, photographic galleries, desktop viewing panel and a mobile viewing action share the system. Content/legal routes use readable text widths. No public listing workflow was added.

## Validation

- `npm ci`: exact existing lockfile, Node 22.23.3.
- Lint and route generation/TypeScript: passed.
- Vitest: 21 tests passed.
- Existing offline Playwright suite: 18 tests passed, covering retryable outages, mobile navigation, empty states, retired listing route and unconfigured Android association/download guards.
- Isolated populated Playwright suite: 19 tests passed, covering responsive pages, rendered images, hero/search collisions, banner/footer text contrast, themes, search URL/recent history, removable filters, sorting, saved persistence, comparison keyboard restoration, viewing payload/timezone and browser-local history, contact messages, and secondary routes.
- Seven sizes: 390×844, 430×932, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080. Light and dark home/discover/detail checks pass without document overflow.
- Final tablet adjustment rechecked at 768 and 1024 in both themes.
- Production-config build uses the supplied Render API, public site URL and media origin, with no local validation bypass.
- `git diff --check`: passed.

## Screenshots

Workspace artifacts are outside the repository, under `artifacts/v2-website/`:

- `before/home-1440.png`, `before/home-390.png`: baseline against Render.
- `final/{home,discover,property}-{390,768,1440}-{light,dark}.png`: 18 final screenshots against the isolated fixture API. Fixture listings are illustrative, never production inventory.
- `live/`: final website with actual Render inventory/empty states.

The final visual pass corrected banner/footer contrast, excessive discovery heading spacing, favorite icon presentation and a squeezed tablet viewing panel. Fixture POST requests terminate in a loopback-only in-memory server; no synthetic booking/contact was submitted to Render.

## Remaining release inputs and defects

Render currently returns no published properties, so a genuine production property detail cannot be exercised. Genuine inventory/media, real Android distribution URL/Play signing fingerprints and final legal/business contact review remain owner inputs. Illustrative marketing photos are labeled and should be replaced with approved genuine assets before representing a location or listing.

The unchanged dependency lockfile has pre-existing npm audit advisories: 12 total (1 critical, 9 high, 2 moderate). The critical package is Next.js 16.3.0; the audit reports 16.4.0 as the fixed version. A separate coordinated security update and regression validation is required before merging/releasing. No forced dependency changes or weakened configuration guards were introduced to this visual branch.
