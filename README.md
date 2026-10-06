# HudumaLink — Referral Management System (RMS)

A secure, centralized digital platform for creating, sending, tracking, and
closing referrals between humanitarian organizations in Kyangwali Refugee
Settlement.

**Frontend:** HTML + CSS + vanilla JavaScript (no framework, no build step)
**Backend (to be built):** Spring Boot + MySQL — see "API contract" below
**Stakeholders:** UNHCR, OPM, partner NGOs

---

## Current Status

✅ **Frontend MVP — 8 pages, fully working, live data, multi-organization demo login**

| Page | File | Purpose |
|---|---|---|
| Login | `frontend/login.html` | Authentication against 6 demo accounts, one per partner org (mock only — no backend yet) |
| Dashboard | `frontend/dashboard.html` | 4 stat cards, recent referrals, search/filter shortcuts |
| Referrals | `frontend/referrals.html` | List with tabs (All/Incoming/Outgoing/Closed) + filters |
| New Referral | `frontend/referral-new.html` | Create form — save as draft or submit |
| Referral Detail | `frontend/referral-detail.html?id=N` | Full case view + 5 actions (status, note, assign, onward, close) |
| Partners / NGOs | `frontend/partners.html` | 12 orgs, card grid, staff side panel |
| Reports | `frontend/reports.html` | Summary stats + CSS bar charts + activity feed |
| Settings | `frontend/settings.html` | Profile, change password, users management, org info |

**Data source:** All pages currently read from **`localStorage`**, seeded by
mock files that mirror the shape the real API will return:

- `frontend/mock-users.js` — 6 demo login accounts (one per org)
- `frontend/mock-referrals.js` — 8 seed referrals with full history
- `frontend/mock-organizations.js` — 12 organizations with staff lists

**No backend exists yet.** This is deliberate — the frontend is built against
the exact API contract below so the backend can be swapped in with minimal
frontend changes.

---

## What's New — Multi-Org Login, Auth Guard, Logout, Branding

Earlier the app had a single hardcoded user (Grace A. / OPM) on every page,
and the login form didn't actually check anything. This pass replaced that
with a working demo login so the system can be shown "as" different
partner organizations:

- **`frontend/mock-users.js`** — 6 demo accounts, one per org (table below)
- **`frontend/login.js` / `login.html`** — real check against `mock-users.js`,
  a show/hide password toggle, and defensive error handling so a missing
  script file fails loudly (an alert + console message) instead of silently
  doing nothing
- **`frontend/auth.js`** — new shared script, loaded first on every inner
  page. It redirects to `login.html` if nobody is logged in, fills the
  sidebar/topbar with whoever actually logged in, and wires the logout
  button
- **`frontend/mock-referrals.js`** — `window.CURRENT_USER` now comes from
  whoever logged in (`localStorage`) instead of being hardcoded
- **`frontend/settings.js`** — the profile email now uses the real login
  email instead of being hardcoded to `@opm.gov.ug` regardless of org
- **`frontend/favicon.svg`** — new HudumaLink logo mark (linked-nodes
  design), used as the browser tab icon, the login page badge, and the
  sidebar brand mark on every page

### Demo login accounts

| Organization | Email | Password |
|---|---|---|
| OPM | `grace@opm.gov.ug` | `demo1234` |
| AVSI | `jean@avsi.org` | `demo1234` |
| NRC | `ahmed@nrc.org` | `demo1234` |
| UNHCR | `marie@unhcr.org` | `demo1234` |
| CIYOTA | `david@ciyota.org` | `demo1234` |
| Hunger Fighters | `robert@hungerfighters.org` | `demo1234` |

These are **not real accounts** — made-up credentials for demos only, with
no real security behind them. They get deleted the moment real
authentication (`POST /api/v1/auth/login`) exists.

To demo switching organizations: log in as one account, click the logout
icon (⎋) at the bottom of the sidebar, then log in as another. `auth.js`
will refuse to show any inner page to someone who isn't logged in.

---

## How to Run the Frontend Locally

You only need a static file server. **No npm, no build step.**

### Option A — VS Code Live Server
1. Install the **Live Server** extension
2. Right-click `frontend/login.html` → "Open with Live Server"
3. Browser opens `http://127.0.0.1:5500/frontend/login.html`

### Option B — Python (any system)
```bash
cd frontend
python3 -m http.server 5500
# then open http://localhost:5500/login.html
```

> **Windows note:** if a script 404s after you add a new `.js` file, check
> that File Explorer isn't hiding the real extension — a file you named
> `mock-users.js` can silently get saved as `mock-users.js.txt`. Turn on
> "File name extensions" in the View tab to confirm.

