import { cn } from '@/lib/cn'
import { Icon } from './Icon'
import { IconButton } from './Button'
import { Counter } from './Badge'
import { RoleSwitcher } from './RoleSwitcher'
import { Breadcrumbs } from './Breadcrumbs'

/**
 * ТОПБАР — верхняя кромка корпуса.
 * Слева — где я нахожусь (крошки), справа — от чьего имени работаю.
 * Снизу проходит светящаяся линия: она отделяет корпус от рабочей
 * поверхности и служит главным «световым» акцентом каркаса.
 */
export function Topbar({
  breadcrumbs,
  roleKey,
  onRoleChange,
  onToggleSidebar,
  notifications = 0,
  onSearch,
  searchValue = '',
  className,
}) {
  return (
    <header
      className={cn(
        'on-obsidian relative flex h-topbar shrink-0 items-center gap-3 bg-surface-obsidian px-3',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute inset-0 opacity-50"
      />

      <div className="relative flex min-w-0 flex-1 items-center gap-3">
        <IconButton
          icon="panel-left"
          label="Свернуть/раскрыть навигацию"
          size="sm"
          variant="ghost-dark"
          onClick={onToggleSidebar}
        />

        {breadcrumbs?.length ? (
          <Breadcrumbs items={breadcrumbs} onDark className="min-w-0 flex-1" />
        ) : (
          <div className="min-w-0 flex-1" />
        )}
      </div>

      <div className="relative flex items-center gap-2.5">
        {/* Поиск на корпусе: стеклянное поле, подсветка по фокусу */}
        <div className="relative hidden md:block">
          <Icon
            name="search"
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian-300"
          />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearch?.(event.target.value)}
            placeholder="Поиск: мероприятие, договор, арендатор…"
            className={cn(
              'h-control w-64 rounded border border-white/[0.1] bg-white/[0.05] pl-8 pr-14 text-base text-obsidian-50 xl:w-80',
              'placeholder:text-obsidian-300',
              'transition-all duration-fast focus:border-beam-400/50 focus:bg-white/[0.08] focus:shadow-beam-sm focus:outline-none',
            )}
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-sm border border-white/[0.1] bg-white/[0.06] px-1 py-px font-mono text-2xs text-obsidian-300">
            ⌘K
          </kbd>
        </div>

        <div className="relative">
          <IconButton icon="bell" label="Уведомления" size="md" variant="ghost-dark" />
          {notifications > 0 ? (
            <span
              className="pointer-events-none absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-danger-500 px-1 text-2xs font-semibold leading-none tabular-nums tracking-normal text-white"
              style={{ boxShadow: '0 0 0 2px #080D14, 0 0 8px 0 rgba(239,68,68,0.6)' }}
            >
              {notifications}
            </span>
          ) : null}
        </div>

        <span className="h-5 w-px shrink-0 bg-white/[0.1]" aria-hidden="true" />

        <RoleSwitcher value={roleKey} onChange={onRoleChange} onDark />
      </div>

      {/* Светящаяся кромка корпуса */}
      <span aria-hidden="true" className="beam-edge absolute inset-x-0 bottom-0" />
    </header>
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
              <span className="flex h-7 w-7 items-center justify-center rounded border border-beam-200 bg-beam-50 text-beam-700 shadow-bevel">
                <Icon name={icon} size={15} />
              </span>
            ) : null}
            <h1 className="truncate text-2xl font-semibold leading-tight text-ink-900">{title}</h1>
            {plate ? (
              <span className="mt-0.5 inline-flex items-center rounded-sm border border-hairline-strong bg-ink-25 px-1.5 py-px font-mono text-2xs font-semibold uppercase tracking-plate text-ink-600">
                {plate}
              </span>
            ) : null}
          </div>
          {subtitle ? <p className="mt-1 max-w-3xl text-base text-ink-500">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {tabs ? <div className="px-5">{tabs}</div> : null}
    </div>
  )
}

export default Topbar
