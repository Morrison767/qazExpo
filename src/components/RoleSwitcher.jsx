import { useState } from 'react'
import { cn } from '@/lib/cn'
import { ROLES, ROLE_GROUPS } from '@/design/roles'
import { useEscapeKey, useOutsideClick } from '@/lib/hooks'
import { Icon } from './Icon'
import { HallPlate } from './HallPlate'

/**
 * ПЕРЕКЛЮЧАТЕЛЬ РОЛИ — только демо-режим прототипа.
 * В продуктивной системе роль приходит из Active Directory (раздел 6 ТЗ),
 * поэтому элемент явно помечен табличкой «ДЕМО» и визуально отделён.
 */
export function RoleSwitcher({ value, onChange, onDark = false, className }) {
  const [open, setOpen] = useState(false)
  const ref = useOutsideClick(() => setOpen(false), open)
  useEscapeKey(() => setOpen(false), open)

  const current = ROLES[value] ?? ROLES.admin

  const t = onDark
    ? {
        trigger:
          'focus-ring-dark border-white/[0.12] bg-white/[0.05] text-obsidian-50 hover:border-white/25 hover:bg-white/[0.09]',
        triggerOpen: 'border-beam-400/50 bg-white/[0.09] shadow-beam-sm',
        label: 'text-obsidian-300',
        icon: 'text-beam-400',
        chevron: 'text-obsidian-300',
        panel: 'border-obsidian-600/70 bg-surface-obsidian shadow-xl',
        panelHead: 'border-white/[0.07] bg-white/[0.03]',
        headTitle: 'text-obsidian-200',
        headHint: 'text-obsidian-300',
        groupLabel: 'text-obsidian-300',
        option: 'hover:bg-white/[0.06]',
        optionActive: 'bg-beam-400/10',
        optionIcon: 'border-white/[0.1] bg-white/[0.05] text-obsidian-200',
        optionIconActive: 'border-beam-400/40 bg-beam-400/10 text-beam-300',
        optionName: 'text-obsidian-50',
        optionNameActive: 'text-beam-200',
        optionScope: 'text-obsidian-300',
        check: 'text-beam-400',
      }
    : {
        trigger:
          'focus-ring border-hairline-strong bg-surface-raised text-ink-900 hover:border-ink-400 hover:bg-white shadow-button-light',
        triggerOpen: 'border-beam-400 shadow-beam-sm',
        label: 'text-ink-400',
        icon: 'text-beam-700',
        chevron: 'text-ink-400',
        panel: 'border-hairline bg-white shadow-lg',
        panelHead: 'border-hairline bg-ink-25',
        headTitle: 'text-ink-500',
        headHint: 'text-ink-400',
        groupLabel: 'text-ink-400',
        option: 'hover:bg-ink-50',
        optionActive: 'bg-beam-50',
        optionIcon: 'border-hairline bg-ink-50 text-ink-500',
        optionIconActive: 'border-beam-200 bg-white text-beam-700',
        optionName: 'text-ink-900',
        optionNameActive: 'text-beam-800',
        optionScope: 'text-ink-400',
        check: 'text-beam-700',
      }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex h-control items-center gap-2 rounded border pl-2 pr-1.5 transition-all duration-fast',
          t.trigger,
          open && t.triggerOpen,
        )}
      >
        <HallPlate tone="signal" size="sm">
          Демо
        </HallPlate>
        <span className={cn('hidden text-2xs uppercase tracking-label lg:inline', t.label)}>
          Войти как
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name={current.icon} size={13} className={t.icon} />
          <span className="max-w-[9.5rem] truncate text-base font-medium">{current.short}</span>
        </span>
        <Icon
          name="chevron-down"
          size={13}
          className={cn('transition-transform duration-fast', t.chevron, open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className={cn(
            'absolute right-0 top-[calc(100%+6px)] z-dropdown w-[21rem] animate-scale-in overflow-hidden rounded-md border',
            t.panel,
            onDark && 'on-obsidian',
          )}
        >
          <div className={cn('border-b px-3 py-2', t.panelHead)}>
            <p className={cn('text-2xs font-semibold uppercase tracking-label', t.headTitle)}>
              Роли системы · раздел 4 ТЗ
            </p>
            <p className={cn('mt-0.5 text-xs', t.headHint)}>
              Переключение влияет на состав разделов и видимость данных
            </p>
          </div>

          <div className="max-h-[24rem] overflow-y-auto py-1">
            {ROLE_GROUPS.map((group) => {
              const roles = Object.values(ROLES).filter((role) => role.group === group.key)
              if (roles.length === 0) return null
              return (
                <div key={group.key} className="py-1">
                  <p
                    className={cn(
                      'px-3 py-1 text-2xs font-semibold uppercase tracking-label',
                      t.groupLabel,
                    )}
                  >
                    {group.label}
                  </p>
                  {roles.map((role) => {
                    const active = role.key === value
                    return (
                      <button
                        key={role.key}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          onChange?.(role.key)
                          setOpen(false)
                        }}
                        className={cn(
                          'relative flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors duration-fast',
                          active ? t.optionActive : t.option,
                        )}
                      >
                        {active ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-1 left-0 w-rail rounded-r-sm bg-beam-400"
                            style={{ boxShadow: '0 0 8px 0 rgba(53,214,240,0.6)' }}
                          />
                        ) : null}
                        <span
                          className={cn(
                            'mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded border',
                            active ? t.optionIconActive : t.optionIcon,
                          )}
                        >
                          <Icon name={role.icon} size={13} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              'block truncate text-base font-medium',
                              active ? t.optionNameActive : t.optionName,
                            )}
                          >
                            {role.name}
                          </span>
                          <span
                            className={cn('mt-0.5 block text-xs leading-snug', t.optionScope)}
                          >
                            {role.scope}
                          </span>
                        </span>
                        {active ? (
                          <Icon name="check" size={14} className={cn('mt-1 shrink-0', t.check)} />
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default RoleSwitcher
