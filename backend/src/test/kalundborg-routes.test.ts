/**
 * Integration test: 100+ adresser i Kalundborg kommune.
 * - Opretter en normal (manuel) rute med 1 chauffør.
 * - Optimerer efterfølgende med 1, 2 og 3 chauffører.
 * - Sammenligner total distance og varighed.
 *
 * Kræver: Database (Prisma), Optimizer-service kører (OPTIMIZER_URL i .env).
 * Kør: npm run test -- --run src/test/kalundborg-routes.test.ts
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { prisma } from '../config/database.js'
import { app } from '../index.js'
import {
  seedKalundborgFixture,
  cleanupKalundborgFixture,
} from './fixtures/kalundborg.js'
import { createNormalRoute } from './utils/normal-route.js'

const TEST_DATE = '2026-03-15'

describe('Kalundborg ruter: 100+ adresser, normal rute vs optimeret 1/2/3 chauffører', () => {
  let fixture: Awaited<ReturnType<typeof seedKalundborgFixture>> | undefined

  beforeAll(async () => {
    fixture = await seedKalundborgFixture(prisma, TEST_DATE)
    expect(fixture.taskIds.length).toBeGreaterThanOrEqual(100)
    expect(fixture.employeeIds).toHaveLength(3)
  }, 60_000)

  afterAll(async () => {
    if (fixture) await cleanupKalundborgFixture(prisma, fixture)
  }, 30_000)

  it('opretter normal (manuel) rute med 1 chauffør og alle opgaver', async () => {
    if (!fixture) return
    const { totalDistanceKm, totalDurationMinutes } = await createNormalRoute(
      prisma,
      TEST_DATE,
      fixture.employeeIds[0],
      fixture.taskIds
    )

    const route = await prisma.route.findFirst({
      where: { date: new Date(TEST_DATE), employeeId: fixture!.employeeIds[0] },
      include: { _count: { select: { assignments: true } } },
    })
    expect(route).toBeDefined()
    expect(route!._count.assignments).toBe(fixture!.taskIds.length)
    expect(totalDistanceKm).toBeGreaterThan(0)
    expect(totalDurationMinutes).toBeGreaterThan(0)

    console.log(
      '[Normal rute, 1 chauffør]',
      'totalDistanceKm:',
      totalDistanceKm.toFixed(1),
      'totalDurationMinutes:',
      totalDurationMinutes
    )
  })

  it('optimerer med 1 chauffør', async () => {
    if (!fixture) return
    const res = await request(app)
      .post('/api/optimize')
      .send({ date: TEST_DATE, employeeIds: [fixture.employeeIds[0]] })
      .expect(200)

    expect(res.body.success).toBe(true)
    expect(res.body.routesOptimized).toBe(1)
    expect(res.body.tasksAssigned).toBe(fixture.taskIds.length)

    const routes = await prisma.route.findMany({
      where: { date: new Date(TEST_DATE) },
      include: { _count: { select: { assignments: true } } },
    })
    expect(routes).toHaveLength(1)
    const totalKm = routes.reduce((s, r) => s + (r.totalDistanceKm ?? 0), 0)
    const totalMin = routes.reduce(
      (s, r) => s + (r.totalDurationMinutes ?? 0),
      0
    )
    console.log(
      '[Optimeret 1 chauffør]',
      'totalDistanceKm:',
      totalKm.toFixed(1),
      'totalDurationMinutes:',
      totalMin
    )
  })

  it('optimerer med 2 chauffører', async () => {
    if (!fixture) return
    const res = await request(app)
      .post('/api/optimize')
      .send({
        date: TEST_DATE,
        employeeIds: [fixture.employeeIds[0], fixture.employeeIds[1]],
      })
      .expect(200)

    expect(res.body.success).toBe(true)
    expect(res.body.routesOptimized).toBe(2)
    expect(res.body.tasksAssigned).toBe(fixture.taskIds.length)

    const routes = await prisma.route.findMany({
      where: { date: new Date(TEST_DATE) },
      include: { _count: { select: { assignments: true } } },
    })
    expect(routes).toHaveLength(2)
    const totalKm = routes.reduce((s, r) => s + (r.totalDistanceKm ?? 0), 0)
    const totalMin = routes.reduce(
      (s, r) => s + (r.totalDurationMinutes ?? 0),
      0
    )
    console.log(
      '[Optimeret 2 chauffører]',
      'totalDistanceKm:',
      totalKm.toFixed(1),
      'totalDurationMinutes:',
      totalMin
    )
  })

  it('optimerer med 3 chauffører', async () => {
    if (!fixture) return
    const res = await request(app)
      .post('/api/optimize')
      .send({
        date: TEST_DATE,
        employeeIds: [
          fixture.employeeIds[0],
          fixture.employeeIds[1],
          fixture.employeeIds[2],
        ],
      })
      .expect(200)

    expect(res.body.success).toBe(true)
    expect(res.body.routesOptimized).toBeLessThanOrEqual(3)
    expect(res.body.tasksAssigned).toBe(fixture.taskIds.length)

    const routes = await prisma.route.findMany({
      where: { date: new Date(TEST_DATE) },
      include: { _count: { select: { assignments: true } } },
    })
    expect(routes.length).toBeGreaterThanOrEqual(1)
    expect(routes.length).toBeLessThanOrEqual(3)
    const totalKm = routes.reduce((s, r) => s + (r.totalDistanceKm ?? 0), 0)
    const totalMin = routes.reduce(
      (s, r) => s + (r.totalDurationMinutes ?? 0),
      0
    )
    const sumAssignments = routes.reduce(
      (s, r) => s + r._count.assignments,
      0
    )
    expect(sumAssignments).toBe(fixture.taskIds.length)

    console.log(
      '[Optimeret 3 chauffører]',
      'antal ruter:',
      routes.length,
      'totalDistanceKm:',
      totalKm.toFixed(1),
      'totalDurationMinutes:',
      totalMin
    )
  })
})
