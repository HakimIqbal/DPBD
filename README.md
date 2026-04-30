# DPBD — Dana Abadi PPI Dunia

Platform pengelolaan dana abadi (endowment fund) untuk Perhimpunan Pelajar Indonesia (PPI) Dunia. Mengelola donasi, portofolio investasi syariah, penyaluran dana, dan tata kelola multi-peran (CFO, Investment Manager, Risk Manager, Dewan Pembina, dll.).

**Versi:** 1.0.0 — Sprint 5 shipped &nbsp;·&nbsp; **Last updated:** April 30, 2026 &nbsp;·&nbsp; **Status:** Active development

> Dokumen role/permission rinci ada di [`backend/ROLES.md`](backend/ROLES.md). Update dokumen itu setiap kali menambah/mengubah role atau permission.

---

## Daftar Isi

- [Apa yang dibangun](#apa-yang-dibangun)
- [Quick start (5 menit)](#quick-start-5-menit)
- [Arsitektur folder](#arsitektur-folder)
- [Tech stack (versi aktual)](#tech-stack-versi-aktual)
- [Modul backend & endpoint](#modul-backend--endpoint)
- [Role & dashboard frontend](#role--dashboard-frontend)
- [Test accounts (dev only)](#test-accounts-dev-only)
- [Workflow penting](#workflow-penting)
- [Environment variables](#environment-variables)
- [Scripts npm yang sering dipakai](#scripts-npm-yang-sering-dipakai)
- [Sprint history](#sprint-history)
- [Troubleshooting](#troubleshooting)
- [Konvensi commit & branching](#konvensi-commit--branching)

---

## Apa yang dibangun

DPBD bukan sekadar platform donasi. Inti produknya adalah **dana abadi yang dikelola jangka panjang**: pokok donasi diinvestasikan ke instrumen syariah (sukuk, reksa dana, deposito, saham), dan hanya imbal hasilnya yang disalurkan ke program. Pokok dana tetap utuh tahun demi tahun.

Yang sudah jadi:

- **Landing page publik** — counter dana abadi (corpus + return real-time), berita terkini, daftar program donasi.
- **Donasi end-to-end** via Midtrans (sandbox).
- **14 role RBAC** dengan permission matrix — CEO, CFO, Investment Manager, Risk Manager, Dewan Pembina/Pengawas, Audit Independen, Komite Etik, Finance, Admin, Editor, Partnership, Donor (personal/company). Detail di [`backend/ROLES.md`](backend/ROLES.md).
- **Audit trail** — semua aksi sensitif (approve donasi, hapus user, breach risiko, approve disbursement) tercatat dengan actor + IP + UA.
- **Modul Investment Portfolio** — daftar instrumen, transaksi, summary (mark-to-market, return %, alokasi).
- **Modul Risk & Compliance** — threshold konfigurasi (mis. "Konsentrasi Sukuk > 60% → warning"), evaluasi otomatis terhadap portofolio aktual, alert lifecycle.
- **Dashboard per role** — view berbeda untuk CFO, Investment Manager, Risk Manager, Dewan Pembina, Dewan Pengawas. Role lain pakai dashboard generik.
- **CEO bootstrap** — server pertama auto-create CEO account dari env, idempotent.
- **Disbursement approval flow** — Finance ajukan, CFO review (Setujui/Tolak dengan alasan), audit log otomatis.

---

## Quick start (5 menit)

### Prasyarat

| | Min | Disarankan |
|---|---|---|
| Node.js | 18 LTS | 20 LTS |
| npm | 9.x | 10.x |
| PostgreSQL | 12 | 15 (atau Supabase) |

### Langkah

```bash
# 1. Clone
git clone <repo-url> dpbd && cd dpbd

# 2. Install deps (parallel-friendly)
(cd backend && npm install --legacy-peer-deps) & \
(cd frontend && npm install) & wait

# 3. Setup env backend
cp backend/.env.example backend/.env
# Edit backend/.env — minimum yang harus diset:
#   DATABASE_HOST, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME
#   JWT_SECRET (≥32 chars), JWT_REFRESH_SECRET
#   CEO_BOOTSTRAP_PASSWORD (ganti dari default!)

# 4. Run migrations
cd backend && npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts

# 5. Start backend (port 3001)
npm run start:dev

# 6. Di terminal lain — start frontend (port 3000)
cd ../frontend && npm run dev
```

Buka `http://localhost:3000`. Login pakai akun bootstrap CEO atau test account (lihat [Test accounts](#test-accounts-dev-only)).

> **Frontend tidak butuh `.env.local`** untuk dev — `NEXT_PUBLIC_API_URL` default ke `http://localhost:3001/api`. Set kalau backend di host lain.

---

## Arsitektur folder

```
dpbd/
├── backend/                         NestJS API server (port 3001)
│   ├── src/
│   │   ├── admin/                   Admin operations (bulk approve/reject donations)
│   │   ├── analytics/               /endowment, /public-stats, /dashboard, trends
│   │   ├── audit/                   AuditLog write + read controller
│   │   ├── auth/                    JWT, RolesGuard, PermissionsGuard, decorators
│   │   ├── disbursements/           CFO approval queue (Sprint 5)
│   │   ├── donations/               Donation CRUD + status transitions
│   │   ├── donors/                  Donor profile lookups
│   │   ├── faqs/ / news/ / partners/ / programs/    Konten publik
│   │   ├── investment/              Portfolio + transaksi (Sprint 4)
│   │   ├── payments/                Midtrans charge + webhook
│   │   ├── reporting/               PDF/Excel exports
│   │   ├── risk/                    Threshold + alert engine (Sprint 5)
│   │   ├── users/                   Profile + admin user mgmt
│   │   ├── entities/                TypeORM entities (single source of truth)
│   │   ├── migrations/              Versioned schema migrations
│   │   ├── seeds/                   Idempotent seed scripts (run on bootstrap)
│   │   ├── scripts/                 Standalone CLIs (e.g. create-ceo.ts)
│   │   ├── data-source.ts           TypeORM DataSource untuk CLI
│   │   ├── app.module.ts            Wiring semua module
│   │   └── main.ts                  Bootstrap + seed orchestration
│   ├── ROLES.md                     Role/permission catalog (source of truth)
│   ├── .env.example
│   └── package.json
│
├── frontend/                        Next.js App Router (port 3000)
│   ├── app/
│   │   ├── (public landing)         page.tsx, /berita, /program, /transparency
│   │   ├── /donasi/, /donate/       Legacy redirect → checkout flow
│   │   ├── /auth/                   Login, register (personal/company), forgot-pw
│   │   ├── /admin/                  Role-aware: dispatch by role
│   │   │   ├── page.tsx             Dispatcher → role-specific or default dashboard
│   │   │   ├── /risk/               Risk Manager full page (Sprint 5)
│   │   │   ├── /disbursements/      Admin disbursement page
│   │   │   ├── /portfolio/, /audit/, /users/, /donations/, ...
│   │   ├── /finance/, /editor/, /user/    Per-role workflow pages
│   ├── components/
│   │   ├── admin/dashboards/        Per-role dashboard components (Sprint 5)
│   │   ├── landing/                 Hero, Endowment counter, News, Programs, etc.
│   │   └── ui/                      Radix primitives (Card, Dialog, Select, ...)
│   ├── lib/
│   │   ├── api.ts                   Typed API client wrappers
│   │   ├── auth-context.tsx         Auth provider + hasPermission()
│   │   ├── permissions.ts           Permission catalog (mirrors backend)
│   │   └── utils.ts                 cn() + safe formatRupiah()
│   ├── hooks/
│   │   ├── use-permission.ts        usePermission(), useRole()
│   │   └── use-toast.ts             Sonner toast wrapper
│   └── types/                       Module declarations (canvas-confetti, dll.)
│
└── README.md (this file)
```

---

## Tech stack (versi aktual)

| Layer | Stack |
|---|---|
| **Backend** | NestJS **11.x**, TypeORM **0.3.28**, PostgreSQL 12+ (dev pakai Supabase pooler) |
| **Auth** | JWT (access 7d, refresh 30d), bcrypt(js) hashing, RolesGuard + PermissionsGuard |
| **Frontend** | Next.js **16.0.7**, React **19.2.0**, App Router, Server + Client Components |
| **Forms** | React Hook Form 7 + Zod 3.25 |
| **HTTP client** | Native `fetch()` (bukan Axios) — lihat `lib/api.ts` |
| **UI** | Tailwind CSS, Radix UI primitives, Lucide icons, Recharts (donut/area charts) |
| **Payment** | Midtrans Sandbox (production: ganti `MIDTRANS_ENVIRONMENT=production`) |
| **Reports** | PDFKit, ExcelJS |

> Frontend client menggunakan `fetch()` langsung, bukan Axios. Header auth diambil dari `localStorage.getItem('dpbd_token')`. Lihat `frontend/components/admin/dashboards/shared.ts` untuk pola standar.

---

## Modul backend & endpoint

Backend prefix: `/api`. Semua endpoint terotentikasi pakai `Authorization: Bearer <jwt>` kecuali ditandai **(public)**.

| Modul | Path utama | Highlights |
|---|---|---|
| **Auth** | `/auth/login`, `/auth/register`, `/auth/me` | Register hanya untuk `personal` / `company`. Org roles dibuat via Admin. |
| **Users** | `/users/:id`, `/users/profile` | `:id` GET self-or-admin (lihat [ROLES.md §3](backend/ROLES.md)). Password tidak pernah di-leak. |
| **Admin** | `/admin/users/create`, `/admin/donations/{approve\|reject\|refund}` | Bulk actions. Audit log otomatis. |
| **Donations** | `/donations` (CRUD), `/donations/:id/status/:status` | Status: pending → completed/failed/refunded. |
| **Payments** | `/payments/charge`, `/payments/webhook` | Midtrans integration. Webhook tanpa auth (verified by signature). |
| **Programs** | `/programs` (public read), `/programs/:id` | Kategori distribusi dana, bukan funding terpisah. |
| **News** | `/news` **(public)**, `/news?all=1` (drafts, auth) | Filter `isPublished=true` server-side untuk public. |
| **Partners / FAQs** | `/partners`, `/faqs` | Public read, admin write. |
| **Analytics** | `/analytics/endowment` **(public)**, `/analytics/public-stats` **(public)**, `/analytics/dashboard` (admin) | Endowment dipakai landing + dashboard CFO/IM/Dewan. |
| **Investment** | `/investments`, `/investments/summary`, `/investments/transactions/recent` | Portfolio CRUD. Gated `READ_PORTFOLIO` / `WRITE_PORTFOLIO`. |
| **Risk** | `/risk/thresholds`, `/risk/alerts`, `/risk/evaluate` (POST) | Threshold = rule yang dievaluasi terhadap portfolio summary. Alert = breach event. |
| **Disbursements** | `/disbursements/pending`, `/disbursements/:id/{approve\|reject}` | CFO queue. Lifecycle: pending → approved/rejected → process → completed. Reject butuh `reason`. |
| **Audit** | `/audit/logs` | Read-only. Permission `READ_AUDIT_TRAIL`. |
| **Reporting** | `/reports/transactions/{pdf\|excel}`, `/reports/summary` | Custom date range filtering. |

---

## Role & dashboard frontend

14 role (full catalog: [`backend/ROLES.md`](backend/ROLES.md)):

| Role | Dashboard view di `/admin` | Bisa apa |
|---|---|---|
| `admin`, `ceo` | DefaultAdminDashboard | Semua permission |
| `cfo` | **CFODashboard** — cash flow + ROI + approval queue penyaluran | Approve disbursement, read portfolio/risk/audit |
| `investment_manager` | **InvestmentManagerDashboard** — corpus, allocation donut, recent transactions | Read/write portfolio |
| `risk_manager` | **RiskManagerDashboard** — status badge + alert count, link ke `/admin/risk` | Read/write risk thresholds + alerts |
| `dewan_pembina`, `dewan_pengawas` | **DewanDashboard** — 3 kartu high-level + Dana Aman indicator | Read reports only |
| `audit_independent` | DefaultAdminDashboard | Read-only audit trail + write log |
| `ethic_committee` | DefaultAdminDashboard | Flag/suspend transactions |
| `finance` | DefaultAdminDashboard | Donations, disbursement requests |
| `editor`, `partnership_onboarding` | DefaultAdminDashboard | Manage programs/partners |
| `personal`, `company` | Tidak akses `/admin` | Donor side only |

Dispatcher: [`frontend/app/admin/page.tsx`](frontend/app/admin/page.tsx) — match by `useRole()`. Tambah role baru → tambah branch + buat komponen di `frontend/components/admin/dashboards/`.

---

## Test accounts (dev only)

Akun ini auto-tersedia di environment dev (sudah di-seed atau dibuat via skrip). **Jangan pakai di production.** Rotate password CEO segera setelah first-start production.

| Role | Email | Password |
|---|---|---|
| CEO (auto-bootstrap) | `ceo@dpbd.org` | `ChangeMe123!` |
| Admin | `admintest@example.com` | `adminpass1` |
| CFO | `cfo-test@example.com` | `cfopass1` |
| Investment Manager | `im-test@example.com` | `impass1` |
| Risk Manager | `risk-test@example.com` | `riskpass1` |
| Dewan Pembina | `pembina-test@example.com` | `pembinapass1` |
| Dewan Pengawas | `pengawas-test@example.com` | `pengawaspass1` |
| Donor (personal) | `smoketest@example.com` | (ada di seed asli) |

CEO password bisa di-override via `CEO_BOOTSTRAP_PASSWORD` env sebelum first start. Detail lengkap: [ROLES.md §3](backend/ROLES.md).

---

## Workflow penting

### 1. CEO bootstrap (zero-config first start)

Saat backend start dan tidak ada user dengan `role='ceo'`, [`backend/src/seeds/bootstrap.seed.ts`](backend/src/seeds/bootstrap.seed.ts) auto-create satu pakai `CEO_BOOTSTRAP_*` env. Idempotent. Audit log `CEO_BOOTSTRAP` ditulis.

Untuk re-bootstrap manual (mis. user CEO terhapus): `cd backend && npx ts-node src/scripts/create-ceo.ts`.

### 2. Disbursement approval (CFO queue)

```
Finance buat request    →   PATCH backend  →   pending
       ↓
CFO review di dashboard
       ├──→ Setujui  →  PATCH /disbursements/:id/approve  →  approved → process → completed
       └──→ Tolak    →  PATCH /disbursements/:id/reject (butuh reason)  →  rejected
```

Re-review row non-pending → 409 Conflict (lifecycle strict). Reject tanpa reason → 400. Setiap aksi tulis audit log `DISBURSEMENT_{APPROVED,REJECTED}`.

### 3. Risk evaluation

Threshold (mis. "sukuk_percentage > 60 → warning") dievaluasi tiap kali user dengan `WRITE_RISK` membuka `/admin/risk` ATAU klik "Jalankan Evaluasi". Engine fetch portfolio summary → bandingkan setiap threshold aktif → tulis alert jika breach.

Untuk auto-eval scheduled (cron), wire di `main.ts` atau pakai `@nestjs/schedule` (belum ada — backlog).

### 4. Tambah user organisasi

Admin/CEO → `/admin/users` → "Tambah Pengguna". Dropdown role tidak include `personal`/`company` — donor harus self-register agar consent flow berjalan. Detail: ROLES.md §3.

---

## Environment variables

Template lengkap di [`backend/.env.example`](backend/.env.example). Yang **wajib** untuk dev:

```env
# Database (Supabase pooler atau local Postgres)
DATABASE_HOST=...
DATABASE_PORT=5432
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
DATABASE_NAME=postgres

# JWT — ganti di production (generate via `openssl rand -base64 48`)
JWT_SECRET=dev-secret-min-32-chars-replace-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-min-32-chars

# CEO bootstrap
CEO_BOOTSTRAP_EMAIL=ceo@dpbd.org
CEO_BOOTSTRAP_PASSWORD=ChangeMe123!     # ⚠️ ganti sebelum production
CEO_BOOTSTRAP_NAME=CEO DPBD
```

Optional (default sudah cukup untuk dev):

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Midtrans (sandbox dummy works for local; ganti untuk real test)
MIDTRANS_SERVER_KEY=SB-Mid-server-dummy
MIDTRANS_CLIENT_KEY=SB-Mid-client-dummy
MIDTRANS_ENVIRONMENT=sandbox

# Email (kosongkan = email disabled)
EMAIL_HOST=
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=noreply@dpbd.org
```

Frontend `.env.local` (optional):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Scripts npm yang sering dipakai

### Backend

| Command | Kapan dipakai |
|---|---|
| `npm run start:dev` | Dev — watch mode + auto-restart on file change |
| `npm run start:debug` | Dev dengan Node debugger (port 9229) |
| `npm run build` | Compile TS → `dist/` |
| `npm run start:prod` | Production — run `dist/main.js` |
| `npm run lint` | ESLint (pakai `--fix` untuk auto-fix) |
| `npm run format` | Prettier semua source |
| `npm run test` / `:watch` / `:cov` | Unit tests Jest |
| `npm run test:e2e` | E2E tests |
| `npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts` | Apply pending migrations |
| `npx typeorm-ts-node-commonjs migration:generate src/migrations/<name> -d src/data-source.ts` | Generate migration dari entity diff |
| `npx ts-node src/scripts/create-ceo.ts` | Standalone CEO bootstrap |

### Frontend

| Command | Kapan dipakai |
|---|---|
| `npm run dev` | Dev — Next.js Fast Refresh |
| `npm run build` | Build production bundle ke `.next/` |
| `npm run start` | Run production build |
| `npm run lint` | Next.js + ESLint |
| `npx tsc --noEmit` | Type check tanpa emit (Sprint 5 baseline: 0 errors) |

---

## Sprint history

Pegangan untuk konteks "kapan fitur X ditambahkan":

| Sprint | Output utama |
|---|---|
| **1–4** (pre-merge) | Base auth, 14 roles + RBAC + audit trail, investment portfolio module, landing page endowment counter + public stats, polish landing components |
| **5** (current) | Risk & Compliance module (threshold + alert), role dashboards (CFO/IM/Risk/Dewan), CEO bootstrap, disbursement approval flow, RpNaN bug fix, news section data, formatRupiah util, /donasi route documentation |

Commit graph yang relevan untuk Sprint 5 (`master`):

```
2e98a09  feat: disbursement approval flow + CFO queue
837680c  docs: explain why /donasi redirect routes are kept
fff33d0  feat(auth): live stats on auth panel
942f2ee  feat: CEO bootstrap on first server start
0970e0b  Merge branch 'claude/cranky-engelbart-a8fdc1'
b68b627  feat(sprint-5): risk module, role dashboards, RpNaN fix, news seed
682e1ee  feat: landing page endowment counter + public stats + auth fixes
```

---

## Troubleshooting

**Port 3001 atau 3000 sudah dipakai**
```powershell
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
Stop-Process -Id <OwningProcess>
```
Atau jalankan di port lain: `PORT=3002 npm run start:dev` (backend), `npm run dev -- -p 3002` (frontend).

**`Failed to fetch` di frontend, padahal backend jalan**
- Cek `NEXT_PUBLIC_API_URL` — default `http://localhost:3001/api`. Frontend dev server harus di-restart setelah ubah env (Next.js cache env saat boot).
- CORS: backend allow-list `localhost:3000` dan `192.168.x.x:3000`. Kalau pakai port lain, edit [`backend/src/main.ts`](backend/src/main.ts) CORS config.

**Login berhasil tapi `/admin` muncul "Access Denied"**
- Cek role user di DB: `SELECT email, role FROM users WHERE email='...'`. JWT cache role saat login — kalau role di DB diubah belakangan, user **harus logout-login lagi**.

**Migration error "type already exists"**
Migration dirancang idempotent (`DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN NULL`). Kalau tetap error, cek apakah migration sebelumnya gagal di tengah — drop manual table/enum yang konflik, lalu re-run.

**Backend restart tapi endpoint baru 404**
Pastikan modulnya diregister di [`backend/src/app.module.ts`](backend/src/app.module.ts). Module yang tidak di-import = controller-nya tidak di-mount.

**Frontend hot-reload tidak detect file baru**
Restart `npm run dev`. Next.js sometimes misses new files in untracked directories the first time.

---

## Konvensi commit & branching

**Commit message** — Conventional Commits, body singkat tapi informatif:
```
feat(scope): one-line summary

Body — kenapa, bukan apa. Bullet list kalau perlu.
Reference issue/PR kalau ada.
```

Contoh: `feat(risk): add concentration threshold evaluation engine`, `fix(programs): RpNaN on collectedAmount when API returns string`, `docs: explain /donasi redirect routes`.

**Branching:**
- `master` — production-ready
- `feature/<short-name>` — feature work (PR ke master)
- `fix/<short-name>` — bug fixes
- `claude/<random-suffix>` — AI-assisted worktree branches

**Sebelum push:**
```bash
cd backend && npm run lint && npm run test
cd ../frontend && npx tsc --noEmit && npm run lint
```

**Yang HARUS di-commit:** source code, migrations, seeds, config (tsconfig, eslint), `.env.example`, dokumentasi.

**Yang HARUS di-IGNORE:** `node_modules/`, `dist/`, `.next/`, `.env`, `.env.local`, `tsconfig.tsbuildinfo`, `.DS_Store`, `.claude/` (worktrees AI).

---

## Untuk anggota tim baru

**Hari 1 — setup (1 jam):**
1. Clone, install, copy `.env.example` → `.env`
2. Minta password DB dari teammate (atau pakai Supabase free tier)
3. Run migrations + start backend + frontend
4. Login dengan salah satu test account
5. Klik-klik `/admin` dengan role berbeda untuk lihat dashboard variations

**Hari 2 — eksplorasi:**
1. Baca [`backend/ROLES.md`](backend/ROLES.md) — wajib paham 14 role + permission matrix
2. Trace satu flow: misal donasi end-to-end — `frontend/app/donate/` → `backend/src/payments/` → webhook → `donations.service` → audit log
3. Buka satu role dashboard di `frontend/components/admin/dashboards/`, lihat pola fetch + render
4. Buka migration terbaru (`1777450000000-ExtendDisbursements.ts`) untuk pola schema change

**Sebelum first PR:**
- Commit message ikuti pola di atas
- Test lokal: `npm run test` (backend) + `npx tsc --noEmit` (frontend) zero errors
- Update ROLES.md kalau menyentuh permission/role
- Update `.env.example` kalau menambah env baru

Pertanyaan: tag teammate di commit/PR atau lewat Slack channel `#dpbd-dev`. Untuk pertanyaan arsitektur, mulai dari grep di codebase — banyak komentar inline yang menjelaskan kenapa, bukan cuma apa.
