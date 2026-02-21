import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { RoutePlanner } from './pages/RoutePlanner'
import { Employees } from './pages/Employees'
import { Settings } from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="routes" element={<RoutePlanner />} />
        <Route path="employees" element={<Employees />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
