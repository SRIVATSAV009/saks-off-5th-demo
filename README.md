# Saks OFF 5TH — SFCC-Style Storefront & Business Manager (Portfolio Demo)

A self-contained portfolio project that recreates the shape of a **Salesforce B2C
Commerce (SFCC) implementation and customization** engagement: a discount-retail storefront
(product listing/detail, cart, wishlist, checkout, account dashboard) plus a **Business
Manager–style admin panel** for Promotions, Content Slots, Content Assets, and Jobs.

**Live demo:** https://saks-off-5th-demo.vercel.app/ — deployed on Vercel, backed by a real
Postgres database on [Neon](https://neon.tech), auto-deploying on every push to `main`.

> **Not affiliated with Saks OFF 5TH, Salesforce, or Google.** Real SFCC is a licensed,
> hosted platform (Business Manager + WebDAV-deployed cartridges against a provisioned
> sandbox). This project reimplements the same concepts — storefront customization,
> promotions, content slots, scheduled jobs — as a plain Next.js + Postgres app.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **TypeScript**, **Tailwind CSS v4**
- **Prisma 7** + **PostgreSQL** (via the `@prisma/adapter-pg` driver adapter) — runs against
  any Postgres provider (Neon, Supabase, Vercel Postgres, or a local instance)
- **Google reCAPTCHA v2** (checkbox) on login, register, and checkout
- Cookie-based session auth (HMAC-signed, no external auth provider)
- Deployed on **Vercel**, database hosted on **Neon**

## Getting Started

Requires a Postgres database — [Neon](https://neon.tech) has a free tier that takes about a
minute to set up, or point this at any other Postgres instance (Supabase, Vercel Postgres,
local).

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL with your Postgres connection string
npx prisma migrate dev       # creates the schema (and the initial migration, first run only)
npx prisma db seed           # seeds products, promotions, content, jobs, a demo user
npm run dev
```

Visit **http://localhost:3000**.

`npx prisma db seed` (rather than running `tsx prisma/seed.ts` directly) ensures
`DATABASE_URL` is loaded from `.env` via `prisma.config.ts` before the seed script connects.

### Accounts

| Role       | Login                                            |
| ---------- | ------------------------------------------------- |
| Shopper    | `jane.doe@example.com` / `password123`             |
| Admin (BM) | `/admin/login` → password `admin123`               |

### reCAPTCHA

`.env.local` ships with **Google's official published test keys**, which always pass
verification and work on `localhost` with zero setup:

```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
RECAPTCHA_SECRET_KEY="6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
```

Server actions call Google's real `siteverify` endpoint — this is a live network call, not a
stub — so it's a genuine end-to-end reCAPTCHA integration, just pointed at test credentials.
Swap in real site/secret keys from the [reCAPTCHA admin console](https://www.google.com/recaptcha/admin)
for production use.

## How this maps to the role

| Resume bullet | Where it lives |
| --- | --- |
| **PDP, Account Dashboard, PLP, Cart, Wishlist, Checkout customization** | `src/app/products/`, `src/app/account/`, `src/app/cart/`, `src/app/wishlist/`, `src/app/checkout/` |
| **Business Manager: Promotions, Jobs, Content Slot, Content Assets** | `src/app/admin/(protected)/` — a password-gated dark-themed admin shell mirroring BM |
| **Google reCAPTCHA integration** | `src/components/Recaptcha.tsx` + `src/lib/recaptcha.ts`, wired into login, register, and checkout server actions |
| **Bitbucket (version control)** | This is a standard git repository (`git log` / `git remote` stand in for Bitbucket) |
| **Jira (issue tracking)** | [`TICKETS.md`](./TICKETS.md) — a sample backlog of the kind of tickets this build would have closed |

### Storefront → SFCC concept mapping

- **PLP** (`/products`) — category/color filters + sort, backed by a Business-Manager-managed
  **Content Slot** banner (`plp-banner`).
- **PDP** (`/products/[slug]`) — variant (color/size) selection, add-to-cart / add-to-wishlist
  as progressively-enhanced Server Actions, related products.
- **Cart** (`/cart`) — line-item qty/remove, promo code redemption validated against the
  `Promotion` model (enabled flag + date range, exactly like an SFCC promotion campaign).
- **Wishlist** (`/wishlist`) — save/remove, one-click move-to-bag.
- **Checkout** (`/checkout`) — saved or inline address, shipping method, mock payment,
  reCAPTCHA, order creation; a **Content Slot** (`checkout-banner`) renders a trust message.
- **Account Dashboard** (`/account`) — profile edit, recent orders, saved addresses, links out
  to order history and wishlist.

### Business Manager → `/admin`

- **Promotions** — create/edit/enable/disable percent, fixed, and free-shipping codes with
  date ranges, exactly like an SFCC promotion campaign; validated live at cart/checkout.
- **Content Assets** — reusable content blocks with an online/offline status flag.
- **Content Slots** — assigns a Content Asset to a named slot (`home-top-banner`,
  `plp-banner`, `checkout-banner`); the storefront always renders whatever is currently
  assigned, with no code change or redeploy — the actual point of SFCC's slot system.
- **Jobs** — a scheduled-job list (export orders, reindex search, abandoned-cart email, expire
  promotions) with a manual **Run Now** and a persisted **Job Log**, standing in for BM's Job
  Scheduler / Job Log.

## Project structure

```
prisma/schema.prisma       Product, User, Cart, Wishlist, Order, Promotion,
                            ContentAsset, ContentSlot, Job, JobLog models
prisma/seed.ts              Seed data: products, promotions, content, jobs, demo user
src/lib/                    db client, session auth, reCAPTCHA verification, pricing engine
src/components/             Header, Footer, ProductCard, ContentSlot, Recaptcha, Money
src/app/                    storefront routes (App Router, Server Components + Actions)
src/app/admin/              Business Manager admin panel (password-gated route group)
```

## Notes & limitations (by design, for a portfolio demo)

- **Auth** is a minimal HMAC-signed cookie, not a production-grade auth provider.
- **Payment** on checkout is a mock form (no processor is called); only basic field
  presence is validated.
- **Images** are real photography sourced from [Pexels](https://www.pexels.com) (free to use,
  no attribution required under the Pexels License), matched to each product's category —
  not actual product photography from the brands/items described.
- **Admin auth** is a single shared password (`ADMIN_PASSWORD` in `.env.local`), standing in
  for BM's per-user login.
