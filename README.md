<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# AWS Student Community Day website

The website is a React/Vite frontend. Its ticket prices, availability, and Razorpay checkout are provided by the Express API in [`server/`](./server/README.md).

## Run locally

Requirements: Node.js 20 or newer and PostgreSQL 14 or newer.

1. Configure the backend by following the [backend setup guide](./server/README.md). Create `server/.env` from `server/.env.example`, configure PostgreSQL and Razorpay **Test Mode** credentials, and set the approved ticket capacities.
2. In one terminal, start the API:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

3. In a second terminal from the project root, start the website:

   ```powershell
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000). Vite proxies `/api` requests to the backend at `http://localhost:4000`.

Ticket availability stays disabled until the backend has a working database and non-zero approved capacity configured. Keep Razorpay secret and webhook keys in the backend environment only.
