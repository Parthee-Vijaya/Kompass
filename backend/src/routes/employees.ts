import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'

export const employeesRouter = Router()

const createEmployeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  weeklyHours: z.number().min(0).max(48).default(37),
  competencies: z.array(z.string()).default([]),
  homeLatitude: z.number().optional(),
  homeLongitude: z.number().optional(),
})

employeesRouter.get('/', async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        competencies: true,
        _count: {
          select: { assignments: true },
        },
      },
      orderBy: { name: 'asc' },
    })
    res.json(employees)
  } catch (error) {
    next(error)
  }
})

employeesRouter.get('/:id', async (req, res, next) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: {
        competencies: true,
        assignments: {
          include: { task: true },
          orderBy: { startTime: 'asc' },
        },
      },
    })

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' })
    }

    res.json(employee)
  } catch (error) {
    next(error)
  }
})

employeesRouter.post('/', async (req, res, next) => {
  try {
    const data = createEmployeeSchema.parse(req.body)
    
    const employee = await prisma.employee.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        weeklyHours: data.weeklyHours,
        homeLatitude: data.homeLatitude,
        homeLongitude: data.homeLongitude,
        competencies: {
          connectOrCreate: data.competencies.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { competencies: true },
    })

    res.status(201).json(employee)
  } catch (error) {
    next(error)
  }
})

employeesRouter.put('/:id', async (req, res, next) => {
  try {
    const data = createEmployeeSchema.partial().parse(req.body)
    
    const employee = await prisma.employee.update({
      where: { id: req.params.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        weeklyHours: data.weeklyHours,
        homeLatitude: data.homeLatitude,
        homeLongitude: data.homeLongitude,
        ...(data.competencies && {
          competencies: {
            set: [],
            connectOrCreate: data.competencies.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
        }),
      },
      include: { competencies: true },
    })

    res.json(employee)
  } catch (error) {
    next(error)
  }
})

employeesRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.employee.delete({
      where: { id: req.params.id },
    })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
