import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { Route, Assignment } from '@/services/api'

interface RouteTimelineProps {
  routes: Route[]
  selectedEmployeeId?: string | null
  onEmployeeSelect?: (employeeId: string) => void
  onAssignmentClick?: (assignment: Assignment) => void
  startHour?: number
  endHour?: number
}

const EMPLOYEE_COLORS = [
  'bg-sky-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-red-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-lime-500',
]

export function RouteTimeline({
  routes,
  selectedEmployeeId,
  onEmployeeSelect,
  onAssignmentClick,
  startHour = 7,
  endHour = 18,
}: RouteTimelineProps) {
  const hours = useMemo(() => {
    const arr: number[] = []
    for (let h = startHour; h <= endHour; h++) {
      arr.push(h)
    }
    return arr
  }, [startHour, endHour])

  const totalMinutes = (endHour - startHour) * 60

  const getPositionPercent = (time: Date) => {
    const minutes = time.getHours() * 60 + time.getMinutes()
    const startMinutes = startHour * 60
    return Math.max(0, Math.min(100, ((minutes - startMinutes) / totalMinutes) * 100))
  }

  const getWidthPercent = (start: Date, end: Date) => {
    const startPercent = getPositionPercent(start)
    const endPercent = getPositionPercent(end)
    return Math.max(1, endPercent - startPercent)
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with hours */}
        <div className="flex border-b border-gray-200">
          <div className="w-40 flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-700">
            Medarbejder
          </div>
          <div className="flex-1 relative">
            <div className="flex">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-center text-xs text-gray-500 py-2 border-l border-gray-100"
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rows */}
        {routes.map((route, index) => {
          const colorClass = EMPLOYEE_COLORS[index % EMPLOYEE_COLORS.length]
          const isSelected = selectedEmployeeId === route.employeeId

          return (
            <div
              key={route.id}
              className={cn(
                'flex border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer',
                isSelected && 'bg-primary-50 hover:bg-primary-100'
              )}
              onClick={() => onEmployeeSelect?.(route.employeeId)}
            >
              {/* Employee name */}
              <div className="w-40 flex-shrink-0 px-3 py-3 flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded-full', colorClass)} />
                <div className="truncate">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {route.employee?.name || 'Ukendt'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {route.assignments.length} opgaver
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex-1 relative h-16">
                {/* Hour grid lines */}
                <div className="absolute inset-0 flex">
                  {hours.map((hour) => (
                    <div key={hour} className="flex-1 border-l border-gray-100" />
                  ))}
                </div>

                {/* Assignments */}
                {route.assignments
                  .sort((a, b) => a.routeOrder - b.routeOrder)
                  .map((assignment, assignmentIndex) => {
                    const start = new Date(assignment.startTime)
                    const end = new Date(assignment.endTime)
                    const left = getPositionPercent(start)
                    const width = getWidthPercent(start, end)

                    const startTimeStr = start.toLocaleTimeString('da-DK', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })

                    return (
                      <div
                        key={assignment.id}
                        className={cn(
                          'absolute top-2 bottom-2 rounded-md shadow-sm flex items-center px-2 text-white text-xs font-medium overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md',
                          colorClass,
                          isSelected && 'ring-2 ring-offset-1 ring-gray-800'
                        )}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          minWidth: '40px',
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onAssignmentClick?.(assignment)
                        }}
                        title={`${assignment.task?.title || 'Opgave'} (${startTimeStr})`}
                      >
                        <span className="truncate">
                          {assignmentIndex + 1}. {assignment.task?.title || 'Opgave'}
                        </span>
                      </div>
                    )
                  })}

                {/* Travel time indicators */}
                {route.assignments.map((assignment, i) => {
                  if (i === 0 || !assignment.travelMinutes) return null

                  const start = new Date(assignment.startTime)
                  const travelStart = new Date(start.getTime() - assignment.travelMinutes * 60000)
                  const left = getPositionPercent(travelStart)
                  const width = getPositionPercent(start) - left

                  return (
                    <div
                      key={`travel-${assignment.id}`}
                      className="absolute top-1/2 -translate-y-1/2 h-1 bg-gray-300 rounded-full"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                      }}
                      title={`${assignment.travelMinutes} min rejsetid`}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}

        {routes.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <p className="text-sm">Ingen ruter at vise</p>
          </div>
        )}
      </div>
    </div>
  )
}
