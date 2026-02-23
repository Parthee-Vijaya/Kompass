# Tasks: Kompass - Intelligent Workforce Scheduling & Route Planning

**PRD Reference:** `0001-prd-kompass-workforce-routing.md`  
**Genereret:** 20. februar 2026  
**Estimeret Scope:** MVP (Fase 1 + dele af Fase 2)

---

## Relevant Files

### Root / Configuration
- `package.json` - Root workspace configuration
- `.npmrc` - NPM workspace settings
- `docker-compose.yml` - Docker services configuration
- `.env.example` - Environment variables template
- `README.md` - Project documentation

### Backend
- `backend/package.json` - Backend dependencies
- `backend/src/index.ts` - Express server entry point
- `backend/src/config/database.ts` - PostgreSQL + PostGIS connection
- `backend/src/models/*.ts` - Prisma/TypeORM entities
- `backend/src/routes/*.ts` - API route handlers
- `backend/src/services/optimizer.ts` - OR-Tools integration
- `backend/src/services/routing.ts` - Route calculation service
- `backend/src/services/traffic.ts` - Traffic API integration
- `backend/src/services/compliance.ts` - Labor law validation
- `backend/src/websocket/index.ts` - Real-time WebSocket handlers
- `backend/prisma/schema.prisma` - Database schema
- `backend/tests/*.test.ts` - Backend unit tests

### Frontend
- `frontend/package.json` - Frontend dependencies
- `frontend/src/main.tsx` - React entry point
- `frontend/src/App.tsx` - Main application component
- `frontend/src/components/Map/*.tsx` - Map components (Mapbox/Leaflet)
- `frontend/src/components/Timeline/*.tsx` - Gantt-style timeline
- `frontend/src/components/Dashboard/*.tsx` - Dashboard widgets
- `frontend/src/components/RouteEditor/*.tsx` - Route editing interface
- `frontend/src/components/Simulation/*.tsx` - Simulation panel
- `frontend/src/store/*.ts` - Zustand state management
- `frontend/src/hooks/*.ts` - Custom React hooks
- `frontend/src/services/api.ts` - API client
- `frontend/src/services/websocket.ts` - WebSocket client
- `frontend/src/types/*.ts` - TypeScript interfaces
- `frontend/tests/*.test.tsx` - Frontend unit tests

### Optimization Engine (Python)
- `optimizer/requirements.txt` - Python dependencies
- `optimizer/src/main.py` - FastAPI server entry
- `optimizer/src/vrp_solver.py` - OR-Tools VRP implementation
- `optimizer/src/constraints.py` - Constraint definitions
- `optimizer/src/models.py` - Pydantic models
- `optimizer/tests/*.py` - Optimizer unit tests

---

## Tasks

### Phase 1: Foundation

- [x] **1.0 Projektopsætning & Infrastruktur** ✅
  - [x] 1.1 Opret NPM workspace monorepo struktur med root `package.json`
  - [x] 1.2 Konfigurer `.npmrc` med workspace best practices
  - [x] 1.3 Initialiser frontend workspace (Vite + React 19 + TypeScript)
  - [x] 1.4 Initialiser backend workspace (Node.js + Express + TypeScript)
  - [x] 1.5 Initialiser optimizer workspace (Python + FastAPI + OR-Tools)
  - [x] 1.6 Opret `docker-compose.yml` med PostgreSQL + PostGIS + Redis
  - [x] 1.7 Konfigurer Tailwind CSS + shadcn/ui i frontend
  - [x] 1.8 Opret `.env.example` med alle nødvendige miljøvariabler
  - [x] 1.9 Opsæt ESLint + Prettier for konsistent kodestandard
  - [x] 1.10 Opret basis README.md med setup-instruktioner

- [x] **2.0 Data Model & Backend API** ✅
  - [ ] 2.1 Design og opret Prisma schema med alle entiteter:
    - Employee (medarbejder med kompetencer, lokation, præferencer)
    - Task (opgave med varighed, krav, tidsvindue)
    - Client (borger/kunde med adresse, særlige behov)
    - Assignment (medarbejder-opgave kobling)
    - Route (daglig rute med statistik)
    - Schedule (arbejdstidsplan)
  - [ ] 2.2 Konfigurer PostGIS extension til geografiske queries
  - [ ] 2.3 Opret database migrations og seed data
  - [ ] 2.4 Implementer CRUD endpoints for Employee (`/api/employees`)
  - [ ] 2.5 Implementer CRUD endpoints for Task (`/api/tasks`)
  - [ ] 2.6 Implementer CRUD endpoints for Client (`/api/clients`)
  - [ ] 2.7 Implementer Route endpoints (`/api/routes`)
  - [ ] 2.8 Implementer Assignment endpoints (`/api/assignments`)
  - [ ] 2.9 Tilføj input validering med Zod schemas
  - [ ] 2.10 Implementer error handling middleware
  - [ ] 2.11 Skriv API tests for alle endpoints

