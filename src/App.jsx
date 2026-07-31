import { Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './app/ThemeContext'
import { RoleProvider } from './app/RoleContext'
import { AppShell } from './app/AppShell'
import { ToastProvider } from './components/Toast'
import DesignSystem from './pages/DesignSystem'
import Placeholder from './pages/Placeholder'
import { ALL_NAV_ITEMS } from './design/navigation'

const PLACEHOLDER_ITEMS = ALL_NAV_ITEMS.filter((item) => item.key !== 'design-system')

export default function App() {
  return (
    <ThemeProvider>
      <RoleProvider initialRole="manager">
        <ToastProvider>
          <AppShell>
            <Routes>
              <Route path="/" element={<Navigate to="/design-system" replace />} />
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
      </RoleProvider>
    </ThemeProvider>
  )
}
