# Uganda photography and supplied logo

The homepage hero, five category panels and illustrative location fallbacks use
reviewed Uganda photographs, rather than generic overseas mansion imagery. Five
source renditions are stored in `public/images/uganda/` for reliable delivery;
no new photograph or logo was generated. Original source pages, photographers,
licences and original file URLs are recorded in
`src/data/uganda-photography.json`. Expand the homepage's **Media credits** below
the category panels for visible attribution. All five photographs are CC BY-SA
4.0; rendered resizing/cropping retains their source licences. They illustrate
property types and do not establish an exact match to showcase addresses.

Header and footer use the supplied SVG mark beside HOMES. One rendered image
uses the actual pale SVG through CSS on dark surfaces, including the footer and
Android promotional panels. Assets and aspect ratio remain unchanged; themes
switch without adding a new React hydration-dependent state. Existing visual
coverage remains intact. Only the exact Commons host/path is added to Next's
remote image patterns; configured production media origins remain required and
validated. Preview property photographs currently come from the existing Render
media service and carry visible credits in each description.

The backend's `homes_preview` inventory contains fictional unverified showcase
records. Render uploads currently use ephemeral disk; durable media storage is
required before launch. No API contracts, routes, search behavior, production
guards or main branches are changed by this content/logo task.
