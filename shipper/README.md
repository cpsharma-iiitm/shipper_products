# Shipper.com — frontend

React 19 + Vite storefront and admin dashboard for Shipper.com. This repository contains the frontend only;
authentication, pricing, payments (Razorpay), inventory and India Post integration are backend work.
The visual reference is `design/shipper-figma.pdf.pdf` (24 artboards: storefront desktop and mobile, admin 1440 × 900).

## Requirements

- Node.js `^20.19.0` or `>=22.12.0` (required by Vite 8)
- npm 10+

## Getting started

```

bash
npm install
cp .env.example .env # Windows PowerShell: Copy-Item .env.example .env
npm run dev

```

`.env.example` turns the mock API on (`VITE_USE_MOCK_API=true`), so the whole app works without a backend. If you skip
the `.env` file, `npm run dev` still uses the mock while `VITE_API_BASE_URL` is empty; production builds never do.
| Script | Purpose |
| ----------------- | ---------------------------------------- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (also enforces the `@/` alias) |

## Mock mode (development fixtures)

With `VITE_USE_MOCK_API=true` every API call is answered in the browser from `src/mocks` (a custom Axios adapter:
126 products, 40 customers, 291 orders, addresses, wallet ledger, reports). **This is a simulation, not an integration.**
Data lives in memory and resets on reload; a yellow "Mock data" badge is shown whenever it is on. Never enable it
against real customers or real money. Every rule it applies (GST split, shipping charge, wallet and coupon limits,
payment outcomes, stock queues) is an **ASSUMPTION — confirm with backend team**.
Demo sign-ins (password `Shipper@123`):
| Area | Sign in at | Account |
| -------- | -------------- | ------------------------------------------------------------- |
| Customer | `/login` | Aditi Sharma — `9876543210` or `aditi.sharma@gmail.com`, wallet ₹250 |
| Admin | `/admin/login` | Pawan Yadav — `pawan.yadav@shipper.com` or `9811122334` |
The demo session is kept in `sessionStorage` (mock mode only) so a reload does not sign you out. In the mock a UPI ID
starting with `fail@` shows a declined payment; any other UPI ID succeeds. Coupons: `HELLO10`, `SHIPPER50`.
To connect a real backend: set `VITE_USE_MOCK_API=false` and `VITE_API_BASE_URL`. Every endpoint the UI calls is
declared once in `src/app/services/endpoints.js` (composed from `src/app/services/endpointGroups/*`), and every path,
payload and response shape there is an assumption to confirm with the backend team.

## Routes

Storefront: `/`, `/shop`, `/category/:slug`, `/products/:slug`, `/offers`, `/cart`, `/login`, `/signup`, `/checkout`,
`/checkout/confirmation/:orderNumber`, `/account/profile`, `/account/orders`, `/account/orders/:orderNumber`,
`/account/wallet`, `/account/saved`, `/track`, `/policies/:slug`.
Admin (`/admin/...`, administrators only): `login`, `dashboard`, `purchases`, `purchases/new`, `orders`,
`orders/:orderNumber`, `products`, `reports`, `reports/financial`, `customers`, `customers/:code`, `users`, `roles`,
`store-operation/:tab` (`new-orders`, `to-pick`, `to-pack`, `ready-to-dispatch`, `dispatched`, `delayed`), `shipping`,
`restock`, `profile`. In development, `/dev/components` shows the component gallery.
Route guards (`RequireAuth`, `RequireAdmin`, `RedirectIfAuthenticated`) are **UX only**; real authorisation is the
backend's job.

## Environment

| Variable            | Meaning                                                                                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Backend base URL. **ASSUMPTION — confirm with backend team.**                                                                                                                       |
| `VITE_USE_MOCK_API` | `true`/`false`. `true` answers API calls from `src/mocks` (development fixtures); unset means "yes in `npm run dev` while no backend URL is set". A simulation, not an integration. |

## Structure

```

src/app providers, router (routes, guards, paths), Redux store (auth, cart, ui), services (Axios, endpoints), config
src/components atoms → molecules → organisms shared by both apps
src/features one folder per domain: catalog, cart, checkout, auth, profile, orders, tracking, wallet, policies,
saved, addresses, dashboard, products, purchases, inventory, store-operations, shipping,
admin-lists, admin-orders, customers, users, reports, admin-auth, admin-profile
src/layouts StorefrontLayout, AdminLayout
src/pages route-level screens (storefront/, admin/)
src/mocks development fixtures and handlers (never imported outside the lazy mock chunk)
src/lib formatting, validators, storage, address helpers, downloads, lazy Excel (exceljs)
src/styles tokens, CSS variables, Bootstrap mapping, mixins

```

## Conventions

- **Imports:** use the `@/` alias for anything under `src`. Parent-relative imports (`../`) are a lint error.
- **Styling:** component styles sit beside the component as `Name.module.scss` (CSS Modules, camelCase class names only —
  `.app-shell` would be exported as `styles.appShell`). Read design tokens through CSS variables
  (`var(--sh-color-primary)`); import breakpoint mixins with `@use '@/styles/mixins' as *;`.
- **Tokens:** `src/styles/_tokens.scss` is the single source of truth; `_root.scss` publishes it as `--sh-*` variables and
  `_bootstrap.scss` maps Bootstrap's theme onto it. The admin area is denser than the storefront in the design, so
  `_root.scss` re-points the type tokens under `:root[data-area='admin']` (set by `AdminLayout`).
- **Bootstrap:** grid, containers and utilities only. No Reboot, no component CSS, no Bootstrap JavaScript.
- **Icons:** Bootstrap Icons font (`<i className="bi bi-box-seam" />`) through the `Icon` atom.
- **Component hierarchy:** atoms → molecules → organisms (`src/components`), domain components in `src/features/<name>`,
  route-level composition in `src/pages` and `src/layouts`.
- **Money:** the frontend displays backend-confirmed values. It never computes authoritative GST, discounts, shipping,
  wallet deductions or order totals; checkout shows the quote the backend returns.
- **State:** server data in TanStack Query, shared client state (auth, cart, UI) in Redux Toolkit, forms in React Hook
  Form + Zod. Only the cart and UI preferences are persisted; the access token never is.

## Out of scope here (frontend integration points only)

Live Razorpay payments, India Post tracking and label generation, invoice PDFs, Excel import validation, real
authentication and permissions, inventory reservation and stock enforcement, server-side reports, policy copy. Each has a
clearly labelled mock adapter and an endpoint declaration to replace.

## Fonts

The design uses Inter, loaded from Google Fonts in `index.html`. Self-hosting needs a dependency approval.

## Excel

Excel export uses `exceljs`, always loaded through `@/lib/excel` with a dynamic `import()` so it stays out of the main bundle.
