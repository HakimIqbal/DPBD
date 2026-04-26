# DPBD-PPID: Donation Platform & Public Information Database

Enterprise-grade donation management system with integrated payment processing, real-time analytics, advanced reporting, and comprehensive donor management.

**Status**: Production Ready | **Version**: 1.0.0 | **Last Updated**: April 26, 2026

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Development](#development)
- [Technology Stack](#technology-stack)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Git Workflow](#git-workflow)
- [Troubleshooting](#troubleshooting)

---

## Overview

DPBD-PPID is a comprehensive donation management platform designed for organizations to streamline donation processing, analyze donor behavior, generate reports, and manage complete donor relationships.

**Core Capabilities:**
- Secure Payment Processing with Midtrans - Multiple payment methods
- Real-time Analytics Dashboard - KPIs, trends, and donor insights
- Advanced Reporting - PDF/Excel exports with custom filtering
- Complete Donor Management - Full lifecycle and loyalty programs
- Automation Engine - Scheduled reminders, refunds, and notifications
- Enterprise Security - JWT auth, RBAC, encrypted passwords, CORS protection

**Technology Stack:**
TypeScript | NestJS | React | Next.js | PostgreSQL | Tailwind CSS

---

## Architecture

```
dpbd-ppid/
├── backend/                    NestJS REST API Server
│   ├── src/
│   │   ├── admin/              Admin operations
│   │   ├── analytics/          Analytics engine
│   │   ├── auth/               JWT authentication
│   │   ├── donations/          Donation processing
│   │   ├── donors/             Donor management
│   │   ├── email/              Email service (Nodemailer)
│   │   ├── payments/           Midtrans payment processor
│   │   ├── reporting/          PDF/Excel reports
│   │   ├── news/               Content management
│   │   ├── partners/           Partner management
│   │   ├── programs/           Program management
│   │   ├── faqs/               FAQ management
│   │   ├── entities/           TypeORM entities
│   │   ├── config/             Configuration
│   │   └── main.ts             Entry point
│   ├── test/                   E2E & integration tests
│   ├── dist/                   Build output
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   Next.js Web Application
│   ├── app/                    Next.js App Router
│   │   ├── page.tsx            Landing page
│   │   ├── /donasi/            Donation listing
│   │   ├── /donate/            Donation checkout
│   │   ├── /admin/             Admin dashboard
│   │   ├── /auth/              Auth pages
│   │   ├── /user/              User dashboard
│   │   └── ...other routes/    Additional pages
│   ├── components/             React components
│   ├── lib/                    Utilities (API client, auth, utils)
│   ├── hooks/                  Custom React hooks
│   ├── public/                 Static assets
│   ├── package.json
│   └── tsconfig.json
│
└── Configuration
    ├── .gitignore              Git ignore rules
    ├── README.md               This file
    └── .env.example            Environment template
```

---

## Quick Start

### System Requirements

**Minimum Requirements:**
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **Node.js** | 18.x LTS | 20.x LTS |
| **npm** | 9.x | 10.x+ |
| **PostgreSQL** | 12.x | 15.x+ |
| **RAM** | 2GB | 4GB+ |
| **Disk Space** | 500MB | 2GB+ |

### Installation Steps

#### Clone Repository
```bash
git clone https://github.com/your-org/dpbd-ppid.git
cd dpbd-ppid
```

#### Install Dependencies

**Backend:**
```bash
cd backend
npm install --legacy-peer-deps  # if needed
npm run build                   # Compile TypeScript
```

**Frontend:**
```bash
cd ../frontend
npm install
```

#### Configure Environment Variables

**Backend (.env):**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials
```

**Frontend (.env.local):**
```bash
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your settings
```

#### Initialize Database

```bash
cd backend
npm run typeorm:migration:run  # If using TypeORM migrations
```

---

## Development

### Backend Server (NestJS)

**Start Development Server:**
```bash
cd backend
npm run dev  # Starts on http://localhost:3000 with hot-reload
```

**Available Commands:**

| Command | Description | Usage |
|---------|-------------|-------|
| `npm run dev` | Start dev server with watch mode | Development |
| `npm run dev:debug` | Start with Node debugger enabled | Debugging |
| `npm run build` | Compile TypeScript to JavaScript | CI/CD |
| `npm run start` | Run production build | Production |
| `npm run lint` | ESLint code quality check | Code Review |
| `npm run format` | Auto-format code with Prettier | Before Commit |
| `npm run test` | Run unit tests with Jest | Testing |
| `npm run test:watch` | Run tests in watch mode | Development |
| `npm run test:cov` | Run tests with coverage report | CI/CD |
| `npm run test:e2e` | Run end-to-end tests | Integration Testing |

### Frontend Application (Next.js)

**Start Development Server:**
```bash
cd frontend
npm run dev  # Starts on http://localhost:3001
```

**Available Commands:**

| Command | Description | Usage |
|---------|-------------|-------|
| `npm run dev` | Start dev server with hot-reload | Development |
| `npm run build` | Build optimized production bundle | CI/CD |
| `npm run start` | Run production server | Production |
| `npm run lint` | ESLint code quality check | Code Review |
| `npm run type-check` | TypeScript type checking | Before Commit |

### API Testing

**Recommended Tools:**
- **Postman** - [postman.com](https://www.postman.com) - GUI HTTP client
- **Insomnia** - [insomnia.rest](https://insomnia.rest) - REST client
- **curl/httpie** - Command-line tools
- **VS Code REST Client** - VS Code extension

**Example API Call:**
```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -d '{
    "donationAmount": 100000,
    "programId": "uuid-here"
  }'
```

---

## Technology Stack

### Backend (NestJS + Node.js)

**Architecture Pattern:**
```
HTTP Request
    ↓
[Express Middleware] → Authentication, Validation, Logging
    ↓
[Route Handler] → NestJS Controller
    ↓
[Business Logic] → Services Layer
    ↓
[Data Access] → TypeORM Repositories
    ↓
[Database] → PostgreSQL
    ↓
[Response] → JSON
```

**Core Framework & Libraries:**
- **NestJS 11.x** - Enterprise Node.js framework
- **TypeScript 5.x** - Modern JavaScript with types
- **PostgreSQL 12+** - Relational database
- **TypeORM 0.3.x** - ORM for database operations
- **JWT** - Stateless authentication
- **Passport.js** - Authentication middleware
- **Midtrans Client** - Payment gateway integration
- **PDFKit 0.18.x** - PDF generation
- **ExcelJS 4.4.x** - Excel file creation
- **Nodemailer 8.x** - Email sending service
- **node-schedule 2.x** - Cron job scheduling
- **class-validator** - Data validation
- **class-transformer** - Data transformation
- **Jest** - Unit testing framework
- **Prettier** - Code formatter
- **ESLint** - Code linter

**Key Dependencies (package.json):**
```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/jwt": "^11.0.2",
    "@nestjs/typeorm": "^11.0.0",
    "typeorm": "^0.3.x",
    "postgres": "^3.4.x"
  },
  "devDependencies": {
    "@types/jest": "^29.x",
    "jest": "^29.x",
    "ts-jest": "^29.x"
  }
}
```

### Frontend (Next.js + React)

**Architecture Pattern:**
```
Browser Request
    ↓
