import { useState, useCallback } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  ListOrdered,
  Map,
  GanttChart,
  Columns,
  Users,
  Clock,
  Route as RouteIcon,
  Minus,
  Plus,
  MapPin,
  AlertTriangle,
  Timer,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Assignment } from '@/services/api'
import { RouteMap } from '@/components/Map/RouteMap'
import { StaggerContainer, StaggerItem } from '@/components/ui/Stagger'
import { useMockRouteStore } from '@/store/mockRouteStore'
import { KALUNDBORG_ADDRESSES } from '@/data/kalundborg-addresses'
import { useCountUp } from '@/hooks/useCountUp'

const DRIVER_COLORS = ['#3366ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

export function RoutePlanner() {
  const store = useMockRouteStore()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'timeline' | 'split'>('map')
  const [step, setStep] = useState<'choose' | 'plan'>('choose')
  const [routeType, setRouteType] = useState<'manual' | 'optimized'>('optimized')

  const handleOptimize = useCallback(() => {
    store.runOptimize()
    setStep('plan')
  }, [store])

  const handleDateChange = (delta: number) => {
    const d = new Date(store.selectedDate)
    d.setDate(d.getDate() + delta)
    store.setDate(d.toISOString().slice(0, 10))
  }

  const animatedEfficiency = useCountUp(store.stats.avgEfficiency, 800)
  const animatedTasks = useCountUp(store.stats.totalTasks, 600)
  const displayDate = new Date(store.selectedDate).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const viewIcons = { map: Map, split: Columns, timeline: GanttChart } as const

  if (step === 'choose') {
    return (
      <StaggerContainer className="space-y-5">
        <StaggerItem>
          <div>
            <p className="section-title mb-1.5">Ny rute</p>
            <h1 className="heading-display text-3xl text-gray-900">Vælg en rutetype</h1>
            <p className="text-[13px] text-gray-500 mt-1">Manuel kontrol eller automatisk optimering af {KALUNDBORG_ADDRESSES.length} adresser</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl">
            {([
              { type: 'manual' as const, title: 'Manuel rute', desc: 'Du styrer rækkefølge og fordeling. Velegnet til kendte ruter.', icon: ListOrdered, points: ['Du bestemmer rækkefølgen', 'Én rute pr. medarbejder', 'Fuld kontrol'] },
              { type: 'optimized' as const, title: 'Optimeret rute', desc: 'Systemet finder den bedste fordeling. Sparer tid og kørsel.', icon: Zap, points: ['Optimal rækkefølge', 'Fordeling på flere chauffører', 'Justerbare parametre'] },
            ]).map((opt) => (
              <motion.button key={opt.type} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setRouteType(opt.type); if (opt.type === 'optimized') { handleOptimize() } else { setStep('plan') } }}
                className={cn('text-left p-6 rounded-2xl border-2 transition-all', routeType === opt.type ? 'border-primary-500 shadow-glow-blue glass-card' : 'border-transparent glass-card')}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', opt.type === 'manual' ? 'bg-violet-500/10 text-violet-500' : 'bg-primary-500/10 text-primary-500')}>
                  <opt.icon className="w-5 h-5" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">{opt.title}</h2>
                <p className="text-[13px] text-gray-500 mb-4">{opt.desc}</p>
                <ul className="space-y-2">
                  {opt.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-[12px] text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-400 shrink-0" />{p}
                    </li>
                  ))}
                </ul>
              </motion.button>
            ))}
          </div>
        </StaggerItem>
      </StaggerContainer>
    )
  }

  return (
    <StaggerContainer className="space-y-5">
      {/* ── Header + Controls ── */}
      <StaggerItem>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="section-title mb-1.5">Planlægning</p>
            <h1 className="heading-display text-3xl text-gray-900">Ruteplanlægning</h1>
            <p className="text-[13px] text-gray-500 mt-1 capitalize">{displayDate}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl p-1 gap-0.5">
              {(['map', 'split', 'timeline'] as const).map((m) => {
                const Icon = viewIcons[m]
                return <button key={m} onClick={() => setViewMode(m)} className={cn('p-2 rounded-lg transition-colors', viewMode === m ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600')} title={m}><Icon className="w-4 h-4" /></button>
              })}
            </div>
            <button onClick={() => { store.reset(); setStep('choose') }}
              className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-sm font-medium text-gray-600 hover:bg-white/50">
              <RotateCcw className="w-4 h-4" />Nulstil
            </button>
            <button onClick={handleOptimize}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 rounded-xl text-sm font-semibold text-white hover:bg-primary-600 shadow-sm hover:shadow-glow-blue-sm transition-all">
              <Play className="w-4 h-4" />Genoptimer
            </button>
          </div>
        </div>
      </StaggerItem>

      {/* ── Date + Stats ── */}
      <StaggerItem>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="glass-card rounded-2xl p-3 flex items-center gap-1">
            <button onClick={() => handleDateChange(-1)} className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <input type="date" value={store.selectedDate} onChange={(e) => store.setDate(e.target.value)} className="text-sm font-semibold text-gray-900 border-none focus:outline-none focus:ring-0 bg-transparent cursor-pointer" />
            </div>
            <button onClick={() => handleDateChange(1)} className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
          </div>

          {store.isOptimized && (
            <div className="flex flex-wrap items-center gap-3">
              {[
                { label: 'Opgaver', value: `${animatedTasks}`, sub: `af ${KALUNDBORG_ADDRESSES.length}`, icon: MapPin, color: 'text-primary-500' },
                { label: 'Distance', value: `${store.stats.totalDistance} km`, sub: 'total kørsel', icon: RouteIcon, color: 'text-emerald-500' },
                { label: 'Effektivitet', value: `${animatedEfficiency}%`, sub: 'gennemsnit', icon: Zap, color: 'text-accent-500' },
                { label: 'Ikke tildelt', value: `${store.stats.unassigned}`, sub: 'uden rute', icon: AlertTriangle, color: store.stats.unassigned > 0 ? 'text-accent-500' : 'text-success-500' },
              ].map((s) => (
                <div key={s.label} className="glass-card rounded-xl px-4 py-2.5 flex items-center gap-3">
                  <s.icon className={cn('w-4 h-4', s.color)} />
                  <div>
                    <p className="data-value text-sm text-gray-900">{s.value}</p>
                    <p className="text-[10px] text-gray-400">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </StaggerItem>

      {/* ── Parameter Controls ── */}
      <StaggerItem>
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Parametre</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {/* Driver count */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                <Users className="w-3 h-3" /> Chauffører
              </label>
              <div className="flex items-center gap-2">
                <button onClick={() => store.setParam('driverCount', Math.max(1, store.params.driverCount - 1))}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><Minus className="w-3.5 h-3.5 text-gray-600" /></button>
                <span className="data-value text-xl text-gray-900 w-8 text-center">{store.params.driverCount}</span>
                <button onClick={() => store.setParam('driverCount', Math.min(6, store.params.driverCount + 1))}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><Plus className="w-3.5 h-3.5 text-gray-600" /></button>
              </div>
            </div>

            {/* Travel time */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                <Timer className="w-3 h-3" /> Rejsetid
              </label>
              <div className="flex items-center gap-2">
                <input type="range" min={2} max={25} value={store.params.travelMinutes}
                  onChange={(e) => store.setParam('travelMinutes', parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-gray-200 rounded-full accent-primary-500 cursor-pointer" />
                <span className="data-value text-sm text-gray-900 w-12 text-right">{store.params.travelMinutes} min</span>
              </div>
            </div>

            {/* Start time */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                <Clock className="w-3 h-3" /> Start
              </label>
              <select value={store.params.startHour} onChange={(e) => store.setParam('startHour', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm data-value focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 bg-white">
                {Array.from({ length: 8 }, (_, i) => 5 + i).map((h) => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>

            {/* End time */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                <Clock className="w-3 h-3" /> Slut
              </label>
              <select value={store.params.endHour} onChange={(e) => store.setParam('endHour', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm data-value focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 bg-white">
                {Array.from({ length: 10 }, (_, i) => 12 + i).map((h) => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* ── Main layout: employees + map ── */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Employee / route list */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl">
              <div className="px-4 py-3 border-b border-white/30">
                <h2 className="text-[15px] font-semibold text-gray-900">Ruter</h2>
                <p className="text-[10px] text-gray-400 data-value mt-0.5">{store.routes.length} chauffører · {store.stats.totalTasks} opgaver</p>
              </div>
              <div className="divide-y divide-gray-100/40 max-h-[600px] overflow-y-auto scrollbar-thin">
                <button onClick={() => setSelectedEmployeeId(null)}
                  className={cn('w-full px-4 py-3 text-left text-sm font-medium transition-colors', !selectedEmployeeId ? 'bg-primary-50/40 text-primary-600' : 'text-gray-600 hover:bg-white/30')}>
                  Alle ruter
                </button>
                {store.routes.map((route, idx) => {
                  const color = DRIVER_COLORS[idx % DRIVER_COLORS.length]!
                  const isSelected = selectedEmployeeId === route.employeeId
                  return (
                    <button key={route.id} onClick={() => setSelectedEmployeeId(route.employeeId)}
                      className={cn('w-full px-4 py-3 text-left transition-colors', isSelected ? 'bg-primary-50/40' : 'hover:bg-white/30')}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-white"
                          style={{ backgroundColor: color }}>
                          {route.employee?.name?.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{route.employee?.name}</p>
                          <p className="text-[10px] text-gray-400">
                            <span className="data-value">{route.assignments.length}</span> opgaver · <span className="data-value">{route.totalDistanceKm}</span> km
                          </p>
                        </div>
                        {route.efficiency != null && (
                          <span className={cn('badge', route.efficiency > 0.8 ? 'badge-success' : route.efficiency > 0.6 ? 'badge-warning' : 'badge-danger')}>
                            {Math.round(route.efficiency * 100)}%
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                          {route.assignments.map((a, i) => (
                            <button key={a.id} onClick={(e) => { e.stopPropagation(); setSelectedAssignment(a) }}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-white/40 transition-colors">
                              <span className="data-value text-[10px] text-gray-400 w-4">{i + 1}</span>
                              <div className="min-w-0">
                                <p className="text-[11px] font-medium text-gray-700 truncate">{a.task?.client?.name}</p>
                                <p className="text-[9px] text-gray-400 truncate">{a.task?.client?.address}</p>
                              </div>
                              <span className="text-[9px] text-gray-400 data-value ml-auto shrink-0">
                                {new Date(a.startTime).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
                {store.routes.length === 0 && (
                  <div className="p-8 text-center text-gray-400">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Tryk "Genoptimer" for at bygge ruter</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map + Timeline */}
          <div className="lg:col-span-3 space-y-4">
            {(viewMode === 'map' || viewMode === 'split') && (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/30 flex items-center justify-between">
                  <h2 className="text-[15px] font-semibold text-gray-900">
                    {selectedEmployeeId ? `Rute: ${store.routes.find((r) => r.employeeId === selectedEmployeeId)?.employee?.name}` : 'Alle ruter'}
                  </h2>
                  <span className="text-[11px] text-gray-400 data-value">{KALUNDBORG_ADDRESSES.length} adresser i Kalundborg</span>
                </div>
                <div className="h-[500px] min-h-[50vh]">
                  <RouteMap routes={store.routes} selectedEmployeeId={selectedEmployeeId} onEmployeeSelect={setSelectedEmployeeId} onAssignmentSelect={setSelectedAssignment} />
                </div>
              </div>
            )}

            {(viewMode === 'timeline' || viewMode === 'split') && store.routes.length > 0 && (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/30">
                  <h2 className="text-[15px] font-semibold text-gray-900">Tidslinje</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {String(store.params.startHour).padStart(2, '0')}:00 – {String(store.params.endHour).padStart(2, '0')}:00
                  </p>
                </div>
                <div className="p-4">
                  <MockTimeline routes={store.routes} startHour={store.params.startHour} endHour={store.params.endHour} />
                </div>
              </div>
            )}
          </div>
        </div>
      </StaggerItem>

      {/* ── Selected assignment detail ── */}
      {selectedAssignment && (
        <StaggerItem>
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedAssignment.task?.title || 'Opgave'}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedAssignment.task?.client?.name} · {selectedAssignment.task?.client?.address}</p>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">×</button>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Nr.', value: `#${selectedAssignment.routeOrder + 1}` },
                { label: 'Start', value: new Date(selectedAssignment.startTime).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }) },
                { label: 'Slut', value: new Date(selectedAssignment.endTime).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }) },
                { label: 'Varighed', value: `${selectedAssignment.task?.durationMinutes} min` },
                { label: 'Rejsetid', value: `${selectedAssignment.travelMinutes || '?'} min` },
              ].map((it) => (
                <div key={it.label}>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{it.label}</p>
                  <p className="data-value text-sm text-gray-900 mt-0.5">{it.value}</p>
                </div>
              ))}
            </div>
          </div>
        </StaggerItem>
      )}
    </StaggerContainer>
  )
}

/* ── Inline timeline component ── */
function MockTimeline({ routes, startHour, endHour }: { routes: import('@/services/api').Route[]; startHour: number; endHour: number }) {
  const totalHours = endHour - startHour
  const hourMarkers = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i)
  const toPercent = (h: number) => ((h - startHour) / totalHours) * 100

  return (
    <div className="space-y-3">
      <div className="relative h-5 ml-[80px]">
        {hourMarkers.map((h) => (
          <span key={h} className="absolute text-[10px] font-mono text-gray-400 -translate-x-1/2" style={{ left: `${toPercent(h)}%` }}>
            {String(h).padStart(2, '0')}
          </span>
        ))}
      </div>
      {routes.map((route, rIdx) => {
        const color = DRIVER_COLORS[rIdx % DRIVER_COLORS.length]!
        return (
          <div key={route.id} className="flex items-center gap-3">
            <div className="w-[68px] shrink-0 flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: color }}>
                {route.employee?.name?.split(' ').map((n) => n[0]).join('')}
              </div>
              <span className="text-[10px] font-medium text-gray-600 truncate">{route.employee?.name?.split(' ')[0]}</span>
            </div>
            <div className="flex-1 relative h-6 bg-gray-100/60 rounded-lg overflow-hidden">
              {hourMarkers.map((h) => (
                <div key={h} className="absolute top-0 bottom-0 w-px bg-gray-200/50" style={{ left: `${toPercent(h)}%` }} />
              ))}
              {route.assignments.map((a) => {
                const start = new Date(a.startTime)
                const end = new Date(a.endTime)
                const startH = start.getHours() + start.getMinutes() / 60
                const endH = end.getHours() + end.getMinutes() / 60
                const left = toPercent(startH)
                const width = toPercent(endH) - left
                return (
                  <div key={a.id} className="absolute top-0.5 bottom-0.5 rounded text-white text-[8px] font-medium flex items-center justify-center overflow-hidden"
                    style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%`, backgroundColor: color, minWidth: 2 }}
                    title={`${a.task?.client?.name} (${a.task?.durationMinutes}min)`}>
                    {width > 3 && <span className="truncate px-0.5">{a.routeOrder + 1}</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
