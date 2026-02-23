import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Edit2,
  Trash2,
  X,
  UserPlus,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, type Employee, type CreateEmployeeData } from '@/services/api'
import { cn } from '@/lib/utils'
import { StaggerContainer, StaggerItem } from '@/components/ui/Stagger'

const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Anna Sørensen', email: 'anna@kompass.dk', phone: '+45 2012 3456', weeklyHours: 37, competencies: [{ id: 'c1', name: 'Personlig pleje' }, { id: 'c2', name: 'Medicinhåndtering' }], isActive: true, createdAt: '', updatedAt: '' },
  { id: '2', name: 'Bo Nielsen', email: 'bo@kompass.dk', phone: '+45 2034 5678', weeklyHours: 37, competencies: [{ id: 'c3', name: 'Rengøring' }], isActive: true, createdAt: '', updatedAt: '' },
  { id: '3', name: 'Carla Jensen', email: 'carla@kompass.dk', weeklyHours: 32, competencies: [{ id: 'c1', name: 'Personlig pleje' }], isActive: true, createdAt: '', updatedAt: '' },
  { id: '4', name: 'David Petersen', email: 'david@kompass.dk', phone: '+45 2056 7890', weeklyHours: 37, competencies: [{ id: 'c3', name: 'Rengøring' }, { id: 'c4', name: 'Indkøb' }], isActive: true, createdAt: '', updatedAt: '' },
  { id: '5', name: 'Emma Larsen', email: 'emma@kompass.dk', weeklyHours: 37, competencies: [{ id: 'c2', name: 'Medicinhåndtering' }], isActive: false, createdAt: '', updatedAt: '' },
  { id: '6', name: 'Frederik Holm', email: 'frederik@kompass.dk', phone: '+45 2078 1234', weeklyHours: 30, competencies: [{ id: 'c1', name: 'Personlig pleje' }, { id: 'c3', name: 'Rengøring' }], isActive: true, createdAt: '', updatedAt: '' },
  { id: '7', name: 'Gitte Andersen', email: 'gitte@kompass.dk', weeklyHours: 37, competencies: [{ id: 'c4', name: 'Indkøb' }], isActive: true, createdAt: '', updatedAt: '' },
  { id: '8', name: 'Henrik Madsen', email: 'henrik@kompass.dk', phone: '+45 2090 5678', weeklyHours: 37, competencies: [{ id: 'c2', name: 'Medicinhåndtering' }, { id: 'c3', name: 'Rengøring' }], isActive: false, createdAt: '', updatedAt: '' },
]

const EMPLOYEE_COLORS = ['#3366ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

export function Employees() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  const { data: apiEmployees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: api.employees.list,
    retry: 1,
  })
  const employees = apiEmployees && apiEmployees.length > 0 ? apiEmployees : MOCK_EMPLOYEES

  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeeData) => api.employees.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); setShowModal(false) },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEmployeeData> }) => api.employees.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); setShowModal(false); setEditingEmployee(null) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.employees.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterActive === 'all' || (filterActive === 'active' && emp.isActive) || (filterActive === 'inactive' && !emp.isActive)
    return matchesSearch && matchesFilter
  })

  const activeCount = employees.filter((e) => e.isActive).length

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data: CreateEmployeeData = {
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      phone: (fd.get('phone') as string) || undefined,
      weeklyHours: parseInt(fd.get('weeklyHours') as string) || 37,
      competencies: (fd.get('competencies') as string).split(',').map((s) => s.trim()).filter(Boolean),
    }
    editingEmployee ? updateMutation.mutate({ id: editingEmployee.id, data }) : createMutation.mutate(data)
  }

  return (
    <StaggerContainer className="space-y-5">
      <StaggerItem>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="section-title mb-1.5">Team</p>
            <h1 className="heading-display text-3xl text-gray-900">Medarbejdere</h1>
            <p className="text-[13px] text-gray-500 mt-1">
              <span className="data-value">{activeCount}</span> aktive · <span className="data-value">{employees.length - activeCount}</span> inaktive
            </p>
          </div>
          <button
            onClick={() => { setEditingEmployee(null); setShowModal(true) }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 rounded-xl text-sm font-semibold text-white hover:bg-primary-600 transition-colors shadow-sm hover:shadow-glow-blue-sm"
          >
            <UserPlus className="w-4 h-4" />
            Tilføj medarbejder
          </button>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Søg efter navn eller email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all" />
          </div>
          <div className="flex items-center bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl p-1 gap-0.5">
            {(['all', 'active', 'inactive'] as const).map((f) => (
              <button key={f} onClick={() => setFilterActive(f)}
                className={cn('px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors', filterActive === f ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700')}>
                {f === 'all' ? 'Alle' : f === 'active' ? 'Aktive' : 'Inaktive'}
              </button>
            ))}
          </div>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="glass-card rounded-2xl overflow-hidden">
          {isLoading && !apiEmployees ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100/60 bg-white/20">
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Medarbejder</th>
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Kompetencer</th>
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Arbejdstid</th>
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-2.5">Status</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/40">
                  {filteredEmployees.map((employee, idx) => (
                    <EmployeeRow key={employee.id} employee={employee} color={EMPLOYEE_COLORS[idx % EMPLOYEE_COLORS.length]!}
                      onEdit={() => { setEditingEmployee(employee); setShowModal(true) }}
                      onDelete={() => { if (confirm('Er du sikker?')) deleteMutation.mutate(employee.id) }} />
                  ))}
                </tbody>
              </table>
              {filteredEmployees.length === 0 && <div className="p-12 text-center text-gray-400 text-sm">Ingen medarbejdere fundet</div>}
            </div>
          )}
        </div>
      </StaggerItem>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white rounded-2xl shadow-elevated w-full max-w-md mx-4">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-gray-900">{editingEmployee ? 'Rediger medarbejder' : 'Tilføj medarbejder'}</h2>
                <button onClick={() => { setShowModal(false); setEditingEmployee(null) }} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {([
                  { name: 'name', label: 'Navn', type: 'text', defaultValue: editingEmployee?.name ?? '', required: true },
                  { name: 'email', label: 'Email', type: 'email', defaultValue: editingEmployee?.email ?? '', required: true },
                  { name: 'phone', label: 'Telefon', type: 'tel', defaultValue: editingEmployee?.phone ?? '', required: false },
                ] as const).map((f) => (
                  <div key={f.name}>
                    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                    <input type={f.type} name={f.name} defaultValue={f.defaultValue} required={f.required}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" />
                  </div>
                ))}
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Timer/uge</label>
                  <input type="number" name="weeklyHours" defaultValue={editingEmployee?.weeklyHours || 37} min={0} max={48}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Kompetencer (komma)</label>
                  <input type="text" name="competencies" defaultValue={editingEmployee?.competencies.map((c) => c.name).join(', ') || ''} placeholder="Personlig pleje, Medicinhåndtering"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setEditingEmployee(null) }}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Annuller</button>
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-primary-500 rounded-xl text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50">
                    {createMutation.isPending || updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : editingEmployee ? 'Gem' : 'Tilføj'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </StaggerContainer>
  )
}

