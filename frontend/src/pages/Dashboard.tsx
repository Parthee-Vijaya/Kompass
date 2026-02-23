import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  Users,
  TrendingUp,
  Route,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ShieldCheck,
  MapPin,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Activity,
  CalendarClock,
  CircleDot,
  Clock,
  ExternalLink,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Label,
} from 'recharts'
import { api } from '@/services/api'
import { wsService } from '@/services/websocket'
import { cn } from '@/lib/utils'
import { useCountUp } from '@/hooks/useCountUp'
import { StaggerContainer, StaggerItem } from '@/components/ui/Stagger'
import { RouteTimelineWidget } from '@/components/Dashboard/RouteTimelineWidget'

// ── Mock data ─────────────────────────────────────────────────────

const today = new Date()
const daysAgo = (n: number): string => {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const MOCK_EFFICIENCY_TREND = Array.from({ length: 14 }, (_, i) => ({
  date: daysAgo(13 - i),
  efficiency: Math.round(72 + Math.random() * 18),
  routeCount: Math.round(2 + Math.random() * 5),
  tasks: Math.round(8 + Math.random() * 20),
}))

const MOCK_STATS = {
  date: daysAgo(0),
  tasks: { total: 34, completed: 28, completionRate: 82 },
  employees: { active: 5, total: 8, utilizationRate: 78 },
  routes: { count: 5, avgEfficiency: 87, totalDistanceKm: 142, totalDurationHours: 6.2 },
}

const MOCK_EMPLOYEES = [
  { id: '1', name: 'Anna Sørensen', email: 'anna@kompass.dk', weeklyHours: 37, competencies: [{ id: 'c1', name: 'Personlig pleje' }, { id: 'c2', name: 'Medicinhåndtering' }], isActive: true, createdAt: '', updatedAt: '' },
  { id: '2', name: 'Bo Nielsen', email: 'bo@kompass.dk', weeklyHours: 37, competencies: [{ id: 'c3', name: 'Rengøring' }], isActive: true, createdAt: '', updatedAt: '' },
  { id: '3', name: 'Carla Jensen', email: 'carla@kompass.dk', weeklyHours: 32, competencies: [{ id: 'c1', name: 'Personlig pleje' }], isActive: true, createdAt: '', updatedAt: '' },
  { id: '4', name: 'David Petersen', email: 'david@kompass.dk', weeklyHours: 37, competencies: [{ id: 'c3', name: 'Rengøring' }, { id: 'c4', name: 'Indkøb' }], isActive: true, createdAt: '', updatedAt: '' },
  { id: '5', name: 'Emma Larsen', email: 'emma@kompass.dk', weeklyHours: 37, competencies: [{ id: 'c2', name: 'Medicinhåndtering' }], isActive: false, createdAt: '', updatedAt: '' },
  { id: '6', name: 'Frederik Holm', email: 'frederik@kompass.dk', weeklyHours: 30, competencies: [{ id: 'c1', name: 'Personlig pleje' }, { id: 'c3', name: 'Rengøring' }], isActive: true, createdAt: '', updatedAt: '' },
]

const MOCK_TASK_DIST = {
  byPriority: { urgent: 3, high: 8, normal: 18, low: 5 },
}

const MOCK_NEXT_ACTIONS = [
  { id: 'a1', label: 'Optimer ruter for i morgen', desc: '6 medarbejdere, 32 opgaver endnu ikke optimeret', type: 'optimize' as const, urgent: true },
  { id: 'a2', label: 'Tjek compliance-advarsler', desc: 'Bo Nielsen nærmer sig 48-timers grænsen', type: 'compliance' as const, urgent: true },
  { id: 'a3', label: 'Godkend vagtbytte', desc: 'Anna Sørensen ↔ Carla Jensen, tirsdag', type: 'staffing' as const, urgent: false },
  { id: 'a4', label: 'Ny opgave uden tildeling', desc: 'Rengøring – Gyldenvej 12, 4400 Kalundborg', type: 'task' as const, urgent: false },
]

const MOCK_ACTIVITY = [
  { id: 'f1', time: '09:42', text: 'Anna Sørensen startede rute A-07', color: 'text-primary-500' },
  { id: 'f2', time: '09:35', text: 'Rute B-03 optimeret — 12% kortere', color: 'text-success-600' },
  { id: 'f3', time: '09:21', text: 'Ny akutopgave: Medicinlevering, Kordilgade 77', color: 'text-accent-400' },
  { id: 'f4', time: '08:55', text: 'David Petersen ankommet til Møllevangen 5', color: 'text-primary-500' },
  { id: 'f5', time: '08:30', text: 'Daglige ruter genereret for 5 medarbejdere', color: 'text-gray-400' },
  { id: 'f6', time: '08:15', text: 'Bo Nielsen markeret syg — rute C-01 genfordelt', color: 'text-danger-500' },
  { id: 'f7', time: '08:02', text: 'Compliance-tjek OK for alle aktive medarbejdere', color: 'text-success-600' },
  { id: 'f8', time: '07:45', text: 'System startet — morgenoversigt genereret', color: 'text-gray-400' },
]

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f59e0b',
  normal: '#3366ff',
  low: '#94a3b8',
}

