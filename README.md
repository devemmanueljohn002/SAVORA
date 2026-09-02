# Savora Food — Mobile (React Native + Expo)

Production scaffold through Phase 7 of 10 (project setup → vendor dashboard),
per the SAVORA FOOD production spec.

## What's in this scaffold

```text
app/
  _layout.tsx          Root layout: providers, splash-screen gating, auth hydration
  index.tsx            Role-aware redirect: VENDOR → (vendor)/dashboard, others → (customer)/home,
                        unauthenticated → (auth)/welcome
  (auth)/
    _layout.tsx
    welcome.tsx         Brand landing screen
    login.tsx           Fully wired: RHF + Zod validation, calls authStore.login, role-aware redirect
    register.tsx        Fully wired: RHF + Zod validation, calls authStore.register
    forgot-password.tsx Fully wired: sends OTP, routes into verify-email
    verify-email.tsx    Shared OTP screen for register + reset flows (purpose param), resend cooldown
    reset-password.tsx  Sets new password using the token handed off by verify-email
  (customer)/
    _layout.tsx          Bottom tabs (Home/Explore/Orders/Favorites/Profile); all other
                          customer routes below are hidden from the tab bar via href:null
                          but remain fully navigable
    home.tsx             Category/vendor queries, search entry point, hero banner, notification
                          bell, catering promo banner
    categories.tsx        Full category grid (spec section 13)
    search.tsx             Recent/popular search chips, debounced live search, vendor+product results
    vendor/[id].tsx         Vendor detail: cover, info, category tabs, menu, add-to-cart, CartBar
    cart.tsx                Line items, quantity stepper, order summary, proceed to checkout
    addresses.tsx           List/add/edit/delete addresses; select-mode when arriving from checkout
    checkout.tsx            Address + payment method selection, order summary, place order,
                            payment initialization/verification (never trusts client-side success)
    order/[id].tsx           Order confirmation + detail view; review form once delivered; reorder
                            button once delivered/cancelled
    order/tracking.tsx       8-stage animated tracking timeline, rider info, 15s polling
    notifications.tsx        Notification center — hidden from tab bar, reached via home bell icon
    orders.tsx               Active/Completed/Cancelled tabs, reorder with eligibility check
    catering/index.tsx        Provider browsing with service-type filter chips
    catering/[id].tsx          Provider detail: packages, gallery, request-quote CTA
    catering/booking.tsx        Quote request form (event type/date/guests/location/budget/prefs)
    favorites.tsx, profile.tsx   Placeholders — not in scope until later phases
  (vendor)/
    _layout.tsx          Bottom tabs (Dashboard/Orders/Menu/Earnings/More); settings and
                        catering-requests hidden from the tab bar, reached via "More"
    dashboard.tsx         Summary stats, live store open/closed toggle, quick links
    orders.tsx             New/Accepted/Preparing/Ready/Completed/Cancelled tabs; accept
                          (with prep time), reject (with reason modal), mark-ready actions
    menu/index.tsx          Menu grouped by category, availability toggle per item, add-item CTA
    menu/[id].tsx            Create/edit/delete a menu item; id="new" signals create mode
    earnings.tsx             Totals, pending payout, transaction history
    more.tsx                 Links to Store Settings and Catering Requests, logout
    catering-requests.tsx     Vendor-side response to customer quote requests (quote/decline)
    settings.tsx              Open/closed, opening hours, default prep time

src/
  api/client.ts          Axios instance: auth header injection, 401 refresh-and-retry,
                          normalized error shape, request queueing during refresh
  config/env.ts           Typed EXPO_PUBLIC_* env access — never read process.env elsewhere
  constants/theme.ts       Colors, spacing, radii, typography, shadows (brand tokens)
  components/              VendorCard, CategoryCard, FoodCard, SearchBar, RatingStars, Badge,
                            CartItemRow, CartBar, AddressCard, PaymentMethodCard, PriceText,
                            OrderCard, NotificationItem, StarRatingInput, CateringProviderCard,
                            StatCard, VendorOrderCard, MenuItemRow
  hooks/                    useVendors, useVendor, useCategories, useProducts, useProduct,
                            useSearch, useDebouncedValue, useAddresses, useOrders (list/detail/
                            tracking/create/cancel), useReorder, useReviews, useNotifications,
                            useCatering (providers/bookings), useVendorDashboard, useVendorOrders
                            (list/accept/reject/prep-time/ready), useVendorProducts (CRUD),
                            useVendorEarnings, useVendorStore, useVendorCatering (list/quote/decline)
  services/                 authService, vendorService, categoryService, productService,
                            searchService, cartService, addressService, orderService,
                            paymentService, reviewService, notificationService, cateringService,
                            vendorDashboardService, vendorOrderService, vendorProductService,
                            vendorStoreService, vendorEarningsService, vendorCateringService
  stores/                   authStore, recentSearchesStore, cartStore (vendor-locked line items)
  types/index.ts            User, AuthTokens, ApiError, Paginated<T>, Category, Vendor, Product,
                            SearchResult, CartLineItem, Address, Order, OrderTrackingUpdate,
                            Rider, Review, AppNotification, CateringProvider, CateringPackage,
                            CateringBooking, VendorDashboardSummary, VendorEarningsSummary,
                            VendorStoreSettings, VendorCateringRequest
  utils/                    secureStorage, format (formatCurrency/formatDeliveryTime/formatDistance)
  validation/                authSchemas, addressSchemas, cateringSchemas, menuItemSchema
```

