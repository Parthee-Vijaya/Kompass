import { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Layers, CheckCircle2, MapPin, Route as RouteIcon, Zap } from 'lucide-react'
import type { Assignment } from '@/services/api'
import { RouteMap } from '@/components/Map/RouteMap'
import { cn } from '@/lib/utils'
import { StaggerContainer, StaggerItem } from '@/components/ui/Stagger'
import { useMockRouteStore } from '@/store/mockRouteStore'
import { KALUNDBORG_ADDRESSES } from '@/data/kalundborg-addresses'

const DRIVER_COLORS = ['#3366ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

export function MapView() {
  const store = useMockRouteStore()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

  const handleDateChange = (delta: number) => {
    const d = new Date(store.selectedDate)
    d.setDate(d.getDate() + delta)
    store.setDate(d.toISOString().slice(0, 10))
  }

  const displayDate = new Date(store.selectedDate).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const hasRoutes = store.routes.length > 0

  return (
    <StaggerContainer className="space-y-5">
      <StaggerItem>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="section-title mb-1.5">Live overblik</p>
            <h1 className="heading-display text-3xl text-gray-900">Kortvisning</h1>
            <p className="text-[13px] text-gray-500 mt-1 capitalize">{displayDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass-card rounded-xl p-1.5 flex items-center gap-1">
              <button onClick={() => handleDateChange(-1)} className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
              <div className="flex items-center gap-1.5 px-2">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <input type="date" value={store.selectedDate} onChange={(e) => store.setDate(e.target.value)} className="text-sm font-semibold text-gray-900 border-none focus:outline-none focus:ring-0 bg-transparent cursor-pointer" />
              </div>
              <button onClick={() => handleDateChange(1)} className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
            </div>
            {hasRoutes && (
              <div className="flex items-center gap-2">
                {[
                  { icon: MapPin, value: `${store.stats.totalTasks}`, color: 'text-primary-500' },
                  { icon: RouteIcon, value: `${store.stats.totalDistance} km`, color: 'text-emerald-500' },
                  { icon: Zap, value: `${store.stats.avgEfficiency}%`, color: 'text-accent-500' },
                ].map((s, i) => (
                  <div key={i} className="glass-card rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                    <s.icon className={cn('w-3 h-3', s.color)} />
                    <span className="data-value text-[11px] text-gray-700">{s.value}</span>
                  </div>
                ))}
              </div>
            )}
            <button className="p-2 glass-card rounded-xl hover:bg-white/50 transition-colors"><Layers className="w-4 h-4 text-gray-500" /></button>
          </div>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl">
              <div className="px-4 py-3 border-b border-white/30">
                <h2 className="text-[15px] font-semibold text-gray-900">Medarbejdere</h2>
                <p className="text-[10px] text-gray-400 data-value mt-0.5">{store.routes.length} aktive ruter</p>
              </div>
              <div className="divide-y divide-gray-100/40 max-h-[600px] overflow-y-auto scrollbar-thin">
                <button onClick={() => setSelectedEmployeeId(null)}
                  className={cn('w-full px-4 py-3 text-left text-sm font-medium transition-colors', !selectedEmployeeId ? 'bg-primary-50/40 text-primary-600' : 'text-gray-600 hover:bg-white/30')}>
                  Alle ruter
                </button>
                {store.routes.map((route, idx) => {
                  const color = DRIVER_COLORS[idx % DRIVER_COLORS.length]!
                  return (
                    <button key={route.id} onClick={() => setSelectedEmployeeId(route.employeeId)}
                      className={cn('w-full px-4 py-3 text-left transition-colors', selectedEmployeeId === route.employeeId ? 'bg-primary-50/40' : 'hover:bg-white/30')}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: color }}>
                          {route.employee?.name?.split(' ').map((n) => n[0]).join('') || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{route.employee?.name}</p>
                          <p className="text-[10px] text-gray-400">
                            <span className="data-value">{route.assignments.length}</span> opgaver · <span className="data-value">{route.totalDistanceKm}</span> km
                          </p>
                        </div>
                        {route.efficiency != null && route.efficiency > 0.8 && <CheckCircle2 className="w-3.5 h-3.5 text-success-500 shrink-0" />}
                      </div>
                    </button>
                  )
                })}
                {!hasRoutes && (
                  <div className="p-8 text-center text-gray-400">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm mb-1">Ingen ruter endnu</p>
                    <p className="text-[11px] text-gray-400">Gå til Ruteplanlægning for at optimere {KALUNDBORG_ADDRESSES.length} adresser</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="h-[calc(100vh-220px)] min-h-[500px]">
                <RouteMap routes={store.routes} selectedEmployeeId={selectedEmployeeId} onEmployeeSelect={setSelectedEmployeeId} onAssignmentSelect={setSelectedAssignment} />
              </div>
            </div>
          </div>
        </div>
      </StaggerItem>

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
    </StaggerContainer>
  )
}
