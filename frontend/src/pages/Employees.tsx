import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Plus,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Edit2,
  Trash2,
  X,
} from 'lucide-react'
import { api, type Employee, type CreateEmployeeData } from '@/services/api'
import { cn } from '@/lib/utils'

export function Employees() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: api.employees.list,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeeData) => api.employees.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setShowModal(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEmployeeData> }) =>
      api.employees.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setShowModal(false)
      setEditingEmployee(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.employees.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data: CreateEmployeeData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || undefined,
      weeklyHours: parseInt(formData.get('weeklyHours') as string) || 37,
      competencies: (formData.get('competencies') as string)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }

    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Medarbejdere</h1>
          <p className="text-gray-500 mt-1">Administrer medarbejdere og kompetencer</p>
        </div>

        <button
          onClick={() => {
            setEditingEmployee(null)
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 rounded-lg text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Tilføj medarbejder
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Søg efter medarbejder..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Employee table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-5 py-3">
                    Medarbejder
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-5 py-3">
                    Kompetencer
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-5 py-3">
                    Arbejdstid
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map((employee) => (
                  <EmployeeRow
                    key={employee.id}
                    employee={employee}
                    onEdit={() => {
                      setEditingEmployee(employee)
                      setShowModal(true)
                    }}
                    onDelete={() => {
                      if (confirm('Er du sikker på at du vil slette denne medarbejder?')) {
                        deleteMutation.mutate(employee.id)
                      }
                    }}
                  />
                ))}
              </tbody>
            </table>

            {filteredEmployees.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <p>Ingen medarbejdere fundet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                {editingEmployee ? 'Rediger medarbejder' : 'Tilføj medarbejder'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingEmployee(null)
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Navn</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingEmployee?.name}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingEmployee?.email}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingEmployee?.phone || ''}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ugentlig arbejdstid (timer)
                </label>
                <input
                  type="number"
                  name="weeklyHours"
                  defaultValue={editingEmployee?.weeklyHours || 37}
                  min={0}
                  max={48}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kompetencer (kommasepareret)
                </label>
                <input
                  type="text"
                  name="competencies"
                  defaultValue={editingEmployee?.competencies.map((c) => c.name).join(', ') || ''}
                  placeholder="Personlig pleje, Medicinhåndtering"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingEmployee(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuller
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary-600 rounded-lg text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : editingEmployee ? (
                    'Gem ændringer'
                  ) : (
                    'Tilføj'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function EmployeeRow({
  employee,
  onEdit,
  onDelete,
}: {
  employee: Employee
  onEdit: () => void
  onDelete: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  const { data: compliance } = useQuery({
    queryKey: ['compliance', employee.id],
    queryFn: () => api.compliance.check(employee.id),
    enabled: employee.isActive,
  })

  const complianceStatus = compliance?.isCompliant
    ? 'ok'
    : (compliance?.violations.length ?? 0) > 0
      ? 'violation'
      : 'warning'

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-700">
              {employee.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{employee.name}</p>
            <p className="text-sm text-gray-500">{employee.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-wrap gap-1">
          {employee.competencies.map((comp) => (
            <span
              key={comp.id}
              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {comp.name}
            </span>
          ))}
          {employee.competencies.length === 0 && (
            <span className="text-sm text-gray-400">Ingen</span>
          )}
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="text-sm">
          <span className="font-medium text-gray-900">{employee.weeklyHours}t</span>
          <span className="text-gray-500"> / uge</span>
        </div>
      </td>
      <td className="px-5 py-4">
        {complianceStatus === 'ok' ? (
          <span className="inline-flex items-center gap-1 text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">OK</span>
          </span>
        ) : complianceStatus === 'warning' ? (
          <span className="inline-flex items-center gap-1 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Advarsel</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-red-600">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">Overtrædelse</span>
          </span>
        )}
      </td>
      <td className="px-5 py-4 relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-5 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
              <button
                onClick={() => {
                  setShowMenu(false)
                  onEdit()
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Rediger
              </button>
              <button
                onClick={() => {
                  setShowMenu(false)
                  onDelete()
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Slet
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  )
}
