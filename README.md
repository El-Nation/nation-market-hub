<div align="center">
  <h1>🌟 Nation Market Hub</h1>
  <p><strong>A production-ready, dual-sided marketplace bringing local customers and pre-verified service providers together.</strong></p>

  [![Live Demo](https://img.shields.io/badge/Live_Demo-View_Project-blue?style=for-the-badge)](https://nationmarkethub.eghedev.com)
</div>

---

## 🚀 Live Demo

**Check out the live interactive application here:** 
👉 [https://nationmarkethub.eghedev.com] 👈

> **Note:** Use test credentials provided in the application (or register an account) to explore the various dashboards.

---

## 📖 Overview

**Nation Market Hub** is built with a robust multi-role architecture, secure authentication, real-time messaging, and interactive dynamic dashboards inside a highly scalable **Node.js/React monorepo**. It solves the problem of connecting potential clients with local service professionals securely and efficiently.

## ✍️ Authors

- **Developed and Engineered by:** [El-Nation](https://github.com/El-Nation)

*(Give the repository a ⭐ if you found it useful!)*

---

## ✨ Comprehensive Features

We've packed the platform with an extensive suit of industry-standard features mapping cleanly to each user role (Customer, Provider, Admin):

### 🛡️ Core Security & Identity
- **Multi-Role Flow:** Fully isolated and secure architectural routing for **Customers**, **Service Providers**, and **Super Admins**.
- **Enterprise-Grade Identity:**
  - Fast, stateless **JWT-based authentication**.
  - Advanced **Two-Factor Authentication (2FA)** mechanisms protecting user settings using Authenticator Apps.
  - Complete, branded, and deeply secure **Forgot Password / Reset Workflow** utilizing native Node crypto and expiration caching.

### 💬 Real-time Operations & Chat Engine
- **Adaptive Chat Algorithm:** Our native React messaging interface utilizes backoff polling. It aggressively fetches direct messages at 3-second intervals during active typing/chatting, but gracefully dials down to 15-second cycles when idle. This actively prevents WAF/DDoS backend blocking while ensuring seamless UX.
- **Cross-Platform Synchronization:** Localized avatar/profile adjustments instantly synchronize through React state lifecycles to all correlated dashboards. 

### 📧 Intelligent Transactional Notifications
- **Event-Driven Push Notifications:** Real-time frontend alerts combined with audio chimes track all granular marketplace events (new provider signups, service inquiries, and project completions). 
- **Professionalized SMTP Matrix:** Fully standardized HTML email templates using `nodemailer` ensuring responsive, branded delivery for:
  - Welcome, Onboarding, and Security Alert emails.
  - Custom transactional routing (Business notices to Admins vs Security alerts direct to Owners).

### 🛒 Checkout & Financial Pipelines
- **Paystack Webhooks:** Bulletproof automated checkout monitoring and asynchronous verification explicitly catching live transactions.
- **Digital Receipt Generation:** Automatically triggered secure, printable digital transaction receipts matching exact checkout criteria.
- **Dynamic Mobile Formatting:** Meticulously engineered CSS layouts solving horizontal overflow and massive reactive whitespace issues across mobile eCommerce cart workflows.

---

## 🛠️ Tech Stack & Architecture

This project strictly utilizes modern tools encapsulated within a cleanly managed MonoRepo environment designed for minimal-complexity host deployment:

- **Frontend:** React 18, Vite, TypeScript, Lucide React (Icons), Standardized Adaptive CSS
- **Backend:** Node.js (v20+), Express.js (REST API / Middleware Routers)
- **Database:** PostgreSQL (with `pg` driver natively pointing to remote Supabase clusters)
- **Security:** `bcryptjs`, `jsonwebtoken`, `express-rate-limit`
- **Mail Orchestration:** `nodemailer` with dynamic HTML layout injections.

---

## 📁 System Structure

```
nation-market-hub/
│
├── client/                     # Frontend Vite Workspace
│   ├── src/
│   │   ├── components/         # Modular React UI (ChatModal, ProviderCTA, Modals)
│   │   ├── types/              # TypeScript interface definitions
│   │   └── App.tsx             # Core router and security guard wrappers
│   └── package.json            # Vite configuration
│
├── src/                        # Backend Express Server
│   ├── controllers/            # Auth, Users, Enquiries, Payments, Audits
│   ├── utils/                  # Mailer templates, Webhooks, Crypto hashing
│   └── server.js               # Core API endpoints & generic React serving
│
├── .env.example                # Templated secrets
└── package.json                # Root Hostinger orchestration scripts
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- **Node.js** (v20+)
- **PostgreSQL** database (Local or Cloud like Supabase)
- **Git**

### 2. Install Dependencies
Clone the repository and install dependencies sequentially automatically using our integrated scripts:
```bash
git clone https://github.com/El-Nation/nation-market-hub.git
cd nation-market-hub

# Installs root backend dependencies
npm install

# Installs React deps and builds the initial frontend bundle
npm run postinstall
```

### 3. Database Initialization
Create a Postgres database and run your SQL schema/seeds against it. (E.g., `nation_market_hub_dump.sql` or `seed.sql`)
```bash
psql -h <host> -U <user> -d <db_name> -f src/db/seed.sql
```

### 4. Environment Variables
Create a local `.env` matching your configuration requirements.

```bash
cp .env.example .env
```
Ensure required keys are set:
```env
PORT=5000
DB_HOST=localhost            
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secret
DB_NAME=nation_market_hub
JWT_SECRET=super_secret_key
SMTP_HOST=smtp.gmail.com
```

### 5. Start Development Servers
This boots up both the Express Backend API (5000) and Vite HMR Frontend (5173).
```bash
npm run client:dev   # In terminal tab 1
npm start            # In terminal tab 2
```

---

## 📦 Production Deployment (Hostinger Node.js)

The architecture is carefully engineered to dynamically serve the React frontend through the Express routing backend. This completely bypasses complicated CORS or cross-origin deployment pipelines on standard cPanel/Hostinger VPS ecosystems.

1. **Build the production bundle:**
   ```bash
   npm run build --prefix client
   ```
2. **Setup your Hostinger Node App:**
   - Target the Application Startup File strictly to `src/server.js`.
   - Ensure the `.env.production` inside the client folder points its `VITE_API_URL` locally as `""` (empty string).
   - The Express application natively captures incoming HTTP requests and securely routes them to `client/dist/index.html`!

---

## 🔐 System Permissions Framework

- **Customer Dashboard:** Trigger service requests, maintain public avatars, communicate privately with vendors, buy products.
- **Service Provider Interface:** Actively accept/reject incoming job requests, update service status ("Pending", "Contacted", "Completed"), and optimize metrics.
- **Super Admin Control Center:** Complete oversight capability. Handle platform bans, system usage metrics, direct broadcast email, and category data oversight. 

---
*Architected for flawless execution on any device. Built by El-Nation.*