[Next.js Server] → Page Rendering
    ↓
[React Components] → Component Tree
    ↓
[Custom Hooks] → Logic & State
    ↓
[API Client] → Axios HTTP Calls
    ↓
[Backend API] → NestJS Server
    ↓
[Rendered HTML] → Browser Display
```

**Core Framework & Libraries:**
- **Next.js 14.x** - React meta-framework with SSR/SSG
- **React 18.x** - UI library
- **TypeScript 5.x** - Modern JavaScript with types
- **Tailwind CSS 3.x** - Utility-first CSS framework
- **Radix UI** - Headless component library
- **React Hook Form 7.x** - Form state management
- **Axios** - HTTP client
- **Chart.js 4.4.x** - Data visualization
- **Lucide React** - Icon library
- **date-fns 4.x** - Date manipulation
- **Zod** - Schema validation
- **clsx** - Conditional className utility
- **Vercel Analytics** - Web analytics
- **Prettier** - Code formatter
- **ESLint** - Code linter

**Key Dependencies (package.json):**
```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "typescript": "^5.x",
    "axios": "^1.x",
    "react-hook-form": "^7.x",
    "tailwindcss": "^3.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/node": "^20.x",
    "eslint": "^8.x"
  }
}
```

---

## API Reference

### Payment Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|:---:|-------------|
| `POST` | `/payments` | ✅ Required | Create payment order |
| `GET` | `/payments/:externalId/receipt` | ✅ Required | Download receipt PDF |
| `POST` | `/payments/:donationId/refund` | ✅ Required | Request refund |
| `GET` | `/payments/:donationId/refund-status` | ✅ Required | Check refund status |

### Analytics Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|:---:|-------------|
| `GET` | `/analytics/dashboard` | ✅ Required | Get dashboard KPIs |
| `GET` | `/analytics/programs` | ✅ Required | Program performance |
| `GET` | `/analytics/trends` | ✅ Required | Donation trends |
| `GET` | `/analytics/donors` | ✅ Required | Donor insights |
| `GET` | `/analytics/summary` | ✅ Required | Summary statistics |

### Reporting Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|:---:|-------------|
| `GET` | `/reports/transactions/pdf` | ✅ Required | PDF transaction report |
| `GET` | `/reports/transactions/excel` | ✅ Required | Excel export |
| `GET` | `/reports/summary` | ✅ Required | Summary report |

### Admin Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|:---:|-------------|
| `POST` | `/admin/donations/approve` | 👤 Admin | Bulk approve donations |
| `POST` | `/admin/donations/reject` | 👤 Admin | Bulk reject donations |
| `POST` | `/admin/donations/refund` | 👤 Admin | Bulk refund donations |
| `DELETE` | `/admin/donations/:id` | 👤 Admin | Delete donation |
| `GET` | `/admin/donations/summary` | 👤 Admin | Admin statistics |

**Full API Documentation**: See [backend/README.md](backend/README.md)  
**API Testing**: Import Postman collection from `/backend/postman-collection.json`

---

## Features

### Payment Processing
| Feature | Status | Details |
|---------|:------:|---------|
| Midtrans Integration | ✅ | Multiple payment methods |
| Real-time Status | ✅ | Live payment tracking |
| Payment Reminders | ✅ | Automated hourly schedule |
| Refund Processing | ✅ | Verification & reconciliation |
| Receipt PDF | ✅ | On-demand generation |
| Payment History | ✅ | Complete transaction log |

### Analytics Dashboard
| Feature | Status | Details |
|---------|:------:|---------|
| Real-time Metrics | ✅ | Live KPI dashboard |
| Program Performance | ✅ | Success rate analysis |
| Donation Trends | ✅ | Time-series visualization |
| Donor Demographics | ✅ | Segmentation & insights |
| Revenue Forecasting | ✅ | Predictive analytics |
| Interactive Charts | ✅ | Chart.js powered |

### Reporting System
| Feature | Status | Details |
|---------|:------:|---------|
| PDF Reports | ✅ | Professional formatting |
| Excel Exports | ✅ | Multi-sheet workbooks |
| Date Range Filtering | ✅ | Custom periods |
| Scheduled Generation | ✅ | Automated schedule |
| Email Delivery | ✅ | Auto-delivery system |
| Data Aggregation | ✅ | Transaction summarization |

### Donor Management
| Feature | Status | Details |
|---------|:------:|---------|
| Donor Profiles | ✅ | Complete information |
| Donation History | ✅ | Full transaction history |
| Loyalty Tiers | ✅ | Bronze → Platinum system |
| Preferences | ✅ | Communication settings |
| Advanced Search | ✅ | Multi-field filtering |
| Segmentation | ✅ | Donor categorization |

### Admin Operations
| Feature | Status | Details |
|---------|:------:|---------|
| Bulk Actions | ✅ | Approve/Reject/Refund |
| Reconciliation | ✅ | Transaction verification |
| Status Updates | ✅ | Manual status changes |
| Audit Trail | ✅ | Complete action logging |
| Monitoring | ✅ | System status dashboard |
| User Management | ✅ | Admin user control |

### Authentication & Security
| Feature | Status | Details |
|---------|:------:|---------|
| JWT Authentication | ✅ | Stateless tokens |
| Role-Based Access | ✅ | RBAC permission system |
| Password Encryption | ✅ | bcrypt hashing |
| Refresh Tokens | ✅ | Token rotation |
| Request Validation | ✅ | Input sanitization |
| CORS Protection | ✅ | Cross-origin security |
| SQL Injection Prevention | ✅ | Parameterized queries |

---

## Configuration

### Backend Setup (.env)

```bash
# ===== Database Configuration =====
DATABASE_URL=postgres://username:password@localhost:5432/dpbd_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=dpbd_db

