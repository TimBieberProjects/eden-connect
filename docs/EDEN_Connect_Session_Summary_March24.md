# EDEN Connect — Project Summary
*Session summary: March 24, 2026*

---

## What We Built Today

A comprehensive foundation for EDEN Connect — from concept alignment and partner documentation through to a live working API connection to Google Sheets. By end of session the Google Sheets API connection was tested and confirmed working.

---

## The Project in One Sentence

EDEN Connect is a mobile platform that enables community health workers to collect household health data, run basic diagnostics, and connect patients with remote clinicians while AI analyzes the data to monitor and improve community health in real time.

---

## Partners

| Partner | Role | Location |
|---|---|---|
| Evolved AI | Technology platform, end-to-end execution | Canada |
| Medical Ambassadors International (MAI Canada) | Program leadership, EDEN Healthy Communities | Canada |
| Eastern Highlands Provincial Health Authority (EHP PHA) | Primary government partner, MOU signed. Contact: Dr. Pumosu Warima CEO | Papua New Guinea |
| Christian Health Services PNG (CHSPNG) | Implementing partner, existing EDEN program. Contact: Nickson | Papua New Guinea |
| PNG CHE | On-the-ground program coordination. Contact: Emma Wakpi | Papua New Guinea |
| Stephen | Development lead, PNG national based in-country | Papua New Guinea |

---

## Strategic Alignment

EDEN Connect is designed in direct alignment with the **WHO Regional Action Framework on Digital Health in the Western Pacific**, endorsed by all WHO Western Pacific member states including Papua New Guinea at the 75th session of the WHO Regional Committee for the Western Pacific in Manila, October 2024.

**Three strategic objectives:**
1. Enhanced digital health governance
2. People-centric innovative technology
3. Empowered and included actors

**Five priority domains:**
1. Governance
2. Socio-technical infrastructure
3. Financing and economics
4. Digital health solutions
5. Data

This WHO alignment must be referenced in all grant applications, scope documents, and partner communications.

---

## PNG Health System Reporting Hierarchy

Defined by Nickson (CHSPNG) — must be built into the database schema, dashboard filters, and role-based access from day one:

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

Users only see data at their level and below. All reports auto-generate at each level.

---

## Two Tracks of the Platform

### Track 1 — Secure Health Worker Backend
- Accessible only to trained health workers and agency coordinators
- All health records, surveys, household data, disease tracking, WASH indicators
- Role-based access reflecting the five-level reporting hierarchy
- Offline-capable Android app for field workers
- Health data never exposed to the public platform

### Track 2 — Public Community Platform
- Public-facing website and interactive map
- Villages drop pins, create profiles, upload photos
- Document community progress — sanitation, beautification, health projects
- Visible to donors, government, partners, and the global community
- Villages manage their own content

---

## Four Phase Roadmap

### Phase 1 — Data Intelligence
**Status: Active — building now**

Connect to existing CHS Google Sheets via API with read-only access. Pull baseline survey and quarterly report data into a structured Postgres backend. Build admin dashboard with hierarchy-based filtering and automated reports at each level of the reporting hierarchy. Zero disruption to current CHS workflows — health workers keep using Google Forms unchanged.

What this unlocks immediately:
- Trend analysis across quarters impossible in Sheets
- District and province level rollups
- Submission completion tracking
- Automated reports for leadership and policy makers
- AI pattern recognition across health indicators

**Key milestone reached today:** Google Sheets API connection tested and confirmed working.

### Phase 2 — Mobile Platform and Community Network
**Status: Planned — Q2 2026**

Replace Google Forms with an offline-capable Android app for health workers. Works without connectivity and syncs when signal returns. All data lands in the same Postgres backend.

At the same time launch the public community map — villages drop pins on an interactive map of PNG, create profiles, and share photos of their transformation journey. A living map of community change visible to donors, government, and the world.

### Phase 3 — AI Health Copilot
**Status: Roadmap**

Every health worker gets an AI partner embedded in the app. Describe symptoms or upload a photo — the AI assesses against WHO-approved PNG health protocols and recommends treatment steps based on exactly what supplies are available at that specific village aid post.

Practical guidance extends beyond clinical care — where and how to install a pit toilet based on a photo of the village layout, nutrition guidance, hygiene education. Health workers go from data collectors to AI-assisted frontline health practitioners.

**AI stack:**
- Base model: Claude API or GPT-4o
- Vision: Claude or GPT-4o Vision for photo analysis
- Protocol knowledge: RAG system trained on PNG health guidelines
- Supply awareness: aid post inventory from the database
- Guardrails: NeMo or custom prompt layer
- All outputs framed as suggestions not diagnoses

### Phase 4 — Telehealth
**Status: Roadmap**

One tap connects an aid worker to a doctor at a regional hospital via video. The patient summary, photos, vitals, and actions already taken are automatically packaged and presented to the clinician before the call begins. No aid worker in a remote village is ever alone with a difficult case.

**Integration:** Twilio Video

---

## Tech Stack

| Layer | Technology |
|---|---|
| Android app | Kotlin + Jetpack Compose |
| Offline storage | Room (SQLite) |
| Backend database | Supabase Postgres |
| API | Cloudflare Workers or Next.js API routes |
| Web dashboard | Next.js on Vercel |
| Auth | Supabase Auth |
| File storage | Supabase Storage |
| AI layer (Phase 3) | Claude API + RAG |
| Telehealth (Phase 4) | Twilio Video |
| Dev tool | Claude Code |
| Repo | GitHub |
| Google Sheets API | Service account with read-only access |

