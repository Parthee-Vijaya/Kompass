# Kompass – Plan for total UI-overhaling

**Status:** Plan  
**Dato:** Februar 2026  
**Formål:** Research-baseret plan for en komplet visuel og funktionel opgradering af Kompass, med fokus på nyeste design-trends og planlægger-centreret UX.

---

## 1. Research-opsummering (2024–2026)

### 1.1 SaaS Dashboard & datavisualisering
- **Tilpasselige dashboards:** Modulære widgets, brugerdefinerede views og filtre (rolle-baseret). F-pattern: vigtigste KPI (North Star) øverst til venstre.
- **Beslutningsstøtte:** Dashboards som “Next Best Action” – integrerede opgave-widgets og tydelige CTAs i stedet for kun statiske tal.
- **Datavisualisering:** Klarhed over æstetik – line for trends, bar for sammenligninger, donut for andele. Ingen “hover for at forstå”-grafer.
- **AI og fortælling:** Korte AI-opsummeringer af trends, proaktive advarsler og kontekstrige tooltips.

### 1.2 Fleet / ruteplanlægning UI
- **Real-time kort:** Live ruter, køretøj/medarbejder-positioner, trafik og dynamisk omrouting.
- **Drag-and-drop:** Redigering af ruter direkte på kort eller tidslinje.
- **Kombineret kort + tidslinje:** Som i nuværende Kompass – bevare og styrke.
- **Kost-/effektivitet:** Tydelige visualiseringer af besparelse og kapacitetsudnyttelse.

