# Hammad Tools Project Knowledge Base

Last updated: 2026-05-08 (full code scan pass)

## 1) Project Intent

Hammad Tools is a production marketplace for:
- premium digital tools/subscriptions
- agency services
- manual checkout/payment proof flow
- admin operations (catalog, orders, users, coupons, notifications, settings)
- user dashboard (orders, messages, profile, notifications)

## 2) Stack and Runtime

- Next.js App Router (`next@15.5.15`)
- React 19 (`react@19.2.1`)
- TypeScript 5
- Tailwind CSS 4
- Firebase client: Auth + Firestore + FCM web
- Firebase Admin server-side: Auth + Firestore + Messaging
- Hostinger-compatible local filesystem upload system via API routes

Build/runtime:
- `npm run build` -> `next build && node scripts/prepare-standalone.mjs`
- `npm run start` -> `node .next/standalone/server.js`
- `next.config.ts` uses `output: 'standalone'`
- `vercel.json` has a daily cron for entitlement expiry

## 3) Repository Map

Primary directories:
- `app/`: pages, layouts, API routes
- `app/admin/`: admin UI modules
- `app/api/`: backend endpoints
- `components/`: shared UI blocks
- `context/`: app providers (`Auth`, `Cart`, `Settings`)
- `lib/`: client/shared helpers
- `lib/server/`: server-only helpers (auth/admin/upload/notifications)
- `docs/`: project docs

Important root files:
- `firestore.rules`
- `next.config.ts`
- `.env.example`
- `scripts/prepare-standalone.mjs`

## 4) App Bootstrap (Global Providers + Components)

`app/layout.tsx` wraps the app with:
- `AuthProvider`
- `CartProvider`
- `SettingsProvider`
- `ToastProvider`
- `LenisProvider`
- `GsapSectionAnimator`
- `ChunkLoadRecovery`
- `PushNotificationBootstrap`
- `GlobalPromoTicker`
- `Navbar`
- `UserOrderTicker`
- `EngagementPrompt`
- `CartDrawer`
- `Footer`

Result: most pages inherit auth/cart/settings state, promo ticker, order ticker, cart drawer, and engagement/push behavior.

## 5) Route Inventory (Pages)

Public routes:
- `/`
- `/about`
- `/tools`
- `/tools/[slug]`
- `/services`
- `/services/[slug]`
- `/blogs`
- `/blogs/[slug]`
- `/blog` (legacy redirect page)
- `/blog/[slug]` (legacy redirect page)
- `/giveaway`
- `/contact`
- `/privacy`
- `/terms`
- `/checkout`
- `/login`
- `/signup`
- `/forgot-password`
- `/profile` (redirects users to dashboard)

User route:
- `/dashboard`

Admin routes:
- `/admin`
- `/admin/tools`
- `/admin/agency-services`
- `/admin/giveaways`
- `/admin/blog`
- `/admin/orders`
- `/admin/categories`
- `/admin/payment-methods`
- `/admin/notifications`
- `/admin/subscribers`
- `/admin/coupons`
- `/admin/users`
- `/admin/socials`
- `/admin/settings`

## 6) API Inventory

- `POST /api/auth/profile`
- `POST /api/newsletter/subscribe`
- `POST /api/push/register`
- `POST /api/upload`
- `GET /api/upload/library`
- `GET /api/upload/[mediaId]`
- `DELETE /api/upload/[mediaId]`
- `GET /api/upload/diagnostics`
- `POST /api/orders/[orderId]/messages`
- `POST /api/admin/users`
- `PATCH /api/admin/users/[userId]`
- `DELETE /api/admin/users/[userId]`
- `GET /api/admin/subscribers`
- `GET /api/cron/expire-entitlements`
- `POST /api/cron/expire-entitlements`

## 7) Firestore Collections (Observed)

Core collections:
- `users`
- `services`
- `agency_services`
- `categories`
- `payment_methods`
- `orders`
- `notifications`
- `coupons`
- `service_reviews`
- `media_files`
- `newsletter_subscribers`
- `entitlements`
- `push_tokens`
- `notification_dispatches`
- `blogPosts`
- `giveaways`
- `user_entries`
- `service_activations`
- `admin_audit_logs`

Nested:
- `giveaways/{id}/comments`
- `giveaways/{id}/entries`

Type contracts are in `lib/types/domain.ts`.

