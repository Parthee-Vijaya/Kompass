# PRD: Kompass - Intelligent Workforce Scheduling & Route Planning

**Version:** 1.0  
**Dato:** 20. februar 2026  
**Status:** Draft  

---

## 1. Executive Summary

Kompass er en intelligent planlægningsplatform der kombinerer **ruteplanlægning** og **bemandingsplanlægning** i én sammenhængende løsning. Systemet understøtter planlæggere med avancerede algoritmer, mens mennesket bevarer kontrollen over de vigtige beslutninger.

### Vision
*"Teknologi der understøtter, ikke erstatter den erfarne planlægger"*

---

## 2. Problem Statement

### Nuværende Udfordringer
1. **Manuel ruteplanlægning** er tidskrævende og suboptimal (timer vs. sekunder)
2. **Manglende realtidsdata** - trafik og vejr ignoreres i planlægningen
3. **Komplekse arbejdstidsregler** (11-timers og 48-timers regler) er svære at overholde manuelt
4. **Ingen simuleringsmuligheder** - ændringer påvirker eksisterende planer
5. **Fragmenterede systemer** - ruteplanlægning og bemanding er adskilt
6. **Lav effektivitet** - planlæggere kan kun håndtere begrænsede områder

### Målsætning
- Forbedre planlagt effektivitet med **5-10 procentpoint**
- Planlæggere kan håndtere **op til 4x så meget**
- Realtids genberegning på **sekunder, ikke timer**

---

## 3. Target Users

### Primær Bruger: Planlæggeren
- Erfarne planlæggere i hjemmepleje, teknisk service, eller feltservice
- Har lokalkendskab og relationsforståelse
- Behøver værktøjer der respekterer deres ekspertise
- Arbejder under tidspres med mange daglige ændringer

### Sekundære Brugere
- **Teamledere** - overblik over kapacitet og bemanding
- **Medarbejdere i marken** - modtager optimerede ruter
- **Administratorer** - compliance-rapportering og KPI'er

---

## 4. Core Modules

### Modul 1: Ruteplanlægning & Arbejdsplaner (Daglig Operationel)

#### 4.1.1 Automatisk Ruteplanlægning
- **Beskrivelse:** Genererer optimale ruter baseret på multiple faktorer
- **Optimeringsparametre:**
  - Arbejdstider og pauser
  - Transporttider (realistiske, ikke luftlinje)
  - Trafikdata (real-time og historisk)
  - Vejrprognoser
  - Medarbejderlokation (start/slut)

#### 4.1.2 Intelligent Medarbejder-Opgave Allokering
- **Beskrivelse:** Matcher opgaver med medarbejdere baseret på:
  - Kompetencekrav (certificeringer, erfaring)
  - Borger/kunde-relationer (kontinuitet)
  - Særlige forhold (fysiske krav, sprog)
  - Individuelle kalendere og præferencer

#### 4.1.3 Realtids Genberegning
- **Beskrivelse:** Øjeblikkelig tilpasning når virkeligheden ændrer sig
- **Triggers:**
  - Sygemelding
  - Akut opgave
  - Aflysning
  - Trafikændringer
  - Opgave tager længere/kortere tid
- **Krav:** < 5 sekunder genberegningstid

#### 4.1.4 Simuleringsfunktion
- **Beskrivelse:** Test alternative planer uden at påvirke nuværende
- **Funktioner:**
  - "What-if" scenarier
  - Sammenligning af alternativer
  - Bevar allerede udførte opgaver
  - Bevar fastlåste opgaver

### Modul 2: Bemandingsplanlægning (Strategisk)

#### 4.2.1 Kapacitetsprognose
- **Beskrivelse:** Forudsiger behov baseret på historiske data
- **Input:**
  - Historisk opgavemængde (sæson, ugedag, etc.)
  - Planlagt fravær
  - Kendte fremtidige ændringer

#### 4.2.2 Overenskomst-Compliance
- **Automatisk overholdelse af:**
  - **11-timers reglen:** Min. 11 sammenhængende timers hvile per 24 timer
  - **48-timers reglen:** Max 48 timer/uge gennemsnit over 4 måneder
  - **Ugentlig hviledag:** Én fridag per uge, max 6 sammenhængende dage
  - Arbejdstidsregistrering (lovkrav siden juli 2024)

#### 4.2.3 Medarbejderønsker & Fairness
- **Funktioner:**
  - Fair fordeling af opgavetyper
  - Imødekommelse af ønskevagter
  - Balancering af byrder
  - Vikarplanlægning

#### 4.2.4 Langsigtet Planlægning
- **Tidshorisont:** Uger til måneder frem
- **Output:** Vagtplaner, ferieplaner, uddannelsesplaner

---

## 5. Technical Requirements

### 5.1 Algoritmer & Optimering

#### Ruteplanlægning (Vehicle Routing Problem - VRP)
```
Anbefalede Tilgange (baseret på 2025 research):
├── Adaptive Tabu Search
│   └── Tre-lags struktur: Strategisk → Taktisk → Operationel
├── Genetic Algorithms (GA)
│   └── AI-initialiseret for hurtig konvergens
├── Adaptive Large Neighborhood Search (ALNS)
│   └── Traffic-Aware variant (T-ALNS-RRD)
└── Reinforcement Learning + Graph Neural Networks
    └── For generalisering på tværs af områder
```

