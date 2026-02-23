import { create } from 'zustand'
import type { Route } from '@/services/api'
import { optimizeRoutes, getRouteStats, DEFAULT_PARAMS, type OptimizeParams } from '@/services/mockOptimizer'

interface MockRouteState {
  params: OptimizeParams
  routes: Route[]
  stats: ReturnType<typeof getRouteStats>
  selectedDate: string
  isOptimized: boolean

  setParam: <K extends keyof OptimizeParams>(key: K, value: OptimizeParams[K]) => void
  setDate: (date: string) => void
  runOptimize: () => void
  reset: () => void
}

const today = new Date().toISOString().slice(0, 10)

export const useMockRouteStore = create<MockRouteState>((set, get) => ({
  params: { ...DEFAULT_PARAMS },
  routes: [],
  stats: { totalTasks: 0, totalDistance: 0, avgEfficiency: 0, unassigned: 100 },
  selectedDate: today,
  isOptimized: false,

  setParam: (key, value) => {
    const newParams = { ...get().params, [key]: value }
    set({ params: newParams })
    if (get().isOptimized) {
      const routes = optimizeRoutes(newParams, get().selectedDate)
      set({ routes, stats: getRouteStats(routes) })
    }
  },

  setDate: (date) => {
    set({ selectedDate: date })
    if (get().isOptimized) {
      const routes = optimizeRoutes(get().params, date)
      set({ routes, stats: getRouteStats(routes) })
    }
  },

  runOptimize: () => {
    const { params, selectedDate } = get()
    const routes = optimizeRoutes(params, selectedDate)
    set({ routes, stats: getRouteStats(routes), isOptimized: true })
  },

  reset: () => {
    set({ params: { ...DEFAULT_PARAMS }, routes: [], stats: { totalTasks: 0, totalDistance: 0, avgEfficiency: 0, unassigned: 100 }, isOptimized: false })
  },
}))
