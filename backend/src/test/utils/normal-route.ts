import { PrismaClient } from '@prisma/client'
import { haversineKm } from './haversine.js'

/**
 * Create a "normal" (manual) route: assign all tasks for the date to one employee
 * in nearest-neighbour order from home. Compute total distance and duration.
 */
export async function createNormalRoute(
  prisma: PrismaClient,
  date: string,
  employeeId: string,
  taskIds: string[]
): Promise<{ totalDistanceKm: number; totalDurationMinutes: number }> {
  const employee = await prisma.employee.findUniqueOrThrow({
    where: { id: employeeId },
  })
  const homeLat = employee.homeLatitude ?? 55.6794
  const homeLng = employee.homeLongitude ?? 11.0886

  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIds } },
    include: { client: true },
    orderBy: { createdAt: 'asc' },
  })

  if (tasks.length === 0) throw new Error('No tasks for normal route')

  const withDistance = tasks.map((t) => ({
    task: t,
    distFromHome: haversineKm(
      homeLat,
      homeLng,
      t.client.latitude,
      t.client.longitude
    ),
  }))

  let currentLat = homeLat
  let currentLng = homeLng
  const ordered: typeof tasks = []
  const remaining = [...withDistance]

  while (remaining.length > 0) {
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(
        currentLat,
        currentLng,
        remaining[i].task.client.latitude,
        remaining[i].task.client.longitude
      )
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    }
    const next = remaining.splice(best, 1)[0]
    ordered.push(next.task)
    currentLat = next.task.client.latitude
    currentLng = next.task.client.longitude
  }

  const targetDate = new Date(date)
  targetDate.setHours(8, 0, 0, 0)
  const avgSpeedKmh = 30
  let totalDistanceKm = 0
  let currentMinutes = 8 * 60

  const route = await prisma.route.create({
    data: {
      employeeId,
      date: new Date(date),
      status: 'planned',
    },
  })

  for (let i = 0; i < ordered.length; i++) {
    const task = ordered[i]
    const prevLat = i === 0 ? homeLat : ordered[i - 1].client.latitude
    const prevLng = i === 0 ? homeLng : ordered[i - 1].client.longitude
    const segKm = haversineKm(
      prevLat,
      prevLng,
      task.client.latitude,
      task.client.longitude
    )
    totalDistanceKm += segKm
    const travelMinutes = Math.max(1, Math.ceil((segKm / avgSpeedKmh) * 60))
    const startTime = new Date(targetDate)
    startTime.setMinutes(currentMinutes)
    currentMinutes += travelMinutes + task.durationMinutes
    const endTime = new Date(targetDate)
    endTime.setMinutes(currentMinutes)

    await prisma.assignment.create({
      data: {
        routeId: route.id,
        employeeId,
        taskId: task.id,
        startTime,
        endTime,
        routeOrder: i,
        travelMinutes,
        status: 'pending',
      },
    })
  }

  const totalDurationMinutes = currentMinutes - 8 * 60
  await prisma.route.update({
    where: { id: route.id },
    data: { totalDistanceKm, totalDurationMinutes },
  })

  return { totalDistanceKm, totalDurationMinutes }
}
