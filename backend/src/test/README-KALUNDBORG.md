# Test: Kalundborg ruter (100+ adresser)

Integrationstest der:

1. **Opretter 105 adresser** i Kalundborg kommune (tilfældige koordinater inden for kommunens grænser).
2. **Opretter en normal (manuel) rute** med 1 chauffør: alle opgaver tildelt i nærmeste-nabo rækkefølge fra chaufførens hjem.
3. **Optimerer med 1 chauffør** via `/api/optimize`.
4. **Optimerer med 2 chauffører** via `/api/optimize`.
5. **Optimerer med 3 chauffører** via `/api/optimize`.

Testen verificerer at alle opgaver bliver tildelt og logger total distance og varighed for hver variant.

## Forudsætninger

- **Database**: PostgreSQL (PostGIS) kører og `DATABASE_URL` i `backend/.env` peger på den (fx `localhost:5433`).
- **Optimizer**: Python-optimizer kører og `OPTIMIZER_URL` i `backend/.env` peger på den (fx `http://localhost:8001`).

## Kørsel

Fra `backend/`:

```bash
# Start database (Docker)
docker-compose up -d postgres redis

# Start optimizer (andet terminal)
cd ../optimizer && source .venv/bin/activate && uvicorn src.main:app --host 0.0.0.0 --port 8001

# Kør kun Kalundborg-testen
npm run test -- --run src/test/kalundborg-routes.test.ts
```

Testen bruger datoen `2026-03-15` og rydder op (sletter oprettede klienter, opgaver, medarbejdere og ruter) i `afterAll`.
