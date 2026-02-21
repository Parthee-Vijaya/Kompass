import { Router } from 'express'
import { z } from 'zod'
import { complianceService } from '../services/compliance.js'

export const complianceRouter = Router()

complianceRouter.get('/check/:employeeId', async (req, res, next) => {
  try {
    const { employeeId } = req.params
    const { startDate, endDate } = z
      .object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
      .parse(req.query)

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    const result = await complianceService.checkEmployeeCompliance(employeeId, start, end)

    res.json(result)
  } catch (error) {
    next(error)
  }
})

complianceRouter.post('/validate-assignment', async (req, res, next) => {
  try {
    const { employeeId, startTime, endTime } = z
      .object({
        employeeId: z.string(),
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
      })
      .parse(req.body)

    const result = await complianceService.validateAssignment(
      employeeId,
      new Date(startTime),
      new Date(endTime)
    )

    res.json(result)
  } catch (error) {
    next(error)
  }
})

complianceRouter.get('/weekly-hours/:employeeId', async (req, res, next) => {
  try {
    const { employeeId } = req.params
    const { weekStart } = z
      .object({
        weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .parse(req.query)

    const result = await complianceService.getWeeklyHoursStatus(employeeId, new Date(weekStart))

    res.json(result)
  } catch (error) {
    next(error)
  }
})
