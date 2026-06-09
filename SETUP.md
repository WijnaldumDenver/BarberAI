# BarberAI — Account Setup Guide

Follow these steps once to get BarberAI running locally and deployed. No coding required.

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation) (`npm install -g pnpm`)
- A GitHub account (for deployment)

---

## Step 1: Supabase (Database + Auth)

1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New project** → choose a name, password, and region.
3. Wait for the project to finish provisioning (~2 minutes).
4. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)
5. Go to **SQL Editor** → **New query**.
6. Copy the entire contents of `supabase/migrations/001_initial_schema.sql` and click **Run**.
7. Go to **Authentication → Providers** and ensure **Email** is enabled.

---

## Step 2: Google AI Studio (AI Consultations)

1. Go to [aistudio.google.com](https://aistudio.google.com) and sign in with your Google account.
2. Click **Get API key** (top right) → **Create API key**.
3. Copy the key → `GEMINI_API_KEY`.

> Free tier includes Gemini Flash models with daily rate limits — no credit card required.

---

## Step 3: Stripe (Test Mode Payments)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) and create an account.
2. Make sure **Test mode** toggle (top right) is ON.
3. Go to **Developers → API keys** and copy:
   - **Publishable key** (`pk_test_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (`sk_test_...`) → `STRIPE_SECRET_KEY`
4. Go to **Product catalog → Add product**:
   - Name: `BarberAI Pro`
   - Price: `$9.00` / month / recurring
   - Copy the **Price ID** (`price_...`) → `STRIPE_PRO_PRICE_ID`
5. Webhook setup (do this **after** Vercel deploy — Step 6):
   - Go to **Developers → Webhooks → Add endpoint**
   - URL: `https://YOUR-VERCEL-URL.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`
   - Copy **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

> **Test card:** `4242 4242 4242 4242` — any future expiry, any CVC.

---

## Step 4: Cloudinary (Avatar Uploads)

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account.
2. On the Dashboard, copy:
   - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

---

## Step 5: Local Setup

1. Clone the repo and install dependencies:

```bash
git clone <your-repo-url>
cd RazorAI
pnpm install
```

2. Create `.env.local` from the example:

```bash
cp .env.example .env.local
```

3. Fill in all values from Steps 1–4.

4. Start the dev server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000).

### Quick smoke test

- Sign up as a **barber** → add services + availability
- Sign up as a **client** (use a different email) → book the barber + try AI consult
- Test Stripe upgrade with card `4242 4242 4242 4242`

---

## Step 6: Deploy to Vercel

1. Push the repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Set **Package Manager** to `pnpm`.
4. Add all environment variables from `.env.local` (except update `NEXT_PUBLIC_APP_URL` to your Vercel URL).
5. Click **Deploy**.
6. After deploy, complete Stripe webhook setup (Step 3.5) with your live Vercel URL.
7. Add `STRIPE_WEBHOOK_SECRET` to Vercel env vars and redeploy.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Signup fails | Check SQL migration ran successfully in Supabase |
| AI consult returns 500 | Verify `GEMINI_API_KEY` is set in Vercel (not `ANTHROPIC_API_KEY`) and redeploy |
| Stripe checkout fails | Ensure test mode keys and valid `STRIPE_PRO_PRICE_ID` |
| No time slots when booking | Barber must set availability first |
| Webhook not updating plan | Check webhook URL and `STRIPE_WEBHOOK_SECRET` in Vercel |