- [x] **3.0 Optimeringsmotor (OR-Tools)** ✅
  - [ ] 3.1 Opsæt FastAPI projekt med Pydantic models
  - [ ] 3.2 Implementer basis VRP solver med OR-Tools:
    - Distance matrix beregning
    - Kapacitetsbegrænsninger
    - Tidsvinduer
  - [ ] 3.3 Tilføj kompetence-matching constraints
  - [ ] 3.4 Tilføj medarbejder arbejdstids-constraints
  - [ ] 3.5 Implementer pause-håndtering i ruter
  - [ ] 3.6 Opret `/optimize` endpoint der modtager opgaver og returnerer ruter
  - [ ] 3.7 Implementer inkrementel optimering (kun genberegn ændrede dele)
  - [ ] 3.8 Tilføj timeout og fallback ved lange beregninger
  - [ ] 3.9 Skriv performance tests (mål: 500 lokationer < 1 sekund)
  - [ ] 3.10 Dokumenter algoritme-parametre og tuning

- [x] **4.0 Kort & Visualisering** ✅
  - [ ] 4.1 Integrer Mapbox GL JS / Leaflet i React
  - [ ] 4.2 Implementer MapContainer komponent med basis funktionalitet
  - [ ] 4.3 Tilføj markers for medarbejdere (med status-farver)
  - [ ] 4.4 Tilføj markers for opgaver/klienter
  - [ ] 4.5 Implementer rute-rendering med polylines
  - [ ] 4.6 Tilføj farve-kodning per medarbejder
  - [ ] 4.7 Implementer click-to-select på markers
  - [ ] 4.8 Tilføj popup med detaljer ved hover/click
  - [ ] 4.9 Implementer zoom-to-fit for valgt medarbejders rute
  - [ ] 4.10 Tilføj cluster-visning ved mange markers

- [x] **5.0 Planlægger UI - Dashboard & Grundlæggende Views** ✅
  - [ ] 5.1 Opret AppLayout med sidebar navigation
  - [ ] 5.2 Implementer Dashboard hovedvisning med:
    - Dato-vælger
    - Team/medarbejder filter
    - Status oversigt (KPI cards)
  - [ ] 5.3 Opret KPI widgets (opgaver, medarbejdere, effektivitet)
  - [ ] 5.4 Implementer split-view: Kort + Tidslinje side-by-side
  - [ ] 5.5 Opret Timeline komponent (Gantt-style):
    - Tidsskala (timer)
    - Medarbejder-rækker
    - Opgave-blokke med drag-support
  - [ ] 5.6 Implementer synkronisering mellem kort og tidslinje (highlight)
  - [ ] 5.7 Opret RouteEditor panel:
    - Medarbejder-vælger
    - Sortérbar opgaveliste
    - Rute-statistik (km, tid)
  - [ ] 5.8 Implementer drag-and-drop til manuel omrokering af opgaver
  - [ ] 5.9 Tilføj "Optimer Route" knap der kalder optimizer
  - [ ] 5.10 Implementer undo/redo funktionalitet
  - [ ] 5.11 Tilføj loading states og skeleton loaders
  - [ ] 5.12 Implementer responsive design (tablet support)

---

### Phase 2: Real-time & Intelligence

- [x] **6.0 Real-time Updates & Simulation** ✅
  - [ ] 6.1 Opsæt Socket.io server i backend
  - [ ] 6.2 Implementer WebSocket client i frontend
  - [ ] 6.3 Broadcast route-ændringer til alle tilsluttede klienter
  - [ ] 6.4 Implementer optimistic updates i UI
  - [ ] 6.5 Opret SimulationPanel komponent:
    - Scenarie-beskrivelse input
    - Side-by-side sammenligning
    - Påvirkede opgaver liste
  - [ ] 6.6 Implementer "What-if" API endpoint (`/api/simulate`)
  - [ ] 6.7 Bevar uændrede og fastlåste opgaver ved simulering
  - [ ] 6.8 Tilføj "Anvend forslag" og "Annuller" actions
  - [ ] 6.9 Implementer simulerings-historik (seneste 5 simuleringer)
  - [ ] 6.10 Tilføj diff-visning mellem nuværende og simuleret plan

