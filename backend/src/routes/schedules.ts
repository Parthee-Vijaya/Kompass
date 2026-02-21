import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'

export const schedulesRouter = Router()

const weekStartSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

schedulesRouter.get('/', async (req, res, next) => {
  try {
    const { employeeId, weekStart } = req.query

    const where: Record<string, unknown> = {}

    if (employeeId) {
      where.employeeId = employeeId
    }

    if (weekStart) {
      where.weekStart = new Date(weekStartSchema.parse(weekStart))
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        employee: true,
      },
      orderBy: [{ weekStart: 'desc' }, { employee: { name: 'asc' } }],
    })

    res.json(schedules)
  } catch (error) {
    next(error)
  }
})

schedulesRouter.get('/employee/:employeeId/week/:weekStart', async (req, res, next) => {
  try {
    const { employeeId, weekStart } = req.params
    const parsedWeekStart = new Date(weekStartSchema.parse(weekStart))

    const schedule = await prisma.schedule.findUnique({
      where: {
        employeeId_weekStart: {
          employeeId,
          weekStart: parsedWeekStart,
        },
      },
      include: {
        employee: true,
      },
    })

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' })
    }

    res.json(schedule)
  } catch (error) {
    next(error)
  }
})

schedulesRouter.post('/generate', async (req, res, next) => {
  try {
    const { weekStart, employeeIds } = z
      .object({
        weekStart: weekStartSchema,
        employeeIds: z.array(z.string()).optional(),
      })
      .parse(req.body)

    const parsedWeekStart = new Date(weekStart)

    const employees = await prisma.employee.findMany({
      where: employeeIds ? { id: { in: employeeIds } } : { isActive: true },
    })

    const schedules = await Promise.all(
      employees.map(async (employee) => {
        return prisma.schedule.upsert({
          where: {
            employeeId_weekStart: {
              employeeId: employee.id,
              weekStart: parsedWeekStart,
            },
          },
          create: {
            employeeId: employee.id,
            weekStart: parsedWeekStart,
            plannedHours: employee.weeklyHours,
            complianceStatus: 'ok',
          },
          update: {},
          include: { employee: true },
        })
      })
    )

    res.status(201).json(schedules)
  } catch (error) {
    next(error)
  }
})

schedulesRouter.put('/:id', async (req, res, next) => {
  try {
    const data = z
      .object({
        plannedHours: z.number().min(0).optional(),
        actualHours: z.number().min(0).optional(),
        overtime: z.number().optional(),
        complianceStatus: z.enum(['ok', 'warning', 'violation']).optional(),
      })
      .parse(req.body)

    const schedule = await prisma.schedule.update({
      where: { id: req.params.id },
      data,
      include: { employee: true },
    })

    res.json(schedule)
  } catch (error) {
    next(error)
  }
})

schedulesRouter.get('/compliance-report', async (req, res, next) => {
  try {
    const { weekStart } = req.query

    const where = weekStart
      ? { weekStart: new Date(weekStartSchema.parse(weekStart as string)) }
      : {}

    const schedules = await prisma.schedule.findMany({
      where,
      include: { employee: true },
    })

    const report = {
      totalEmployees: schedules.length,
      compliant: schedules.filter((s) => s.complianceStatus === 'ok').length,
      warnings: schedules.filter((s) => s.complianceStatus === 'warning').length,
      violations: schedules.filter((s) => s.complianceStatus === 'violation').length,
      details: schedules.map((s) => ({
        employeeId: s.employeeId,
        employeeName: s.employee.name,
        plannedHours: s.plannedHours,
        actualHours: s.actualHours,
        overtime: s.overtime,
        status: s.complianceStatus,
      })),
    }

    res.json(report)
  } catch (error) {
    next(error)
  }
})
