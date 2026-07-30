import { cn } from '@/lib/cn'
import { HallPlate } from './HallPlate'
import { StatusRail, StatusBadge } from './Status'
import { Icon } from './Icon'

/**
 * КАРТОЧКА — базовый контейнер для мероприятия, договора, арендатора,
 * подрядчика и помещения.
 *
 * Подписная структура (повторяется во всей системе):
 *   [сигнальная кромка 4px] [табличка-идентификатор] Заголовок
 *                            подзаголовок · метаданные
 *                            ─────────────────────────
 *                            сетка полей с CAPS-метками
 *
 * Если у объекта есть статус — кромка обязательна.
 */
export function Card({
  status,
  interactive = false,
  as: Component = 'div',
  className,
  children,
  ...rest
}) {
  return (
    <Component
      className={cn(
        'relative overflow-hidden rounded-md border border-hairline bg-white shadow-xs',
        status && 'pl-rail',
        interactive &&
          'focus-ring cursor-pointer transition-shadow duration-fast hover:border-hairline-strong hover:shadow-sm',
        className,
      )}
      {...rest}
    >
      {status ? <StatusRail status={status} /> : null}
      {children}
    </Component>
  )
}

export function CardHeader({
  plate,
  plateTone = 'navy',
  title,
  subtitle,
  status,
  statusLabel,
  actions,
  meta,
  className,
  children,
}) {
  return (
    <div className={cn('flex flex-col gap-2 px-4 pb-3 pt-3.5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {plate ? <HallPlate tone={plateTone}>{plate}</HallPlate> : null}
            {status ? <StatusBadge status={status} label={statusLabel} size="sm" /> : null}
            {meta ? <span className="text-xs text-ink-400">{meta}</span> : null}
          </div>
          {title ? (
            <h3 className="mt-1.5 truncate text-lg font-semibold leading-snug text-ink-900">
              {title}
            </h3>
          ) : null}
          {subtitle ? <p className="mt-0.5 truncate text-base text-ink-500">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
      </div>
      {children}
    </div>
  )
}

export function CardBody({ className, divided = true, children }) {
  return (
    <div className={cn('px-4 py-3', divided && 'border-t border-hairline-soft', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 border-t border-hairline-soft bg-ink-25 px-4 py-2.5',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Сетка полей карточки: CAPS-метка сверху, значение снизу */
export function MetaGrid({ columns = 2, className, children }) {
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }
  return (
    <dl className={cn('grid gap-x-4 gap-y-3', cols[columns] ?? cols[2], className)}>{children}</dl>
  )
}

export function MetaItem({ label, value, mono = false, icon, tone = 'default', className }) {
  const tones = {
    default: 'text-ink-900',
    muted: 'text-ink-500',
    strong: 'text-ink-900 font-semibold',
    accent: 'text-navy-700 font-semibold',
  }
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="mb-0.5 truncate text-2xs font-semibold uppercase tracking-label text-ink-400">
        {label}
      </dt>
      <dd
        className={cn(
          'flex items-center gap-1.5 truncate text-base tabular-nums',
          mono && 'font-mono',
          tones[tone] ?? tones.default,
        )}
      >
        {icon ? <Icon name={icon} size={13} className="text-ink-400" /> : null}
        <span className="truncate">{value ?? '—'}</span>
      </dd>
    </div>
  )
}

/**
 * KPI-плитка для дашборда и панелей сводки.
 * Число крупным кеглем + табличные цифры + дельта.
 */
export function StatTile({ label, value, unit, delta, deltaTone = 'neutral', icon, hint, className }) {
  const deltaTones = {
    up: 'text-status-confirmed-text bg-status-confirmed-soft border-status-confirmed-border',
    down: 'text-status-unpaid-text bg-status-unpaid-soft border-status-unpaid-border',
    neutral: 'text-ink-600 bg-ink-100 border-hairline',
  }
  return (
    <div className={cn('rounded-md border border-hairline bg-white p-3.5 shadow-xs', className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xs font-semibold uppercase tracking-label text-ink-400">
          {label}
        </span>
        {icon ? <Icon name={icon} size={14} className="text-ink-300" /> : null}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tabular-nums leading-none text-ink-900">
          {value}
        </span>
        {unit ? <span className="text-base text-ink-500">{unit}</span> : null}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {delta ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-2xs font-semibold tabular-nums',
              deltaTones[deltaTone] ?? deltaTones.neutral,
            )}
          >
            <Icon
              name={deltaTone === 'down' ? 'arrow-down' : 'arrow-up'}
              size={9}
              strokeWidth={2.2}
            />
            {delta}
          </span>
        ) : null}
        {hint ? <span className="truncate text-xs text-ink-400">{hint}</span> : null}
      </div>
    </div>
  )
}

export default Card
