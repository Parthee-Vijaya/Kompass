import { useState } from 'react'
import { Save, Check, AlertCircle, Shield, Cog, Key } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StaggerContainer, StaggerItem } from '@/components/ui/Stagger'

interface SettingsState {
  compliance: { restHours: number; maxWeeklyHours: number; maxConsecutiveDays: number }
  optimization: { timeoutSeconds: number; defaultBreakMinutes: number; includeTraffic: boolean; includeWeather: boolean }
  api: { googleMapsKey: string; weatherApiKey: string }
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      className={cn('relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2', enabled ? 'bg-primary-500' : 'bg-gray-200')}>
      <span className={cn('pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 mt-0.5', enabled ? 'translate-x-[22px]' : 'translate-x-0.5')} />
    </button>
  )
}

export function Settings() {
  const [settings, setSettings] = useState<SettingsState>({
    compliance: { restHours: 11, maxWeeklyHours: 48, maxConsecutiveDays: 6 },
    optimization: { timeoutSeconds: 30, defaultBreakMinutes: 30, includeTraffic: true, includeWeather: false },
    api: { googleMapsKey: '', weatherApiKey: '' },
  })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleSave = async () => {
    setSaveStatus('saving')
    try { await new Promise((r) => setTimeout(r, 800)); setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2500) }
    catch { setSaveStatus('error') }
  }

  const updateCompliance = (key: keyof SettingsState['compliance'], value: number) =>
    setSettings((p) => ({ ...p, compliance: { ...p.compliance, [key]: value } }))
  const updateOptimization = <K extends keyof SettingsState['optimization']>(key: K, value: SettingsState['optimization'][K]) =>
    setSettings((p) => ({ ...p, optimization: { ...p.optimization, [key]: value } }))
  const updateApi = (key: keyof SettingsState['api'], value: string) =>
    setSettings((p) => ({ ...p, api: { ...p.api, [key]: value } }))

  const inputCls = 'w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 data-value'
  const fullInputCls = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400'

  return (
    <StaggerContainer className="space-y-5">
      <StaggerItem>
        <div>
          <p className="section-title mb-1.5">System</p>
          <h1 className="heading-display text-3xl text-gray-900">Indstillinger</h1>
          <p className="text-[13px] text-gray-500 mt-1">Compliance-regler, optimering og API-integrationer</p>
        </div>
      </StaggerItem>

      <div className="max-w-2xl space-y-5">
        <StaggerItem>
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/30 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-500" />
              <div><h2 className="text-[15px] font-semibold text-gray-900">Compliance-regler</h2><p className="text-[10px] text-gray-400">Arbejdstidsloven</p></div>
            </div>
            <div className="p-6 space-y-5">
              {[
                { label: '11-timers regel', key: 'restHours' as const, val: settings.compliance.restHours, min: 8, max: 24, unit: 'timers hvile', desc: 'Minimum 11 timer mellem vagter' },
                { label: '48-timers regel', key: 'maxWeeklyHours' as const, val: settings.compliance.maxWeeklyHours, min: 37, max: 60, unit: 'timer/4 mdr.', desc: 'Gennemsnitlig ugentlig max' },
                { label: 'Maks arbejdsdage', key: 'maxConsecutiveDays' as const, val: settings.compliance.maxConsecutiveDays, min: 5, max: 12, unit: 'dage', desc: 'Sammenhængende uden hviledag' },
              ].map((s) => (
                <div key={s.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{s.label}</label>
                  <div className="flex items-center gap-3">
                    <input type="number" value={s.val} onChange={(e) => updateCompliance(s.key, parseInt(e.target.value) || s.val)} min={s.min} max={s.max} className={inputCls} />
                    <span className="text-sm text-gray-500">{s.unit}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </StaggerItem>

        <StaggerItem>
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/30 flex items-center gap-2">
              <Cog className="w-4 h-4 text-gray-400" />
              <div><h2 className="text-[15px] font-semibold text-gray-900">Ruteoptimering</h2><p className="text-[10px] text-gray-400">VRP-algoritme indstillinger</p></div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Timeout</label>
                <div className="flex items-center gap-3">
                  <input type="number" value={settings.optimization.timeoutSeconds} onChange={(e) => updateOptimization('timeoutSeconds', parseInt(e.target.value) || 30)} min={5} max={120} className={inputCls} />
                  <span className="text-sm text-gray-500">sekunder</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pausevarighed</label>
                <div className="flex items-center gap-3">
                  <input type="number" value={settings.optimization.defaultBreakMinutes} onChange={(e) => updateOptimization('defaultBreakMinutes', parseInt(e.target.value) || 30)} min={15} max={60} className={inputCls} />
                  <span className="text-sm text-gray-500">minutter</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-1">
                <div><p className="text-sm font-medium text-gray-700">Trafikdata</p><p className="text-[10px] text-gray-400">Real-time trafik i planlægning</p></div>
                <Toggle enabled={settings.optimization.includeTraffic} onChange={() => updateOptimization('includeTraffic', !settings.optimization.includeTraffic)} />
              </div>
              <div className="flex items-center justify-between py-1">
                <div><p className="text-sm font-medium text-gray-700">Vejrdata</p><p className="text-[10px] text-gray-400">Juster rejsetider efter vejrforhold</p></div>
                <Toggle enabled={settings.optimization.includeWeather} onChange={() => updateOptimization('includeWeather', !settings.optimization.includeWeather)} />
              </div>
            </div>
          </section>
        </StaggerItem>

        <StaggerItem>
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/30 flex items-center gap-2">
              <Key className="w-4 h-4 text-gray-400" />
              <div><h2 className="text-[15px] font-semibold text-gray-900">API-integrationer</h2><p className="text-[10px] text-gray-400">Krypteret nøgleopbevaring</p></div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Maps API</label>
                <input type="password" value={settings.api.googleMapsKey} onChange={(e) => updateApi('googleMapsKey', e.target.value)} placeholder="••••••••" className={fullInputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Azure Maps / Weather</label>
                <input type="password" value={settings.api.weatherApiKey} onChange={(e) => updateApi('weatherApiKey', e.target.value)} placeholder="••••••••" className={fullInputCls} />
              </div>
            </div>
          </section>
        </StaggerItem>

        <StaggerItem>
          <div className="flex items-center justify-between pb-8">
            {saveStatus === 'saved' && <div className="flex items-center gap-2 text-success-600"><Check className="w-4 h-4" /><span className="text-sm font-medium">Gemt!</span></div>}
            {saveStatus === 'error' && <div className="flex items-center gap-2 text-danger-500"><AlertCircle className="w-4 h-4" /><span className="text-sm font-medium">Fejl</span></div>}
            {(saveStatus === 'idle' || saveStatus === 'saving') && <div />}
            <button onClick={handleSave} disabled={saveStatus === 'saving'}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 rounded-xl text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50 shadow-sm hover:shadow-glow-blue-sm transition-all">
              <Save className="w-4 h-4" />{saveStatus === 'saving' ? 'Gemmer...' : 'Gem indstillinger'}
            </button>
          </div>
        </StaggerItem>
      </div>
    </StaggerContainer>
  )
}