## Setup

```bash
npm install
cp .env.example .env
# edit .env with your API URL and payment public keys
npm start
```

Requires a running backend implementing at minimum:
`POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`,
`POST /auth/logout`, `GET /auth/me`, `POST /auth/forgot-password`,
`POST /auth/reset-password` (see spec section 40 for the full contract).

## Design decisions worth knowing

- **Path aliases**: `@/*` → `src/*`. Import screens/services as `@/services/authService`, not relative paths.
- **Token storage**: access + refresh tokens live in `expo-secure-store`, never AsyncStorage or plain state.
- **401 handling**: a failed request triggers one refresh attempt; concurrent requests queue behind it rather than each firing their own refresh call. A refresh failure clears tokens and flips `authStore.status` to `unauthenticated`, which `app/index.tsx` picks up to redirect to `/(auth)/welcome`.
- **No secrets client-side**: only `EXPO_PUBLIC_*` values are read (see `src/config/env.ts`). Paystack/Flutterwave *secret* keys, JWT secret, and DB credentials belong on the backend only.
- **Splash + hydration**: the splash screen stays up until `authStore.hydrate()` resolves, avoiding a flash of the wrong screen.
- **Single-vendor cart**: `cartStore.addItem` rejects adding a product from a different vendor while the cart is non-empty (spec section 17). The UI doesn't currently surface this rejection anywhere — wire a confirmation dialog ("Adding this will clear your current cart") before Phase 6 if multi-vendor ordering isn't planned.
- **Payment is never trusted client-side**: `checkout.tsx` only marks an order as paid after `paymentService.verify()` returns `PAID` from the backend — never from a webview closing or redirecting (spec section 20).
- **Order tracking polls, doesn't push**: `useOrderTracking` refetches every 15s. There's no live-tracking endpoint in the spec's contract yet (section 40) — `orderService.getTracking()` currently derives a tracking shape from `GET /orders/:id`. Swap for a dedicated endpoint or socket/SSE subscription once available.
- **Role-aware navigation** (spec section 37): both `app/index.tsx` (app boot) and `(auth)/login.tsx` (post-login) check `user.role` and send `VENDOR` to `/(vendor)/dashboard`, everyone else to `/(customer)/home`. `RIDER` and `ADMIN` app shells don't exist yet (Phase 8 / backend admin dashboard) and fall back to the customer shell rather than a dead route — this is a stopgap, not a real access decision; the backend remains the sole source of truth for what each role can actually do.

## Phase 4/5 backend contract assumptions (confirm against real Express routes)

- `POST /payments/initialize` is assumed to return `{ reference, authorizationUrl? }` for a hosted Paystack/Flutterwave checkout page opened via `Linking.openURL`. If the real integration instead uses an in-app SDK (react-native-paystack-webview, etc.) rather than a hosted redirect, `checkout.tsx`'s payment step needs to change to use that SDK instead of `Linking`.
- `GET /orders/:orderId/reorder-check` (spec section 24: check product availability, price, vendor status before reordering) has no defined shape in section 40 — documented as `ReorderCheckResult` in `orderService.ts`. Confirm the real response shape before wiring `useReorderCheck` to production.
- `POST /reviews` is assumed to reject a second review for the same order — the client hints at this via `Order.hasReview`, but the client never invents this field; it comes from `GET /orders/:id`, so the backend needs to include it.
- `notificationService` assumes `GET /notifications` returns a paginated shape (`Paginated<AppNotification>`) — adjust if the backend returns a flat array.

