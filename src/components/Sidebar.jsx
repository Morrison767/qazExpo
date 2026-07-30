import { cn } from '@/lib/cn'
import { Icon } from './Icon'
import { HallPlate } from './HallPlate'
import { Counter } from './Badge'

/**
 * НАВИГАЦИОННЫЙ САЙДБАР — «указатель по комплексу» в корпусе прибора.
 *
 * По умолчанию — обсидиановый корпус: навигация уходит в тень, рабочие
 * данные справа остаются на светлой поверхности. Активный раздел маркируется
 * светящейся кромкой — тот же механизм, что у карточек и строк реестра.
 * Группы разделов подписаны CAPS-метками, как секции на схеме объекта.
 *
 * tone: dark (основной) | light (для встраивания в светлый макет)
 */
const TONE = {
  dark: {
    shell: 'on-obsidian bg-surface-obsidian border-r border-obsidian-600/60',
    texture: true,
    brandSub: 'text-obsidian-300',
    brandTitle: 'text-obsidian-50',
    groupLabel: 'text-obsidian-300',
    item: 'text-obsidian-200 hover:bg-white/[0.055] hover:text-white',
    itemActive: 'bg-white/[0.07] text-white',
    rail: 'bg-beam-400',
    railGlow: '0 0 10px 0 rgba(53, 214, 240, 0.65)',
    icon: 'text-obsidian-400',
    iconActive: 'text-beam-400',
    divider: 'border-white/[0.07]',
    footer: 'text-obsidian-300',
    footerBg: 'bg-black/25',
    counterActive: 'bg-beam-400/15 text-beam-300',
    counterIdle: 'bg-white/[0.07] text-obsidian-200',
    avatar: 'border-white/10 bg-white/[0.06] text-beam-300',
  },
  light: {
    shell: 'bg-white border-r border-hairline',
    texture: false,
    brandSub: 'text-ink-400',
    brandTitle: 'text-ink-900',
    groupLabel: 'text-ink-400',
    item: 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
    itemActive: 'bg-navy-50 text-navy-700',
    rail: 'bg-beam-700',
    railGlow: '0 0 8px 0 rgba(11, 124, 147, 0.45)',
    icon: 'text-ink-400',
    iconActive: 'text-beam-700',
    divider: 'border-hairline',
    footer: 'text-ink-500',
    footerBg: 'bg-ink-25',
    counterActive: 'bg-navy-100 text-navy-700',
    counterIdle: 'bg-ink-100 text-ink-600',
    avatar: 'border-hairline bg-white text-navy-700',
  },
}

export function Sidebar({
  groups,
  activePath,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  tone = 'dark',
  role,
  className,
}) {
  const t = TONE[tone] ?? TONE.dark

  return (
    <nav
      aria-label="Основная навигация"
      className={cn(
        'relative flex h-full shrink-0 flex-col transition-[width] duration-slow ease-decelerate',
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
        t.shell,
        className,
      )}
    >
      {t.texture ? (
        <>
          <span
            aria-hidden="true"
            className="dot-grid pointer-events-none absolute inset-0 opacity-60"
          />
          <span aria-hidden="true" className="bloom-beam pointer-events-none absolute inset-0" />
        </>
      ) : null}

      {/* Бренд-блок: табличка комплекса + название системы */}
      <div
        className={cn(
          'relative flex h-topbar shrink-0 items-center gap-2.5 border-b px-3',
          t.divider,
          collapsed && 'justify-center px-0',
        )}
      >
        <HallPlate
          tone={tone === 'dark' ? 'beam' : 'navy'}
          size="lg"
          className="shrink-0"
        >
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
      <div className="relative min-h-0 flex-1 overflow-y-auto py-2">
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
                        'relative flex h-8 w-full items-center gap-2.5 rounded px-2 text-base transition-colors duration-fast',
                        tone === 'dark' ? 'focus-ring-dark' : 'focus-ring',
                        collapsed && 'justify-center px-0',
                        active ? cn(t.itemActive, 'font-medium') : t.item,
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden="true"
                          className={cn('absolute left-0 h-4 w-rail rounded-r-sm', t.rail)}
                          style={{ boxShadow: t.railGlow }}
                        />
                      ) : null}
                      <Icon
                        name={item.icon}
                        size={15}
                        className={cn(
                          'transition-colors duration-fast',
                          active ? t.iconActive : t.icon,
                        )}
                      />
                      {!collapsed ? (
                        <>
                          <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                          {item.count != null ? (
                            <Counter
                              value={item.count}
                              className={active ? t.counterActive : t.counterIdle}
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
      <div className={cn('relative shrink-0 border-t', t.divider, t.footerBg)}>
        {!collapsed && role ? (
          <div className="flex items-center gap-2 px-3 py-2.5">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
                t.avatar,
              )}
            >
              <Icon name={role.icon} size={13} />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'truncate text-xs font-medium',
                  tone === 'dark' ? 'text-obsidian-50' : 'text-ink-800',
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
            'flex h-8 w-full items-center gap-2.5 px-3 text-xs transition-colors duration-fast',
            tone === 'dark' ? 'focus-ring-dark' : 'focus-ring',
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
