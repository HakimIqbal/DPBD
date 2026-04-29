# DPBD Roles & Permissions

This document is the source of truth for role/permission semantics in the
DPBD-PPID platform. The runtime sources are
[`backend/src/auth/permissions.ts`](src/auth/permissions.ts) (backend) and
[`frontend/lib/permissions.ts`](../frontend/lib/permissions.ts) (frontend) —
keep them in sync with this file when you change anything.

---

## 1. Role catalog (14 roles)

| Role | Description |
|------|-------------|
| `admin` | Platform super-admin. Full access to every endpoint and admin UI page. Manages other admins. |
| `editor` | Content editor. Creates/edits programs, partners, news, FAQ. No financial or user-management access. |
| `finance` | Finance officer. Approves disbursements, edits donation records, runs financial exports. |
| `personal` | Donor account (individual). Self-registers via `/auth/register`. Cannot access any admin area. |
| `company` | Donor account (corporate / CSR). Self-registers via `/auth/register`. Same access scope as `personal`. |
| `ceo` | Chief Executive Officer. Read/write across every module — equivalent to admin. |
| `cfo` | Chief Financial Officer. Approves disbursements, reads portfolio/risk/audit, exports reports. Read-only on portfolio. |
| `investment_manager` | Manages the investment portfolio. Read/write on portfolio, read-only on risk. |
| `risk_manager` | Risk & compliance owner. Read/write on risk metrics, read-only on portfolio. |
| `ethic_committee` | Ethics committee member. Reviews donations, can flag and suspend transactions. Read-only reports. |
| `audit_independent` | Independent auditor. Read-only across donations / portfolio / risk + write on audit trail. |
| `dewan_pengawas` | Supervisory board (Dewan Pengawas). Read-only access to donations, reports, exports. |
| `dewan_pembina` | Founders / advisory board (Dewan Pembina). Reports-only — narrowest org access. |
| `partnership_onboarding` | Partner & program onboarding ops. Manages programs and partners. No financial access. |

**Self-register vs admin-create**

- `personal`, `company` — public sign-up via `POST /api/auth/register`. Required for the consent / privacy-policy flow.
- All other 12 roles — created by `admin` or `ceo` only via `POST /api/admin/users/create` (see §3).

---

## 2. Permission matrix

Columns are `Permission` enum values from [`permissions.ts`](src/auth/permissions.ts). A `✓` means the role grants the permission; blank means it does not.

### Donations / Disbursement / Reports

| Role | READ_DONATIONS | WRITE_DONATIONS | APPROVE_DISBURSEMENT | READ_REPORTS | EXPORT_ALL |
|------|:-:|:-:|:-:|:-:|:-:|
| `admin` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `ceo` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `cfo` | ✓ |   | ✓ | ✓ | ✓ |
| `finance` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `investment_manager` | ✓ |   |   | ✓ | ✓ |
| `risk_manager` | ✓ |   |   | ✓ | ✓ |
| `ethic_committee` | ✓ |   |   | ✓ |   |
| `audit_independent` | ✓ |   |   | ✓ | ✓ |
| `dewan_pengawas` | ✓ |   |   | ✓ | ✓ |
| `dewan_pembina` |   |   |   | ✓ |   |
| `partnership_onboarding` |   |   |   |   |   |
| `editor` |   |   |   |   |   |
| `personal` / `company` |   |   |   |   |   |

### Portfolio / Risk / Compliance

| Role | READ_PORTFOLIO | WRITE_PORTFOLIO | READ_RISK | WRITE_RISK | FLAG_TRANSACTION | SUSPEND_TRANSACTION |
|------|:-:|:-:|:-:|:-:|:-:|:-:|
| `admin` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `ceo` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `cfo` | ✓ |   | ✓ |   |   |   |
| `investment_manager` | ✓ | ✓ | ✓ |   |   |   |
| `risk_manager` | ✓ |   | ✓ | ✓ |   |   |
| `ethic_committee` |   |   |   |   | ✓ | ✓ |
| `audit_independent` | ✓ |   | ✓ |   |   |   |
| Others |   |   |   |   |   |   |

### Content / Users / Audit

