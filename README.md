# Plaain - Intelligent Workforce Scheduling & Route Planning

En moderne planlægningsplatform der kombinerer **ruteplanlægning** og **bemandingsplanlægning** i én sammenhængende løsning.

> *"Teknologi der understøtter, ikke erstatter den erfarne planlægger"*

## 🚀 Features

### Ruteplanlægning & Arbejdsplaner
- ✅ Automatisk ruteplanlægning med OR-Tools VRP solver
- ✅ Intelligent medarbejder-opgave allokering baseret på kompetencer
- ✅ Real-time genberegning ved ændringer
- ✅ Simulering af alternative planer (what-if scenarier)
- 🔄 Trafik- og vejrintegration (kommer)

### Bemandingsplanlægning
- ✅ Automatisk compliance med danske arbejdstidsregler
  - 11-timers hvileperiode
  - 48-timers ugentlig max (4-måneders gennemsnit)
  - Ugentlig hviledag
- 🔄 Kapacitetsprognose baseret på historik (kommer)
- 🔄 Fair fordeling af opgavetyper (kommer)

## 🏗 Arkitektur

```
plaain/
├── frontend/          # React 19 + TypeScript + Vite
│   └── src/
│       ├── components/  # UI komponenter
│       ├── pages/       # Side-komponenter
│       ├── store/       # Zustand state
│       └── services/    # API klienter
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── config/      # Konfiguration
│   └── prisma/          # Database schema
├── optimizer/         # Python + FastAPI + OR-Tools
│   └── src/
│       ├── vrp_solver.py  # VRP optimering
│       └── models.py      # Pydantic schemas
└── docker-compose.yml # PostgreSQL + PostGIS + Redis
```

## 📋 Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Python** >= 3.12
- **Docker** og **Docker Compose**

## 🛠 Installation

### 1. Klon repository

```bash
git clone <repository-url>
cd plaain
```

### 2. Installer dependencies

```bash
# Installer Node.js dependencies (root + workspaces)
npm install

# Installer Python dependencies
cd optimizer
python -m venv venv
source venv/bin/activate  # På Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3. Konfigurer miljøvariabler

```bash
cp .env.example .env
# Rediger .env med dine indstillinger
```

### 4. Start database services

```bash
npm run db:up
# Venter på at PostgreSQL og Redis starter...
```

### 5. Kør database migrationer

```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed  # Opret testdata
cd ..
```

### 6. Start udvikling

```bash
# Terminal 1: Start alle services
npm run dev

# Eller start separat:
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend

# Terminal 3: Optimizer
npm run dev:optimizer
```

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| Optimizer API | http://localhost:8001 |
| Prisma Studio | `npx prisma studio` (backend/) |

## 📚 API Endpoints

### Backend (Node.js)

| Method | Endpoint | Beskrivelse |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/employees` | Hent alle medarbejdere |
| POST | `/api/employees` | Opret medarbejder |
| GET | `/api/tasks` | Hent opgaver (filter: `?date=YYYY-MM-DD`) |
| POST | `/api/tasks` | Opret opgave |
| GET | `/api/routes` | Hent ruter |
| POST | `/api/optimize` | Kør ruteoptimering |
| POST | `/api/optimize/simulate` | Simuler scenarie |

### Optimizer (Python)

| Method | Endpoint | Beskrivelse |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/optimize` | VRP optimering |
| POST | `/distance-matrix` | Beregn afstandsmatrix |

## 🧪 Test

```bash
# Kør alle tests
npm test

# Frontend tests
npm run test:frontend

# Backend tests
npm run test:backend

# Optimizer tests
npm run test:optimizer
```

## 🐳 Docker Production Build

```bash
# Byg og start alle services
docker-compose up -d

# Se logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Projektstruktur - Vigtige Filer

```
backend/
├── prisma/schema.prisma    # Database model
├── src/routes/optimize.ts  # Optimerings-endpoints
└── src/services/           # Business logic

frontend/
├── src/App.tsx             # Main routing
├── src/pages/Dashboard.tsx # Hovedoverblik
├── src/pages/RoutePlanner.tsx # Ruteplanlægning
└── src/components/         # Genbrugelige komponenter

optimizer/
├── src/vrp_solver.py       # OR-Tools VRP implementation
└── src/models.py           # Request/Response schemas
```

## 🔧 Konfiguration

### Compliance Regler (`.env`)

```env
COMPLIANCE_REST_HOURS=11        # Min. hvileperiode (timer)
COMPLIANCE_MAX_WEEKLY_HOURS=48  # Max ugentlig arbejdstid
COMPLIANCE_MAX_CONSECUTIVE_DAYS=6  # Max sammenhængende dage
```

### Optimering

Optimizer timeout og parametre kan justeres i `/api/optimize` request:

```json
{
  "date": "2026-02-20",
  "config": {
    "timeoutSeconds": 30,
    "includeTraffic": true
  }
}
```

## 📖 Dokumentation

- [PRD (Product Requirements Document)](./tasks/0001-prd-plaain-workforce-routing.md)
- [Task Liste](./tasks/tasks-plaain-workforce-routing.md)

## 🤝 Bidrag

1. Opret feature branch (`git checkout -b feature/ny-feature`)
2. Commit ændringer (`git commit -m 'Tilføj ny feature'`)
3. Push til branch (`git push origin feature/ny-feature`)
4. Opret Pull Request

## 📄 Licens

Proprietary - Alle rettigheder forbeholdes

---

**Plaain** - Grundlagt 2024  
*Erfaring møder innovation*