## Phase 2 backend contract assumptions (confirm against real Express routes)

- `POST /auth/verify-email` — body `{ email, code, purpose: "register" | "reset" }`, returns `{ verified: true, resetToken? }`. `resetToken` is only expected when `purpose` is `"reset"`.
- `POST /auth/resend-code` — body `{ email, purpose }`, no response body expected.
- `POST /auth/reset-password` — body `{ resetToken, newPassword }`. If your backend instead validates the OTP again at this step (rather than issuing a short-lived `resetToken`), swap this for `{ email, code, newPassword }` in `authService.resetPassword` and pass those params through from `verify-email.tsx` instead.
- Registration (`POST /auth/register`) is assumed to return a session (`accessToken`/`refreshToken`) immediately, with email verification happening *after* signup rather than blocking it — confirm this matches the intended UX (some products block login until verified instead).

## Phase 3 backend contract assumptions (confirm against real Express routes)

- `GET /search` doesn't exist yet in the spec's endpoint list (section 40) — `searchService.search()` currently composes `GET /vendors?q=` and `GET /products?q=` in parallel. Swap for a single combined endpoint once the backend has one; it'll be faster and let the backend rank relevance properly.
- `productService.list({ vendorId })` assumes `GET /products?vendorId=...` filters server-side. If the real route only supports `GET /vendors/:id/products`, update the service call accordingly.
- Favoriting (`vendorService.addFavorite` / `removeFavorite`, same on `productService`) posts `{ type: "vendor" | "product", id }` to `/favorites` per spec section 40 — confirm the backend expects a `type` discriminator rather than separate endpoints.
- Recent searches are in-memory only (`recentSearchesStore`) and reset on app restart — fine for now, but Phase 9 should either persist them locally or move them server-side.

## Phase 6/7 backend contract assumptions (confirm against real Express routes)

- `cateringService.myBookings()` (`GET /catering/bookings/me`) isn't in the spec's endpoint list (section 40 only defines the request-quote flow) — a customer-facing "my catering requests" view needs this or an equivalent; not yet wired to any screen.
- **None** of the vendor-side endpoints (`/vendor/dashboard/summary`, `/vendor/orders`, `/vendor/products`, `/vendor/store/settings`, `/vendor/earnings`, `/vendor/catering-requests`) appear in the spec's customer-facing contract (section 40), since that section only documents the customer API surface. Every path and payload shape under `src/services/vendor*.ts` is a documented assumption for a vendor API surface — treat the whole vendor backend contract as needing confirmation before this is load-bearing, not just the usual per-endpoint caveats.
- `vendorOrderService.list(tab)` sends `statuses: OrderStatus[]` as a query param and expects the backend to filter server-side. If the real vendor orders endpoint doesn't support multi-status filtering, filter client-side after fetching all orders instead.
- `useVendorOrders("new")` and `useVendorDashboard` both poll (15s and 30s respectively) since there's no push mechanism yet for "a new order came in" — same caveat as customer order tracking.
- Menu item photo upload (spec section 34: "Upload food images") is stubbed as a plain `imageUrl` text field in `menu/[id].tsx` — swap for `expo-image-picker` + an upload endpoint once the backend exposes one.

## Not yet built (later phases per the spec)

- Favorites screen (vendors/meals), full profile screen (Phase 5 leftovers, not blocking)
- Customer-facing "my catering bookings" view (service method exists, no screen yet)
- Rider dashboard (Phase 8)
- Push notification delivery (Expo Notifications setup), deep linking, analytics, automated tests (Phase 9)
- EAS production builds and store submission (Phase 10)

## Known gaps / things to confirm before Phase 2

- `app.json`'s `extra.eas.projectId` is a placeholder — replace once an EAS project exists.
- App icon/splash images (`./assets/*.png`) are referenced but not included — drop in real brand assets before building.
- `authService`/`apiClient` assume the backend endpoint shapes in spec section 40; adjust field names once the real Express/Prisma routes are finalized.
