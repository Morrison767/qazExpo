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
 *
 * onNav — версия для каркаса (топбар): цвета берутся из nav-токенов.
 */
export function RoleSwitcher({ value, onChange, onNav, onDark, className }) {
  const [open, setOpen] = useState(false)
  const ref = useOutsideClick(() => setOpen(false), open)
  useEscapeKey(() => setOpen(false), open)

  const inNav = onNav ?? onDark ?? false
  const current = ROLES[value] ?? ROLES.admin

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex h-control items-center gap-2 rounded border pl-1.5 pr-1.5 transition-all duration-fast',
          inNav
            ? 'focus-ring-nav border-nav-line bg-nav-hover text-nav-fg hover:border-hairline-strong'
            : 'focus-ring border-hairline-strong bg-surface-raised text-content hover:border-content-faint shadow-button-quiet',
          open && 'border-accent shadow-beam-sm',
        )}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-line bg-accent-soft text-accent-fg">
          <Icon name={current.icon} size={12} />
        </span>
        <span className="hidden flex-col items-start leading-none sm:flex">
          <span
            className={cn(
              'text-[0.5625rem] uppercase tracking-label',
              inNav ? 'text-nav-faint' : 'text-content-faint',
            )}
          >
            Войти как
          </span>
          <span className="mt-0.5 max-w-[9.5rem] truncate text-xs font-medium">
            {current.short}
          </span>
        </span>
        <Icon
          name="chevron-down"
          size={13}
          className={cn(
            'transition-transform duration-fast',
            inNav ? 'text-nav-subtle' : 'text-content-faint',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-dropdown w-[21rem] animate-scale-in overflow-hidden rounded-md border border-hairline bg-surface shadow-lg"
        >
          <div className="flex items-start justify-between gap-2 border-b border-hairline bg-surface-sunken px-3 py-2">
            <div className="min-w-0">
              <p className="text-2xs font-semibold uppercase tracking-label text-content-subtle">
                Роли системы · раздел 4 ТЗ
              </p>
              <p className="mt-0.5 text-xs text-content-faint">
                Переключение влияет на состав разделов и видимость данных
              </p>
            </div>
            <HallPlate tone="signal" size="sm">
              Демо
            </HallPlate>
          </div>

          <div className="max-h-[24rem] overflow-y-auto py-1">
            {ROLE_GROUPS.map((group) => {
              const roles = Object.values(ROLES).filter((role) => role.group === group.key)
              if (roles.length === 0) return null
              return (
                <div key={group.key} className="py-1">
                  <p className="px-3 py-1 text-2xs font-semibold uppercase tracking-label text-content-faint">
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
                          active ? 'bg-accent-soft' : 'hover:bg-surface-sunken',
                        )}
                      >
                        {active ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-1 left-0 w-rail rounded-r-sm bg-accent shadow-beam-sm"
                          />
                        ) : null}
                        <span
                          className={cn(
                            'mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded border',
                            active
                              ? 'border-accent-line bg-surface text-accent-fg'
                              : 'border-hairline bg-surface-sunken text-content-subtle',
                          )}
                        >
                          <Icon name={role.icon} size={13} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              'block truncate text-base font-medium',
                              active ? 'text-accent-strong' : 'text-content',
                            )}
                          >
                            {role.name}
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-content-faint">
                            {role.scope}
                          </span>
                        </span>
                        {active ? (
                          <Icon name="check" size={14} className="mt-1 shrink-0 text-accent-fg" />
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