| Role | MANAGE_PROGRAMS | MANAGE_PARTNERS | MANAGE_USERS | READ_AUDIT_TRAIL | WRITE_AUDIT_TRAIL |
|------|:-:|:-:|:-:|:-:|:-:|
| `admin` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `ceo` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `cfo` |   |   |   | ✓ |   |
| `audit_independent` |   |   |   | ✓ | ✓ |
| `editor` | ✓ | ✓ |   |   |   |
| `partnership_onboarding` | ✓ | ✓ |   |   |   |
| Others |   |   |   |   |   |

> Maintenance: when you add a row or column here, also update
> [`src/auth/permissions.ts`](src/auth/permissions.ts) and
> [`../frontend/lib/permissions.ts`](../frontend/lib/permissions.ts).

---

## 3. Creating accounts

### Donor accounts (`personal`, `company`)

Self-register via the public registration page. Backend endpoint:

```
POST /api/auth/register
{
  "email": "donor@example.com",
  "password": "...",
  "name": "Full Name",
  "role": "personal",          // or "company"
  "country": "Indonesia"       // optional
  // company fields (if role=company): companyName, npwp, picName, companyAddress
}
```

`RegisterDto` enforces `role ∈ {personal, company}` — the public endpoint
cannot create elevated accounts.

### Organizational accounts (the other 12 roles)

Restricted to `admin` and `ceo`. Endpoint:

```
POST /api/admin/users/create
Authorization: Bearer <admin-or-ceo-jwt>

{
  "email": "cfo@dpbd.org",
  "name":  "Full Name",
  "password": "min-8-chars",
  "role": "cfo"   // any of the 12 ADMIN_CREATABLE_ROLES
}
```

Donor roles (`personal`, `company`) are explicitly blocked by the DTO so the
consent flow on `/auth/register` is always exercised.

UI entry point: **Admin → User & Peran → Tambah Pengguna**
(`frontend/app/admin/users/page.tsx`). The page itself is gated by
`PermissionGate require={Permission.MANAGE_USERS}`, so only `admin` and `ceo`
roles see the form.

### Bootstrapping the first CEO

A fresh deployment has no users at all, so there's nobody who can hit the
admin-gated `POST /api/admin/users/create` endpoint. The CEO is the
"chicken-and-egg" account that breaks the loop: every other org account is
created by an admin or CEO, and the CEO is created by bootstrap.

**Auto-bootstrap (default, dev-friendly).** On every server start, the
seed [`backend/src/seeds/bootstrap.seed.ts`](src/seeds/bootstrap.seed.ts)
checks for any user with `role='ceo'`. If none exists, it creates one
using these env vars (defaults shown):

```
CEO_BOOTSTRAP_EMAIL=ceo@dpbd.org
CEO_BOOTSTRAP_PASSWORD=ChangeMe123!
CEO_BOOTSTRAP_NAME=CEO DPBD
```

The bootstrap is **idempotent** — once a CEO exists, every subsequent
start skips the seed silently. It also refuses to clobber an existing
non-CEO user at the same email (logs a warning and bails).

A `CEO_BOOTSTRAP` audit log row (entityType `User`) is written for the
creation so the event is traceable.

**Manual / production-safe path.** When auto-seed is undesirable
(production deployments often disable seeds), run the standalone script:

```bash
cd backend
npx ts-node src/scripts/create-ceo.ts
```

It reads the same env vars and the same idempotent logic. Exits 0 on
success or no-op, non-zero only on DB/hashing errors.

**Changing CEO credentials after bootstrap.** The default password
(`ChangeMe123!`) is intentionally weak so you can sign in once. Rotate it
immediately:

