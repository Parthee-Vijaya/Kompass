import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'

export const tasksRouter = Router()

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  clientId: z.string(),
  durationMinutes: z.number().min(5).default(30),
  requiredCompetencies: z.array(z.string()).default([]),
  windowStart: z.string().datetime().optional(),
  windowEnd: z.string().datetime().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
})

tasksRouter.get('/', async (req, res, next) => {
  try {
    const { date, status } = req.query

    const where: Record<string, unknown> = {}
    
    if (date) {
      const targetDate = new Date(date as string)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)
      
      where.windowStart = {
        gte: targetDate,
        lt: nextDay,
      }
    }

    if (status) {
      where.status = status
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        client: true,
        requiredCompetencies: true,
        assignment: {
          include: { employee: true },
        },
      },
      orderBy: { windowStart: 'asc' },
    })

    res.json(tasks)
  } catch (error) {
    next(error)
  }
})

tasksRouter.get('/:id', async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        client: true,
        requiredCompetencies: true,
        assignment: {
          include: { employee: true },
        },
      },
    })

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    res.json(task)
  } catch (error) {
    next(error)
  }
})

tasksRouter.post('/', async (req, res, next) => {
  try {
    const data = createTaskSchema.parse(req.body)

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        clientId: data.clientId,
        durationMinutes: data.durationMinutes,
        windowStart: data.windowStart ? new Date(data.windowStart) : undefined,
        windowEnd: data.windowEnd ? new Date(data.windowEnd) : undefined,
        priority: data.priority,
        requiredCompetencies: {
          connectOrCreate: data.requiredCompetencies.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: {
        client: true,
        requiredCompetencies: true,
      },
    })

    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
})

tasksRouter.put('/:id', async (req, res, next) => {
  try {
    const data = createTaskSchema.partial().parse(req.body)

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        windowStart: data.windowStart ? new Date(data.windowStart) : undefined,
        windowEnd: data.windowEnd ? new Date(data.windowEnd) : undefined,
        priority: data.priority,
        ...(data.requiredCompetencies && {
          requiredCompetencies: {
            set: [],
            connectOrCreate: data.requiredCompetencies.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
        }),
      },
      include: {
        client: true,
        requiredCompetencies: true,
      },
    })

    res.json(task)
  } catch (error) {
    next(error)
  }
})

tasksRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id },
    })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
