# Kompass – Testguide

## Hurtig test (nuværende status)

### Forudsætninger
- Docker kører (PostgreSQL på **5433**, Redis på 6379)
- Backend kører på **http://localhost:3002**
- Frontend kører på **http://localhost:5175**

### 1. Start services

```bash
# Database + Redis
docker-compose up -d postgres redis

# Backend (fra projektrod)
cd backend && npm run dev

# Frontend (nyt terminal, fra projektrod)
npm run dev
# eller: cd frontend && npm run dev
```

**Bemærk:** Hvis port 3001 eller 5432 er optaget, er backend sat til 3002 og Postgres i Docker til 5433. Se `backend/.env` og `docker-compose.yml`.

### 2. Database (første gang)

```bash
cd backend
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Manuel UI-test

1. **Dashboard** – http://localhost:5175/
   - Statistik-kort (medarbejdere, opgaver, ruter)
   - Grafer (effektivitet, ruter)

2. **Ruteplanlægning** – http://localhost:5175/routes
   - Vælg dato
   - Kort med ruter/opgaver
   - Tidslinje
   - Simuleringspanel (scenarier)

3. **Medarbejdere** – http://localhost:5175/employees
   - Liste med seed-medarbejdere (Anna, Bo, Carla, …)
   - Opret/rediger/slet
   - Compliance-status

4. **Indstillinger** – http://localhost:5175/settings
   - Compliance-regler, optimeringsparametre, API-nøgler

### 4. API-test (curl)

```bash
# Health
curl http://localhost:3002/api/health

# Medarbejdere
curl http://localhost:3002/api/employees

# Opgaver (dato i YYYY-MM-DD)
curl "http://localhost:3002/api/tasks?date=2026-02-21"
```

### 5. Optimizer (valgfrit)

Optimizer-service (Python/OR-Tools) kører på port 8001. Backend kalder den ved "Optimer ruter".

```bash
cd optimizer
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8001
```

Test: `curl http://localhost:8001/health`

---

## Retter jeg har lavet under test

- **Tailwind:** `border-border` / `bg-background` fjernet fra `index.css` (bruger nu ren CSS for border/background).
- **Database:** Postgres i Docker bruger port **5433** for at undgå konflikt med lokal Postgres på 5432.
- **Backend:** Bruger port **3002** hvis 3001 er optaget; frontend proxy i `vite.config.ts` peger på 3002.
- **Seed:** Køres med `npx tsx prisma/seed.ts` (DATABASE_URL fra `backend/.env`).
- **OR-Tools:** `optimizer/requirements.txt` opdateret til `ortools>=9.15` (pga. tilgængelige versioner).

---

*Sidst opdateret: efter første fulde test af applikationen.*
