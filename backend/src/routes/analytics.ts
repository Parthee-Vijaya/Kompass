import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'

export const analyticsRouter = Router()

analyticsRouter.get('/dashboard', async (req, res, next) => {
  try {
    const { date } = z
      .object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      })
      .parse(req.query)

    const targetDate = date ? new Date(date) : new Date()
    targetDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const [
      totalTasks,
      completedTasks,
      activeEmployees,
      totalEmployees,
      routes,
    ] = await Promise.all([
      prisma.task.count({
        where: {
          windowStart: { gte: targetDate, lt: nextDay },
        },
      }),
      prisma.task.count({
        where: {
          windowStart: { gte: targetDate, lt: nextDay },
          status: 'completed',
        },
      }),
      prisma.employee.count({
        where: {
          isActive: true,
          routes: {
            some: { date: targetDate },
          },
        },
      }),
      prisma.employee.count({
        where: { isActive: true },
      }),
      prisma.route.findMany({
        where: { date: targetDate },
        select: {
          efficiency: true,
          totalDistanceKm: true,
          totalDurationMinutes: true,
        },
      }),
    ])

    const avgEfficiency =
      routes.length > 0
        ? routes.reduce((sum, r) => sum + (r.efficiency || 0), 0) / routes.length
        : 0

    const totalDistance = routes.reduce((sum, r) => sum + (r.totalDistanceKm || 0), 0)
    const totalDuration = routes.reduce((sum, r) => sum + (r.totalDurationMinutes || 0), 0)

    res.json({
      date: targetDate.toISOString().split('T')[0],
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      employees: {
        active: activeEmployees,
        total: totalEmployees,
        utilizationRate: totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0,
      },
      routes: {
        count: routes.length,
        avgEfficiency: Math.round(avgEfficiency * 100),
        totalDistanceKm: Math.round(totalDistance * 10) / 10,
        totalDurationHours: Math.round((totalDuration / 60) * 10) / 10,
      },
    })
  } catch (error) {
    next(error)
  }
})

analyticsRouter.get('/efficiency-trend', async (req, res, next) => {
  try {
    const { days } = z
      .object({
        days: z.string().transform(Number).default('7'),
      })
      .parse(req.query)

    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const routes = await prisma.route.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        efficiency: true,
      },
      orderBy: { date: 'asc' },
    })

    const groupedByDate = routes.reduce(
      (acc, route) => {
        const dateStr = route.date.toISOString().split('T')[0]
        if (!acc[dateStr]) {
          acc[dateStr] = { total: 0, count: 0 }
        }
        acc[dateStr].total += route.efficiency || 0
        acc[dateStr].count += 1
        return acc
      },
      {} as Record<string, { total: number; count: number }>
    )

    const trend = Object.entries(groupedByDate).map(([date, data]) => ({
      date,
      efficiency: Math.round((data.total / data.count) * 100),
      routeCount: data.count,
    }))

    res.json(trend)
  } catch (error) {
    next(error)
  }
})

analyticsRouter.get('/employee-performance', async (req, res, next) => {
  try {
    const { startDate, endDate } = z
      .object({
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .parse(req.query)

    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      include: {
        routes: {
          where: {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
          include: {
            _count: {
              select: { assignments: true },
            },
          },
        },
      },
    })

    const performance = employees.map((emp) => {
      const totalRoutes = emp.routes.length
      const avgEfficiency =
        totalRoutes > 0
          ? emp.routes.reduce((sum, r) => sum + (r.efficiency || 0), 0) / totalRoutes
          : 0
      const totalTasks = emp.routes.reduce((sum, r) => sum + r._count.assignments, 0)
      const totalDistance = emp.routes.reduce((sum, r) => sum + (r.totalDistanceKm || 0), 0)

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        routeCount: totalRoutes,
        taskCount: totalTasks,
        avgEfficiency: Math.round(avgEfficiency * 100),
        totalDistanceKm: Math.round(totalDistance * 10) / 10,
      }
    })

    res.json(performance.sort((a, b) => b.avgEfficiency - a.avgEfficiency))
  } catch (error) {
    next(error)
  }
})

analyticsRouter.get('/task-distribution', async (req, res, next) => {
  try {
    const { date } = z
      .object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .parse(req.query)

    const targetDate = new Date(date)
    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const tasks = await prisma.task.findMany({
      where: {
        windowStart: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      include: {
        requiredCompetencies: true,
      },
    })

    const byPriority = tasks.reduce(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const byStatus = tasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const byCompetency = tasks.reduce(
      (acc, task) => {
        task.requiredCompetencies.forEach((comp) => {
          acc[comp.name] = (acc[comp.name] || 0) + 1
        })
        return acc
      },
      {} as Record<string, number>
    )

    res.json({
      total: tasks.length,
      byPriority,
      byStatus,
      byCompetency,
    })
  } catch (error) {
    next(error)
  }
})