## 8) Auth and Role Model

Main auth:
- Client auth and session state in `context/AuthContext.tsx`
- Server auth in `lib/server/auth.ts`
- Profile sync fallback endpoint: `POST /api/auth/profile`

Role sources:
- User doc role (`users/{uid}.role`)
- Hardcoded super-admin email: `technicalhammad39@gmail.com`

Role consistency notes (important):
- `requireStaff()` currently accepts only `admin` or `manager`.
- `isStaffRole()` helper (used elsewhere) accepts `admin`, `manager`, `staff`.
- Firestore rules treat `staff`/`Staff` as manager-level.
- Auth profile normalization maps `staff` -> `manager` in some code paths.
- Client `AuthContext.isStaff` includes admin/manager only (plus super-admin email).

Risk: mixed `staff` vs `manager` assumptions can create behavior mismatches across client, API, and rules.

## 9) Firestore Rules Summary

From `firestore.rules`:
- public read for `services`, `categories`, `agency_services`, published blog posts, giveaways
- `newsletter_subscribers` client writes blocked (`allow write: if false`)
- `orders`:
  - users can create own pending orders
  - staff can update/delete
  - final status lock enforced by rule helpers (`approved`/`rejected` cannot be flipped)
- `notifications`:
  - recipients can mark own notifications as `read`
  - staff can create/delete
- `service_reviews`:
  - restricted create shape and rating validation

## 10) Checkout and Order Lifecycle

Main file: `app/checkout/page.tsx`

Flow:
1. Require login
2. Resolve items (single product or cart)
3. Load active payment methods
4. Optional coupon validation
5. Optional payment proof upload (`payment-proofs`)
6. Create `orders/{orderId}` with:
   - full customer/contact fields
   - line items and item summary
   - subtotal/discount/total
   - coupon snapshot
   - payment method snapshot
   - payment proof snapshot
   - `status: 'pending'`
   - `tickerState: 'new'`

Manual chat mode:
- detected when payment method is `paymentType === 'manual_chat'` (or inferred by name fallback)
- sender/transaction/proof not required
- order is created then redirected to WhatsApp
- hardcoded number: `923209310656`

## 11) Orders Admin + Messaging

Main file: `app/admin/orders/page.tsx`

Features:
- realtime orders feed
- filters/search
- approve/reject actions
- status finalization metadata (`statusFinal`, `statusFinalizedAt`)
- admin/user chat per order (attachments supported)
- user notifications on admin actions
- admin-only bulk "Delete All Orders" (batched)

Order message API:
- endpoint: `POST /api/orders/[orderId]/messages`
- checks order access
- validates attachment against `media_files`
- enforces attachment `relatedOrderId` match
- stores message in `orders.messages`
- updates preview/timestamps
- if sender is user, creates admin/staff notifications

## 12) User Dashboard

Main file: `app/dashboard/page.tsx`

Features:
- realtime user orders
- order chat interface + attachment support
- realtime notifications + mark single/all as read
- profile updates (including avatar upload to `profiles`)
- password update for email/password users

## 13) Upload and Media System

Core files:
- `lib/server/local-upload.ts`
- `app/api/upload/route.ts`
- `app/api/upload/library/route.ts`
- `app/api/upload/[mediaId]/route.ts`
- `lib/storage-utils.ts`

Allowed folders:
- public: `tools`, `services`, `blogs`, `partners`, `profiles`
- protected: `payment-proofs`, `chat-attachments`

Key behavior:
- strict folder alias normalization
- per-folder file extension + MIME + size validation
- path traversal protections and root-bound path checks
- metadata persisted in `media_files`
- optional replace-by-media-id flow

Access rules:
- protected file reads require auth token (header bearer or `?token=` query)
- `chat-attachments` require `relatedOrderId`
- non-staff ownership checks are enforced

Library endpoint:
- staff can query multiple folders (`folders=...`)
- non-staff is restricted to owned media/folder rules

## 14) Notifications and Push

In-app notifications:
- stored in `notifications`
- consumed by navbar bell, dashboard, user ticker, admin ticker

Push registration:
- client bootstrap in `components/PushNotificationBootstrap.tsx`
- only registers if browser permission already `granted`
- API endpoint `POST /api/push/register` stores token in `push_tokens` with SHA256 token hash as doc id