### 1.3 Layout og navigation
- **Mørk sidebar + lys indhold:** Allerede delvist implementeret (COBLI-inspiration). Anbefalinger:
  - Sidebar: 240px åben / 56px collapsed. Menupunkter min. 36px højde (tilgængelighed).
  - Undgå ren sort (#000); brug neutral mørk (fx #0a0a0a / #141414) eller kølig mørk (#0a0a12) for mindre belastning.
- **Breadcrumbs og trin:** Trin-indikator (Start > Tilføj opgaver > Udvid > Afslut) for lange flows – allerede på ruteplanlægning.
- **Sekundær sidebar:** Mulighed for ekstra panel (fx filtre, detaljer) på desktop.

### 1.4 Overflade og kort
- **Glassmorphism:** Semi-transparente kort med blur og let gradient-baggrund for “premium” feel. Kræver god kontrast på tekst.
- **Kort-styling:** Subtil skygge (shadow-card), afrundede hjørner, konsistent spacing. Prioritér læsbarhed over effekter.
- **Mørk mode:** Understøttelse med reduceret mætning og let øget lysstyrke på farver.

### 1.5 Tilgængelighed og micro-interactions
- **WCAG:** Kontrast, fokus-states, keyboard navigation, skærmlæser.
- **Micro-interactions:** Korte animationer ved valg, expand/collapse og success-feedback uden at overbelaste.

---

## 2. Anbefalede retningslinjer for Kompass

### 2.1 Designprincipper
1. **Planlæggeren i centrum:** Hurtig adgang til ofte brugte funktioner; teknologien assisterer, erstatter ikke.
2. **Ét fælles datafundament:** Ruteplanlægning og bemanding deler data og føles som én løsning.
3. **Klarhed før dekoration:** Tydelige tal, labels og handlinger; visuelle effekter understøtter, ikke distraherer.
4. **Konsistens:** Samme sidebar, farver, typografi og komponent-sprog på tværs af moduler.

### 2.2 Farver og tema
- **Sidebar:** Behold mørk (#1b273d) med hvid/grå tekst og primary blå for aktiv state.
- **Primary accent:** Blå (#2563eb / #3b82f6) til CTAs, valg og links.
- **Baggrund:** Lys grå (#f9fafb / gray-50) i indholdsområdet; hvide kort med let skygge.
- **Semantik:** Grøn (success), amber (advarsel), rød (fejl/overtrædelse) – især på compliance og status.
- **Fremtid:** Valgfri mørk mode med samme tokens (CSS variables).

### 2.3 Typografi
- **Primær:** Sans-serif (Inter eller lignende) – allerede i brug.
- **Hierarki:** Stor fed overskrift på sider; mellem-størrelse til sektioner; lille til metadata og labels.
- **Læsbarhed:** Tilstrækkelig linjehøjde og afstand mellem sektioner.

### 2.4 Komponenter og patterns
- **Stat-kort:** Ikon, værdi, subtekst og evt. lille “change”-label (som nu). Overvej valgfri glassmorphism på dashboard.
- **Kort med handling:** Kort til “Manuel rute” / “Optimeret rute” med tydelig hover og valgt state.
- **Tabeller/lister:** Sorterbare kolonner, række-hover, kompakte handlinger (ikon-knapper).
- **Kort + tidslinje:** Behold split-view; mulighed for resizable panels og “kun kort” / “kun tidslinje”.
- **Simulering:** Dedikeret panel (som nu) med scenarier og “Anvend anbefaling”.

### 2.5 Responsivitet
- **Desktop:** Sidebar fast; indhold med max-width eller fuld bredde efter behov.
- **Tablet:** Collapsible sidebar eller sheet; kort og tidslinje kan stables.
- **Mobil:** Bottom nav eller hamburger; forenklede views (fx kun liste eller kun kort).

---

## 3. Konkrete UI-opgaver (prioriteret)

### Fase A – Foundation (allerede delvist på plads)
- [ ] Fastlægge design tokens (farver, spacing, radius, skygge) i Tailwind + evt. CSS variables.
- [ ] Ensrette alle sider med samme sidebar og top-bar.
- [ ] Introducere evt. glassmorphism kun på dashboard-kort (valgfrit, med fallback).
- [ ] Tilgængelighed: fokus-states og kontrast på alle interaktive elementer.

### Fase B – Dashboard
- [ ] North Star KPI tydeligt placeret (fx “Planlagt effektivitet i dag” eller “Opgaver fuldført”).
- [ ] Tilpasselige widgets: bruger kan skjule/vise og evt. flytte blokke (drag-and-drop).
- [ ] “Næste skridt”-widget: anbefalede handlinger (fx “Optimer ruter for i morgen”, “Tjek compliance”).
- [ ] Grafer: tooltips med kontekst og evt. korte AI- eller foruddefinerede forklaringer.

### Fase C – Ruteplanlægning
- [ ] Bevare trin-flow (Start > Tilføj opgaver > Udvid > Afslut) med tydelig aktiv step.
- [ ] Forbedret kort: bedre markører, tydeligere rute-linjer og evt. trafik/vejr-indikatorer.
- [ ] Tidslinje: drag-and-drop for rækkefølge; vis rejsetid mellem opgaver.
- [ ] Simuleringspanel: mere tydelig “før/efter” og anbefalinger.

### Fase D – Bemanding og andre sider
- [ ] Bemandingsoversigt: uge-/måneds-view med kapacitet og compliance-indikatorer.
- [ ] Medarbejdere: hurtig compliance-status og filter på kompetencer.
- [ ] Indstillinger: gruperede sektioner (Compliance, API, Optimering) med tydelige labels.

### Fase E – Avanceret
- [ ] Mørk mode med design tokens.
- [ ] Sekundær sidebar til filtre/detaljer på desktop.
- [ ] Micro-animationer (fx ved optimering færdig, ved valg af rute-type).
- [ ] Evt. AI-opsummeringer på dashboard (når backend understøtter det).

---

## 4. Teknisk stack (uændret, med mulige udvidelser)
- **Frontend:** React 19, Vite, TypeScript, Tailwind, Zustand, React Query, Leaflet, Recharts.
- **Komponenter:** Lucide ikoner; evt. udvidelse med shadcn/ui eller egne design-system-komponenter.
- **State:** Global state (Zustand) + server state (React Query); WebSocket til live opdateringer.

---

## 5. Næste skridt
1. Godkend denne plan og evt. juster prioriteringer.
2. Implementer Fase A (tokens, konsistens, tilgængelighed).
3. Udvid mockdata (se nedenfor) så dashboard og alle views kan vises med rigtigt-indhold under udvikling.
4. Iterer på Fase B (Dashboard) og Fase C (Ruteplanlægning) med løbende brugerfeedback.

---

*Dokumentet bygger på research i SaaS dashboard trends 2024–2026, fleet/rute-UI, dark sidebar layouts og glassmorphism/neumorphism. Kompass beholder “planlæggeren i centrum” og den eksisterende funktionelle opdeling mellem ruteplanlægning og bemanding.*
