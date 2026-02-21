import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'

export const clientsRouter = Router()

const createClientSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().optional(),
  notes: z.string().optional(),
  preferredEmployeeId: z.string().optional(),
})

clientsRouter.get('/', async (req, res, next) => {
  try {
    const { search } = req.query

    const where = search
      ? {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' as const } },
            { address: { contains: search as string, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const clients = await prisma.client.findMany({
      where,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    res.json(clients)
  } catch (error) {
    next(error)
  }
})

clientsRouter.get('/:id', async (req, res, next) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: {
        tasks: {
          include: {
            assignment: {
              include: { employee: true },
            },
          },
          orderBy: { windowStart: 'desc' },
          take: 20,
        },
      },
    })

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    res.json(client)
  } catch (error) {
    next(error)
  }
})

clientsRouter.post('/', async (req, res, next) => {
  try {
    const data = createClientSchema.parse(req.body)

    const client = await prisma.client.create({
      data,
    })

    res.status(201).json(client)
  } catch (error) {
    next(error)
  }
})

clientsRouter.put('/:id', async (req, res, next) => {
  try {
    const data = createClientSchema.partial().parse(req.body)

    const client = await prisma.client.update({
      where: { id: req.params.id },
      data,
    })

    res.json(client)
  } catch (error) {
    next(error)
  }
})

clientsRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.client.delete({
      where: { id: req.params.id },
    })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