Current server sender:
- `lib/server/notifications.ts` writes in-app notifications only
- `notifyUsers()` returns `{ sent: 0, failed: 0 }` (no real FCM push dispatch there yet)

Engagement prompt:
- `components/EngagementPrompt.tsx`
- shows after ~12-18s
- 3-day localStorage cooldown
- requests notification permission only when state is `default`

## 15) Coupons, Promo Ticker, Search

Coupons:
- rules/normalization in `lib/coupons.ts`
- route-aware visibility logic (`global`, `category`, `product`)
- expiry parsing handles timestamp/date string formats

Promo ticker:
- `components/GlobalPromoTicker.tsx`
- picks best active coupon for current route
- supports no-expiry coupons (`LIMITED` countdown label)

Search:
- public nav search in `components/Navbar.tsx` (tools/blogs/giveaways)
- admin search in `app/admin/layout.tsx` (services, orders, blogs, giveaways, users)
- CSS guard in `app/globals.css`: closed public search panel is non-interactive (`pointer-events: none`, hidden visibility)

## 16) Rich Text and Content Rendering

Editor/renderer stack:
- `components/RichTextEditor.tsx`
- `components/RichTextContent.tsx`
- `lib/rich-text.ts`

Supported formatting:
- markdown basics (bold/italic/lists/links/code/etc)
- raw allowed tags subset including `<u>` and `<span>`
- span attributes for color/size (`data-rich-color`, `data-rich-size`)
- plain URL auto-linking
- safe link handling helpers via `lib/blog-links.ts`

Used by admin content flows (blogs, giveaways, tools) and public detail pages.

## 17) Blog, Giveaway, Reviews, SEO

Blog:
- canonical routes: `/blogs`, `/blogs/[slug]`
- legacy compatibility routes: `/blog`, `/blog/[slug]`
- publish logic handles both `status=published` and legacy `published=true`

Giveaway:
- route: `/giveaway`
- collection: `giveaways`
- comments/entries in subcollections

Reviews:
- `service_reviews` with rules-validated payload and rating range

SEO:
- metadata helpers in `lib/seo.ts`
- `app/robots.ts` disallows `/admin`, `/dashboard`, `/checkout`, `/api`
- `app/sitemap.ts` builds static + dynamic entries (services/blogs/agency services) with Firestore timeout and credential checks

## 18) Settings and Defaults

Settings context (`context/SettingsContext.tsx`) listens to:
- `settings/general` (support email/phone)
- `settings/socials` (social links)

If missing/inaccessible, hardcoded defaults are used for support and social URLs.

## 19) Environment and Config Notes

Environment contract is in `.env.example`.

Key groups:
- app URL (`APP_URL`, `NEXT_PUBLIC_APP_URL`)
- Firebase client public env
- Firebase admin creds (explicit cert path; no implicit ADC fallback)
- optional VAPID key for web push
- cron secret
- Hostinger upload path/size/debug envs

Important behavior:
- Firebase client config can fallback to `firebase-config.json`
- password reset custom URL must start with `https://hammadtools.com/reset-password`
- service worker `public/firebase-messaging-sw.js` contains hardcoded Firebase web config values

## 20) Deployment and Operations

- standalone deployment supported
- post-build script copies `.next/static` and `public` into `.next/standalone`
- cron endpoint `/api/cron/expire-entitlements`:
  - expires active entitlements past due date
  - marks near-expiry notices (24h window)
  - creates in-app notifications via `notifyUsers`
- cron auth accepts:
  - `x-vercel-cron: 1`
  - or matching `CRON_SECRET` via query/header

## 21) Known Constraints and Risks

Current hardcoded constants:
- super-admin email: `technicalhammad39@gmail.com`
- manual order WhatsApp target: `923209310656`
- footer dev link points to same WhatsApp number

Observed code risks:
- mixed `staff` vs `manager` semantics across modules
- entitlement creation flow is not clearly present in this codebase, while entitlement expiry/reporting is present
- footer has a copyright glyph encoding artifact in the footer text
- no automated tests found; validation is mostly manual + lint/build
- `next.config.ts` has `eslint.ignoreDuringBuilds: true` (lint will not block production build)

## 22) Change Playbooks (Where to Edit)

Checkout/order schema changes:
- `app/checkout/page.tsx`
- `lib/types/domain.ts`
- `app/admin/orders/page.tsx`
- `app/dashboard/page.tsx`
- `firestore.rules`

