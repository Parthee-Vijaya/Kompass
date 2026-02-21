import { useState } from 'react'
import { AlertTriangle, Play, X, Users, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Employee, SimulateResponse } from '@/services/api'

interface SimulationPanelProps {
  employees: Employee[]
  date: string
  onSimulate: (scenario: SimulationScenario) => Promise<SimulateResponse>
  onApply: (recommendation: SimulateResponse['recommendations'][0]) => void
  onClose: () => void
}

interface SimulationScenario {
  type: 'employee_absent' | 'new_task' | 'task_cancelled' | 'delay'
  employeeId?: string
  taskId?: string
  delayMinutes?: number
}

export function SimulationPanel({
  employees,
  date,
  onSimulate,
  onApply,
  onClose,
}: SimulationPanelProps) {
  const [scenario, setScenario] = useState<SimulationScenario>({
    type: 'employee_absent',
  })
  const [result, setResult] = useState<SimulateResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSimulate = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await onSimulate(scenario)
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulering fejlede')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-600" />
          <h2 className="font-semibold text-gray-900">Simulering</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/50 rounded-md transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Scenario selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scenarie type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'employee_absent', label: 'Medarbejder syg', icon: Users },
              { type: 'delay', label: 'Forsinkelse', icon: Clock },
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setScenario({ ...scenario, type: type as SimulationScenario['type'] })}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                  scenario.type === type
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Employee selection */}
        {scenario.type === 'employee_absent' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vælg medarbejder
            </label>
            <select
              value={scenario.employeeId || ''}
              onChange={(e) => setScenario({ ...scenario, employeeId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Vælg medarbejder...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Delay input */}
        {scenario.type === 'delay' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forsinkelse (minutter)
            </label>
            <input
              type="number"
              value={scenario.delayMinutes || 30}
              onChange={(e) =>
                setScenario({ ...scenario, delayMinutes: parseInt(e.target.value) || 30 })
              }
              min={5}
              max={180}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}

        {/* Run simulation button */}
        <button
          onClick={handleSimulate}
          disabled={isLoading || (scenario.type === 'employee_absent' && !scenario.employeeId)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" />
          {isLoading ? 'Simulerer...' : 'Kør simulering'}
        </button>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Resultat</h3>

            {/* Impacts */}
            {result.impacts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase">Påvirkninger</p>
                {result.impacts.map((impact, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {impact.employeeName}
                      </p>
                      <p className="text-sm text-gray-600">{impact.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase">Anbefalinger</p>
                {result.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{rec.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Forventet effektivitet: {Math.round(rec.efficiency * 100)}%
                        </p>
                      </div>
                      <button
                        onClick={() => onApply(rec)}
                        className="px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-md hover:bg-primary-700 transition-colors"
                      >
                        Anvend
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
