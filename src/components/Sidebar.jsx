import { cn } from '@/lib/cn'
import { Icon } from './Icon'
import { HallPlate } from './HallPlate'
import { Counter } from './Badge'

/**
 * НАВИГАЦИОННЫЙ САЙДБАР — «указатель по комплексу».
 *
 * Активный раздел маркируется той же сигнальной кромкой 3px, что и
 * карточки со строками реестра: один визуальный механизм на всю систему.
 * Группы разделов подписаны CAPS-метками — как секции на схеме объекта.
 *
 * tone: light (основной) | dark (для презентаций и полноэкранных режимов)
 */
const TONE = {
  light: {
    shell: 'bg-white border-r border-hairline',
    brandSub: 'text-ink-400',
    brandTitle: 'text-ink-900',
    groupLabel: 'text-ink-400',
    item: 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
    itemActive: 'bg-navy-50 text-navy-700',
    rail: 'bg-navy-600',
    icon: 'text-ink-400',
    iconActive: 'text-navy-600',
    divider: 'border-hairline',
    footer: 'text-ink-500',
    footerBg: 'bg-ink-25',
  },
  dark: {
    shell: 'bg-navy-900 border-r border-navy-800',
    brandSub: 'text-navy-300',
    brandTitle: 'text-white',
    groupLabel: 'text-navy-400',
    item: 'text-navy-200 hover:bg-navy-800 hover:text-white',
    itemActive: 'bg-navy-800 text-white',
    rail: 'bg-signal-500',
    icon: 'text-navy-400',
    iconActive: 'text-signal-400',
    divider: 'border-navy-800',
    footer: 'text-navy-300',
    footerBg: 'bg-navy-950/40',
  },
}

export function Sidebar({
  groups,
  activePath,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  tone = 'light',
  role,
  className,
}) {
  const t = TONE[tone] ?? TONE.light

  return (
    <nav
      aria-label="Основная навигация"
      className={cn(
        'flex h-full shrink-0 flex-col transition-[width] duration-slow ease-out',
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
        t.shell,
        className,
      )}
    >
      {/* Бренд-блок: табличка комплекса + название системы */}
      <div
        className={cn(
          'flex h-topbar shrink-0 items-center gap-2.5 border-b px-3',
          t.divider,
          collapsed && 'justify-center px-0',
        )}
      >
        <HallPlate tone={tone === 'dark' ? 'signal' : 'navy'} size="lg" className="shrink-0">
          QEC
        </HallPlate>
        {!collapsed ? (
          <div className="min-w-0">
            <p className={cn('truncate text-base font-semibold leading-tight', t.brandTitle)}>
              QazExpoCongress
            </p>
            <p className={cn('truncate text-2xs uppercase tracking-label', t.brandSub)}>
              Учёт мероприятий
            </p>
          </div>
        ) : null}
      </div>

      {/* Разделы */}
      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        {groups.map((group, groupIndex) => (
          <div key={group.key} className={cn(groupIndex > 0 && 'mt-4')}>
            {!collapsed ? (
              <p
                className={cn(
                  'mb-1 px-3 text-2xs font-semibold uppercase tracking-label',
                  t.groupLabel,
                )}
              >
                {group.label}
              </p>
            ) : groupIndex > 0 ? (
              <div className={cn('mx-3 mb-2 border-t', t.divider)} />
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
                        'focus-ring relative flex h-8 w-full items-center gap-2.5 rounded px-2 text-base transition-colors duration-fast',
                        collapsed && 'justify-center px-0',
                        active ? cn(t.itemActive, 'font-medium') : t.item,
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute left-0 h-4 w-[3px] rounded-r-sm',
                            t.rail,
                          )}
                        />
                      ) : null}
                      <Icon
                        name={item.icon}
                        size={15}
                        className={active ? t.iconActive : t.icon}
                      />
                      {!collapsed ? (
                        <>
                          <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                          {item.count != null ? (
                            <Counter
                              value={item.count}
                              tone={active ? 'navy' : 'neutral'}
                              className={tone === 'dark' ? 'bg-navy-700 text-navy-100' : undefined}
                            />
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

      {/* Подвал: текущая роль + свернуть */}
      <div className={cn('shrink-0 border-t', t.divider, t.footerBg)}>
        {!collapsed && role ? (
          <div className="flex items-center gap-2 px-3 py-2.5">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-2xs font-semibold',
                tone === 'dark'
                  ? 'border-navy-700 bg-navy-800 text-navy-200'
                  : 'border-hairline bg-white text-navy-700',
              )}
            >
              <Icon name={role.icon} size={13} />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'truncate text-xs font-medium',
                  tone === 'dark' ? 'text-white' : 'text-ink-800',
                )}
              >
                {role.person}
              </p>
              <p className={cn('truncate text-2xs', t.footer)}>{role.short}</p>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            'focus-ring flex h-8 w-full items-center gap-2.5 px-3 text-xs transition-colors duration-fast',
            collapsed && 'justify-center px-0',
            t.item,
          )}
        >
          <Icon name={collapsed ? 'chevrons-right' : 'chevrons-left'} size={14} />
          {!collapsed ? <span>Свернуть панель</span> : null}
        </button>
      </div>
    </nav>
  )
}

export default Sidebar
