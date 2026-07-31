import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useEscapeKey, useOutsideClick } from '@/lib/hooks'
import { Icon } from './Icon'
import { Button, IconButton } from './Button'
import { RoleSwitcher } from './RoleSwitcher'
import { Breadcrumbs } from './Breadcrumbs'
import { ThemeToggle } from './ThemeToggle'

/**
 * ТОПБАР — верхняя кромка каркаса.
 * Слева — где я нахожусь (крошки), справа — инструменты и от чьего имени
 * работаю. Снизу проходит светящаяся линия: она отделяет каркас от рабочей
 * поверхности и служит главным «световым» акцентом интерфейса.
 */
export function Topbar({
  breadcrumbs,
  roleKey,
  onRoleChange,
  onToggleSidebar,
  notifications = 0,
  onSearch,
  searchValue = '',
  onCreate,
  className,
}) {
  return (
    <header
      className={cn(
        'on-nav relative z-dropdown flex h-topbar shrink-0 items-center gap-3 border-b border-nav-line bg-surface-nav px-3',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute inset-0 opacity-40"
      />

      <div className="relative flex min-w-0 flex-1 items-center gap-3">
        <IconButton
          icon="panel-left"
          label="Свернуть/раскрыть навигацию"
          size="sm"
          variant="ghost-nav"
          onClick={onToggleSidebar}
        />

        {breadcrumbs?.length ? (
          <Breadcrumbs items={breadcrumbs} onDark className="min-w-0 flex-1" />
        ) : (
          <div className="min-w-0 flex-1" />
        )}
      </div>

      <div className="relative flex items-center gap-2">
        {/* Глобальный поиск: подсветка по фокусу */}
        <div className="relative hidden md:block">
          <Icon
            name="search"
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-nav-faint"
          />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearch?.(event.target.value)}
            placeholder="Поиск: мероприятие, договор, арендатор…"
            className={cn(
              'h-control w-56 rounded border border-nav-line bg-nav-hover pl-8 pr-14 text-base text-nav-fg xl:w-72',
              'placeholder:text-nav-faint',
              'transition-all duration-fast focus:border-accent focus:shadow-beam-sm focus:outline-none',
            )}
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-sm border border-nav-line bg-nav-sunken px-1 py-px font-mono text-2xs text-nav-faint">
            ⌘K
          </kbd>
        </div>

        {onCreate ? (
          <Button variant="primary-nav" size="md" iconLeft="plus" onClick={onCreate}>
            <span className="hidden sm:inline">Создать</span>
          </Button>
        ) : null}

        <span className="hidden h-5 w-px shrink-0 bg-nav-line sm:block" aria-hidden="true" />

        <LanguageSwitcher />
        <ThemeToggle />

        <div className="relative">
          <IconButton icon="bell" label="Уведомления" size="md" variant="ghost-nav" />
          {notifications > 0 ? (
            <span
              className="pointer-events-none absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-danger-500 px-1 text-2xs font-semibold leading-none tabular-nums tracking-normal text-white ring-2 ring-nav"
              style={{ boxShadow: '0 0 8px 0 rgba(239, 68, 68, 0.55)' }}
            >
              {notifications > 9 ? '9+' : notifications}
            </span>
          ) : null}
        </div>

        <span className="h-5 w-px shrink-0 bg-nav-line" aria-hidden="true" />

        <RoleSwitcher value={roleKey} onChange={onRoleChange} onDark />
      </div>

      {/* Светящаяся кромка каркаса */}
      <span aria-hidden="true" className="beam-edge absolute inset-x-0 bottom-0" />
    </header>
  )
}

const LANGUAGES = [
  { key: 'ru', label: 'Русский', short: 'RU' },
  { key: 'kk', label: 'Қазақша', short: 'KK' },
  { key: 'en', label: 'English', short: 'EN' },
]

/** Язык интерфейса — раздел 8 ТЗ: русский обязателен, казахский и английский опционально */
function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState('ru')
  const ref = useOutsideClick(() => setOpen(false), open)
  useEscapeKey(() => setOpen(false), open)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Язык интерфейса"
        className={cn(
          'focus-ring-nav inline-flex h-control items-center gap-1 rounded border border-transparent px-1.5 text-nav-subtle transition-colors duration-fast hover:bg-nav-hover hover:text-nav-fg',
          open && 'bg-nav-hover text-nav-fg',
        )}
      >
        <Icon name="globe" size={15} />
        <span className="font-mono text-2xs font-semibold">
          {LANGUAGES.find((l) => l.key === lang)?.short}
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-dropdown w-40 animate-scale-in overflow-hidden rounded-md border border-hairline bg-surface shadow-lg"
        >
          {LANGUAGES.map((option) => (
            <button
              key={option.key}
              type="button"
              role="option"
              aria-selected={option.key === lang}
              onClick={() => {
                setLang(option.key)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-base transition-colors duration-fast',
                option.key === lang
                  ? 'bg-accent-soft text-accent-strong'
                  : 'text-content-muted hover:bg-surface-sunken hover:text-content',
              )}
            >
              <span>{option.label}</span>
              <span className="font-mono text-2xs text-content-faint">{option.short}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Заголовок страницы под топбаром: название раздела, счётчик, действия.
 * Используется всеми экранами системы для единого ритма.
 */
export function PageHeader({ plate, title, subtitle, actions, tabs, icon, className }) {
  return (
    <div className={cn('border-b border-hairline bg-surface-raised', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-3.5 pt-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon ? (
              <span className="flex h-7 w-7 items-center justify-center rounded border border-accent-line bg-accent-soft text-accent-fg shadow-bevel">
                <Icon name={icon} size={15} />
              </span>
            ) : null}
            <h1 className="truncate text-2xl font-semibold leading-tight text-content">{title}</h1>
            {plate ? (
              <span className="mt-0.5 inline-flex items-center rounded-sm border border-hairline-strong bg-surface-sunken px-1.5 py-px font-mono text-2xs font-semibold uppercase tracking-plate text-content-subtle">
                {plate}
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <p className="mt-1 max-w-3xl text-base text-content-subtle">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {tabs ? <div className="px-5">{tabs}</div> : null}
    </div>
  )
}

export default Topbar
