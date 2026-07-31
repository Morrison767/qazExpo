import { Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './app/ThemeContext'
import { RoleProvider } from './app/RoleContext'
import { EventsProvider } from './app/EventsContext'
import { AppShell } from './app/AppShell'
import { ToastProvider } from './components/Toast'
import DesignSystem from './pages/DesignSystem'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Events from './pages/Events'
import EventCard from './pages/EventCard'
import Contracts from './pages/Contracts'
import ContractCard from './pages/ContractCard'
import Tenants from './pages/Tenants'
import TenantCard from './pages/TenantCard'
import Placeholder from './pages/Placeholder'
import { ALL_NAV_ITEMS } from './design/navigation'

/** Собранные экраны — остальные разделы пока отдают заглушку */
const BUILT_ROUTES = ['design-system', 'dashboard', 'calendar', 'events', 'contracts', 'tenants']
const PLACEHOLDER_ITEMS = ALL_NAV_ITEMS.filter((item) => !BUILT_ROUTES.includes(item.key))

export default function App() {
  return (
    <ThemeProvider>
      <RoleProvider initialRole="manager">
        {/* Единый store мероприятий: календарь, реестр, карточка и дашборд
            читают и пишут одно состояние */}
        <EventsProvider>
          <ToastProvider>
            <AppShell>
              <Routes>
                {/* Дашборд — первый экран после входа */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventCard />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/contracts/:id" element={<ContractCard />} />
                <Route path="/tenants" element={<Tenants />} />
                <Route path="/tenants/:id" element={<TenantCard />} />
                <Route path="/design-system" element={<DesignSystem />} />
                {PLACEHOLDER_ITEMS.map((item) => (
                  <Route
                    key={item.key}
                    path={item.path}
                    element={<Placeholder icon={item.icon} title={item.label} />}
                  />
                ))}
                <Route
                  path="*"
                  element={<Placeholder icon="search" title="Раздел не найден" notFound />}
                />
              </Routes>
            </AppShell>
          </ToastProvider>
        </EventsProvider>
      </RoleProvider>
    </ThemeProvider>
  )
}
