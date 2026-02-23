import {
  KALUNDBORG_ADDRESSES,
  KALUNDBORG_CENTER,
  MOCK_DRIVERS,
  type MockAddress,
} from '@/data/kalundborg-addresses'
import type { Route, Assignment, Employee, Task, Client } from '@/services/api'

export interface OptimizeParams {
  driverCount: number
  startHour: number      // e.g. 7
  endHour: number        // e.g. 16
  travelMinutes: number  // avg travel time between stops
  breakMinutes: number   // lunch break duration
  breakAfterHours: number // take break after N hours
}

export const DEFAULT_PARAMS: OptimizeParams = {
  driverCount: 3,
  startHour: 7,
  endHour: 16,
  travelMinutes: 8,
  breakMinutes: 30,
  breakAfterHours: 4,
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function angleFromCenter(addr: MockAddress): number {
  return Math.atan2(addr.lng - KALUNDBORG_CENTER.lng, addr.lat - KALUNDBORG_CENTER.lat)
}

function nearestNeighborSort(addresses: MockAddress[], startLat: number, startLng: number): MockAddress[] {
  const remaining = [...addresses]
  const sorted: MockAddress[] = []
  let curLat = startLat
  let curLng = startLng

  while (remaining.length > 0) {
    let bestIdx = 0
    let bestDist = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(curLat, curLng, remaining[i]!.lat, remaining[i]!.lng)
      if (d < bestDist) {
        bestDist = d
        bestIdx = i
      }
    }
    const next = remaining.splice(bestIdx, 1)[0]!
    sorted.push(next)
    curLat = next.lat
    curLng = next.lng
  }
  return sorted
}

export function optimizeRoutes(params: OptimizeParams, date: string): Route[] {
  const addresses = [...KALUNDBORG_ADDRESSES]
  const driverCount = Math.max(1, Math.min(params.driverCount, MOCK_DRIVERS.length))
  const drivers = MOCK_DRIVERS.slice(0, driverCount)

  // Step 1: cluster addresses by angular sector around Kalundborg center
  addresses.sort((a, b) => angleFromCenter(a) - angleFromCenter(b))

  const perDriver = Math.ceil(addresses.length / driverCount)
  const clusters: MockAddress[][] = []
  for (let i = 0; i < driverCount; i++) {
    clusters.push(addresses.slice(i * perDriver, (i + 1) * perDriver))
  }

  // Step 2: within each cluster, sort by nearest-neighbor from driver home
  const routes: Route[] = drivers.map((driver, dIdx) => {
    const cluster = clusters[dIdx] ?? []
    const sorted = nearestNeighborSort(cluster, driver.homeLat, driver.homeLng)

    const workMinutes = (params.endHour - params.startHour) * 60
    let currentMinute = 0
    let breakTaken = false
    const assignments: Assignment[] = []
    let totalDistance = 0
    let prevLat = driver.homeLat
    let prevLng = driver.homeLng

    for (let i = 0; i < sorted.length; i++) {
      const addr = sorted[i]!

      // Insert break
      if (!breakTaken && currentMinute >= params.breakAfterHours * 60) {
        currentMinute += params.breakMinutes
        breakTaken = true
      }

      // Travel
      const dist = haversineKm(prevLat, prevLng, addr.lat, addr.lng)
      totalDistance += dist
      currentMinute += params.travelMinutes

      // Check if we still have time
      if (currentMinute + addr.durationMinutes > workMinutes) break

      const startMinute = currentMinute
      currentMinute += addr.durationMinutes

      const startTime = new Date(`${date}T00:00:00`)
      startTime.setHours(params.startHour, startMinute, 0, 0)
      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + addr.durationMinutes)

      const client: Client = {
        id: addr.id,
        name: addr.name,
        address: addr.address,
        latitude: addr.lat,
        longitude: addr.lng,
      }
      const task: Task = {
        id: `t-${addr.id}`,
        title: addr.priority === 'urgent' ? 'Akut besøg' : addr.priority === 'high' ? 'Medicinering' : addr.durationMinutes >= 35 ? 'Personlig pleje' : 'Rengøring',
        clientId: addr.id,
        client,
        durationMinutes: addr.durationMinutes,
        priority: addr.priority,
        status: 'assigned',
        requiredCompetencies: [],
      }

      assignments.push({
        id: `asgn-${dIdx}-${i}`,
        routeId: `route-${driver.id}`,
        employeeId: driver.id,
        taskId: task.id,
        task,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        routeOrder: i,
        travelMinutes: params.travelMinutes,
        isLocked: false,
        status: 'pending',
      })

      prevLat = addr.lat
      prevLng = addr.lng
    }

    const totalDuration = currentMinute
    const maxPossible = sorted.length
    const assigned = assignments.length
    const efficiency = maxPossible > 0 ? assigned / maxPossible : 0

    const employee: Employee = {
      id: driver.id,
      name: driver.name,
      email: `${driver.name.split(' ')[0]!.toLowerCase()}@kompass.dk`,
      weeklyHours: 37,
      homeLatitude: driver.homeLat,
      homeLongitude: driver.homeLng,
      isActive: true,
      competencies: [],
      createdAt: '',
      updatedAt: '',
    }

    return {
      id: `route-${driver.id}`,
      employeeId: driver.id,
      employee,
      date,
      totalDistanceKm: Math.round(totalDistance * 10) / 10,
      totalDurationMinutes: totalDuration,
      efficiency: Math.round(efficiency * 100) / 100,
      status: 'planned' as const,
      assignments,
    }
  })

  return routes
}

export function getRouteStats(routes: Route[]) {
  const totalTasks = routes.reduce((s, r) => s + r.assignments.length, 0)
  const totalDistance = routes.reduce((s, r) => s + (r.totalDistanceKm ?? 0), 0)
  const avgEfficiency = routes.length > 0
    ? routes.reduce((s, r) => s + (r.efficiency ?? 0), 0) / routes.length
    : 0
  const unassigned = KALUNDBORG_ADDRESSES.length - totalTasks
  return { totalTasks, totalDistance: Math.round(totalDistance * 10) / 10, avgEfficiency: Math.round(avgEfficiency * 100), unassigned }
}
