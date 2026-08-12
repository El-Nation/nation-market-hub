# Nation Market Hub

Nation Market Hub is a dual-sided, production-ready marketplace platform designed to seamlessly connect local customers with registered service providers. It features a robust multi-role architecture, secure authentication, real-time messaging, and interactive dashboards, all packaged within a scalable Node.js/React monorepo architecture tailored for modern web hosting environments.

## 🚀 Features

- **Multi-Role Dashboards:** Fully isolated, secure experiences for **Customers**, **Service Providers**, and **Super Admins**.
- **Adaptive Chat Engine:** A real-time, direct messaging interface between customers and providers. Features an intelligent adaptive backoff polling algorithm that aggressively fetches replies at 3-second intervals during active conversations and gracefully steps down to 15-second cycles when idle, completely avoiding WAF/DDoS rate-limiting blocks.
- **Enterprise-Grade Security:**
  - JWT-based authentication.
  - Multi-role **Two-Factor Authentication (2FA)** using authenticator apps.
  - Secure, password recovery and resetting workflows mapped directly to user roles.
- **Event-Driven Notifications:** Real-time platform notifications alerting Admins to new provider registrations, customer sign-ups, and marketplace interaction events. Complete with visual unread-badges and audio chimes.
- **Cross-Platform UI Synchronization:** Advanced React state management ensures that localized updates (like uploading a new profile picture) immediately trigger network-wide UI updates reflecting seamlessly on opposite ends of a marketplace interaction.
- **Provider Analytics:** Actionable metrics tracking total requests, completed projects, and granular success rates directly visible to the Admin tier.

## 🛠 Tech Stack & Architecture

This project is built as a highly integrated Monorepo.

* **Frontend:** React 18, Vite, TypeScript, Lucide React (Icons), internal plain CSS scaling (Zero-dependency styling wrapper).
* **Backend:** Node.js (v20+), Express.js
* **Database:** PostgreSQL (integrated via the `pg` driver, explicitly mapped for remote Supabase connections).
* **Security & Auth:** `bcryptjs` (password hashing), `jsonwebtoken` (session handling).
* **Utilities:** `nodemailer` (SMTP email orchestration).

## 📁 Project Structure

```
nation-market-hub/
│
├── client/                     # Frontend Vite Workspace
│   ├── src/
│   │   ├── components/         # Modular React UI components (Dashboards, Modals, Lists)
│   │   ├── types/              # TypeScript interface declarations
│   │   └── App.tsx             # Main routing and global state container
│   └── package.json            # Frontend dependencies
│
├── src/                        # Backend Express Server
│   └── server.js               # Core API endpoints, Postgres routes, JWT verification
│
├── .env.example                # Template for environment secrets
├── package.json                # Root dependency manager & Hostinger deployment scripts
└── nation_market_hub_dump.sql  # Database schema & initialization sequence
```

## ⚙️ Setup & Installation

### 1. Prerequisites
- **Node.js** (v20+ recommended)
- **PostgreSQL** (Local environment or a remote connection like Supabase)
- **Git**

### 2. Local Environment Initialization
Clone the repository and install dependencies sequentially across the monorepo:

```bash
git clone https://github.com/El-Nation/nation-market-hub.git
cd nation-market-hub

# Install backend dependencies
npm install

# Install frontend dependencies and build
npm run postinstall
```

### 3. Database Configuration
Construct a PostgreSQL database using the provided schema. 
Execute the core SQL file into your target database:
```bash
psql -h <hostname> -U <username> -d <database_name> -f nation_market_hub_dump.sql
```

### 4. Environment Variables
Duplicate the provided example file and replace the values with your actual database and SMTP credentials. NEVER commit the real `.env` to version control.

```bash
cp .env.example .env
```

**Required `.env` Keys:**
```env
PORT=5000
DB_HOST=localhost            # Ex: aws-1-eu-west-3.pooler.supabase.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=nation_market_hub
JWT_SECRET=your_hyper_secure_randomly_generated_string

# For Email Functions (Password resets / Alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
```

### 5. Running the Application locally

**Development Server:**
To run both the backend Express server and the Vite React frontend simultaneously for live development monitoring:
```bash
npm run client:dev   # Runs frontend on port 5173
npm start            # Runs backend on port 5000
```

## 📦 Production Deployment (Hostinger Node.js App Manager)

The backend `server.js` was specifically re-engineered to seamlessly bypass typical separate frontend/backend hosting dilemmas by securely serving the flattened static React bundle in standard production environments.

1. **Build the Production Distributable:**
   ```bash
   npm run build --prefix client
   ```
2. **Hostinger App Configuration:**
   - Define the `NODE_ENV` environment variable as `production`. Target the Start Script explicitly to `src/server.js`.
   - The Express application will naturally hijack incoming traffic and serve the minified `client/dist/index.html` structure automatically!

## 🔐 User Roles & Permissions

- **Customer:** Create service inquiries, chat with vendors, update profile data, and trigger marketplace demands.
- **Service Provider:** Must select predefined categories representing their active business tier. Can view incoming requests dynamically injected into their dashboards and modify the job statuses ("Pending", "Contacted", "Completed").
- **Admin:** Absolute root-level oversight. Can ban providers, track system usage analytics, manage core categories, and receive unified global notifications.

---
*Built with precision and integrated heavily for stability across all hosting networks.*
