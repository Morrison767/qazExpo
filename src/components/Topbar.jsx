import { cn } from '@/lib/cn'
import { Icon } from './Icon'
import { IconButton } from './Button'
import { SearchInput } from './Field'
import { Counter } from './Badge'
import { RoleSwitcher } from './RoleSwitcher'
import { Breadcrumbs } from './Breadcrumbs'

/**
 * ТОПБАР. Слева — где я нахожусь (крошки), справа — от чьего имени работаю.
 * Глобальный поиск — единая точка входа в реестры, договоры и документы
 * (в дальнейшем — с AI-поиском, п. 10.9 ТЗ).
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
        'flex h-topbar shrink-0 items-center gap-3 border-b border-hairline bg-white px-3',
        className,
      )}
    >
      <IconButton
        icon="panel-left"
        label="Свернуть/раскрыть навигацию"
        size="sm"
        onClick={onToggleSidebar}
        className="lg:hidden"
      />

      {breadcrumbs?.length ? (
        <Breadcrumbs items={breadcrumbs} className="min-w-0 flex-1" />
      ) : (
        <div className="min-w-0 flex-1" />
      )}

      <SearchInput
        placeholder="Поиск: мероприятие, договор, арендатор…"
        hint="⌘K"
        value={searchValue}
        onChange={(event) => onSearch?.(event.target.value)}
        className="hidden w-64 md:block xl:w-80"
      />

      <div className="relative">
        <IconButton icon="bell" label="Уведомления" size="md" />
        {notifications > 0 ? (
          <Counter
            value={notifications}
            tone="danger"
            className="pointer-events-none absolute -right-0.5 -top-0.5 ring-2 ring-white"
          />
        ) : null}
      </div>

      <span className="h-5 w-px shrink-0 bg-hairline" aria-hidden="true" />

      <RoleSwitcher value={roleKey} onChange={onRoleChange} />
    </header>
  )
}

/**
 * Заголовок страницы под топбаром: название раздела, счётчик, действия.
 * Используется всеми экранами системы для единого ритма.
 */
export function PageHeader({
  plate,
  title,
  subtitle,
  actions,
  tabs,
  icon,
  className,
}) {
  return (
    <div className={cn('border-b border-hairline bg-white', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-3.5 pt-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon ? (
              <span className="flex h-6 w-6 items-center justify-center rounded border border-navy-100 bg-navy-50 text-navy-600">
                <Icon name={icon} size={14} />
              </span>
            ) : null}
            <h1 className="truncate text-2xl font-semibold leading-tight text-ink-900">{title}</h1>
            {plate ? (
              <span className="mt-0.5">
                <span className="inline-flex items-center rounded-sm border border-navy-200 bg-white px-1.5 py-px font-mono text-2xs font-semibold uppercase tracking-plate text-navy-700">
                  {plate}
                </span>
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
