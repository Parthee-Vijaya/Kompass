import { prisma } from '../config/database.js'

export interface ComplianceResult {
  employeeId: string
  isCompliant: boolean
  violations: ComplianceViolation[]
  warnings: ComplianceWarning[]
}

export interface ComplianceViolation {
  rule: '11-hour' | '48-hour' | 'consecutive-days'
  message: string
  date?: string
}

export interface ComplianceWarning {
  rule: string
  message: string
  currentValue: number
  threshold: number
}

const ELEVEN_HOUR_REST = 11 * 60
const FORTY_EIGHT_HOUR_WEEK = 48
const MAX_CONSECUTIVE_DAYS = 6

export class ComplianceService {
  async checkEmployeeCompliance(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceResult> {
    const violations: ComplianceViolation[] = []
    const warnings: ComplianceWarning[] = []

    const workLogs = await prisma.workTimeLog.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })

    for (let i = 1; i < workLogs.length; i++) {
      const prevLog = workLogs[i - 1]
      const currentLog = workLogs[i]

      if (prevLog?.endTime && currentLog?.startTime) {
        const restMinutes =
          (currentLog.startTime.getTime() - prevLog.endTime.getTime()) / (1000 * 60)

        if (restMinutes < ELEVEN_HOUR_REST) {
          violations.push({
            rule: '11-hour',
            message: `Kun ${Math.round(restMinutes / 60)} timers hvile mellem ${prevLog.date.toISOString().split('T')[0]} og ${currentLog.date.toISOString().split('T')[0]}. Krævet: 11 timer.`,
            date: currentLog.date.toISOString().split('T')[0],
          })
        }
      }
    }

    const fourMonthsAgo = new Date(endDate)
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4)

    const schedules = await prisma.schedule.findMany({
      where: {
        employeeId,
        weekStart: {
          gte: fourMonthsAgo,
          lte: endDate,
        },
      },
    })

    if (schedules.length > 0) {
      const totalHours = schedules.reduce((sum, s) => sum + (s.actualHours || s.plannedHours), 0)
      const avgWeeklyHours = totalHours / schedules.length

      if (avgWeeklyHours > FORTY_EIGHT_HOUR_WEEK) {
        violations.push({
          rule: '48-hour',
          message: `Gennemsnitlig ugentlig arbejdstid er ${avgWeeklyHours.toFixed(1)} timer over 4 måneder. Max: 48 timer.`,
        })
      } else if (avgWeeklyHours > FORTY_EIGHT_HOUR_WEEK * 0.9) {
        warnings.push({
          rule: '48-hour',
          message: `Nærmer sig 48-timers grænsen`,
          currentValue: avgWeeklyHours,
          threshold: FORTY_EIGHT_HOUR_WEEK,
        })
      }
    }

    let consecutiveDays = 0
    let maxConsecutive = 0
    let prevDate: Date | null = null

    for (const log of workLogs) {
      if (prevDate) {
        const dayDiff = Math.round(
          (log.date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (dayDiff === 1) {
          consecutiveDays++
          maxConsecutive = Math.max(maxConsecutive, consecutiveDays)
        } else {
          consecutiveDays = 1
        }
      } else {
        consecutiveDays = 1
      }
      prevDate = log.date
    }

    if (maxConsecutive > MAX_CONSECUTIVE_DAYS) {
      violations.push({
        rule: 'consecutive-days',
        message: `${maxConsecutive} sammenhængende arbejdsdage. Max: ${MAX_CONSECUTIVE_DAYS} dage.`,
      })
    } else if (maxConsecutive >= MAX_CONSECUTIVE_DAYS - 1) {
      warnings.push({
        rule: 'consecutive-days',
        message: `${maxConsecutive} sammenhængende arbejdsdage`,
        currentValue: maxConsecutive,
        threshold: MAX_CONSECUTIVE_DAYS,
      })
    }

    return {
      employeeId,
      isCompliant: violations.length === 0,
      violations,
      warnings,
    }
  }

  async validateAssignment(
    employeeId: string,
    proposedStart: Date,
    proposedEnd: Date
  ): Promise<{ valid: boolean; reason?: string }> {
    const dayBefore = new Date(proposedStart)
    dayBefore.setDate(dayBefore.getDate() - 1)

    const previousAssignment = await prisma.assignment.findFirst({
      where: {
        employeeId,
        endTime: {
          gte: new Date(dayBefore.setHours(0, 0, 0, 0)),
          lt: proposedStart,
        },
      },
      orderBy: { endTime: 'desc' },
    })

    if (previousAssignment) {
      const restMinutes =
        (proposedStart.getTime() - previousAssignment.endTime.getTime()) / (1000 * 60)

      if (restMinutes < ELEVEN_HOUR_REST) {
        return {
          valid: false,
          reason: `Kun ${Math.round(restMinutes / 60)} timers hvile. Krævet: 11 timer.`,
        }
      }
    }

    return { valid: true }
  }

  async getWeeklyHoursStatus(employeeId: string, weekStart: Date): Promise<{
    planned: number
    actual: number
    remaining: number
    percentUsed: number
  }> {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    })

    if (!employee) {
      throw new Error('Employee not found')
    }

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const assignments = await prisma.assignment.findMany({
      where: {
        employeeId,
        startTime: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      include: { task: true },
    })

    const actualMinutes = assignments.reduce((sum, a) => {
      const duration = (a.endTime.getTime() - a.startTime.getTime()) / (1000 * 60)
      return sum + duration
    }, 0)

    const actualHours = actualMinutes / 60
    const plannedHours = employee.weeklyHours
    const remaining = Math.max(0, plannedHours - actualHours)
    const percentUsed = (actualHours / plannedHours) * 100

    return {
      planned: plannedHours,
      actual: Math.round(actualHours * 10) / 10,
      remaining: Math.round(remaining * 10) / 10,
      percentUsed: Math.round(percentUsed),
    }
  }
}

export const complianceService = new ComplianceService()
