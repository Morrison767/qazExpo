import { cn } from '@/lib/cn'
import { Icon } from './Icon'
import { HallPlate } from './HallPlate'
import { Counter } from './Badge'

/**
 * НАВИГАЦИОННЫЙ САЙДБАР — «указатель по комплексу».
 *
 * Работает на токенах каркаса (nav-*): в светлой теме белый, в тёмной —
 * обсидиановый корпус. Активный раздел маркируется светящейся кромкой —
 * тот же механизм, что у карточек и строк реестра. Группы разделов
 * подписаны CAPS-метками, как секции на схеме объекта.
 */
export function Sidebar({
  groups,
  activePath,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  role,
  version = 'Demo build · v0.3',
  className,
}) {
  return (
    <nav
      aria-label="Основная навигация"
      className={cn(
        'on-nav relative flex h-full shrink-0 flex-col border-r border-nav-line bg-surface-nav transition-[width] duration-slow ease-decelerate',
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute inset-0 opacity-50"
      />
      <span aria-hidden="true" className="bloom-beam pointer-events-none absolute inset-0" />

      {/* Бренд-блок: табличка комплекса + название системы */}
      <div
        className={cn(
          'relative flex h-topbar shrink-0 items-center gap-2.5 border-b border-nav-line px-3',
          collapsed && 'justify-center px-0',
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-accent-line bg-accent-soft text-accent-fg shadow-beam-sm">
          <Icon name="zap" size={16} />
        </span>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-base font-semibold leading-tight text-nav-fg">
              QazExpoCongress
            </p>
            <p className="truncate text-2xs uppercase tracking-label text-nav-subtle">
              Учёт мероприятий
            </p>
          </div>
        ) : null}
      </div>

      {/* Разделы */}
      <div className="relative min-h-0 flex-1 overflow-y-auto py-2">
        {groups.map((group, groupIndex) => (
          <div key={group.key} className={cn(groupIndex > 0 && 'mt-4')}>
            {!collapsed ? (
              <p className="mb-1 px-3 text-2xs font-semibold uppercase tracking-label text-nav-subtle">
                {group.label}
              </p>
            ) : groupIndex > 0 ? (
              <div className="mx-3 mb-2 border-t border-nav-line" />
            ) : null}

            <ul className="space-y-px px-2">
              {group.items.map((item) => {
                const active = item.path === activePath
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => onNavigate?.(item)}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'focus-ring-nav relative flex h-8 w-full items-center gap-2.5 rounded px-2 text-base transition-colors duration-fast',
                        collapsed && 'justify-center px-0',
                        active
                          ? 'bg-nav-active font-medium text-accent-strong'
                          : 'text-nav-muted hover:bg-nav-hover hover:text-nav-fg',
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 h-4 w-rail rounded-r-sm bg-accent shadow-beam-sm"
                        />
                      ) : null}
                      <Icon
                        name={item.icon}
                        size={15}
                        className={cn(
                          'transition-colors duration-fast',
                          active ? 'text-accent' : 'text-nav-faint',
                        )}
                      />
                      {!collapsed ? (
                        <>
                          <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                          {item.count != null ? (
                            <Counter value={item.count} tone={active ? 'beam' : 'neutral'} />
                          ) : null}
                        </>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Подвал: роль, версия, свернуть */}
      <div className="relative shrink-0 border-t border-nav-line bg-nav-sunken">
        {!collapsed && role ? (
          <div className="flex items-center gap-2 px-3 py-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent-line bg-accent-soft text-accent-fg">
              <Icon name={role.icon} size={13} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-nav-fg">{role.person}</p>
              <p className="truncate text-2xs text-nav-subtle">{role.short}</p>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            'focus-ring-nav flex h-8 w-full items-center gap-2.5 px-3 text-xs text-nav-subtle transition-colors duration-fast hover:bg-nav-hover hover:text-nav-fg',
            collapsed && 'justify-center px-0',
          )}
        >
          <Icon name={collapsed ? 'chevrons-right' : 'chevrons-left'} size={14} />
          {!collapsed ? <span>Свернуть панель</span> : null}
        </button>

        {!collapsed ? (
          <div className="flex items-center gap-1.5 border-t border-nav-line px-3 py-2">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-status-confirmed-base shadow-beam-sm"
            />
            <span className="truncate text-2xs text-nav-faint">{version}</span>
          </div>
        ) : null}
      </div>
    </nav>
  )
}

export default Sidebar