**Performance Krav:**
- 500+ lokationer håndteres på < 1 sekund
- 94%+ on-time delivery rate
- < 150ms response tid ved disruptions

#### Bemandingsplanlægning
```
Constraint Programming med:
├── Hard Constraints (must satisfy)
│   ├── 11-timers regel
│   ├── 48-timers regel
│   └── Kompetencekrav
├── Medium Constraints (should satisfy)
│   ├── Kontinuitet (samme medarbejder til borger)
│   └── Geografisk clustering
└── Soft Constraints (nice to have)
    ├── Medarbejderønsker
    └── Fair fordeling
```

### 5.2 Externe API Integrationer

| API | Formål | Anbefaling |
|-----|--------|------------|
| **Trafik** | Real-time rejsetider | Google Routes API / TomTom |
| **Vejr** | Påvirkning af transport | Azure Maps Weather Along Route / Tomorrow.io |
| **Geocoding** | Adresse → koordinater | Google Maps Geocoding |
| **Kalender** | Medarbejderkalendere | Microsoft Graph API |

### 5.3 Tech Stack (Anbefaling)

```
Frontend:
├── Framework: React 19 + TypeScript
├── State: Zustand / Redux Toolkit
├── UI: Tailwind CSS + shadcn/ui
├── Maps: Mapbox GL JS / Leaflet
├── Charts: Recharts / D3.js
└── Real-time: WebSockets (Socket.io)

Backend:
├── Runtime: Node.js 20+ / Python 3.12+
├── Framework: FastAPI (Python) eller Express (Node)
├── Optimization: OR-Tools (Google) / OptaPlanner (Timefold)
├── Database: PostgreSQL + PostGIS
├── Cache: Redis
└── Message Queue: RabbitMQ / Bull

Infrastructure:
├── Container: Docker + Docker Compose
├── Deployment: Kubernetes (production)
└── CI/CD: GitHub Actions
```

### 5.4 Optimization Engine Valg

| Tool | Sprog | Styrker | Anbefaling |
|------|-------|---------|------------|
| **Google OR-Tools** | Python/C++ | Gratis, hurtig, VRP-optimeret | ⭐ Primary |
| **Timefold** | Java/Python | Enterprise, constraint solving | Alternative |
| **OptaPlanner** | Java | Moden, workforce scheduling | Alternative |

---

## 6. User Interface Design

### 6.1 Design Principper
- **Planlæggeren i centrum** - ikke AI-first
- **Hurtig adgang** til hyppige funktioner
- **Gennemsigtighed** - vis hvorfor algoritmen foreslår X
- **Kontrollerbarhed** - override altid mulig

### 6.2 Hovedvisninger

#### Dashboard (Dagsoverblik)
```
┌─────────────────────────────────────────────────────────────┐
│  [Dato-vælger]  [Team-filter]  [Status-filter]              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Opgaver     │  │ Medarbejdere│  │ Effektivitet│          │
│  │    145      │  │     12/14   │  │    87.3%    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
├───────────────────────────┬─────────────────────────────────┤
│                           │                                 │
│      KORT-VISNING         │      TIDSLINJE-VISNING          │
│      (Mapbox/Leaflet)     │      (Gantt-style)              │
│                           │                                 │
│      • Medarbejder-       │      08:00 ─────────────── 16:00│
│        positioner         │      [Anna]  ████████░░░░░░░░░  │
│      • Opgave-lokationer  │      [Bo]    ░░████████████░░░  │
│      • Aktuelle ruter     │      [Carla] ██████████████░░░  │
│                           │                                 │
└───────────────────────────┴─────────────────────────────────┘
```

#### Rute-Editor
```
┌─────────────────────────────────────────────────────────────┐
│  Medarbejder: [Anna Andersen ▼]                             │
│  Dato: [20. feb 2026]                                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │  OPGAVELISTE    │    │  KORT                           │ │
│  │                 │    │                                 │ │
│  │  ⊙ 08:00 Start  │    │       ①───②                    │ │
│  │  ① 08:15 Borger │    │         ╲ ╲                    │ │
│  │  ② 09:00 Borger │    │          ③─④                   │ │
│  │  ③ 10:30 Borger │    │            ╲                   │ │
│  │  ④ 11:15 Borger │    │             ⊗                  │ │
│  │  ⊗ 12:00 Slut   │    │                                 │ │
│  │                 │    │  Total: 28.4 km · 4t 15m        │ │
│  │  [+ Tilføj]     │    │                                 │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  [Gem]  [Optimer Route]  [Simuler Ændring]  [Fortryd]       │
└─────────────────────────────────────────────────────────────┘
```

