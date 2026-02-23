import { create } from 'zustand'
import { api, type Route, type Employee, type Task } from '@/services/api'

interface RouteState {
  routes: Route[]
  employees: Employee[]
  tasks: Task[]
  selectedDate: string
  selectedEmployeeId: string | null
  isLoading: boolean
  error: string | null
  
  setSelectedDate: (date: string) => void
  setSelectedEmployeeId: (id: string | null) => void
  
  fetchRoutes: (date: string) => Promise<void>
  fetchEmployees: () => Promise<void>
  fetchTasks: (date: string) => Promise<void>
  
  optimizeRoutes: (date: string, employeeIds?: string[]) => Promise<void>
  
  refreshAll: (date: string) => Promise<void>
}

const formatDate = (date: Date): string => date.toISOString().slice(0, 10)

export const useRouteStore = create<RouteState>((set, get) => ({
  routes: [],
  employees: [],
  tasks: [],
  selectedDate: formatDate(new Date()),
  selectedEmployeeId: null,
  isLoading: false,
  error: null,

  setSelectedDate: (date) => {
    set({ selectedDate: date })
    get().refreshAll(date)
  },

  setSelectedEmployeeId: (id) => set({ selectedEmployeeId: id }),

  fetchRoutes: async (date) => {
    try {
      const routes = await api.routes.list({ date })
      set({ routes })
    } catch (error) {
      console.error('Failed to fetch routes:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to fetch routes' })
    }
  },

  fetchEmployees: async () => {
    try {
      const employees = await api.employees.list()
      set({ employees })
    } catch (error) {
      console.error('Failed to fetch employees:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to fetch employees' })
    }
  },

  fetchTasks: async (date) => {
    try {
      const tasks = await api.tasks.list({ date })
      set({ tasks })
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to fetch tasks' })
    }
  },

  optimizeRoutes: async (date, employeeIds) => {
    set({ isLoading: true, error: null })
    try {
      await api.optimize.run({ date, employeeIds })
      await get().fetchRoutes(date)
    } catch (error) {
      console.error('Failed to optimize routes:', error)
      set({ error: error instanceof Error ? error.message : 'Optimization failed' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  refreshAll: async (date) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all([
        get().fetchRoutes(date),
        get().fetchEmployees(),
        get().fetchTasks(date),
      ])
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      set({ isLoading: false })
    }
  },
}))
