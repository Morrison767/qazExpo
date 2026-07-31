import { cn } from '@/lib/cn'
import { HallPlate } from './HallPlate'
import { StatusRail, StatusBadge } from './Status'
import { Icon } from './Icon'
import { CountUp, BeamSweep } from './Motion'

/**
 * КАРТОЧКА — базовый контейнер для мероприятия, договора, арендатора,
 * подрядчика и помещения.
 *
 * Подписная структура (повторяется во всей системе):
 *   [светящаяся кромка 3px] [табличка-идентификатор] Заголовок
 *                            подзаголовок · метаданные
 *                            ─────────────────────────
 *                            сетка полей с CAPS-метками
 *
 * Глубина — три слоя: микроградиент поверхности, фаска-блик 1px сверху
 * и мягкая ambient-тень (shadow-card). Плоских прямоугольников нет.
 * Обе темы обслуживаются одними классами.
 */
export function Card({
  status,
  interactive = false,
  sweep = false,
  as: Component = 'div',
  className,
  children,
  ...rest
}) {
  return (
    <Component
      className={cn(
        'relative overflow-hidden rounded-md border border-hairline bg-surface-raised',
        status && 'pl-rail',
        interactive &&
          'focus-ring cursor-pointer text-left transition-all duration-base ease-decelerate hover:-translate-y-px hover:border-hairline-strong hover:shadow-card-hover',
        className,
      )}
      {...rest}
    >
      {status ? <StatusRail status={status} /> : null}
      {sweep ? <BeamSweep /> : null}
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
            {meta ? <span className="text-xs text-content-faint">{meta}</span> : null}
          </div>
          {title ? (
            <h3 className="mt-1.5 truncate text-lg font-semibold leading-snug text-content">
              {title}
            </h3>
          ) : null}
          {subtitle ? (
            <p className="mt-0.5 truncate text-base text-content-subtle">{subtitle}</p>
          ) : null}
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
        'flex flex-wrap items-center justify-between gap-2 border-t border-hairline-soft bg-surface-sunken px-4 py-2.5',
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
    default: 'text-content',
    muted: 'text-content-subtle',
    strong: 'text-content font-semibold',
    accent: 'text-accent-fg font-semibold',
  }

  return (
    <div className={cn('min-w-0', className)}>
      <dt className="mb-0.5 truncate text-2xs font-semibold uppercase tracking-label text-content-faint">
        {label}
      </dt>
      <dd
        className={cn(
          'flex items-center gap-1.5 truncate text-base tabular-nums',
          mono && 'font-mono',
          tones[tone] ?? tones.default,
        )}
      >
        {icon ? <Icon name={icon} size={13} className="text-content-faint" /> : null}
        <span className="truncate">{value ?? '—'}</span>
      </dd>
    </div>
  )
}

/* Цветной чип иконки в приборной плитке */
const CHIP = {
  accent: 'bg-accent-soft text-accent-fg border-accent-line',
  confirmed: 'bg-status-confirmed-soft text-status-confirmed-text border-status-confirmed-border',
  review: 'bg-status-review-soft text-status-review-text border-status-review-border',
  conflict: 'bg-status-conflict-soft text-status-conflict-text border-status-conflict-border',
  paid: 'bg-status-paid-soft text-status-paid-text border-status-paid-border',
  unpaid: 'bg-status-unpaid-soft text-status-unpaid-text border-status-unpaid-border',
  done: 'bg-status-done-soft text-status-done-text border-status-done-border',
  neutral: 'bg-surface-muted text-content-subtle border-hairline',
}

/**
 * ПРИБОРНАЯ ПЛИТКА — показатель сводки.
 *
 * Контраст кеглей 1:5 между CAPS-меткой (10px) и числом (44px, tabular,
 * отрицательный трекинг), досчёт величины при появлении, цветной чип
 * иконки и слот под инструмент — спарклайн, шкалу или кольцо.
 */
export function StatTile({
  label,
  value,
  countTo,
  countFormat,
  unit,
  delta,
  deltaTone = 'neutral',
  icon,
  chip = 'accent',
  hint,
  instrument,
  status,
  onClick,
  className,
}) {
  const deltaTones = {
    up: 'text-status-confirmed-text bg-status-confirmed-soft border-status-confirmed-border',
    down: 'text-status-unpaid-text bg-status-unpaid-soft border-status-unpaid-border',
    neutral: 'text-content-muted bg-surface-muted border-hairline',
  }

  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-md border border-hairline bg-surface-raised p-3.5 text-left',
        status && 'pl-rail',
        onClick &&
          'focus-ring group transition-all duration-base ease-decelerate hover:-translate-y-px hover:border-hairline-strong hover:shadow-card-hover',
        className,
      )}
    >
      {status ? <StatusRail status={status} /> : null}

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {icon ? (
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded border',
                CHIP[chip] ?? CHIP.accent,
              )}
            >
              <Icon name={icon} size={14} />
            </span>
          ) : null}
          <span className="truncate text-2xs font-semibold uppercase tracking-label text-content-subtle">
            {label}
          </span>
        </div>
        {onClick ? (
          <Icon
            name="arrow-right"
            size={13}
            className="shrink-0 text-content-faint opacity-0 transition-opacity duration-fast group-hover:opacity-100"
          />
        ) : null}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-5xl font-semibold tabular-nums leading-none text-content">
            {countTo != null ? <CountUp value={countTo} format={countFormat} /> : value}
          </span>
          {unit ? (
            <span className="text-base font-medium text-content-subtle">{unit}</span>
          ) : null}
        </div>
        {instrument ? <div className="shrink-0 pb-1">{instrument}</div> : null}
      </div>

      {delta || hint ? (
        <div className="mt-2.5 flex items-center gap-2">
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
          {hint ? <span className="truncate text-xs text-content-faint">{hint}</span> : null}
        </div>
      ) : null}
    </Component>
  )
}

/**
 * HERO-ПОЛОСА — сводная панель во всю ширину.
 * В светлой теме — прохладный градиент с бирюзовым свечением,
 * в тёмной — корпус прибора. Оба варианта несут точечную фактуру,
 * светящуюся кромку сверху и однократный проход света.
 */
export function HeroPanel({ children, className, sweep = true, grid = true, bloom = true }) {
  return (
    <div
      className={cn(
        'on-nav relative overflow-hidden border-y border-hairline bg-hero',
        className,
      )}
    >
      {grid ? (
        <span
          aria-hidden="true"
          className="dot-grid pointer-events-none absolute inset-0 opacity-70"
        />
      ) : null}
      {bloom ? (
        <span aria-hidden="true" className="bloom-beam pointer-events-none absolute inset-0" />
      ) : null}
      <span aria-hidden="true" className="beam-edge-soft absolute inset-x-0 top-0" />
      {sweep ? <BeamSweep /> : null}
      <div className="relative">{children}</div>
    </div>
  )
}

export default Card
