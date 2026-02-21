const API_BASE = '/api'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

export const api = {
  employees: {
    list: () => request<Employee[]>('/employees'),
    get: (id: string) => request<Employee>(`/employees/${id}`),
    create: (data: CreateEmployeeData) =>
      request<Employee>('/employees', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateEmployeeData>) =>
      request<Employee>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/employees/${id}`, { method: 'DELETE' }),
  },

  tasks: {
    list: (params?: { date?: string; status?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.date) searchParams.set('date', params.date)
      if (params?.status) searchParams.set('status', params.status)
      const query = searchParams.toString()
      return request<Task[]>(`/tasks${query ? `?${query}` : ''}`)
    },
    get: (id: string) => request<Task>(`/tasks/${id}`),
    create: (data: CreateTaskData) =>
      request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateTaskData>) =>
      request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
  },

  clients: {
    list: (search?: string) => {
      const query = search ? `?search=${encodeURIComponent(search)}` : ''
      return request<Client[]>(`/clients${query}`)
    },
    get: (id: string) => request<Client>(`/clients/${id}`),
    create: (data: CreateClientData) =>
      request<Client>('/clients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateClientData>) =>
      request<Client>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/clients/${id}`, { method: 'DELETE' }),
  },

  routes: {
    list: (params?: { date?: string; employeeId?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.date) searchParams.set('date', params.date)
      if (params?.employeeId) searchParams.set('employeeId', params.employeeId)
      const query = searchParams.toString()
      return request<Route[]>(`/routes${query ? `?${query}` : ''}`)
    },
    get: (id: string) => request<Route>(`/routes/${id}`),
    getByEmployeeAndDate: (employeeId: string, date: string) =>
      request<Route>(`/routes/employee/${employeeId}/date/${date}`),
    reorder: (id: string, assignmentOrder: { assignmentId: string; routeOrder: number }[]) =>
      request<Route>(`/routes/${id}/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ assignmentOrder }),
      }),
  },

  optimize: {
    run: (data: OptimizeRequest) =>
      request<OptimizeResponse>('/optimize', { method: 'POST', body: JSON.stringify(data) }),
    simulate: (data: SimulateRequest) =>
      request<SimulateResponse>('/optimize/simulate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  compliance: {
    check: (employeeId: string, startDate?: string, endDate?: string) => {
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      const query = params.toString()
      return request<ComplianceResult>(`/compliance/check/${employeeId}${query ? `?${query}` : ''}`)
    },
    validateAssignment: (data: { employeeId: string; startTime: string; endTime: string }) =>
      request<{ valid: boolean; reason?: string }>('/compliance/validate-assignment', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getWeeklyHours: (employeeId: string, weekStart: string) =>
      request<WeeklyHoursStatus>(`/compliance/weekly-hours/${employeeId}?weekStart=${weekStart}`),
  },

  analytics: {
    dashboard: (date?: string) => {
      const query = date ? `?date=${date}` : ''
      return request<DashboardStats>(`/analytics/dashboard${query}`)
    },
    efficiencyTrend: (days?: number) => {
      const query = days ? `?days=${days}` : ''
      return request<EfficiencyTrendPoint[]>(`/analytics/efficiency-trend${query}`)
    },
    employeePerformance: (startDate: string, endDate: string) =>
      request<EmployeePerformance[]>(
        `/analytics/employee-performance?startDate=${startDate}&endDate=${endDate}`
      ),
    taskDistribution: (date: string) =>
      request<TaskDistribution>(`/analytics/task-distribution?date=${date}`),
  },

  health: () => request<{ status: string; timestamp: string }>('/health'),
}

export interface Employee {
  id: string
  name: string
  email: string
  phone?: string
  weeklyHours: number
  homeLatitude?: number
  homeLongitude?: number
  isActive: boolean
  competencies: Competency[]
  createdAt: string
  updatedAt: string
}

export interface Competency {
  id: string
  name: string
  description?: string
}

export interface Client {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  phone?: string
  notes?: string
  preferredEmployeeId?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  clientId: string
  client?: Client
  durationMinutes: number
  windowStart?: string
  windowEnd?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  requiredCompetencies: Competency[]
  assignment?: Assignment
}

export interface Assignment {
  id: string
  routeId: string
  employeeId: string
  employee?: Employee
  taskId: string
  task?: Task
  startTime: string
  endTime: string
  routeOrder: number
  travelMinutes?: number
  isLocked: boolean
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled'
}

export interface Route {
  id: string
  employeeId: string
  employee?: Employee
  date: string
  totalDistanceKm?: number
  totalDurationMinutes?: number
  efficiency?: number
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  assignments: Assignment[]
}

export interface CreateEmployeeData {
  name: string
  email: string
  phone?: string
  weeklyHours?: number
  competencies?: string[]
  homeLatitude?: number
  homeLongitude?: number
}

export interface CreateTaskData {
  title: string
  description?: string
  clientId: string
  durationMinutes?: number
  requiredCompetencies?: string[]
  windowStart?: string
  windowEnd?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

export interface CreateClientData {
  name: string
  address: string
  latitude: number
  longitude: number
  phone?: string
  notes?: string
  preferredEmployeeId?: string
}

export interface OptimizeRequest {
  date: string
  employeeIds?: string[]
  preserveLockedAssignments?: boolean
}

export interface OptimizeResponse {
  success: boolean
  date: string
  routesOptimized: number
  tasksAssigned: number
}

export interface SimulateRequest {
  date: string
  scenario: {
    type: 'employee_absent' | 'new_task' | 'task_cancelled' | 'delay'
    employeeId?: string
    taskId?: string
    delayMinutes?: number
  }
}

export interface SimulateResponse {
  scenario: SimulateRequest['scenario']
  date: string
  impacts: { employeeId: string; employeeName: string; change: string }[]
  recommendations: { type: string; description: string; efficiency: number }[]
}

export interface ComplianceResult {
  employeeId: string
  isCompliant: boolean
  violations: { rule: string; message: string; date?: string }[]
  warnings: { rule: string; message: string; currentValue: number; threshold: number }[]
}

export interface WeeklyHoursStatus {
  planned: number
  actual: number
  remaining: number
  percentUsed: number
}

export interface DashboardStats {
  date: string
  tasks: { total: number; completed: number; completionRate: number }
  employees: { active: number; total: number; utilizationRate: number }
  routes: { count: number; avgEfficiency: number; totalDistanceKm: number; totalDurationHours: number }
}

export interface EfficiencyTrendPoint {
  date: string
  efficiency: number
  routeCount: number
}

export interface EmployeePerformance {
  employeeId: string
  employeeName: string
  routeCount: number
  taskCount: number
  avgEfficiency: number
  totalDistanceKm: number
}

export interface TaskDistribution {
  total: number
  byPriority: Record<string, number>
  byStatus: Record<string, number>
  byCompetency: Record<string, number>
}
