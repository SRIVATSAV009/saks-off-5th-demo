# Ticket Log (Jira Stand-In)

This project didn't have a live Jira instance to attach, so this file stands in for it: a
representative backlog of the kind of tickets a storefront/BM engagement like this generates,
written up the way they'd be tracked in Jira (ticket ID, type, priority, resolution). Each one
maps to a concrete change in this codebase.

| Ticket | Type | Priority | Summary | Resolution |
| --- | --- | --- | --- | --- |
| SAKS-101 | Story | High | Build PDP variant selection (color/size) with add-to-cart | Implemented in `src/app/products/[slug]/page.tsx` + `src/app/products/actions.ts`; merges quantity into an existing cart line if the same product/color/size is already in the bag |
| SAKS-104 | Story | High | PLP needs category/color filters and sort | Added query-param-driven filter form in `src/app/products/page.tsx`; category options scope to the active department |
| SAKS-108 | Bug | Medium | Cart total doesn't reflect free-shipping promotions | Refactored `computeTotals()` (`src/lib/pricing.ts`) to branch on `discountType`, zeroing shipping for `free_shipping` codes |
| SAKS-112 | Story | High | Wishlist: allow moving an item straight to bag | Added `moveToCart` action (`src/app/wishlist/actions.ts`); defaults to the product's first listed color/size since wishlist doesn't track variant selection |
| SAKS-115 | Story | Critical | Checkout must reject bot submissions | Integrated Google reCAPTCHA v2 on login, register, and checkout; server actions call `siteverify` before any mutation (`src/lib/recaptcha.ts`) |
| SAKS-119 | Bug | High | Promo code still applies after its end date | Added `isPromotionActive()` date-range + enabled check, enforced both at cart apply-time and again at checkout (belt-and-suspenders against a stale cart) |
| SAKS-123 | Story | Medium | Business users need to swap homepage banner without a deploy | Built Content Asset / Content Slot admin (`/admin/content-assets`, `/admin/content-slots`); storefront resolves the assigned asset at render time |
| SAKS-127 | Story | Medium | Need a way to trigger the abandoned-cart job manually for QA | Added `/admin/jobs` with a "Run Now" action and persisted Job Log for auditability |
| SAKS-131 | Bug | Low | Account Dashboard shows stale cart count in header after adding an item | Added `revalidatePath("/", "layout")` to cart/wishlist mutations so the header re-renders with the current count |
| SAKS-134 | Story | Medium | Admin panel needs its own login, separate from shopper accounts | Implemented a distinct signed admin session cookie (`saks_admin_session`) gated in `src/app/admin/(protected)/layout.tsx`, independent of storefront customer auth |
| SAKS-138 | Bug | Medium | Expired promotions still show as "Active" in the BM promotions grid | Added a computed status column that separates `enabled` (admin flag) from date-range activity, so out-of-range-but-enabled codes are visibly distinguished |
| SAKS-141 | Story | Low | Checkout should offer Standard vs. Express shipping with live price preview | Extended `computeTotals()` to accept a shipping method key; checkout page renders both totals side-by-side before submission |
