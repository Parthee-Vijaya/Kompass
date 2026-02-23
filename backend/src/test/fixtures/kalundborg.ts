import { PrismaClient } from '@prisma/client'

/** Kalundborg kommune approximate bounds (lat/lng) */
const KALUNDBORG_BOUNDS = {
  latMin: 55.63,
  latMax: 55.72,
  lngMin: 11.0,
  lngMax: 11.2,
}

const NUM_ADDRESSES = 105
const COMPETENCY_NAME = 'Rengøring'

export interface KalundborgFixtureResult {
  date: string
  employeeIds: [string, string, string]
  taskIds: string[]
  clientIds: string[]
  competencyId: string
}

/**
 * Seed 100+ clients in Kalundborg kommune, one competency, 3 employees, and tasks for the given date.
 * Returns ids for use in tests. Does not create routes.
 */
export async function seedKalundborgFixture(
  prisma: PrismaClient,
  date: string
): Promise<KalundborgFixtureResult> {
  const targetDate = new Date(date)
  targetDate.setHours(8, 0, 0, 0)

  const competency = await prisma.competency.upsert({
    where: { name: COMPETENCY_NAME },
    update: {},
    create: { name: COMPETENCY_NAME, description: 'Praktisk hjælp og rengøring' },
  })

  const employeeIds: [string, string, string] = [
    await createEmployee(prisma, competency.id, 'Chauffør 1', 55.6794, 11.0886),
    await createEmployee(prisma, competency.id, 'Chauffør 2', 55.685, 11.1),
    await createEmployee(prisma, competency.id, 'Chauffør 3', 55.67, 11.05),
  ]

  const clientIds: string[] = []
  const taskIds: string[] = []

  for (let i = 0; i < NUM_ADDRESSES; i++) {
    const lat =
      KALUNDBORG_BOUNDS.latMin +
      Math.random() * (KALUNDBORG_BOUNDS.latMax - KALUNDBORG_BOUNDS.latMin)
    const lng =
      KALUNDBORG_BOUNDS.lngMin +
      Math.random() * (KALUNDBORG_BOUNDS.lngMax - KALUNDBORG_BOUNDS.lngMin)

    const client = await prisma.client.create({
      data: {
        name: `Kalundborg Borger ${i + 1}`,
        address: `Testvej ${i + 1}, 4400 Kalundborg`,
        latitude: lat,
        longitude: lng,
        phone: '+45 12 34 56 78',
      },
    })
    clientIds.push(client.id)

    const windowStart = new Date(targetDate)
    windowStart.setHours(8 + (i % 8), (i % 4) * 15, 0, 0)
    const windowEnd = new Date(windowStart)
    windowEnd.setHours(17, 0, 0, 0)

    const task = await prisma.task.create({
      data: {
        title: `Opgave ${i + 1}`,
        clientId: client.id,
        durationMinutes: 30,
        windowStart,
        windowEnd,
        status: 'pending',
        requiredCompetencies: { connect: [{ id: competency.id }] },
      },
    })
    taskIds.push(task.id)
  }

  return {
    date,
    employeeIds,
    taskIds,
    clientIds,
    competencyId: competency.id,
  }
}

async function createEmployee(
  prisma: PrismaClient,
  competencyId: string,
  name: string,
  lat: number,
  lng: number
): Promise<string> {
  const e = await prisma.employee.create({
    data: {
      name,
      email: `kalundborg-test-${name.replace(/\s/g, '-').toLowerCase()}-${Date.now()}@kompass.dk`,
      phone: '+45 00 00 00 00',
      weeklyHours: 37,
      homeLatitude: lat,
      homeLongitude: lng,
      isActive: true,
      competencies: { connect: [{ id: competencyId }] },
    },
  })
  return e.id
}

/**
 * Delete all data created by the fixture (clients, tasks, employees, routes, assignments).
 * Uses the returned clientIds, taskIds, employeeIds from seedKalundborgFixture.
 */
export async function cleanupKalundborgFixture(
  prisma: PrismaClient,
  result: KalundborgFixtureResult
): Promise<void> {
  const date = new Date(result.date)
  await prisma.assignment.deleteMany({
    where: {
      taskId: { in: result.taskIds },
      route: { date },
    },
  })
  await prisma.route.deleteMany({
    where: {
      date,
      employeeId: { in: result.employeeIds },
    },
  })
  await prisma.task.deleteMany({ where: { id: { in: result.taskIds } } })
  await prisma.client.deleteMany({ where: { id: { in: result.clientIds } } })
  await prisma.employee.deleteMany({ where: { id: { in: result.employeeIds } } })
}