#### Simulerings-Panel
```
┌─────────────────────────────────────────────────────────────┐
│  SIMULERING: "Anna sygemeldt"                               │
├─────────────────────────────────────────────────────────────┤
│  Påvirkede opgaver: 8                                       │
│                                                             │
│  FORSLAG A:                      FORSLAG B:                 │
│  ┌─────────────────────────┐     ┌─────────────────────────┐│
│  │ Fordel til Bo + Carla   │     │ Kald vikar ind          ││
│  │ • Bo: +3 opgaver        │     │ • Vikar: 8 opgaver      ││
│  │ • Carla: +5 opgaver     │     │ • Bo/Carla: uændret     ││
│  │                         │     │                         ││
│  │ ⚠️ Bo overtid: +45 min  │     │ ✓ Ingen overarbejde     ││
│  │ Effektivitet: 84%       │     │ Effektivitet: 91%       ││
│  └─────────────────────────┘     └─────────────────────────┘│
│                                                             │
│  [Anvend Forslag A]  [Anvend Forslag B]  [Annuller]         │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Data Model (Konceptuelt)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Employee    │────<│  Assignment  │>────│    Task      │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ id           │
│ name         │     │ employee_id  │     │ location_id  │
│ competencies │     │ task_id      │     │ duration     │
│ work_hours   │     │ start_time   │     │ required_    │
│ location     │     │ end_time     │     │   competency │
│ preferences  │     │ status       │     │ client_id    │
└──────────────┘     │ route_order  │     │ time_window  │
       │             └──────────────┘     └──────────────┘
       │                    │                    │
       │             ┌──────────────┐            │
       └────────────>│    Route     │<───────────┘
                     ├──────────────┤
                     │ id           │
                     │ date         │
                     │ employee_id  │
                     │ total_distance│
                     │ total_time   │
                     │ efficiency   │
                     └──────────────┘

┌──────────────┐     ┌──────────────┐
│   Client     │     │   Schedule   │
├──────────────┤     ├──────────────┤
│ id           │     │ id           │
│ address      │     │ employee_id  │
│ location     │     │ week_start   │
│ preferences  │     │ planned_hours│
│ special_needs│     │ actual_hours │
└──────────────┘     │ compliance_  │
                     │   status     │
                     └──────────────┘
```

---

## 8. Indsigtsmodul (Analytics)

### KPI Dashboard
| Metrik | Beskrivelse | Mål |
|--------|-------------|-----|
| **Effektivitet** | Produktiv tid / Total tid | > 85% |
| **Kontinuitet** | Samme medarbejder til borger | > 75% |
| **Ruteafvigelse** | Faktisk vs. planlagt km | < 10% |
| **On-time Rate** | Opgaver udført inden for tidsvindue | > 95% |
| **Compliance** | Overholdelse af arbejdstidsregler | 100% |

---

## 9. Non-Goals (Out of Scope v1.0)

- ❌ Mobil-app til medarbejdere i marken
- ❌ Integration med ERP/lønsystemer
- ❌ Fakturering og økonomistyring
- ❌ Multi-tenant SaaS platform
- ❌ Machine learning-baseret efterspørgselsprognose
- ❌ Automatisk kommunikation til borgere

---

## 10. Success Criteria

### Launch Criteria
- [ ] Ruteplanlægning for minimum 20 medarbejdere
- [ ] Genberegning < 5 sekunder
- [ ] 11/48-timers compliance 100%
- [ ] Simulering uden påvirkning af aktiv plan
- [ ] Trafik-integration aktiv

### Success Metrics (3 måneder post-launch)
- [ ] Effektivitet forbedret 5%+
- [ ] Planlæggertid reduceret 50%+
- [ ] Brugeradoption > 80%
- [ ] System uptime > 99.5%

---

## 11. Risici & Mitigering

| Risiko | Sandsynlighed | Impact | Mitigering |
|--------|---------------|--------|------------|
| API-omkostninger eskalerer | Høj | Medium | Caching, rate limiting, fallback |
| Optimeringsalgoritme for langsom | Medium | Høj | Inkrementel optimering, timeouts |
| Brugermodstand | Medium | Høj | Involver planlæggere tidligt, træning |
| Datainkonsistens | Medium | Høj | Transaktioner, validering, audit log |

---

## 12. Faser & Milestones

### Fase 1: MVP (8-10 uger)
- Basis ruteplanlægning
- Medarbejder-opgave matching
- Kort-visning med ruter
- Manuel justering

### Fase 2: Real-time & Compliance (6-8 uger)
- Trafik/vejr-integration
- Realtids-genberegning
- 11/48-timers overvågning
- Simulering

### Fase 3: Strategisk Planlægning (8-10 uger)
- Bemandingsmodul
- Kapacitetsprognose
- Vagtplanlægning
- Analytics dashboard

---

## Appendix A: Research Sources

1. **Algoritmer:** MCP Analytics, Solvice, Timefold (2025)
2. **VRP Research:** EARLI framework, T-ALNS-RRD (Nature 2025)
3. **Danish Labor Law:** DLA Piper, Deloitte Denmark (2024)
4. **APIs:** Google Routes, Azure Maps, Tomorrow.io (2025)

---

*Dokumentet er udarbejdet som grundlag for implementering af Kompass workforce scheduling platform.*