---

## Project Structure

```
frontend/
├── login.html / login.js / mock-users.js   # Auth
├── auth.js                                 # Auth guard + sidebar user display + logout (every inner page)
├── dashboard.html / dashboard.js
├── referrals.html / referrals.js
├── referral-new.html / referral-new.js
├── referral-detail.html / referral-detail.js
├── partners.html / partners.js
├── reports.html / reports.js
├── settings.html / settings.js
├── mock-organizations.js                   # 12 orgs + staff (seed data)
├── mock-referrals.js                       # 8 referrals + CURRENT_USER (seed data)
├── toast.js                                # Shared toast notification helper
├── favicon.svg                             # HudumaLink logo mark
└── styles.css                              # Single global stylesheet (see its table of contents)
```

---

## API Contract (for the Spring Boot + MySQL backend)

The frontend's mock files were written to match these endpoints exactly, so
swapping `localStorage` reads for `fetch()` calls should require minimal
changes to page logic. Endpoints marked **TBD** are referenced in code
comments but not yet finalized.

| Method | Endpoint | Used by | Notes |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | `login.js` | Replaces `mock-users.js` check |
| `POST` | `/api/v1/auth/change-password` | `settings.js` | |
| `GET` | `/api/v1/organizations` | `mock-organizations.js`, `partners.js`, `referral-new.js` | SRS §26 |
| `GET` | `/api/v1/dashboard/summary` | `dashboard.js` | Stat card counts — SRS §15.2 |
| `GET` | `/api/v1/referrals?page=0&size=5` | `dashboard.js` | Recent referrals widget |
| `GET` | `/api/v1/referrals` | `referrals.js` | Full list — supports `?status=`, `?priority=`, `?category=`, `?search=` (SRS §16) |
| `POST` | `/api/v1/referrals` | `referral-new.js` | Create (draft or submitted) |
| `GET` | `/api/v1/referrals/{id}` | `referral-detail.js` | |
| `POST` | `/api/v1/referrals/{id}/status` | `referral-detail.js` | SRS §39 — validate against the status chain in SRS §8 |
| `POST` | `/api/v1/referrals/{id}/notes` | `referral-detail.js` | SRS §39 |
| `POST` | `/api/v1/referrals/{id}/assign` | `referral-detail.js` | SRS §39 |
| `POST` | `/api/v1/referrals/{id}/onward` | `referral-detail.js` | Creates a second linked referral — SRS §39 |
| `POST` | `/api/v1/referrals/{id}/close` | `referral-detail.js` | Only valid from `RESOLVED` — SRS §39 |
| `GET` | `/api/v1/reports/...` | `reports.js` | **TBD** — exact shape not finalized; frontend currently computes all report stats client-side from the full referral list |
| `GET` | `/api/v1/users` | `settings.js` | Users management table |
| `PUT` | `/api/v1/users/{id}` | `settings.js` | **TBD** — activate/deactivate action |

**Status chain (SRS §8), as currently enforced client-side in
`referral-detail.js`:**

```
DRAFT → SUBMITTED → RECEIVED → ACCEPTED → IN_PROGRESS → RESOLVED → CLOSED
                         ↓
                     REJECTED

IN_PROGRESS → ONWARD_REFERRED  (creates a new linked referral)
DRAFT / SUBMITTED → CANCELLED
```

> This table was built by reading the `VALID_TRANSITIONS` object in
> `referral-detail.js` — **confirm it matches the real backend's rules
> once the backend exists**, since the frontend comment flags this as a
> judgment call, not literal SRS text.

---

## Known Limitations (MVP / demo stage)

- No real backend — everything lives in the browser's `localStorage`, so
  data does **not** sync between different people's browsers or devices.
- Demo login has no real security (plaintext passwords in a JS file,
  visible to anyone with dev tools open). This is fine for a demo, not
  for production.
- Reports page computes all statistics client-side from the full referral
  list — fine at today's data volume, will need a real backend aggregation
  endpoint at scale.
- No file/photo attachments on referrals yet.
- No notification system — the bell icon badge count (🔔 3) is static.

---

## Next Steps

1. Build the Spring Boot backend against the API contract above.
2. Replace each `mock-*.js` file's data access with real `fetch()` calls —
   the page-level JS (`dashboard.js`, `referrals.js`, etc.) was written so
   this is a small, localized change per file (see each file's
   `getReferrals()` / `getOrgs()` / `getList()` helper function).
3. Replace `login.js`'s `MOCK_USERS` check with a real
   `POST /api/v1/auth/login` call, and delete `mock-users.js`.
4. Add real session handling (tokens) in place of the current
   `localStorage` "logged-in user" object.