# ===== JWT Configuration =====
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRATION=30d

# ===== Midtrans Payment Gateway =====
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_MERCHANT_ID=your_merchant_id

# ===== Email Service (Gmail SMTP) =====
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
SMTP_FROM=noreply@dpbd.org
SMTP_FROM_NAME="DPBD Team"

# ===== Application Configuration =====
NODE_ENV=development
APP_PORT=3000
APP_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001
LOG_LEVEL=debug
```

### Frontend Setup (.env.local)

```bash
# ===== API Configuration =====
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_TIMEOUT=30000

# ===== Midtrans Configuration =====
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
NEXT_PUBLIC_MIDTRANS_ENVIRONMENT=sandbox

# ===== Analytics =====
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# ===== Feature Flags =====
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REPORTING=true
NEXT_PUBLIC_ENABLE_DONATIONS=true
```

---

## Testing & Quality Assurance

### Unit Testing

```bash
cd backend

# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov

# Run specific test file
npm run test -- auth.service.spec.ts
```

### Integration & E2E Testing

```bash
# E2E tests
npm run test:e2e

# E2E watch mode
npm run test:e2e --watch
```

### Code Quality

```bash
# Lint check (find issues)
npm run lint

# Lint with auto-fix
npm run lint -- --fix

# Format code
npm run format

