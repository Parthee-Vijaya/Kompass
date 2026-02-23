import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  MapPin,
  Route,
  Users,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  CalendarClock,
  Compass,
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const NAV_MAIN = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Kortvisning', href: '/map', icon: MapPin },
  { name: 'Ruteplanlægning', href: '/routes', icon: Route },
  { name: 'Bemanding', href: '/staffing', icon: CalendarClock },
]

const NAV_ADMIN = [
  { name: 'Medarbejdere', href: '/employees', icon: Users },
  { name: 'Indstillinger', href: '/settings', icon: Settings },
]

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const pageTitle = (() => {
    const all = [...NAV_MAIN, ...NAV_ADMIN]
    return all.find((n) => n.href === location.pathname)?.name ?? 'Kompass'
  })()

  return (
    <div className="min-h-screen bg-surface-50">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[240px] sidebar-gradient noise-overlay flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="relative z-10 flex h-16 items-center gap-3 px-5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center animate-glow-pulse">
            <Compass className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="text-lg font-display text-white tracking-tight">Kompass</span>
          <button
            className="lg:hidden ml-auto p-1.5 rounded-lg text-white/50 hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 overflow-y-auto scrollbar-thin px-3 pt-6 pb-2 space-y-6">
          <NavSection label="Planlægning" items={NAV_MAIN} pathname={location.pathname} onNavigate={() => setSidebarOpen(false)} />
          <NavSection label="Administration" items={NAV_ADMIN} pathname={location.pathname} onNavigate={() => setSidebarOpen(false)} />
        </nav>

        {/* User */}
        <div className="relative z-10 p-3 border-t border-white/[0.04] shrink-0">
          <button className="w-full sidebar-item sidebar-item-inactive group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400/30 to-violet-500/20 flex items-center justify-center ring-1 ring-white/10">
              <span className="text-[11px] font-bold text-primary-300">PL</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white/70 truncate group-hover:text-white/90">Planlægger</p>
              <p className="text-[10px] text-white/30 truncate">Kalundborg Kommune</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/20 shrink-0" />
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="lg:pl-[240px]">
        <header className="sticky top-0 z-30 h-14 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 flex items-center px-4 lg:px-6 gap-4">
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-[15px] font-semibold text-gray-900 hidden sm:block">{pageTitle}</h1>

          <div className="flex-1" />

          <div className="hidden md:flex items-center bg-gray-100/60 rounded-xl px-3 py-1.5 w-64 gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Søg medarbejder, rute..."
              className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none w-full"
            />
          </div>

          <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white" />
          </button>

          <div className="h-5 w-px bg-gray-200 hidden sm:block" />

          <span className="text-[12px] text-gray-500 hidden sm:block font-mono">
            {new Date().toLocaleDateString('da-DK', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </header>

        <main className="p-4 lg:p-6 min-h-[calc(100vh-3.5rem)] gradient-mesh">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function NavSection({
  label,
  items,
  pathname,
  onNavigate,
}: {
  label: string
  items: typeof NAV_MAIN
  pathname: string
  onNavigate: () => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-3 mb-2">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">{label}</p>
        <div className="flex-1 h-px bg-white/[0.04]" />
      </div>
      {items.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onNavigate}
            className={cn('sidebar-item', isActive ? 'sidebar-item-active' : 'sidebar-item-inactive')}
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            <span>{item.name}</span>
            {isActive && (
              <motion.div
                layoutId="sidebar-active-bg"
                className="absolute inset-0 rounded-xl bg-white/[0.04]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
          </NavLink>
        )
      })}
    </div>
  )
}
