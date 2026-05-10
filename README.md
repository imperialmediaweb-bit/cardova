# Cardova

**Your digital business card. Share it everywhere.**

Cardova is a SaaS platform that gives every user a premium digital business card at `cardova.net/username`. Features include AI bio generation, QR code sharing, view analytics, and beautiful themes.

## Architecture

```
cardova/
  apps/
    api/        ← Express + Prisma + PostgreSQL (REST API)
    web/        ← React 18 + Vite + TailwindCSS (SPA)
  packages/
    shared/     ← Shared TypeScript types & constants
```

**Tech stack:** Node.js 20, Express 4, React 18, PostgreSQL, Redis, Prisma 5, Stripe, OpenAI GPT-4o, TailwindCSS, Railway.

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL (or Docker: `docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16`)
- Redis (or Docker: `docker run -p 6379:6379 redis:7`)

### 1. Clone & Install

```bash
git clone https://github.com/imperialmediaweb-bit/cardova.git
cd cardova
npm install
```

### 2. Configure Environment

```bash
# API
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your values

# Web
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env — set VITE_API_URL=http://localhost:3000
```

### 3. Set Up Database

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start Development Servers

```bash
# Terminal 1 — API (port 3000)
npm run dev:api

# Terminal 2 — Web (port 5173)
npm run dev:web
```

The API runs at `http://localhost:3000` and the frontend at `http://localhost:5173`.

### 5. Stripe Webhook (Local)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET in .env
```

## Railway Deployment

### 1. Create Railway Project

1. Go to [railway.app](https://railway.app) and create a new project
2. Add **PostgreSQL** plugin → `DATABASE_URL` auto-injected
3. Add **Redis** plugin → `REDIS_URL` auto-injected

### 2. Deploy API Service

1. Click "New Service" → "GitHub Repo" → select this repo
2. Set **Root Directory** to `apps/api`
3. Railway will detect the `railway.toml` and use it for build/start commands
4. Add environment variables (see [Environment Variables](#environment-variables))

The build command in `apps/api/railway.toml` runs `prisma migrate deploy` automatically on every deploy.

### 3. Deploy Web Service

1. Click "New Service" → "GitHub Repo" → select this repo
2. Set **Root Directory** to `apps/web`
3. Add `VITE_API_URL=https://your-api-service.railway.app` as env var

### 4. Configure Domains

- API service: `api.cardova.net`
- Web service: `cardova.net`

### 5. Stripe Webhook (Production)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.cardova.net/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.deleted`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET` env var

## Environment Variables

### API (`apps/api/.env`)

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes (auto on Railway) |
| `REDIS_URL` | Redis connection string | Yes (auto on Railway) |
| `JWT_ACCESS_SECRET` | JWT signing key (min 16 chars). Generate: `openssl rand -hex 32` | Yes |
| `JWT_REFRESH_SECRET` | JWT refresh signing key (min 16 chars). Generate: `openssl rand -hex 32` | Yes |
| `OPENAI_API_KEY` | OpenAI API key (starts with `sk-`) — [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key — [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) | Yes |
| `STRIPE_MONTHLY_PRICE_ID` | Stripe Price ID for Pro monthly ($5/mo) | Yes |
| `STRIPE_LIFETIME_PRICE_ID` | Stripe Price ID for Pro lifetime ($19) | Yes |
| `CLOUDINARY_URL` | Cloudinary URL for avatar uploads (optional) | No |
| `STORAGE_PATH` | Local storage path if not using Cloudinary | No |
| `SMTP_HOST` | SMTP hostname (e.g., `smtp.gmail.com`) | Yes |
| `SMTP_PORT` | SMTP port (default: `587`) | Yes |
| `SMTP_USER` | SMTP auth username | Yes |
| `SMTP_PASS` | SMTP auth password / app password | Yes |
| `EMAIL_FROM` | Sender address (e.g., `Cardova <noreply@cardova.net>`) | Yes |
| `CLIENT_URL` | Frontend URL (e.g., `https://cardova.net`) | Yes |
| `PORT` | Server port (default: `3000`) | No |
| `NODE_ENV` | `development` or `production` | No |

### Web (`apps/web/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base URL (e.g., `https://api.cardova.net`) |

## Stripe Setup

### Create Products in Stripe Dashboard

1. Go to **Products** → **Add Product**
2. Create **"Cardova Pro Monthly"** — Recurring, $5/month → copy the Price ID
3. Create **"Cardova Pro Lifetime"** — One-time, $19 → copy the Price ID
4. Set the Price IDs in `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_LIFETIME_PRICE_ID`

### Test Cards

| Scenario | Card Number |
|---|---|
| Successful payment | `4242 4242 4242 4242` |
| Declined | `4000 0000 0000 0002` |
| 3D Secure required | `4000 0025 0000 3155` |

Use any future expiration date and any 3-digit CVC.

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account, sends verification email |
| POST | `/api/auth/verify-email?token=xxx` | No | Verify email address |
| POST | `/api/auth/login` | No | Login, returns JWT + sets refresh cookie |
| POST | `/api/auth/refresh` | Cookie | Rotate refresh token, get new access token |
| POST | `/api/auth/logout` | Cookie | Invalidate refresh token |
| POST | `/api/auth/forgot-password` | No | Send password reset email |
| POST | `/api/auth/reset-password` | No | Reset password with token |
| GET | `/api/auth/me` | Bearer | Get current user profile |

### Card
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/card` | Bearer | Get or create user's card |
| PUT | `/api/card` | Bearer | Update card fields |
| POST | `/api/card/upload-avatar` | Bearer | Upload avatar (multipart, max 5MB) |
| GET | `/api/card/qr` | Bearer | Download QR code PNG |
| GET | `/api/card/vcf` | Bearer | Download vCard file |

### AI
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/generate-bio` | Bearer | Generate bio (rate limited: 5/min) |

### Stripe
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/stripe/checkout` | Bearer | Create Stripe Checkout session |
| POST | `/api/stripe/webhook` | Stripe sig | Handle Stripe webhook events |

### Analytics
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics/views` | Bearer + Pro | View analytics (last 30 days) |

### Public
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/public/:username` | No | Get public card data |

## Free vs Pro

| Feature | Free | Pro |
|---|---|---|
| Digital card | 1 | 1 |
| Custom username | Yes | Yes |
| All themes | Yes | Yes |
| Social links | Yes | Yes |
| QR code | Yes | Yes |
| vCard download | Yes | Yes |
| AI bio generations | 3 lifetime | Unlimited |
| View analytics | No | Yes |
| "Powered by Cardova" badge | Shown | Hidden |

## License

MIT
