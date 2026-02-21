import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Play,
  RotateCcw,
  Zap,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api, type Route, type Employee, type Assignment } from '@/services/api'
import { RouteMap } from '@/components/Map/RouteMap'
import { RouteTimeline } from '@/components/Timeline/RouteTimeline'
import { SimulationPanel } from '@/components/Simulation/SimulationPanel'

const formatDate = (date: Date) => date.toISOString().split('T')[0]

export function RoutePlanner() {
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(() => formatDate(new Date()))
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showSimulation, setShowSimulation] = useState(false)
  const [viewMode, setViewMode] = useState<'map' | 'timeline' | 'split'>('split')

  const { data: routes = [], isLoading: routesLoading } = useQuery({
    queryKey: ['routes', selectedDate],
    queryFn: () => api.routes.list({ date: selectedDate }),
  })

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: api.employees.list,
  })

  const optimizeMutation = useMutation({
    mutationFn: (params: { date: string; employeeIds?: string[] }) =>
      api.optimize.run(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes', selectedDate] })
    },
  })

  const simulateMutation = useMutation({
    mutationFn: (scenario: Parameters<typeof api.optimize.simulate>[0]) =>
      api.optimize.simulate(scenario),
  })

  const handleDateChange = (delta: number) => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + delta)
    setSelectedDate(formatDate(date))
  }

  const handleOptimizeAll = () => {
    optimizeMutation.mutate({ date: selectedDate })
  }

  const handleOptimizeEmployee = (employeeId: string) => {
    optimizeMutation.mutate({ date: selectedDate, employeeIds: [employeeId] })
  }

  const selectedRoute = routes.find((r) => r.employeeId === selectedEmployeeId)

  const displayDate = new Date(selectedDate).toLocaleDateString('da-DK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Ruteplanlægning</h1>
          <p className="text-gray-500 mt-1">Planlæg og optimer daglige ruter</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {(['map', 'split', 'timeline'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  viewMode === mode
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {mode === 'map' ? 'Kort' : mode === 'timeline' ? 'Tidslinje' : 'Begge'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSimulation(!showSimulation)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors',
              showSimulation
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            )}
          >
            <Zap className="w-4 h-4" />
            Simulering
          </button>

          <button
            onClick={handleOptimizeAll}
            disabled={optimizeMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 rounded-lg text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {optimizeMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Optimer alle
          </button>
        </div>
      </div>

      {/* Date navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-lg font-medium text-gray-900 border-none focus:outline-none focus:ring-0 bg-transparent cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleDateChange(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-1 capitalize">{displayDate}</p>
      </div>

      {/* Status bar */}
      {optimizeMutation.isSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">Ruter optimeret succesfuldt!</span>
        </div>
      )}

      {optimizeMutation.isError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">
            Fejl ved optimering: {optimizeMutation.error?.message}
          </span>
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Employee list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Medarbejdere</h2>
              <p className="text-xs text-gray-500 mt-0.5">{routes.length} aktive ruter</p>
            </div>

            {routesLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {routes.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => setSelectedEmployeeId(route.employeeId)}
                    className={cn(
                      'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                      selectedEmployeeId === route.employeeId && 'bg-primary-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {route.employee?.name || 'Ukendt'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {route.assignments.length} opgaver ·{' '}
                          {route.totalDistanceKm?.toFixed(1) || '?'} km
                        </p>
                      </div>
                      {route.efficiency && (
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-1 rounded-full',
                            route.efficiency > 0.8
                              ? 'bg-green-100 text-green-700'
                              : route.efficiency > 0.6
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                          )}
                        >
                          {Math.round(route.efficiency * 100)}%
                        </span>
                      )}
                    </div>
                  </button>
                ))}

                {routes.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <p className="text-sm">Ingen ruter for denne dato</p>
                    <button
                      onClick={handleOptimizeAll}
                      className="mt-2 text-primary-600 text-sm font-medium hover:underline"
                    >
                      Opret ruter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Map and Timeline */}
        <div className={cn('lg:col-span-3 space-y-4', showSimulation && 'lg:col-span-2')}>
          {/* Map */}
          {(viewMode === 'map' || viewMode === 'split') && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  {selectedRoute
                    ? `Rute: ${selectedRoute.employee?.name}`
                    : 'Alle ruter'}
                </h2>
                {selectedEmployeeId && (
                  <button
                    onClick={() => handleOptimizeEmployee(selectedEmployeeId)}
                    disabled={optimizeMutation.isPending}
                    className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Genoptimer
                  </button>
                )}
              </div>
              <div className="h-[400px]">
                <RouteMap
                  routes={routes}
                  selectedEmployeeId={selectedEmployeeId}
                  onEmployeeSelect={setSelectedEmployeeId}
                  onAssignmentSelect={setSelectedAssignment}
                />
              </div>
            </div>
          )}

          {/* Timeline */}
          {(viewMode === 'timeline' || viewMode === 'split') && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Tidslinje</h2>
              </div>
              <div className="p-4">
                <RouteTimeline
                  routes={routes}
                  selectedEmployeeId={selectedEmployeeId}
                  onEmployeeSelect={setSelectedEmployeeId}
                  onAssignmentClick={setSelectedAssignment}
                />
              </div>
            </div>
          )}
        </div>

        {/* Simulation panel */}
        {showSimulation && (
          <div className="lg:col-span-1">
            <SimulationPanel
              employees={employees}
              date={selectedDate}
              onSimulate={(scenario) =>
                simulateMutation.mutateAsync({ date: selectedDate, scenario })
              }
              onApply={(rec) => {
                console.log('Apply recommendation:', rec)
                setShowSimulation(false)
              }}
              onClose={() => setShowSimulation(false)}
            />
          </div>
        )}
      </div>

      {/* Selected assignment details */}
      {selectedAssignment && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {selectedAssignment.task?.title || 'Opgave'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedAssignment.task?.client?.name} ·{' '}
                {selectedAssignment.task?.client?.address}
              </p>
            </div>
            <button
              onClick={() => setSelectedAssignment(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Starttid</p>
              <p className="font-medium">
                {new Date(selectedAssignment.startTime).toLocaleTimeString('da-DK', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Sluttid</p>
              <p className="font-medium">
                {new Date(selectedAssignment.endTime).toLocaleTimeString('da-DK', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Varighed</p>
              <p className="font-medium">{selectedAssignment.task?.durationMinutes} min</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Rejsetid</p>
              <p className="font-medium">{selectedAssignment.travelMinutes || '?'} min</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
