# 🏛️ Antichità Barbaglia

> A premium e-commerce platform for authentic Italian antique furniture restoration

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635bff?style=flat-square&logo=stripe)](https://stripe.com/)

---

## ✨ Features

- 🛒 **E-commerce Platform** — Browse, filter, and purchase unique antique furniture pieces
- 🔧 **Services Page** — Dedicated page showcasing restoration, manufacturing, and buy/sell services
- 🌍 **Internationalization** — Full Italian and English language support with `next-intl`
- 🔐 **Authentication** — Secure user accounts with NextAuth.js (Email + Google OAuth)
- 💳 **Stripe Payments** — Secure checkout with Stripe integration
- 📧 **Email Notifications** — Order confirmations, wishlist alerts via Resend
- 🖼️ **Cloud Image Storage** — Product images hosted on Cloudflare R2
- 📱 **Responsive Design** — Beautiful UI across all devices
- 🛠️ **Admin Dashboard** — Full product, order, and category management

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma |
| **Auth** | NextAuth.js v5 |
| **Payments** | Stripe |
| **Email** | Resend + React Email |
| **Storage** | Cloudflare R2 |
| **Styling** | CSS Modules + Custom Design System |
| **i18n** | next-intl |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (we recommend [Neon](https://neon.tech/))
- Stripe account
- Cloudflare R2 bucket
- Resend account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TomBytedani/gianpy-website.git
   cd gianpy-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your credentials in the `.env` file (see [Environment Variables](#-environment-variables))

4. **Initialize the database**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="your-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Resend)
RESEND_API_KEY=""
EMAIL_FROM="noreply@yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"

# Cloudflare R2
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
R2_PUBLIC_URL=""

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   │   ├── admin/         # Admin dashboard
│   │   ├── services/      # Services page (Restauro, Manifattura, Compra-Vendita)
│   │   ├── shop/          # Product listing & details
│   │   ├── account/       # User account pages
│   │   └── ...
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── admin/            # Admin-specific components
├── emails/               # React Email templates
├── lib/                  # Utility functions & configs
├── messages/             # i18n translation files
└── middleware.ts         # Auth & i18n middleware

prisma/
├── schema.prisma         # Database schema
└── seed.ts              # Database seeding script
```

---

## 🧪 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database UI |
| `npx prisma db push` | Sync schema with database |

---

## 🌐 Deployment

This project is optimized for deployment on **Vercel**:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in Vercel's dashboard
4. Deploy!

> **Note:** Remember to update `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL` to your production domain.

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👥 Authors

- **Tommaso Brindani** — *Full stack web developer and QA engineer*

---

<p align="center">
  Made with ❤️ in Italy
</p>
