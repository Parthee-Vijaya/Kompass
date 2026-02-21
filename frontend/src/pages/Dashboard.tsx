import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
  ClipboardList,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Route,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { api } from '@/services/api'
import { wsService } from '@/services/websocket'
import { cn } from '@/lib/utils'

export function Dashboard() {
  const today = new Date().toISOString().split('T')[0]

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', today],
    queryFn: () => api.analytics.dashboard(today),
    refetchInterval: 60000,
  })

  const { data: efficiencyTrend = [] } = useQuery({
    queryKey: ['efficiency-trend'],
    queryFn: () => api.analytics.efficiencyTrend(7),
  })

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: api.employees.list,
  })

  useEffect(() => {
    wsService.connect()
    return () => wsService.disconnect()
  }, [])

  const statCards = [
    {
      name: 'Opgaver i dag',
      value: stats?.tasks.total ?? '-',
      subtext: `${stats?.tasks.completed ?? 0} fuldført`,
      change: stats ? `${stats.tasks.completionRate}%` : '-',
      changeType: (stats?.tasks.completionRate ?? 0) > 80 ? 'positive' : 'neutral',
      icon: ClipboardList,
    },
    {
      name: 'Aktive medarbejdere',
      value: stats ? `${stats.employees.active}/${stats.employees.total}` : '-',
      subtext: 'på rute i dag',
      change: stats ? `${stats.employees.utilizationRate}%` : '-',
      changeType: (stats?.employees.utilizationRate ?? 0) > 70 ? 'positive' : 'neutral',
      icon: Users,
    },
    {
      name: 'Planlagt effektivitet',
      value: stats ? `${stats.routes.avgEfficiency}%` : '-',
      subtext: 'gennemsnit',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: 'Total distance',
      value: stats ? `${stats.routes.totalDistanceKm} km` : '-',
      subtext: `${stats?.routes.totalDurationHours ?? 0}t køretid`,
      change: `${stats?.routes.count ?? 0} ruter`,
      changeType: 'neutral',
      icon: Route,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overblik over dagens planlægning</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-primary-50 rounded-lg">
                <stat.icon className="w-5 h-5 text-primary-600" />
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : stat.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-500'
                )}
              >
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              {statsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              ) : (
                <>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.subtext}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Effektivitet (sidste 7 dage)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={efficiencyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString('da-DK', { weekday: 'short' })
                  }
                  tick={{ fontSize: 12 }}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Effektivitet']}
                  labelFormatter={(date) =>
                    new Date(date).toLocaleDateString('da-DK', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                    })
                  }
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ fill: '#0ea5e9', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Route count */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Ruter per dag</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString('da-DK', { weekday: 'short' })
                  }
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [value, 'Ruter']}
                  labelFormatter={(date) =>
                    new Date(date).toLocaleDateString('da-DK', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                    })
                  }
                />
                <Bar dataKey="routeCount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Employee compliance list */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Medarbejder status</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {employees.slice(0, 5).map((emp) => (
            <div key={emp.id} className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {emp.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{emp.name}</p>
                  <p className="text-sm text-gray-500">
                    {emp.competencies.map((c) => c.name).join(', ') || 'Ingen kompetencer'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{emp.weeklyHours}t/uge</p>
                  <p className="text-xs text-gray-500">normtid</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