# Type check (TypeScript)
npm run type-check
```

### Pre-commit Hooks

All commits automatically run:
- ESLint checks
- Code formatting
- Type checking
- Unit tests (if configured)

---

## Deployment

### Build Backend

```bash
cd backend

# Build TypeScript to JavaScript
npm run build

# Copy environment file
cp .env.production .env

# Run database migrations
npm run typeorm:migration:run

# Start production server
npm run start:prod
```

**Output:** `dist/` folder (ready for deployment)

### Build Frontend

```bash
cd frontend

# Build optimized production bundle
npm run build

# Start production server
npm run start
```

**Output:** `.next/` folder (ready for deployment)

### Deployment Checklist

- [ ] Environment variables properly configured
- [ ] Database migrations completed successfully
- [ ] SSL/TLS certificates installed
- [ ] Midtrans production credentials configured
- [ ] Email service verified and tested
- [ ] Backup strategy implemented
- [ ] Monitoring & alerting setup complete
- [ ] Logging system configured
- [ ] CDN configured (if applicable)
- [ ] Database backups scheduled
- [ ] Disaster recovery plan documented

### Docker Deployment (Optional)

```bash
# Build Docker image
docker build -t dpbd-ppid:1.0.0 .

# Run container
docker run -p 3000:3000 --env-file .env dpbd-ppid:1.0.0
```

---

## Git Workflow & .gitignore

### What Must Be Committed

```bash
- Source code (src/, app/, components/)
- Configuration (tsconfig.json, eslint.config.mjs)
- Dependencies (package.json, package-lock.json)
- Documentation (.md files, API docs)
- Environment templates (.env.example)
- Tests (*.spec.ts, *.test.ts)
```

### What MUST BE Ignored

```bash
- Dependencies (node_modules/, pnpm-lock.yaml)
- Build outputs (dist/, .next/, build/)
- Runtime data (.env, .env.local, *.log)
- Database files (*.db, *.sqlite)
- IDE settings (.vscode/, .idea/)
- OS files (.DS_Store, Thumbs.db)
- Temp files (tmp/, temp/, cache/)
```

**Check** `.gitignore` and `backend/.gitignore` for complete list.

### Git Best Practices

```bash
# Check what will be committed
git status

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: add payment refund functionality"

