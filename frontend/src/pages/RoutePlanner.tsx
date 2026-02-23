import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  Zap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ListOrdered,
  Map,
  GanttChart,
  Columns,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { api, type Assignment } from '@/services/api'
import { RouteMap } from '@/components/Map/RouteMap'
import { RouteTimeline } from '@/components/Timeline/RouteTimeline'
import { SimulationPanel } from '@/components/Simulation/SimulationPanel'
import { StaggerContainer, StaggerItem } from '@/components/ui/Stagger'

const formatDate = (date: Date): string => date.toISOString().slice(0, 10)

const ROUTE_STEPS = [
  { id: 'start', label: 'Start' },
  { id: 'activities', label: 'Tilføj opgaver' },
  { id: 'complement', label: 'Udvid' },
  { id: 'finish', label: 'Afslut' },
] as const

export function RoutePlanner() {
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(() => formatDate(new Date()))
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showSimulation, setShowSimulation] = useState(false)
  const [viewMode, setViewMode] = useState<'map' | 'timeline' | 'split'>('split')
  const [routeType, setRouteType] = useState<'manual' | 'optimized'>('optimized')
  const [currentStep, setCurrentStep] = useState<(typeof ROUTE_STEPS)[number]['id']>('start')

  const { data: routes = [], isLoading: routesLoading } = useQuery({ queryKey: ['routes', selectedDate], queryFn: () => api.routes.list({ date: selectedDate }) })
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: api.employees.list })
  const optimizeMutation = useMutation({ mutationFn: (params: { date: string; employeeIds?: string[] }) => api.optimize.run(params), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes', selectedDate] }) })
  const simulateMutation = useMutation({ mutationFn: (scenario: Parameters<typeof api.optimize.simulate>[0]) => api.optimize.simulate(scenario) })

  const handleDateChange = (delta: number) => { const d = new Date(selectedDate); d.setDate(d.getDate() + delta); setSelectedDate(formatDate(d)) }
  const handleOptimizeAll = () => optimizeMutation.mutate({ date: selectedDate })
  const handleOptimizeEmployee = (eid: string) => optimizeMutation.mutate({ date: selectedDate, employeeIds: [eid] })
  const selectedRoute = routes.find((r) => r.employeeId === selectedEmployeeId)
  const displayDate = new Date(selectedDate).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const viewIcons = { map: Map, split: Columns, timeline: GanttChart } as const

  return (
    <StaggerContainer className="space-y-5">
      <StaggerItem>
        <div className="flex items-center gap-1 text-sm">
          {ROUTE_STEPS.map((step, i) => (
            <span key={step.id} className="flex items-center gap-1">
              <button onClick={() => setCurrentStep(step.id)}
                className={cn('px-2.5 py-1 rounded-lg font-medium transition-all text-[13px]', currentStep === step.id ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100')}>
                {step.label}
              </button>
              {i < ROUTE_STEPS.length - 1 && <span className="text-gray-200 text-[10px]">/</span>}
            </span>
          ))}
        </div>
      </StaggerItem>

      {currentStep === 'start' && (
        <StaggerItem>
          <div className="space-y-5">
            <div>
              <p className="section-title mb-1.5">Ny rute</p>
              <h1 className="heading-display text-3xl text-gray-900">Vælg en rutetype</h1>
              <p className="text-[13px] text-gray-500 mt-1">Manuel kontrol eller automatisk optimering</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5 max-w-3xl">
              {([
                { type: 'manual' as const, title: 'Manuel rute', desc: 'Du styrer rækkefølge og fordeling. Velegnet til kendte ruter.', icon: ListOrdered, points: ['Du bestemmer rækkefølgen', 'Én rute pr. medarbejder'] },
                { type: 'optimized' as const, title: 'Optimeret rute', desc: 'Systemet finder den bedste fordeling. Sparer tid og kørsel.', icon: Zap, points: ['Optimal rækkefølge', 'Fordeling på flere medarbejdere'] },
              ]).map((opt) => (
                <motion.button key={opt.type} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setRouteType(opt.type); setCurrentStep('activities') }}
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
          </div>
        </StaggerItem>
      )}

      {currentStep !== 'start' && (
        <>
          <StaggerItem>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="section-title mb-1.5">Planlægning</p>
                <h1 className="heading-display text-3xl text-gray-900">Ruteplanlægning</h1>
                <p className="text-[13px] text-gray-500 mt-1">{routeType === 'optimized' ? 'Optimeret' : 'Manuel'} · <span className="capitalize">{displayDate}</span></p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl p-1 gap-0.5">
                  {(['map', 'split', 'timeline'] as const).map((m) => {
                    const Icon = viewIcons[m]
                    return <button key={m} onClick={() => setViewMode(m)} className={cn('p-2 rounded-lg transition-colors', viewMode === m ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600')} title={m}><Icon className="w-4 h-4" /></button>
                  })}
                </div>
                <button onClick={() => setShowSimulation(!showSimulation)}
                  className={cn('inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-all', showSimulation ? 'bg-accent-50 border-accent-300 text-accent-600' : 'glass-card text-gray-600')}>
                  <Zap className="w-4 h-4" />Simulering
                </button>
                {routeType === 'optimized' && (
                  <button onClick={handleOptimizeAll} disabled={optimizeMutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 rounded-xl text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50 shadow-sm hover:shadow-glow-blue-sm transition-all">
                    {optimizeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}Optimer alle
                  </button>
                )}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-white/50 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-base font-semibold text-gray-900 border-none focus:outline-none focus:ring-0 bg-transparent cursor-pointer" />
                </div>
                <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-white/50 rounded-xl transition-colors"><ChevronRight className="w-5 h-5 text-gray-500" /></button>
              </div>
            </div>
          </StaggerItem>

          {optimizeMutation.isSuccess && (
            <StaggerItem>
              <div className="flex items-center gap-2 p-3 bg-success-50 border border-success-500/20 rounded-xl text-success-700">
                <CheckCircle2 className="w-4 h-4" /><span className="text-sm font-medium">Ruter optimeret!</span>
              </div>
            </StaggerItem>
          )}
          {optimizeMutation.isError && (
            <StaggerItem>
              <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-500/20 rounded-xl text-danger-600">
                <AlertCircle className="w-4 h-4" /><span className="text-sm font-medium">Fejl: {optimizeMutation.error?.message}</span>
              </div>
            </StaggerItem>
          )}

          <StaggerItem>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <div className="glass-card rounded-2xl">
                  <div className="px-4 py-3 border-b border-white/30">
                    <h2 className="text-[15px] font-semibold text-gray-900">Medarbejdere</h2>
                    <p className="text-[10px] text-gray-400 data-value mt-0.5">{routes.length} ruter</p>
                  </div>
                  {routesLoading ? (
                    <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                  ) : (
                    <div className="divide-y divide-gray-100/40 max-h-[500px] overflow-y-auto scrollbar-thin">
                      {routes.map((route) => (
                        <button key={route.id} onClick={() => setSelectedEmployeeId(route.employeeId)}
                          className={cn('w-full px-4 py-3 text-left transition-colors', selectedEmployeeId === route.employeeId ? 'bg-primary-50/40' : 'hover:bg-white/30')}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{route.employee?.name || 'Ukendt'}</p>
                              <p className="text-[10px] text-gray-400 data-value">{route.assignments.length} opgaver · {route.totalDistanceKm?.toFixed(1) || '?'} km</p>
                            </div>
                            {route.efficiency != null && <span className={cn('badge', route.efficiency > 0.8 ? 'badge-success' : route.efficiency > 0.6 ? 'badge-warning' : 'badge-danger')}>{Math.round(route.efficiency * 100)}%</span>}
                          </div>
                        </button>
                      ))}
                      {routes.length === 0 && (
                        <div className="p-8 text-center text-gray-400"><p className="text-sm">Ingen ruter</p>
                          <button onClick={handleOptimizeAll} className="mt-2 text-primary-500 text-sm font-medium hover:underline">Opret ruter</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={cn('lg:col-span-3 space-y-4', showSimulation && 'lg:col-span-2')}>
                {(viewMode === 'map' || viewMode === 'split') && (
                  <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/30 flex items-center justify-between">
                      <h2 className="text-[15px] font-semibold text-gray-900">{selectedRoute ? `Rute: ${selectedRoute.employee?.name}` : 'Alle ruter'}</h2>
                      {selectedEmployeeId && <button onClick={() => handleOptimizeEmployee(selectedEmployeeId)} disabled={optimizeMutation.isPending} className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Genoptimer</button>}
                    </div>
                    <div className="h-[450px] min-h-[50vh]"><RouteMap routes={routes} selectedEmployeeId={selectedEmployeeId} onEmployeeSelect={setSelectedEmployeeId} onAssignmentSelect={setSelectedAssignment} /></div>
                  </div>
                )}
                {(viewMode === 'timeline' || viewMode === 'split') && (
                  <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/30"><h2 className="text-[15px] font-semibold text-gray-900">Tidslinje</h2></div>
                    <div className="p-4"><RouteTimeline routes={routes} selectedEmployeeId={selectedEmployeeId} onEmployeeSelect={setSelectedEmployeeId} onAssignmentClick={setSelectedAssignment} /></div>
                  </div>
                )}
              </div>

              {showSimulation && (
                <div className="lg:col-span-1">
                  <SimulationPanel employees={employees} date={selectedDate}
                    onSimulate={(scenario) => simulateMutation.mutateAsync({ date: selectedDate, scenario })}
                    onApply={() => setShowSimulation(false)} onClose={() => setShowSimulation(false)} />
                </div>
              )}
            </div>
          </StaggerItem>

          {selectedAssignment && (
            <StaggerItem>
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div><h3 className="font-semibold text-gray-900">{selectedAssignment.task?.title || 'Opgave'}</h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedAssignment.task?.client?.name} · {selectedAssignment.task?.client?.address}</p></div>
                  <button onClick={() => setSelectedAssignment(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">×</button>
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Start', value: new Date(selectedAssignment.startTime).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }) },
                    { label: 'Slut', value: new Date(selectedAssignment.endTime).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }) },
                    { label: 'Varighed', value: `${selectedAssignment.task?.durationMinutes} min` },
                    { label: 'Rejsetid', value: `${selectedAssignment.travelMinutes || '?'} min` },
                  ].map((it) => (
                    <div key={it.label}><p className="text-[10px] text-gray-400 uppercase tracking-wider">{it.label}</p><p className="data-value text-sm text-gray-900 mt-0.5">{it.value}</p></div>
                  ))}
                </div>
              </div>
            </StaggerItem>
          )}
        </>
      )}
    </StaggerContainer>
  )
}