1. Log in as the bootstrapped CEO.
2. `PATCH /api/users/profile` (or the admin UI's profile page) with a new
   strong password.
3. To rename or move the email, an existing admin/CEO can use
   `PATCH /api/users/:id` against the bootstrapped account.

To re-bootstrap from scratch (e.g. after wiping users), set new values in
`.env` and either restart the server or run the standalone script.

> ⚠️ **Production warning:** never deploy with the default
> `CEO_BOOTSTRAP_PASSWORD`. Override it via env *before* first start, then
> have the CEO change it again right after first login. The default exists
> only so a zero-config dev environment Just Works.

### Bootstrapping additional admins

Once the CEO exists, all org accounts (including additional admins) flow
through the admin-create endpoint above. If you ever need to promote an
existing user out-of-band, fall back to SQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

Then log out & log in again so the JWT carries the new role.

---

## 4. How the guard chain works

Every protected endpoint passes through up to three guards, in this order:

```
incoming request
       │
       ▼
┌─────────────────────┐
│   JwtAuthGuard      │  parses Authorization: Bearer <jwt>
│                     │  → 401 if missing/invalid/expired
│                     │  → attaches { id, email, role } to req.user
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   RolesGuard        │  reads @Roles(...) metadata
│                     │  → 200 pass-through if no @Roles
│                     │  → 403 if req.user.role ∉ list
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ PermissionsGuard    │  reads @RequirePermissions(...) metadata
│                     │  → 200 pass-through if no decorator
│                     │  → 403 if ROLE_PERMISSIONS[req.user.role]
│                     │     does not include all required perms
└────────┬────────────┘
         │
         ▼
       handler
```

Rules of thumb:

- **Auth alone** → `@UseGuards(JwtAuthGuard)`
- **Role-based gate** → `@UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin', 'ceo')`
- **Permission-based gate** → `@UseGuards(JwtAuthGuard, PermissionsGuard) @RequirePermissions(Permission.APPROVE_DISBURSEMENT)`
- **Public** → no guards

Use the role guard when the rule is best expressed as "this list of roles".
Use the permission guard when the rule is "anyone with capability X". The
permission guard is the more sustainable choice for new features because
adding a role only requires updating `ROLE_PERMISSIONS`, never touching
controllers.

Frontend is layered on top:

1. `frontend/app/admin/layout.tsx` allow-lists 11 organizational roles for the admin shell. Donors are pushed to `/user`.
2. Sidebar items wrap themselves in `<PermissionGate>` / `<RoleGate>` so users only see entries they can use.
3. Inside each page, sensitive sub-sections wrap content in `<PermissionGate>` with `<AccessDenied />` as fallback.
4. **Frontend gates are UX, not security.** The backend's PermissionsGuard / RolesGuard remain the enforcement boundary.

---

## 5. Adding a new permission — checklist

When introducing a new capability (e.g. `MANAGE_NOTIFICATIONS`):

1. **Backend enum** — add the value to `Permission` in
   [`src/auth/permissions.ts`](src/auth/permissions.ts).
2. **Backend matrix** — add the permission to every role in
   `ROLE_PERMISSIONS` that should grant it (don't forget `admin` and `ceo`,
   which already get *all* permissions automatically via `ALL_PERMISSIONS`,
   so no edit needed there).
3. **Frontend enum** — add the same value to `Permission` in
   [`../frontend/lib/permissions.ts`](../frontend/lib/permissions.ts).
4. **Frontend matrix** — mirror the same role mapping there. `admin` and
   `ceo` use the same `ALL_PERMISSIONS` shorthand on the frontend.
5. **Apply the decorator** at the endpoint:
   ```ts
   @UseGuards(JwtAuthGuard, PermissionsGuard)
   @RequirePermissions(Permission.MANAGE_NOTIFICATIONS)
   ```
   If the controller's module doesn't already import `AuthModule`, add it.
6. **Wire the UI gate** if the feature has UI:
   ```tsx
   <PermissionGate require={Permission.MANAGE_NOTIFICATIONS} fallback={<AccessDenied />}>
     ...
   </PermissionGate>
   ```
   And gate the relevant sidebar entry the same way.
7. **Update this file** — add a column to the relevant matrix table in §2
   and any prose in §1 if a role's description should reflect the new
   capability.
8. **Smoke-test** with at least three role tokens (one allowed, one denied,
   one anonymous):
   ```bash
   curl -X <method> http://localhost:3001/api/<path> \
        -H "Authorization: Bearer <token>"
   ```
   Expected: 200 / 403 / 401 respectively.

If you skip step 1–2 the endpoint will compile but always return 403. If you
skip step 3–4 the frontend will type-check but show buttons the user can't
actually use. If you skip step 7 the next person to edit this area will guess
wrong about the permission's intent. Each step matters.