Order status or messaging behavior:
- `lib/order-system.ts`
- `app/admin/orders/page.tsx`
- `app/api/orders/[orderId]/messages/route.ts`
- `firestore.rules`

Upload/media policies:
- `lib/server/local-upload.ts`
- `app/api/upload/route.ts`
- `app/api/upload/library/route.ts`
- `app/api/upload/[mediaId]/route.ts`
- `lib/storage-utils.ts`
- `components/MediaLibraryModal.tsx`

Auth/role model:
- `context/AuthContext.tsx`
- `lib/server/auth.ts`
- `app/api/auth/profile/route.ts`
- `app/api/admin/users/route.ts`
- `app/api/admin/users/[userId]/route.ts`
- `firestore.rules`

Notifications/push:
- `app/admin/notifications/page.tsx`
- `lib/server/notifications.ts`
- `components/PushNotificationBootstrap.tsx`
- `app/api/push/register/route.ts`

SEO/branding:
- `lib/seo.ts`
- `app/layout.tsx`
- `app/robots.ts`
- `app/sitemap.ts`
- `context/SettingsContext.tsx`

## 23) Safe Release Checklist

1. Validate Firestore rules impact for any write-path changes.
2. Re-test role matrix for user/manager/admin/super-admin email.
3. Test upload flow for both public and protected folders.
4. Test checkout for standard and manual-chat payment methods.
5. Test order chat with and without media attachments.
6. Test dashboard notification mark-read flows.
7. Run `npm run lint`.
8. Run `npm run build` and smoke test standalone start.

## 24) Related Docs in `docs/`

- `docs/media-records-schema.md`
- `docs/media-api-examples.md`

Use these for media payload field-level reference and example request/response structures.

## 25) 2026-05-08 Production Audit Notes

Root causes identified and fixed:
- frontend “sync issue” was largely page caching, not Firestore write failure:
  - `app/blogs/page.tsx`
  - `app/blogs/[slug]/page.tsx`
  - `app/giveaway/page.tsx`
  - `app/services/page.tsx`
  - `app/services/[slug]/page.tsx`
  - these now render dynamically instead of waiting on `revalidate = 120`
- admin rich text editor was not a real WYSIWYG editor:
  - old editor stored markdown/raw HTML snippets from a textarea
  - replaced with a `contentEditable` editor in `components/RichTextEditor.tsx`
  - sanitized HTML pipeline now lives in `lib/rich-text.ts`
- frontend content rendering mismatch:
  - `components/RichTextContent.tsx` now renders sanitized HTML output from the editor
  - same color/size/link rules are shared by editor + frontend
- image preview mismatch came from incomplete media metadata:
  - `StoredFileMetadata` now supports `publicPath`
  - `lib/storage-utils.ts` now preserves normalized `publicPath`
  - `lib/image-display.ts` already preferred `publicPath`, so the missing field was the actual gap
- admin global search previously opened collection roots only:
  - `app/admin/layout.tsx` now deep-links edit targets with `?edit=<id>`
  - edit auto-open logic added in:
    - `app/admin/tools/page.tsx`
    - `app/admin/blog/page.tsx`
    - `app/admin/giveaways/page.tsx`
    - `app/admin/agency-services/page.tsx`
- public tools category strip had drag/click interference:
  - fixed in `components/ServicesSection.tsx` by separating drag suppression timing from click handling
- scroll overshoot/lag sources:
  - `components/LenisProvider.tsx` had aggressive touch/wheel settings
  - `components/GsapSectionAnimator.tsx` was observing subtree mutations continuously
  - `react-fast-marquee` was used on home/testimonials
  - fixes:
    - softer Lenis config
    - removed persistent GSAP mutation observer
    - replaced JS marquee usage in:
      - `app/HomePageClient.tsx`
      - `components/Testimonials.tsx`

Files added/changed for the new rich text pipeline:
- `lib/rich-text.ts`
- `components/RichTextEditor.tsx`
- `components/RichTextContent.tsx`
- `app/globals.css`

Current validation status after this audit:
- `npm run lint` passes
- `npm run build` passes
- standalone smoke responses returned `200` for:
  - `/`
  - `/tools`
  - `/blogs`
  - `/giveaway`
  - `/admin/blog`

