import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'

export const routesRouter = Router()

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

routesRouter.get('/', async (req, res, next) => {
  try {
    const { date, employeeId } = req.query

    const where: Record<string, unknown> = {}

    if (date) {
      where.date = new Date(dateSchema.parse(date))
    }

    if (employeeId) {
      where.employeeId = employeeId
    }

    const routes = await prisma.route.findMany({
      where,
      include: {
        employee: true,
        assignments: {
          include: {
            task: {
              include: { client: true },
            },
          },
          orderBy: { routeOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(routes)
  } catch (error) {
    next(error)
  }
})

routesRouter.get('/:id', async (req, res, next) => {
  try {
    const route = await prisma.route.findUnique({
      where: { id: req.params.id },
      include: {
        employee: true,
        assignments: {
          include: {
            task: {
              include: { client: true },
            },
          },
          orderBy: { routeOrder: 'asc' },
        },
      },
    })

    if (!route) {
      return res.status(404).json({ error: 'Route not found' })
    }

    res.json(route)
  } catch (error) {
    next(error)
  }
})

routesRouter.get('/employee/:employeeId/date/:date', async (req, res, next) => {
  try {
    const { employeeId, date } = req.params
    const parsedDate = new Date(dateSchema.parse(date))

    const route = await prisma.route.findFirst({
      where: {
        employeeId,
        date: parsedDate,
      },
      include: {
        employee: true,
        assignments: {
          include: {
            task: {
              include: { client: true },
            },
          },
          orderBy: { routeOrder: 'asc' },
        },
      },
    })

    if (!route) {
      return res.status(404).json({ error: 'Route not found for this employee and date' })
    }

    res.json(route)
  } catch (error) {
    next(error)
  }
})

routesRouter.put('/:id/reorder', async (req, res, next) => {
  try {
    const { assignmentOrder } = z
      .object({
        assignmentOrder: z.array(z.object({
          assignmentId: z.string(),
          routeOrder: z.number().int().min(0),
        })),
      })
      .parse(req.body)

    await prisma.$transaction(
      assignmentOrder.map(({ assignmentId, routeOrder }) =>
        prisma.assignment.update({
          where: { id: assignmentId },
          data: { routeOrder },
        })
      )
    )

    const route = await prisma.route.findUnique({
      where: { id: req.params.id },
      include: {
        employee: true,
        assignments: {
          include: {
            task: {
              include: { client: true },
            },
          },
          orderBy: { routeOrder: 'asc' },
        },
      },
    })

    res.json(route)
  } catch (error) {
    next(error)
  }
})