function EmployeeRow({ employee, color, onEdit, onDelete }: { employee: Employee; color: string; onEdit: () => void; onDelete: () => void }) {
  const [showMenu, setShowMenu] = useState(false)
  const { data: compliance } = useQuery({ queryKey: ['compliance', employee.id], queryFn: () => api.compliance.check(employee.id), enabled: employee.isActive, retry: 1 })
  const status = compliance?.isCompliant ? 'ok' : (compliance?.violations.length ?? 0) > 0 ? 'violation' : 'warning'

  return (
    <tr className="hover:bg-white/20 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
            {employee.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{employee.name}</p>
            <p className="text-[10px] text-gray-400 font-mono">{employee.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex flex-wrap gap-1">
          {employee.competencies.map((c) => <span key={c.id} className="badge badge-neutral">{c.name}</span>)}
          {employee.competencies.length === 0 && <span className="text-[10px] text-gray-300">—</span>}
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className="data-value text-sm text-gray-900">{employee.weeklyHours}t</span>
        <span className="text-[10px] text-gray-400"> / uge</span>
      </td>
      <td className="px-5 py-3.5">
        {!employee.isActive ? <span className="badge badge-neutral">Inaktiv</span>
          : status === 'ok' ? <span className="inline-flex items-center gap-1 text-success-600"><CheckCircle2 className="w-3.5 h-3.5" /><span className="text-[11px] font-medium">OK</span></span>
          : status === 'warning' ? <span className="inline-flex items-center gap-1 text-accent-500"><AlertTriangle className="w-3.5 h-3.5" /><span className="text-[11px] font-medium">Advarsel</span></span>
          : <span className="inline-flex items-center gap-1 text-danger-500"><XCircle className="w-3.5 h-3.5" /><span className="text-[11px] font-medium">Brud</span></span>}
      </td>
      <td className="px-5 py-3.5 relative">
        <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 hover:bg-gray-100 rounded-lg"><MoreVertical className="w-4 h-4 text-gray-400" /></button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-5 top-full mt-1 z-20 bg-white border border-gray-100 rounded-xl shadow-elevated py-1 min-w-[130px]">
              <button onClick={() => { setShowMenu(false); onEdit() }} className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Edit2 className="w-3.5 h-3.5" /> Rediger</button>
              <button onClick={() => { setShowMenu(false); onDelete() }} className="w-full px-3 py-2 text-left text-sm text-danger-500 hover:bg-danger-50 flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Slet</button>
            </div>
          </>
        )}
      </td>
    </tr>
  )
}