**Note:** PNG is ~94% Android. Offline-first is not optional — it is essential for rural PNG conditions.

---

## Google Sheets API Setup — Completed Today

**Service account created:**
```
eden-connect-sync@eden-connect-491216.iam.gserviceaccount.com
```

**JSON key file location:**
```
~/eden-connect/credentials/eden-connect-API-key.json
```

**Test Sheet ID:**
```
1DjU4cy-X7l2qN-FqW_DIJXosRRwJagPU6lXaoSJf_Zo
```

**Status:** API connection tested and confirmed working ✓

**Next step:** Ask Nickson to share both CHS Google Sheets with the service account email as Viewer.

---

## Historical Data Asset

Paper-based baseline surveys spanning 100+ communities across PNG dating back to 2002. Physical wall map with color pin system showing phased rollout of the CHE healthy village program.

- Potential 20+ year longitudinal dataset once digitized
- Photograph the wall map before anything else — it is irreplaceable
- Digitizing is a separate workstream — does not block Phase 1
- Strengthens all grant applications significantly

---

## Grant Applications — Status

| Funder | Amount | Deadline | Status |
|---|---|---|---|
| EVAH (Gates/Wellcome/Novo Nordisk) | USD $1M–$3M | April 1, 2026 | Eligibility email sent |
| DAP Australia PNG | AUD $4k–$60k | Next round TBC | Inquiry sent |
| WHO Western Pacific | Technical partnership | Ongoing | Intro email drafted |
| IDRC AI for Global Health | CAD varies | Ongoing | Unsolicited idea submitted |
| Grand Challenges Canada Stars | CAD $100k–$250k | Next round TBC | Monitor gcc.fluxx.io |
| ADB | TBC | TBC | To contact — hot timing post forum |
| DFAT Partnerships for a Healthy Region | Large | TBC | Build relationship |
| Japan High-Level Technology Fund | TBC | TBC | Connected to ADB/WHO forum |

### EVAH Key Notes
- Deadline April 1 — most urgent
- Pathway A up to USD $1M for early deployment evaluation
- Pathway B up to USD $3M for impact at scale
- Lead applicant must be registered in eligible region — Stephen or Emma's PNG entity needed as lead
- Philippines expansion strengthens geographic eligibility
- Questions email sent to evah@povertyactionlab.org

### WHO Forum — Timing Opportunity
WHO Western Pacific and ADB hosted Forum on Harnessing AI for Health Equity on March 25–26 2026. Reference this in all WHO and ADB outreach this week.

---

## Documents Produced Today

1. **Executive Summary** — for Bill and Nickson (Word doc, downloadable)
2. **EDEN Connect Website** — single page HTML with all four interactive mockups (downloadable, shareable)
3. **CLAUDE.md** — full project context file for Claude Code sessions
4. **This summary document**

---

## Key Emails Sent Today

| To | Address | Purpose |
|---|---|---|
| EVAH | evah@povertyactionlab.org | Geographic eligibility — PNG and Philippines |
| DAP Australia | Port-Moresby.dap@dfat.gov.au | Round timing and eligibility inquiry |
| IDRC | idrc-crdi.ca/en/contact-us | Unsolicited idea submission |
| WHO Western Pacific | wprohid@who.int | Send today — intro and alignment |

---

## Immediate Next Steps

1. **Send WHO email today** — wprohid@who.int — while AI forum is still running
2. **Send Nickson the service account email** — ask him to share both CHS Sheets as Viewer
3. **Set up Supabase** — supabase.com — create free project, get Postgres connection string
4. **Build sync service** — Claude Code expands the test script into full Postgres sync
5. **Register on Fluxx** — gcc.fluxx.io — ready for Grand Challenges Canada when Stars opens
6. **Check EVAH FAQ** — povertyactionlab.org/initiative/evidence-ai-health-evah-rfp — March 13 FAQ may answer PNG eligibility
7. **Contact ADB** — draft intro email referencing this week's AI forum
8. **April 1** — submit EVAH application

---

## Important Links

| Resource | URL |
|---|---|
| EVAH RFP | povertyactionlab.org/initiative/evidence-ai-health-evah-rfp |
| Grand Challenges Canada | grandchallenges.ca/apply-for-funding |
| Fluxx portal | gcc.fluxx.io |
| DAP Australia PNG | png.embassy.gov.au/pmsb/cooperation.html |
| WHO Digital Health Framework | who.int/westernpacific/news/item/17-10-2025-who-publishes-regional-action-framework |
| WHO AI Forum | who.int/westernpacific/newsroom/events/overview/item/2026/03/25/western-pacific-events/forum-on-harnessing-artificial-intelligence-for-health-equity |
| IDRC AI4GH | idrc-crdi.ca/en/initiative/artificial-intelligence-global-health |
| Google Cloud Console | console.cloud.google.com |
| Supabase | supabase.com |

---

*EDEN Connect is built by Evolved AI in partnership with Medical Ambassadors International (Canada) and Christian Health Services PNG*
*Piloting in Eastern Highlands Province, Papua New Guinea · 2026*
