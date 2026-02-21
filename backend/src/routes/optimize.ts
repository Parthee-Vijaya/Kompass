import { Router } from 'express'
import { z } from 'zod'
import axios from 'axios'
import { config } from '../config/env.js'
import { prisma } from '../config/database.js'
import { io } from '../index.js'

export const optimizeRouter = Router()

const optimizeRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  employeeIds: z.array(z.string()).optional(),
  preserveLockedAssignments: z.boolean().default(true),
})

const simulateRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scenario: z.object({
    type: z.enum(['employee_absent', 'new_task', 'task_cancelled', 'delay']),
    employeeId: z.string().optional(),
    taskId: z.string().optional(),
    delayMinutes: z.number().optional(),
  }),
})

optimizeRouter.post('/', async (req, res, next) => {
  try {
    const { date, employeeIds, preserveLockedAssignments } = optimizeRequestSchema.parse(req.body)
    const targetDate = new Date(date)

    const employees = await prisma.employee.findMany({
      where: employeeIds ? { id: { in: employeeIds } } : {},
      include: { competencies: true },
    })

    const tasks = await prisma.task.findMany({
      where: {
        windowStart: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
        },
        ...(preserveLockedAssignments
          ? { OR: [{ assignment: null }, { assignment: { isLocked: false } }] }
          : {}),
      },
      include: {
        client: true,
        requiredCompetencies: true,
      },
    })

    const clients = await prisma.client.findMany({
      where: {
        id: { in: tasks.map((t) => t.clientId) },
      },
    })

    const optimizerPayload = {
      employees: employees.map((e) => ({
        id: e.id,
        name: e.name,
        competencies: e.competencies.map((c) => c.name),
        homeLocation: e.homeLatitude && e.homeLongitude
          ? { lat: e.homeLatitude, lng: e.homeLongitude }
          : null,
        workStartMinutes: 8 * 60,
        workEndMinutes: 16 * 60,
        maxWorkMinutes: e.weeklyHours * 60 / 5,
      })),
      tasks: tasks.map((t) => ({
        id: t.id,
        clientId: t.clientId,
        durationMinutes: t.durationMinutes,
        requiredCompetencies: t.requiredCompetencies.map((c) => c.name),
        windowStart: t.windowStart?.toISOString(),
        windowEnd: t.windowEnd?.toISOString(),
        priority: t.priority,
      })),
      clients: clients.map((c) => ({
        id: c.id,
        location: { lat: c.latitude, lng: c.longitude },
      })),
      config: {
        timeoutSeconds: 30,
        includeTraffic: !!config.GOOGLE_MAPS_API_KEY,
      },
    }

    const optimizerResponse = await axios.post(
      `${config.OPTIMIZER_URL}/optimize`,
      optimizerPayload,
      { timeout: 35000 }
    )

    const { routes: optimizedRoutes } = optimizerResponse.data

    for (const optimizedRoute of optimizedRoutes) {
      const route = await prisma.route.upsert({
        where: {
          employeeId_date: {
            employeeId: optimizedRoute.employeeId,
            date: targetDate,
          },
        },
        create: {
          employeeId: optimizedRoute.employeeId,
          date: targetDate,
          totalDistanceKm: optimizedRoute.totalDistanceKm,
          totalDurationMinutes: optimizedRoute.totalDurationMinutes,
          efficiency: optimizedRoute.efficiency,
        },
        update: {
          totalDistanceKm: optimizedRoute.totalDistanceKm,
          totalDurationMinutes: optimizedRoute.totalDurationMinutes,
          efficiency: optimizedRoute.efficiency,
        },
      })

      await prisma.assignment.deleteMany({
        where: {
          routeId: route.id,
          isLocked: false,
        },
      })

      for (const assignment of optimizedRoute.assignments) {
        await prisma.assignment.create({
          data: {
            routeId: route.id,
            employeeId: optimizedRoute.employeeId,
            taskId: assignment.taskId,
            startTime: new Date(assignment.startTime),
            endTime: new Date(assignment.endTime),
            routeOrder: assignment.order,
            travelMinutes: assignment.travelMinutes,
          },
        })
      }
    }

    io.emit('routes-updated', { date, updatedAt: new Date().toISOString() })

    res.json({
      success: true,
      date,
      routesOptimized: optimizedRoutes.length,
      tasksAssigned: optimizedRoutes.reduce((sum: number, r: { assignments: unknown[] }) => sum + r.assignments.length, 0),
    })
  } catch (error) {
    next(error)
  }
})

optimizeRouter.post('/simulate', async (req, res, next) => {
  try {
    const { date, scenario } = simulateRequestSchema.parse(req.body)

    const simulationResult = {
      scenario,
      date,
      impacts: [] as { employeeId: string; employeeName: string; change: string }[],
      recommendations: [] as { type: string; description: string; efficiency: number }[],
    }

    if (scenario.type === 'employee_absent' && scenario.employeeId) {
      const absentEmployee = await prisma.employee.findUnique({
        where: { id: scenario.employeeId },
      })

      const affectedAssignments = await prisma.assignment.findMany({
        where: {
          employeeId: scenario.employeeId,
          route: { date: new Date(date) },
        },
        include: { task: true },
      })

      simulationResult.impacts.push({
        employeeId: scenario.employeeId,
        employeeName: absentEmployee?.name ?? 'Unknown',
        change: `${affectedAssignments.length} opgaver skal omfordeles`,
      })

      simulationResult.recommendations.push(
        {
          type: 'redistribute',
          description: 'Fordel opgaver til kolleger med ledig kapacitet',
          efficiency: 0.84,
        },
        {
          type: 'call_substitute',
          description: 'Tilkald vikar for at håndtere alle opgaver',
          efficiency: 0.91,
        }
      )
    }

    res.json(simulationResult)
  } catch (error) {
    next(error)
  }
})
