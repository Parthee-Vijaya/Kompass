import { useMemo } from 'react'
import {
  CalendarClock,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { cn } from '@/lib/utils'
import { StaggerContainer, StaggerItem } from '@/components/ui/Stagger'
import { useCountUp } from '@/hooks/useCountUp'

const WEEK_LABELS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']

const MOCK_CAPACITY = Array.from({ length: 28 }, (_, i) => {
  const dayIdx = i % 7
  const isWeekend = dayIdx >= 5
  const base = isWeekend ? 2 : 5
  const demand = isWeekend ? Math.round(1 + Math.random() * 2) : Math.round(3 + Math.random() * 4)
  return {
    day: `${WEEK_LABELS[dayIdx]} ${Math.floor(i / 7) + 1}`,
    capacity: base,
    demand,
    gap: Math.max(0, demand - base),
  }
})

const MOCK_WEEKLY = [
  { week: 'Uge 8', needed: 6, available: 5, utilization: 92 },
  { week: 'Uge 9', needed: 6, available: 6, utilization: 87 },
  { week: 'Uge 10', needed: 7, available: 5, utilization: 95 },
  { week: 'Uge 11', needed: 5, available: 5, utilization: 78 },
]

const MOCK_EMPLOYEES_HOURS = [
  { name: 'Anna Sørensen', planned: 35, max: 37, complianceOk: true },
  { name: 'Bo Nielsen', planned: 42, max: 37, complianceOk: false },
  { name: 'Carla Jensen', planned: 30, max: 32, complianceOk: true },
  { name: 'David Petersen', planned: 36, max: 37, complianceOk: true },
  { name: 'Frederik Holm', planned: 29, max: 30, complianceOk: true },
  { name: 'Gitte Andersen', planned: 37, max: 37, complianceOk: true },
]

const EMPLOYEE_COLORS = ['#3366ff', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899']

export function Staffing() {
  const utilization = useCountUp(88, 1200)
  const gapDays = useMemo(() => MOCK_CAPACITY.filter((d) => d.gap > 0).length, [])

  return (
    <StaggerContainer className="space-y-5">
      <StaggerItem>
        <div>
          <p className="section-title mb-1.5">Strategi</p>
          <h1 className="heading-display text-3xl text-gray-900">Bemandingsplanlægning</h1>
          <p className="text-[13px] text-gray-500 mt-1">4-ugers prognose · Kapacitetsanalyse og overenskomst</p>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Udnyttelsesgrad', value: `${utilization}%`, icon: TrendingUp, iconColor: 'text-primary-500', iconBg: 'bg-primary-500/10', change: '+3.2pp', positive: true },
            { label: 'Dage med underbemanding', value: `${gapDays}`, icon: AlertTriangle, iconColor: 'text-accent-500', iconBg: 'bg-accent-400/10', change: `af ${MOCK_CAPACITY.length}`, positive: gapDays < 5 },
            { label: 'Aktive medarbejdere', value: '6', icon: Users, iconColor: 'text-violet-500', iconBg: 'bg-violet-500/10', change: 'af 8', positive: true },
            { label: 'Compliance-brud', value: '1', icon: AlertTriangle, iconColor: 'text-danger-500', iconBg: 'bg-danger-500/10', change: 'Bo Nielsen', positive: false },
          ].map((card) => (
            <div key={card.label} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', card.iconBg)}><card.icon className={cn('w-4 h-4', card.iconColor)} /></div>
                <span className={cn('text-[10px] font-medium', card.positive ? 'text-success-600' : 'text-danger-500')}>{card.change}</span>
              </div>
              <p className="data-value text-2xl text-gray-900">{card.value}</p>
              <p className="text-[11px] text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 text-[15px] mb-1">Kapacitet vs. behov</h2>
          <p className="text-[11px] text-gray-400 mb-5">4-ugers overblik — <span className="inline-block w-2 h-2 rounded-full bg-primary-500" /> kapacitet <span className="inline-block w-2 h-2 rounded-full bg-accent-400 ml-2" /> behov</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CAPACITY} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8', fontFamily: '"JetBrains Mono"' }} axisLine={false} tickLine={false} interval={0} angle={-45} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: '"JetBrains Mono"' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 25px rgba(0,0,0,0.08)', fontSize: 12 }}
                />
                <Bar dataKey="capacity" name="Kapacitet" fill="#3366ff" radius={[4, 4, 0, 0]} barSize={8} />
                <Bar dataKey="demand" name="Behov" radius={[4, 4, 0, 0]} barSize={8}>
                  {MOCK_CAPACITY.map((entry, i) => (
                    <Cell key={i} fill={entry.gap > 0 ? '#ff9f43' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/30 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900 text-[15px]">Ugentlig oversigt</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100/60 bg-white/20">
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Uge</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Behov</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Tilgængelige</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Udnyttelse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/40">
                {MOCK_WEEKLY.map((w) => (
                  <tr key={w.week} className="hover:bg-white/20">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{w.week}</td>
                    <td className="px-5 py-3 data-value text-sm">{w.needed}</td>
                    <td className="px-5 py-3">
                      <span className={cn('data-value text-sm', w.available < w.needed ? 'text-danger-500' : 'text-gray-900')}>{w.available}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200/50 rounded-full overflow-hidden max-w-[80px]">
                          <div className={cn('h-full rounded-full', w.utilization > 90 ? 'bg-accent-400' : 'bg-primary-500')} style={{ width: `${w.utilization}%` }} />
                        </div>
                        <span className="data-value text-[11px] text-gray-500">{w.utilization}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/30 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900 text-[15px]">Timer denne uge</h2>
            </div>
            <div className="divide-y divide-gray-100/40">
              {MOCK_EMPLOYEES_HOURS.map((emp, idx) => (
                <div key={emp.name} className="flex items-center gap-3 px-5 py-3 hover:bg-white/20 transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ backgroundColor: EMPLOYEE_COLORS[idx % EMPLOYEE_COLORS.length] }}>
                    {emp.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{emp.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', emp.planned > emp.max ? 'bg-danger-500' : emp.planned > emp.max * 0.9 ? 'bg-accent-400' : 'bg-success-500')} style={{ width: `${Math.min(100, (emp.planned / 48) * 100)}%` }} />
                      </div>
                      <span className="data-value text-[10px] text-gray-500 w-12 text-right">{emp.planned}/{emp.max}t</span>
                    </div>
                  </div>
                  {emp.complianceOk ? <CheckCircle2 className="w-3.5 h-3.5 text-success-500 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 text-danger-500 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </StaggerItem>
    </StaggerContainer>
  )
}
