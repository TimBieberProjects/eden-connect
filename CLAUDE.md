# EDEN Connect — Claude Code Context

## Project in One Sentence
Mobile platform for PNG community health workers to collect household health data, run diagnostics, and connect patients with remote clinicians — while AI monitors community health trends in real time.

## Partners
| Partner | Role |
|---|---|
| Evolved AI | Technology platform, end-to-end execution |
| Medical Ambassadors International (MAI Canada) | Program leadership |
| Eastern Highlands PHA (EHP PHA) | Primary PNG government partner. CEO: Dr. Pumosu Warima |
| Christian Health Services PNG (CHSPNG) | Implementing partner. Contact: Nickson |
| PNG CHE | On-the-ground coordination. Contact: Emma Wakpi |
| Stephen | Dev lead, PNG national in-country |

## Tech Stack
| Layer | Technology |
|---|---|
| Backend DB | Supabase Postgres |
| Auth | Supabase Auth (email/password) |
| Dashboard | Next.js 14 App Router + Tremor v3 + Tailwind CSS |
| AI Query | Anthropic Claude API (claude-sonnet-4-6), streaming |
| Sync service | Node.js + pg (runs against Supabase Postgres) |
| Android app (Phase 2) | Kotlin + Jetpack Compose + Room |
| AI layer (Phase 3) | Claude API + RAG over health data |
| Telehealth (Phase 4) | Twilio Video |
| Sheets API | Google Service Account (read-only) |
| Hosting | Vercel (dashboard) |

## Google Sheets API
- Service account: `eden-connect-sync@eden-connect-491216.iam.gserviceaccount.com`
- Key file: `./credentials/eden-connect-API-key.json`
- Baseline Survey Sheet ID: `1DjU4cy-X7l2qN-FqW_DIJXosRRwJagPU6lXaoSJf_Zo`
- Quarterly Reports Sheet ID: `15HrEcF0xIs0XwNlPyYQJAG1j8qxlX2sWRHBIFEBNv7o`
- Status: API connection tested and confirmed working ✓

## Nickson's Five-Level Reporting Hierarchy
This is the CORE architectural constraint. Every table, query, and dashboard filter MUST respect it:
```
Community / Village level
        ↓
Health Facility level
        ↓
District level
        ↓
Provincial Health Authority (PHA) level
        ↓
NDOH Health Promotion Section (National)
```
Database FK chain: provinces → districts → llgs → health_facilities → communities

## Project Structure
```
eden-connect/
├── CLAUDE.md                 ← this file
├── .env                      ← secrets (never commit)
├── credentials/              ← Google service account key (never commit)
├── read-sheet.js             ← original API test (keep for reference)
├── migrate.js                ← run schema.sql against Supabase DB
├── src/
│   ├── db/
│   │   ├── schema.sql        ← full schema with views
│   │   └── client.js         ← pg Pool (uses DATABASE_URL)
│   ├── sheets/
│   │   └── client.js         ← Google Sheets auth helper
│   └── sync/
│       ├── hierarchy.js      ← get-or-create hierarchy rows
│       ├── baseline.js       ← baseline survey sync
│       ├── quarterly.js      ← quarterly report sync
│       └── index.js          ← main runner (node src/sync/index.js)
├── supabase/
│   └── migrations/           ← versioned SQL migrations
└── dashboard/                ← Next.js 14 admin dashboard
    ├── app/
    │   ├── login/            ← Supabase Auth login page
    │   ├── dashboard/
    │   │   ├── page.tsx      ← overview with KPIs + disease trends
    │   │   ├── baseline/     ← community baseline data
    │   │   ├── quarterly/    ← quarterly report data
    │   │   └── ai-query/     ← AI natural language health queries
    │   └── api/
    │       ├── ai-query/     ← Claude API streaming endpoint
    │       └── auth/callback/ ← Supabase OAuth callback
    ├── components/
    │   └── HierarchyFilter.tsx ← cascading province/district/llg/facility
    └── lib/
        ├── supabase/         ← server + client Supabase instances
        └── queries.ts        ← all DB query functions
```

## Phase 1 Goal
Connect to existing CHS Google Sheets. Sync baseline survey + quarterly report data into Postgres. Admin dashboard with hierarchy-based filtering and AI health query interface. Zero disruption to CHS workflows — health workers keep using Google Forms.

## Key Decisions
- PNG is ~94% Android. Offline-first is essential (Phase 2).
- Database schema must support the 5-level hierarchy from day one.
- All health data is access-controlled. Never exposed publicly.
- Google Sheets service account has read-only access.
- AI queries use claude-sonnet-4-6 with streaming — no budget_tokens (deprecated).
- Dashboard pages are client components (Tremor requires client-side rendering).

## Grant Deadlines
- EVAH (Gates/Wellcome): April 1, 2026 — URGENT
- DAP Australia PNG: Next round TBC
- Grand Challenges Canada Stars: Monitor gcc.fluxx.io

## Running the Sync
```bash
# Copy .env.example to .env and fill in DATABASE_URL
node migrate.js           # run schema migrations
node src/sync/index.js    # sync both sheets → Postgres
node src/sync/index.js --dry-run  # preview without writing
```

## Running the Dashboard
```bash
cd dashboard
# Copy .env.local.example to .env.local and fill in Supabase keys
npm install
npm run dev               # http://localhost:3000
```