- [x] **7.0 Trafik & Vejr Integration** ✅
  - [ ] 7.1 Integrer Google Routes API / TomTom for rejsetider
  - [ ] 7.2 Implementer caching af rejsetider (Redis, 15 min TTL)
  - [ ] 7.3 Integrer Azure Maps Weather Along Route API
  - [ ] 7.4 Juster estimerede rejsetider baseret på vejrforhold
  - [ ] 7.5 Tilføj vejr-ikoner på kort ved dårligt vejr
  - [ ] 7.6 Implementer fallback til historiske data ved API-fejl
  - [ ] 7.7 Opret admin-indstillinger for API rate limits
  - [ ] 7.8 Log API-kald til monitoring og omkostningsstyring

- [x] **8.0 Compliance Engine (11/48-timers regler)** ✅
  - [ ] 8.1 Implementer 11-timers regel validering:
    - Beregn hvileperiode mellem vagter
    - Blokér assignment der bryder reglen
    - Vis advarsel i UI
  - [ ] 8.2 Implementer 48-timers regel validering:
    - Track rullende 4-måneders gennemsnit
    - Beregn ugentlig arbejdstid
    - Vis compliance-status per medarbejder
  - [ ] 8.3 Implementer ugentlig hviledag validering (max 6 dage)
  - [ ] 8.4 Opret ComplianceService med valideringslogik
  - [ ] 8.5 Tilføj compliance-ikoner i medarbejderlisten
  - [ ] 8.6 Opret compliance-rapport endpoint
  - [ ] 8.7 Implementer arbejdstidsregistrering (audit log)
  - [ ] 8.8 Skriv comprehensive tests for alle compliance regler

---

### Phase 3: Analytics & Polish

- [ ] **9.0 Analytics & Indsigtsmodul**
  - [ ] 9.1 Design analytics database schema (aggregerede data)
  - [ ] 9.2 Implementer daglig aggregering af KPIs
  - [ ] 9.3 Opret Analytics dashboard side:
    - Effektivitet over tid (line chart)
    - Kontinuitet score (bar chart)
    - Ruteafvigelser (scatter plot)
  - [ ] 9.4 Implementer filter på periode og team
  - [ ] 9.5 Tilføj export til CSV/Excel
  - [ ] 9.6 Opret medarbejder-specifik performance view
  - [ ] 9.7 Implementer sammenlignings-funktion (uge vs. uge)

- [ ] **10.0 Testing & Quality Assurance**
  - [ ] 10.1 Skriv E2E tests med Playwright for kritiske flows
  - [ ] 10.2 Implementer API integration tests
  - [ ] 10.3 Performance test af optimizer (load testing)
  - [ ] 10.4 Tilføj error boundary i React
  - [ ] 10.5 Implementer logging og monitoring (Sentry/LogRocket)
  - [ ] 10.6 Opret bruger-dokumentation
  - [ ] 10.7 Gennemfør accessibility audit (WCAG 2.1)

- [ ] **11.0 Deployment & DevOps**
  - [ ] 11.1 Opret production Dockerfile for hver service
  - [ ] 11.2 Konfigurer GitHub Actions CI/CD pipeline
  - [ ] 11.3 Opsæt staging environment
  - [ ] 11.4 Implementer database backup strategi
  - [ ] 11.5 Konfigurer health checks og alerting
  - [ ] 11.6 Dokumenter deployment procedure

---

## Task Dependencies

```
1.0 ──┬──> 2.0 ──┬──> 4.0 ──> 5.0
      │         │
      │         └──> 3.0 ──┬──> 6.0
      │                    │
      └──> 7.0 ────────────┘
                           │
                           └──> 8.0 ──> 9.0 ──> 10.0 ──> 11.0
```

---

## Prioritering (MVP Scope)

**Must Have (MVP):**
- 1.0 Projektopsætning ✓
- 2.0 Data Model & API ✓
- 3.0 Optimeringsmotor (basis) ✓
- 4.0 Kort-visning ✓
- 5.0 Planlægger UI ✓
- 8.0 Compliance (11/48-timer) ✓

**Should Have (MVP+):**
- 6.0 Real-time & Simulation
- 7.0 Trafik/Vejr integration

**Nice to Have (v1.1):**
- 9.0 Analytics
- 10.0 Fuld test suite
- 11.0 Production deployment

---

## Notes

- **OR-Tools vs Timefold:** Vi starter med OR-Tools (gratis, Python) for MVP. Kan migrere til Timefold hvis enterprise features behøves.
- **Kort-valg:** Leaflet er gratis og sufficient til MVP. Mapbox giver bedre UX men har omkostninger.
- **Real-time:** Socket.io valgt for enkelhed. Kan skifte til native WebSockets eller SSE hvis performance kræver det.

---

*Task list genereret baseret på PRD og best practices for workforce scheduling systems.*
