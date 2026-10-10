# AWS SCD 2026 payment API

This is a separate Express/TypeScript API for Razorpay ticket payments used by the React/Vite website. It keeps the Razorpay secret on the server, stores bookings and issued tickets in PostgreSQL, reserves inventory transactionally, verifies captured payments, validates webhook signatures, deduplicates webhook events, rate-limits public endpoints, and retries ticket-confirmation email through a small outbox worker.

> **Do not enable Live Mode until the organizer confirms ticket prices, sale windows, approved capacity, refund policy, merchant KYC, auto-capture settings, and email sender domain.** The example capacities default to `0`, which disables sales to prevent accidental unlimited ticket sales.

## Requirements

- Node.js 20 or newer
- PostgreSQL 14 or newer (a managed PostgreSQL instance is recommended for deployment)
- Razorpay account with **Test Mode** keys
- Optional: a Resend account and verified sender domain for automated ticket emails

## Local setup (VS Code)

Open two terminals from the project root.

### Terminal 1 — backend

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Create a local PostgreSQL database named `aws_scd`, or set `DATABASE_URL` in `server/.env` to an existing development database. Edit `server/.env` and add your Razorpay **test** key ID, test secret, webhook secret, and the organizer-approved ticket capacities. Use the actual remaining ticket inventory; do not keep `0` if you intend to sell tickets. Do not use Live Mode keys during development.

The API runs its initial SQL migration and seeds ticket types from `src/ticketCatalog.ts` on startup.

```powershell
npm run dev
```

The API listens on `http://localhost:4000`. Check `http://localhost:4000/api/health` and `http://localhost:4000/api/tickets`.

### Terminal 2 — frontend

```powershell
npm install
npm run dev
```

Vite serves the website on `http://localhost:3000` and proxies `/api` to the backend. For production, set `VITE_API_BASE_URL` to the public HTTPS URL of the deployed API. Redeploy the frontend after changing this Vite variable.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DATABASE_SSL` | Set `true` when your database provider requires TLS; follow its certificate guidance |
| `RAZORPAY_KEY_ID` | Public Razorpay key ID returned to Checkout |
| `RAZORPAY_KEY_SECRET` | Secret used only by the backend for order/payment verification |
| `RAZORPAY_WEBHOOK_SECRET` | Secret configured specifically for the webhook endpoint |
| `TICKET_CAPACITY_EARLY_BIRD` | Organizer-approved total capacity for Early Bird tier; `0` disables sales |
| `TICKET_CAPACITY_REGULAR` | Organizer-approved total capacity for Regular tier; `0` disables sales |
| `BOOKING_HOLD_MINUTES` | Unpaid seat reservation duration, 5–60 minutes |
| `FRONTEND_ORIGINS` | Comma-separated allowed website origins |
| `RESEND_API_KEY` | Optional email delivery key; without it, ticket codes remain accessible through the checkout confirmation/status page but are not emailed |
| `TICKET_FROM_EMAIL` | Optional verified sender, e.g. `tickets@your-domain.example` |

## Ticket configuration

`src/ticketCatalog.ts` owns the server-side price and sale windows. It currently reflects the sample website copy: Early Bird ₹249 until 22 October 2026 at 17:54 IST; Regular ₹349 from that date onward. Confirm this with the organizer before publishing. Prices shown on the React page are presentation only; the backend database is authoritative.

Capacity values must be the **total approved tier capacity**, not the number of remaining seats. The database maintains sold and temporarily reserved counts, and rejects checkout when the tier is not on sale or there is insufficient inventory. A captured payment arriving after its reservation expired, or a captured payment with an amount/currency mismatch, is marked `refund_required`; no ticket is issued automatically. The organizer must reconcile the payment and refund it if appropriate.

## Razorpay Dashboard setup

1. Generate Test Mode API credentials.
2. Set automatic capture in the Razorpay Dashboard (or implement an explicit capture step before going live). This backend only issues tickets for captured payments.
3. Add a webhook URL: `https://YOUR_API_DOMAIN/api/webhooks/razorpay`.
4. Subscribe to `payment.captured` and `payment.failed` events.
5. Set the webhook secret in `RAZORPAY_WEBHOOK_SECRET`. It is distinct from the API secret.
6. Test successful payment, failed payment, user dismissal, duplicate webhook delivery, and the ticket confirmation email before enabling Live Mode.

## API

- `GET /api/health` — checks API/database readiness.
- `GET /api/tickets` — returns public tier pricing, sale window, and availability.
- `POST /api/checkout/orders` — validates attendee data, obtains a server-side price, reserves capacity, and creates a Razorpay order. Requires a cryptographically random 64-character hexadecimal `Idempotency-Key` header.
- `POST /api/checkout/verify` — verifies the Checkout HMAC and fetches the payment from Razorpay; only captured payments become paid bookings.
- `GET /api/checkout/bookings/:bookingId` — returns minimal booking status and ticket codes after payment; requires `X-Booking-Access` with the same high-entropy checkout token sent as `Idempotency-Key`. Only the SHA-256 hash is stored in PostgreSQL.
- `POST /api/webhooks/razorpay` — validates the HMAC against the exact raw body and idempotently processes events.

## Deployment (one simple split deployment)

### Backend on Render

- Create a Web Service and set its Root Directory to `server`.
- Build command: `npm install --include=dev && npm run build`.
- Start command: `npm start` (runs the compiled `dist/index.js`).
- Set all required environment variables through the Render dashboard. Do not upload `.env`.
- Attach a managed PostgreSQL database and set `DATABASE_URL` to its private connection string where supported.
- Set `FRONTEND_ORIGINS` to the exact deployed frontend origin (no path), e.g. `https://your-site.vercel.app`.
- Set `TRUST_PROXY=true` only when hosted behind Render's trusted reverse proxy so rate limits see client IPs; do not enable it on a directly exposed server without understanding the proxy topology.
- Set `DATABASE_SSL` according to the database provider's instructions.

### Frontend on Vercel

- Deploy the project root as a Vite project.
- Add `VITE_API_BASE_URL=https://YOUR_API_DOMAIN` as an environment variable and redeploy.
- Ensure the frontend domain is included in backend `FRONTEND_ORIGINS`.

### Go-live checklist

- Replace test keys with Live Mode keys only after Razorpay approves the merchant account.
- Set webhook URL and secret for the live integration (separate from test configuration if applicable).
- Verify all prices, ticket sale dates and real ticket capacities with the organizer.
- Publish accurate refund/cancellation, privacy, contact, and event terms.
- Test with small real transactions and confirm settlement to the organizer's verified bank account.
- Monitor API errors and email-outbox failures. Add an admin-only reconciliation/check-in tool before operating a large event.

## Important production notes

- Attendee details are personal data; restrict database access and publish a suitable privacy notice/retention policy.
- Do not collect or store card/UPI credentials.
- The booking status endpoint requires a high-entropy checkout access token (the same value as the request `Idempotency-Key`, sent via `X-Booking-Access`). Only the SHA-256 hash is stored in PostgreSQL, and the endpoint returns no attendee PII. Treat that token, booking reference and ticket codes as private.
- Email retries are capped at eight attempts. Failed rows in `email_outbox` require operational review.
- Database migration execution is idempotent for this initial schema. For future schema changes, create numbered migrations rather than editing this file after production use.