const EMPLOYEE_COLORS = ['#3366ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

// ── Component ─────────────────────────────────────────────────────

export function Dashboard() {
  const navigate = useNavigate()
  const todayStr = today.toISOString().slice(0, 10)

  const { data: apiStats } = useQuery({
    queryKey: ['dashboard', todayStr],
    queryFn: () => api.analytics.dashboard(todayStr),
    refetchInterval: 60_000,
    retry: 1,
  })
  const stats = apiStats ?? MOCK_STATS

  const { data: apiTrend } = useQuery({
    queryKey: ['efficiency-trend'],
    queryFn: () => api.analytics.efficiencyTrend(14),
    retry: 1,
  })
  const trend = apiTrend && apiTrend.length > 0 ? apiTrend : MOCK_EFFICIENCY_TREND

  const { data: apiEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: api.employees.list,
    retry: 1,
  })
  const employees = apiEmployees && apiEmployees.length > 0 ? apiEmployees : MOCK_EMPLOYEES

  useEffect(() => {
    wsService.connect()
    return () => wsService.disconnect()
  }, [])

  const pieData = useMemo(() => {
    const d = MOCK_TASK_DIST.byPriority
    return Object.entries(d).map(([name, value]) => ({ name, value }))
  }, [])

  const totalTasks = Object.values(MOCK_TASK_DIST.byPriority).reduce((a, b) => a + b, 0)

  const animatedEfficiency = useCountUp(stats.routes.avgEfficiency, 1400)
  const animatedTasks = useCountUp(stats.tasks.total, 800)
  const animatedCompleted = useCountUp(stats.tasks.completed, 1000)

  const statCards = [
    {
      label: 'Opgaver i dag',
      value: animatedTasks,
      suffix: '',
      sub: `${animatedCompleted} fuldført`,
      change: stats.tasks.completionRate,
      changeSuffix: '%',
      positive: stats.tasks.completionRate >= 75,
      icon: ClipboardList,
      iconColor: 'text-primary-500',
      iconBg: 'bg-primary-500/10',
    },
    {
      label: 'Aktive medarbejdere',
      value: stats.employees.active,
      suffix: `/${stats.employees.total}`,
      sub: 'på rute i dag',
      change: stats.employees.utilizationRate,
      changeSuffix: '%',
      positive: stats.employees.utilizationRate >= 70,
      icon: Users,
      iconColor: 'text-violet-500',
      iconBg: 'bg-violet-500/10',
    },
    {
      label: 'Total distance',
      value: stats.routes.totalDistanceKm,
      suffix: ' km',
      sub: `${stats.routes.totalDurationHours}t køretid`,
      change: stats.routes.count,
      changeSuffix: ' ruter',
      positive: true,
      icon: Route,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10',
    },
    {
      label: 'Gns. køretid',
      value: Math.round(stats.routes.totalDurationHours / Math.max(stats.routes.count, 1) * 60),
      suffix: ' min',
      sub: 'per rute',
      change: -4.2,
      changeSuffix: '%',
      positive: true,
      icon: Clock,
      iconColor: 'text-accent-500',
      iconBg: 'bg-accent-400/10',
    },
  ]

  const greetingHour = today.getHours()
  const greeting = greetingHour < 12 ? 'God morgen' : greetingHour < 17 ? 'God eftermiddag' : 'God aften'

  return (
    <StaggerContainer className="space-y-6">
      {/* ── Header ── */}
      <StaggerItem>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <p className="section-title mb-1.5">Overblik</p>
            <h1 className="heading-display text-3xl sm:text-4xl text-gray-900">{greeting}, Planlægger</h1>
            <p className="text-[13px] text-gray-500 mt-1">
              {today.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {' · '}Kalundborg Kommune
            </p>
          </div>
        </div>
      </StaggerItem>

      {/* ── North Star KPI ── */}
      <StaggerItem>
        <div className="north-star-banner rounded-2xl p-6 sm:p-8 text-white">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-[0.15em] text-white/35 mb-3 font-medium">
                Planlagt effektivitet i dag
              </p>
              <div className="flex items-baseline gap-3">
                <span className="data-value text-5xl sm:text-6xl font-semibold tracking-tighter">
                  {animatedEfficiency}%
                </span>
                <span className="flex items-center gap-1 text-sm font-medium text-emerald-400">
                  <ArrowUpRight className="w-4 h-4" /> +2.1pp
                </span>
              </div>
              <p className="text-[13px] text-white/40 mt-3">
                <span className="data-value">{stats.routes.count}</span> ruter
                {' · '}<span className="data-value">{stats.tasks.total}</span> opgaver
                {' · '}<span className="data-value">{stats.employees.active}</span> medarbejdere aktive
              </p>
            </div>
            <div className="w-full sm:w-64 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend.slice(-7)}>
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#598dff" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#598dff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="efficiency" stroke="#598dff" strokeWidth={2} fill="url(#sparkGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* ── Stat cards ── */}
      <StaggerItem>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="stat-card group">
              <div className="flex items-center justify-between mb-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', card.iconBg)}>
                  <card.icon className={cn('w-5 h-5', card.iconColor)} />
                </div>
                <span className={cn('inline-flex items-center gap-0.5 text-[11px] font-semibold', card.positive ? 'text-success-600' : 'text-danger-500')}>
                  {card.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {typeof card.change === 'number' && card.change > 0 ? '+' : ''}{card.change}{card.changeSuffix}
                </span>
              </div>
              <p className="data-value text-2xl text-gray-900">
                {card.value}<span className="text-base text-gray-400">{card.suffix}</span>
              </p>
              <p className="text-[12px] text-gray-500 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>
      </StaggerItem>

      {/* ── Next Actions + Activity ── */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Next Best Actions */}
          <div className="lg:col-span-3 glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/30 flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-400" />
              <h2 className="font-semibold text-gray-900 text-[15px]">Næste skridt</h2>
              <span className="badge badge-warning ml-2">2 akutte</span>
            </div>
            <div className="divide-y divide-gray-100/50">
              {MOCK_NEXT_ACTIONS.map((action) => (
                <button key={action.id} className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-white/30 transition-colors group">
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                    action.type === 'optimize' && 'bg-primary-500/10 text-primary-500',
                    action.type === 'compliance' && 'bg-accent-400/10 text-accent-500',
                    action.type === 'staffing' && 'bg-violet-500/10 text-violet-500',
                    action.type === 'task' && 'bg-success-500/10 text-success-600',
                  )}>
                    {action.type === 'optimize' && <Route className="w-4 h-4" />}
                    {action.type === 'compliance' && <ShieldCheck className="w-4 h-4" />}
                    {action.type === 'staffing' && <CalendarClock className="w-4 h-4" />}
                    {action.type === 'task' && <MapPin className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {action.label}
                      {action.urgent && <span className="w-1.5 h-1.5 rounded-full bg-danger-500 animate-pulse-soft shrink-0" />}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{action.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/30 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900 text-[15px]">Live aktivitet</h2>
            </div>
            <div className="divide-y divide-gray-100/50 max-h-[340px] overflow-y-auto scrollbar-thin">
              {MOCK_ACTIVITY.map((item) => (
                <div key={item.id} className="flex items-start gap-3 px-5 py-3">
                  <CircleDot className={cn('w-3 h-3 mt-1 shrink-0', item.color)} />
                  <div className="min-w-0">
                    <p className="text-[13px] text-gray-700 leading-snug">{item.text}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* ── Charts ── */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Efficiency trend */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-gray-900 text-[15px]">Effektivitet</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Sidste 14 dage · Gennemsnit: <span className="data-value">{Math.round(trend.reduce((s, t) => s + (t.efficiency ?? 0), 0) / trend.length)}%</span></p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3366ff" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#3366ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => new Date(d).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })}
                    tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: '"JetBrains Mono"' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[50, 100]}
                    tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: '"JetBrains Mono"' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.5)',
                      background: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                      fontSize: 12,
                      fontFamily: '"DM Sans"',
                    }}
                    formatter={(v: number) => [`${v}%`, 'Effektivitet']}
                    labelFormatter={(d) => new Date(d).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })}
                  />
                  <Area
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#3366ff"
                    strokeWidth={2.5}
                    fill="url(#effGrad)"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2.5, fill: '#fff', stroke: '#3366ff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut chart */}
          <div className="glass-card rounded-2xl p-5 flex flex-col">
            <h2 className="font-semibold text-gray-900 text-[15px] mb-0.5">Opgave-prioritet</h2>
            <p className="text-[11px] text-gray-400 mb-4"><span className="data-value">{totalTasks}</span> opgaver i dag</p>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-44 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? '#94a3b8'} />
                      ))}
                      <Label
                        content={() => (
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                            <tspan x="50%" dy="-6" className="data-value" fontSize="22" fill="#0f172a">{totalTasks}</tspan>
                            <tspan x="50%" dy="18" fontSize="10" fill="#94a3b8">opgaver</tspan>
                          </text>
                        )}
                      />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
              {pieData.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-[11px]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[p.name] }} />
                  <span className="text-gray-500">{p.name === 'urgent' ? 'Akut' : p.name === 'high' ? 'Høj' : p.name === 'normal' ? 'Normal' : 'Lav'}</span>
                  <span className="ml-auto data-value text-gray-900">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* ── Route Timeline ── */}
      <StaggerItem>
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900 text-[15px]">Ruter i dag</h2>
              <span className="text-[11px] text-gray-400 ml-1">Tidslinje 07:00 – 17:00</span>
            </div>
            <button
              onClick={() => navigate('/routes')}
              className="text-[12px] text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1 transition-colors"
            >
              Se alle <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="p-5">
            <RouteTimelineWidget />
          </div>
        </div>
      </StaggerItem>

      {/* ── Bar chart ── */}
      <StaggerItem>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900 text-[15px]">Ruter & opgaver per dag</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Sidste 14 dage</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 0, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => new Date(d).toLocaleDateString('da-DK', { weekday: 'short' })}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: '"JetBrains Mono"' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: '"JetBrains Mono"' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                    fontSize: 12,
                  }}
                  labelFormatter={(d) => new Date(d).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })}
                />
                <Bar dataKey="routeCount" name="Ruter" fill="#3366ff" radius={[6, 6, 0, 0]} barSize={16} />
                <Bar dataKey="tasks" name="Opgaver" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </StaggerItem>

      {/* ── Employee compliance ── */}
      <StaggerItem>
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900 text-[15px]">Compliance-status</h2>
            </div>
            <span className="text-[11px] text-gray-400 data-value">{employees.length} medarbejdere</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100/60 bg-white/20">
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Medarbejder</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Kompetencer</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Timer/uge</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">11-t hvile</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">48-t regel</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/40">
                {employees.slice(0, 6).map((emp, idx) => {
                  const hasViolation = idx === 1
                  const hasWarning = idx === 4
                  const complianceOk = !hasViolation && !hasWarning
                  const weeklyUsed = emp.weeklyHours + (hasViolation ? 10 : hasWarning ? 6 : Math.round(Math.random() * 2 - 1))
                  const color = EMPLOYEE_COLORS[idx % EMPLOYEE_COLORS.length]

                  return (
                    <tr key={emp.id} className="hover:bg-white/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: color }}
                          >
                            {emp.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {emp.competencies.map((c) => (
                            <span key={c.id} className="badge badge-neutral">{c.name}</span>
                          ))}
                          {emp.competencies.length === 0 && <span className="text-[10px] text-gray-300">—</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="data-value text-sm text-gray-900">{weeklyUsed}t</span>
                        <span className="text-[10px] text-gray-400"> / {emp.weeklyHours}t</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn('badge', complianceOk ? 'badge-success' : hasViolation ? 'badge-danger' : 'badge-warning')}>
                          {complianceOk ? 'OK' : hasViolation ? 'Brud' : 'Advarsel'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200/50 rounded-full overflow-hidden max-w-[80px]">
                            <div
                              className={cn('h-full rounded-full transition-all', weeklyUsed > 45 ? 'bg-danger-500' : weeklyUsed > 40 ? 'bg-accent-400' : 'bg-success-500')}
                              style={{ width: `${Math.min(100, (weeklyUsed / 48) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400 data-value">{weeklyUsed}/48</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {complianceOk ? (
                          <CheckCircle2 className="w-4 h-4 text-success-500" />
                        ) : hasViolation ? (
                          <AlertTriangle className="w-4 h-4 text-danger-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-accent-400" />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </StaggerItem>
    </StaggerContainer>
  )
}
