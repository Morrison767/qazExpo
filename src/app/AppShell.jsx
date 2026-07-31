import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { navForRole, navItemByPath } from '@/design/navigation'
import { useRole } from './RoleContext'
import { Sidebar } from '@/components/Sidebar'
import { Topbar } from '@/components/Topbar'
import { useToast } from '@/components/Toast'

/**
 * Каркас приложения: сайдбар + топбар + область контента.
 * Состав разделов зависит от активной роли (демо-переключатель в топбаре),
 * оформление каркаса — от активной темы (переключатель там же).
 */
export function AppShell({ children, breadcrumbs }) {
  const { roleKey, role, setRole } = useRole()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')

  const groups = useMemo(() => navForRole(roleKey), [roleKey])
  const activeItem = navItemByPath(location.pathname)

  const crumbs = breadcrumbs ?? [
    { label: 'QazExpoCongress', icon: 'building', onClick: () => navigate('/dashboard') },
    { label: activeItem?.label ?? 'Раздел' },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar
        groups={groups}
        activePath={location.pathname}
        onNavigate={(item) => navigate(item.path)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        role={role}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          breadcrumbs={crumbs}
          roleKey={roleKey}
          onRoleChange={setRole}
          onToggleSidebar={() => setCollapsed((v) => !v)}
          notifications={12}
          searchValue={search}
          onSearch={setSearch}
          onCreate={() =>
            toast.info({
              title: 'Создание объекта',
              description: 'Формы создания появятся на следующем шаге прототипа.',
            })
          }
        />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
