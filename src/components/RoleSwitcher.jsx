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
export function RoleSwitcher({ value, onChange, className }) {
  const [open, setOpen] = useState(false)
  const ref = useOutsideClick(() => setOpen(false), open)
  useEscapeKey(() => setOpen(false), open)

  const current = ROLES[value] ?? ROLES.admin

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'focus-ring flex h-control items-center gap-2 rounded border border-hairline-strong bg-white pl-2 pr-1.5 transition-colors duration-fast hover:border-ink-400 hover:bg-ink-50',
          open && 'border-navy-400 bg-ink-50',
        )}
      >
        <HallPlate tone="signal" size="sm">
          Демо
        </HallPlate>
        <span className="hidden text-2xs uppercase tracking-label text-ink-400 lg:inline">
          Войти как
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name={current.icon} size={13} className="text-navy-600" />
          <span className="max-w-[9.5rem] truncate text-base font-medium text-ink-900">
            {current.short}
          </span>
        </span>
        <Icon
          name="chevron-down"
          size={13}
          className={cn('text-ink-400 transition-transform duration-fast', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+4px)] z-dropdown w-[21rem] animate-scale-in overflow-hidden rounded-md border border-hairline bg-white shadow-lg"
        >
          <div className="border-b border-hairline bg-ink-25 px-3 py-2">
            <p className="text-2xs font-semibold uppercase tracking-label text-ink-500">
              Роли системы · раздел 4 ТЗ
            </p>
            <p className="mt-0.5 text-xs text-ink-400">
              Переключение влияет на состав разделов и видимость данных
            </p>
          </div>

          <div className="max-h-[24rem] overflow-y-auto py-1">
            {ROLE_GROUPS.map((group) => {
              const roles = Object.values(ROLES).filter((role) => role.group === group.key)
              if (roles.length === 0) return null
              return (
                <div key={group.key} className="py-1">
                  <p className="px-3 py-1 text-2xs font-semibold uppercase tracking-label text-ink-400">
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
                          'flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors duration-fast',
                          active ? 'bg-navy-50' : 'hover:bg-ink-50',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded border',
                            active
                              ? 'border-navy-200 bg-white text-navy-600'
                              : 'border-hairline bg-ink-50 text-ink-500',
                          )}
                        >
                          <Icon name={role.icon} size={13} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              'block truncate text-base font-medium',
                              active ? 'text-navy-800' : 'text-ink-900',
                            )}
                          >
                            {role.name}
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-ink-400">
                            {role.scope}
                          </span>
                        </span>
                        {active ? (
                          <Icon name="check" size={14} className="mt-1 shrink-0 text-navy-600" />
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
