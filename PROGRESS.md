Project Progress Log

Date: 2025-09-07

Summary
- Fixed website console errors/warnings (Font Awesome SRI, Next/Image sizing, LCP priority) and cleaned image sizing across pages.
- Implemented theme-based logo switching (light/dark) and added local SVG brand assets.
- Upgraded cookie consent background to follow theme.
- Improved Chat widget UI (visibility, contrast, hover/active animations) and iterated per feedback.
- Introduced dashboard sidebar redesign (brand color, fixed, mobile drawer), metric icons, and consistent cards.
- Moved “Signed in as …” to a Profile block in sidebar (avatar + menu) and added Profile page.
- Filled skeleton pages: Search, Tags (CRUD per item), Reports (CSV/PDF export), Workflows (low‑stock).
- Added AI Chat widget to dashboard with OpenRouter endpoint, matching website configuration.
- Converted Add Item flow into a modal with blurred backdrop; enforced unique item name and required SKU.
- CI workflow optimized: concurrency, caches, partial Prettier checks.

Notable Fixes
- Build error in AddItemModal: incorrect closing tag </nlabel> → </label>.
- Typecheck issue in PDF route: cast bytes to Response BodyInit to satisfy TS.
- Removed stray development file apps/website/scripts/hello.mjs.

Environment & Configuration
- Standardized brand/primary color to #280299 across website and dashboard.
- Added .env.local.example for website OpenRouter config and set default model.

Validation
- Prettier run across repo (format OK).
- Typecheck for dashboard and website (OK after fixes).
- Local scripts available to verify console cleanliness on website.

Next Steps (Optional)
- Add quick-add (minimal) item modal, + toast notifications.
- Implement tag management with normalized Tag model (DB migration) if needed.
- Enhance PDF export layout (logo, pagination, totals).

