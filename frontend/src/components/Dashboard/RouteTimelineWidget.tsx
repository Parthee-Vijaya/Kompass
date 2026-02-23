import { cn } from '@/lib/utils'

interface TimelineRoute {
  employeeName: string
  initials: string
  color: string
  blocks: { start: number; end: number; label: string; type: 'task' | 'travel' | 'break' }[]
}

const HOURS_START = 7
const HOURS_END = 17
const TOTAL_HOURS = HOURS_END - HOURS_START

export const MOCK_TIMELINE_ROUTES: TimelineRoute[] = [
  {
    employeeName: 'Anna Sørensen',
    initials: 'AS',
    color: '#3366ff',
    blocks: [
      { start: 7.5, end: 8.5, label: 'Kordilgade 77', type: 'task' },
      { start: 8.5, end: 8.75, label: '', type: 'travel' },
      { start: 8.75, end: 9.75, label: 'Møllevangen 5', type: 'task' },
      { start: 9.75, end: 10, label: '', type: 'travel' },
      { start: 10, end: 11, label: 'Nørrevang 12', type: 'task' },
      { start: 11, end: 11.5, label: 'Pause', type: 'break' },
      { start: 11.5, end: 12.5, label: 'Skovvej 3', type: 'task' },
      { start: 12.5, end: 12.75, label: '', type: 'travel' },
      { start: 12.75, end: 14, label: 'Elmegade 8', type: 'task' },
    ],
  },
  {
    employeeName: 'Bo Nielsen',
    initials: 'BN',
    color: '#8b5cf6',
    blocks: [
      { start: 8, end: 9.25, label: 'Holbækvej 44', type: 'task' },
      { start: 9.25, end: 9.5, label: '', type: 'travel' },
      { start: 9.5, end: 10.5, label: 'Klosterparkvej 7', type: 'task' },
      { start: 10.5, end: 11, label: 'Lindegade 19', type: 'task' },
      { start: 11, end: 11.5, label: 'Pause', type: 'break' },
      { start: 11.5, end: 13, label: 'Slagelsevej 92', type: 'task' },
      { start: 13, end: 13.25, label: '', type: 'travel' },
      { start: 13.25, end: 14.5, label: 'Gyldenvej 12', type: 'task' },
    ],
  },
  {
    employeeName: 'Carla Jensen',
    initials: 'CJ',
    color: '#10b981',
    blocks: [
      { start: 7, end: 8, label: 'Havnevej 2', type: 'task' },
      { start: 8, end: 8.5, label: '', type: 'travel' },
      { start: 8.5, end: 10, label: 'Nyvej 15', type: 'task' },
      { start: 10, end: 10.5, label: 'Pause', type: 'break' },
      { start: 10.5, end: 11.75, label: 'Birkevej 4', type: 'task' },
      { start: 11.75, end: 12, label: '', type: 'travel' },
      { start: 12, end: 13.5, label: 'Asnæsvej 31', type: 'task' },
    ],
  },
  {
    employeeName: 'David Petersen',
    initials: 'DP',
    color: '#f59e0b',
    blocks: [
      { start: 8, end: 9, label: 'Skovbrynet 7', type: 'task' },
      { start: 9, end: 9.25, label: '', type: 'travel' },
      { start: 9.25, end: 10.5, label: 'Parkvej 11', type: 'task' },
      { start: 10.5, end: 12, label: 'Vestergade 23', type: 'task' },
      { start: 12, end: 12.5, label: 'Pause', type: 'break' },
      { start: 12.5, end: 14, label: 'Strandvej 56', type: 'task' },
      { start: 14, end: 14.25, label: '', type: 'travel' },
      { start: 14.25, end: 15.5, label: 'Havnevej 18', type: 'task' },
    ],
  },
]

function toPercent(hour: number): number {
  return ((hour - HOURS_START) / TOTAL_HOURS) * 100
}

export function RouteTimelineWidget({ routes = MOCK_TIMELINE_ROUTES }: { routes?: TimelineRoute[] }) {
  const hourMarkers = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => HOURS_START + i)

  return (
    <div className="space-y-3">
      {/* Hour labels */}
      <div className="relative h-5 ml-[72px]">
        {hourMarkers.map((h) => (
          <span
            key={h}
            className="absolute text-[10px] font-mono text-gray-400 -translate-x-1/2"
            style={{ left: `${toPercent(h)}%` }}
          >
            {String(h).padStart(2, '0')}
          </span>
        ))}
      </div>

      {/* Rows */}
      {routes.map((route) => (
        <div key={route.employeeName} className="flex items-center gap-3">
          <div className="w-[60px] shrink-0 flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: route.color }}
            >
              {route.initials}
            </div>
            <span className="text-[11px] font-medium text-gray-600 truncate hidden sm:block">
              {route.employeeName.split(' ')[0]}
            </span>
          </div>

          <div className="flex-1 relative h-7 bg-gray-100/60 rounded-lg overflow-hidden">
            {/* Grid lines */}
            {hourMarkers.map((h) => (
              <div
                key={h}
                className="absolute top-0 bottom-0 w-px bg-gray-200/50"
                style={{ left: `${toPercent(h)}%` }}
              />
            ))}

            {/* Blocks */}
            {route.blocks.map((block, i) => {
              const left = toPercent(block.start)
              const width = toPercent(block.end) - left
              return (
                <div
                  key={i}
                  className={cn(
                    'absolute top-1 bottom-1 rounded-md flex items-center justify-center overflow-hidden transition-opacity',
                    block.type === 'task' && 'text-white text-[9px] font-medium',
                    block.type === 'travel' && 'opacity-40',
                    block.type === 'break' && 'opacity-30',
                  )}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: block.type === 'break' ? '#94a3b8' : route.color,
                    minWidth: 2,
                  }}
                  title={block.label || block.type}
                >
                  {block.type === 'task' && width > 5 && (
                    <span className="truncate px-1">{block.label}</span>
                  )}
                </div>
              )
            })}

            {/* Current time indicator */}
            {(() => {
              const now = new Date()
              const currentHour = now.getHours() + now.getMinutes() / 60
              if (currentHour >= HOURS_START && currentHour <= HOURS_END) {
                return (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-danger-500 z-10"
                    style={{ left: `${toPercent(currentHour)}%` }}
                  />
                )
              }
              return null
            })()}
          </div>
        </div>
      ))}
    </div>
  )
}