# Push to remote
git push origin main

# Create feature branch
git checkout -b feature/new-feature

# Merge with PR review
# (recommended workflow)
```

---

## Troubleshooting

### Backend Issues

**Port 3000 Already in Use**
```bash
# Check process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

**Database Connection Error**
```bash
# Verify PostgreSQL is running
psql -U postgres -h localhost

# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
npm run typeorm:query "SELECT 1"
```

**Dependency Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Frontend Issues

**Port 3001 Already in Use**
```bash
# Use next port
npm run dev -- -p 3002
```

**Build Fails**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build

# Check for TypeScript errors
npm run type-check
```

**API Connection Failed**
```bash
# Verify backend is running
curl http://localhost:3000/health

# Check NEXT_PUBLIC_API_URL in .env.local
cat .env.local | grep API_URL

# Restart frontend
npm run dev
```

---

## New Developer Onboarding

### Day 1: Setup & Familiarization (2 hours)

- [ ] Clone repository & install dependencies
- [ ] Create `.env` files from `.env.example` files
- [ ] Read this README completely
- [ ] Read `backend/README.md`
- [ ] Start backend: `npm run dev` (backend/)
- [ ] Start frontend: `npm run dev` (frontend/)
- [ ] Visit http://localhost:3001 in browser
- [ ] Test login functionality
- [ ] Run tests: `npm run test` (both folders)
- [ ] Ask team for Postman collection

### Day 2: Codebase Exploration (2-4 hours)

- [ ] Explore `/backend/src/` directory structure
- [ ] Understand data models in `/entities/`
- [ ] Review authentication flow (`/auth/`)
- [ ] Explore `/frontend/app/` routes
- [ ] Understand React component structure
- [ ] Review API client in `/lib/api.ts`
- [ ] Check custom hooks in `/hooks/`

### Week 1: Integration Tasks

- [ ] Complete assigned feature/bug task
- [ ] Make first pull request for code review
- [ ] Ask for mentorship from senior dev
- [ ] Participate in daily standup
- [ ] Set up IDE debugger (optional)
- [ ] Configure Git SSH keys
- [ ] Set up local database backups

### Pre-Commit Checklist

Before every commit:
- [ ] Run `npm run lint` and fix issues
- [ ] Run `npm run format` for code style
- [ ] Run `npm run test` and ensure passing
- [ ] Review changes: `git diff`
- [ ] Write meaningful commit message
- [ ] Push to feature branch
- [ ] Create pull request with description
- [ ] Request code review

---

### Reporting Guidelines

**Bug Report Format:**
```
Title: [BUG] Brief description

Environment:
- Node.js version
- OS (macOS/Linux/Windows)
- Backend/Frontend version

Steps to Reproduce:
1. Step one
2. Step two
3. Step three

Expected: ...
Actual: ...

Logs: [attach error logs]
```

**Feature Request Format:**
```
Title: [FEATURE] Brief description

Use Case: What problem does this solve?

Solution: How could it work?

Alternative Solutions: Any alternatives?
```