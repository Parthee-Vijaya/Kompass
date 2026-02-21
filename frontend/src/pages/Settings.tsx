import { useState } from 'react'
import { Save, Check, AlertCircle } from 'lucide-react'

interface SettingsState {
  compliance: {
    restHours: number
    maxWeeklyHours: number
    maxConsecutiveDays: number
  }
  optimization: {
    timeoutSeconds: number
    defaultBreakMinutes: number
    includeTraffic: boolean
    includeWeather: boolean
  }
  api: {
    googleMapsKey: string
    weatherApiKey: string
  }
}

export function Settings() {
  const [settings, setSettings] = useState<SettingsState>({
    compliance: {
      restHours: 11,
      maxWeeklyHours: 48,
      maxConsecutiveDays: 6,
    },
    optimization: {
      timeoutSeconds: 30,
      defaultBreakMinutes: 30,
      includeTraffic: true,
      includeWeather: false,
    },
    api: {
      googleMapsKey: '',
      weatherApiKey: '',
    },
  })

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
    }
  }

  const updateCompliance = (key: keyof SettingsState['compliance'], value: number) => {
    setSettings((prev) => ({
      ...prev,
      compliance: { ...prev.compliance, [key]: value },
    }))
  }

  const updateOptimization = <K extends keyof SettingsState['optimization']>(
    key: K,
    value: SettingsState['optimization'][K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      optimization: { ...prev.optimization, [key]: value },
    }))
  }

  const updateApi = (key: keyof SettingsState['api'], value: string) => {
    setSettings((prev) => ({
      ...prev,
      api: { ...prev.api, [key]: value },
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Indstillinger</h1>
        <p className="text-gray-500 mt-1">Konfigurer systemindstillinger og compliance regler</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Compliance settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Compliance regler</h2>
          <p className="text-sm text-gray-500 mb-4">
            Danske arbejdstidsregler (Arbejdstidsloven)
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                11-timers regel (hvileperiode)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={settings.compliance.restHours}
                  onChange={(e) => updateCompliance('restHours', parseInt(e.target.value) || 11)}
                  min={8}
                  max={24}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-500">timers sammenhængende hvile</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Minimum 11 timer hvile mellem vagter (kan nedsættes til 8 i særlige tilfælde)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                48-timers regel (ugentlig max)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={settings.compliance.maxWeeklyHours}
                  onChange={(e) =>
                    updateCompliance('maxWeeklyHours', parseInt(e.target.value) || 48)
                  }
                  min={37}
                  max={60}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-500">timer gennemsnit over 4 måneder</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Gennemsnitlig ugentlig arbejdstid må ikke overstige 48 timer
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maksimalt sammenhængende arbejdsdage
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={settings.compliance.maxConsecutiveDays}
                  onChange={(e) =>
                    updateCompliance('maxConsecutiveDays', parseInt(e.target.value) || 6)
                  }
                  min={5}
                  max={12}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-500">dage</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Medarbejdere skal have minimum én ugentlig hviledag
              </p>
            </div>
          </div>
        </div>

        {/* Route optimization settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Ruteoptimering</h2>
          <p className="text-sm text-gray-500 mb-4">Indstillinger for VRP-algoritmen</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Optimerings timeout
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={settings.optimization.timeoutSeconds}
                  onChange={(e) =>
                    updateOptimization('timeoutSeconds', parseInt(e.target.value) || 30)
                  }
                  min={5}
                  max={120}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-500">sekunder</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Standard pausevarighed
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={settings.optimization.defaultBreakMinutes}
                  onChange={(e) =>
                    updateOptimization('defaultBreakMinutes', parseInt(e.target.value) || 30)
                  }
                  min={15}
                  max={60}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-500">minutter</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Inkluder trafikdata</p>
                <p className="text-sm text-gray-500">
                  Brug real-time trafikdata i planlægning (kræver API-nøgle)
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateOptimization('includeTraffic', !settings.optimization.includeTraffic)
                }
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.optimization.includeTraffic ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.optimization.includeTraffic ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Inkluder vejrdata</p>
                <p className="text-sm text-gray-500">
                  Juster rejsetider baseret på vejrforhold (kræver API-nøgle)
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateOptimization('includeWeather', !settings.optimization.includeWeather)
                }
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.optimization.includeWeather ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.optimization.includeWeather ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* API settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">API Integrationer</h2>
          <p className="text-sm text-gray-500 mb-4">
            API-nøgler til eksterne tjenester (gemmes sikkert)
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Maps API nøgle
              </label>
              <input
                type="password"
                value={settings.api.googleMapsKey}
                onChange={(e) => updateApi('googleMapsKey', e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Bruges til trafikdata og afstandsberegning
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Azure Maps / Weather API nøgle
              </label>
              <input
                type="password"
                value={settings.api.weatherApiKey}
                onChange={(e) => updateApi('weatherApiKey', e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-400 mt-1">Bruges til vejrprognoser langs ruter</p>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between">
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">Indstillinger gemt!</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Fejl ved gemning</span>
            </div>
          )}
          {(saveStatus === 'idle' || saveStatus === 'saving') && <div />}

          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 rounded-lg text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saveStatus === 'saving' ? 'Gemmer...' : 'Gem indstillinger'}
          </button>
        </div>
      </div>
    </div>
  )
}
