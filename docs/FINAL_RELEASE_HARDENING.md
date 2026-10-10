# Final release hardening

Live inspection did not reproduce a permanently missing showcase asset: original and optimizer requests succeeded. Delayed/lazy images must retain their frames. Known fixed showcase URLs on the exact existing HTTPS host, without credentials/port/query/fragment, normalize to one of 17 local paths and bypass the unnecessary optimizer round-trip. Other image-host and optimizer rules remain unchanged. Property/Home/gallery images have a stable accessible fallback that removes the failed img element rather than spilling raw alt text.

The detail gallery keeps the existing five-image preview and exposes all mixed media through a native modal dialog: counts, image/video index, arrows, keyboard, mobile swipes, Escape/close and focus restoration. Only the active full-size media is mounted. Videos have controls, no autoplay, preload=none, image posters, retry on errors and pause on navigation/close. Failed images retain geometry and do not block subsequent media. Cards stay image-only; metadata/JSON-LD retain their existing image semantics.

Viewing requests save the creation-only status token with the local record. Refresh calls the no-store status proxy with the token in a header; only minimal status fields are returned. Results persist locally, unavailable requests keep their saved copies, and legacy requests explicitly cannot sync. Backend hardening must be deployed first; old records such as QA reference HOM-20261010-85440C have no issued token and cannot be safely upgraded automatically.

`public/qa` contains only owned, labelled synthetic video clips used by the isolated Playwright fixture. They are not genuine property footage. Hosted QA reuses property 6aca1225ca3d4ce6f2209da4 in homes_preview; its temporary Render uploads are not durable launch storage.

Validation: npm ci, lint, HOMES_BUILD_PROFILE=local typecheck/build, npm test, Playwright standard and visual configurations, git diff --check. Standard tests require HOMES_E2E=1 as in CI. Visual tests build against the isolated fixture API on port 3100 and website port 3101. Gallery/fallback/status regression coverage remains enabled.
