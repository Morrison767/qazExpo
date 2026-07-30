import { cn } from '@/lib/cn'
import { getStatus } from '@/design/statuses'
import { Icon } from './Icon'

/**
 * ═══════════════════════════════════════════════════════════════
 *  СИГНАЛЬНАЯ КРОМКА + СТАТУСНЫЙ БЕЙДЖ — подписная деталь системы
 * ═══════════════════════════════════════════════════════════════
 *
 * StatusRail — вертикальная кромка 4px слева от любого объекта, несущего
 * статус: карточка, строка реестра, элемент календаря, слайд-панель, тост.
 * Статус считывается периферийным зрением до чтения текста.
 *
 * Доступность: цвет никогда не работает один. Бейдж всегда несёт
 * иконку-форму + текстовую метку, а «конфликт» дополнительно получает
 * диагональную штриховку — единственный статус с паттерном,
 * читаемый даже в ч/б печати и при любой форме цветовой слепоты.
 */

/* Статические классы — Tailwind должен видеть их в исходниках */
const SOFT = {
  draft: 'bg-status-draft-soft border-status-draft-border text-status-draft-text',
  review: 'bg-status-review-soft border-status-review-border text-status-review-text',
  confirmed: 'bg-status-confirmed-soft border-status-confirmed-border text-status-confirmed-text',
  conflict: 'bg-status-conflict-soft border-status-conflict-border text-status-conflict-text',
  paid: 'bg-status-paid-soft border-status-paid-border text-status-paid-text',
  unpaid: 'bg-status-unpaid-soft border-status-unpaid-border text-status-unpaid-text',
  done: 'bg-status-done-soft border-status-done-border text-status-done-text',
  void: 'bg-status-void-soft border-status-void-border text-status-void-text',
}

const SOLID = {
  draft: 'bg-status-draft-base border-status-draft-base text-white',
  review: 'bg-status-review-base border-status-review-base text-white',
  confirmed: 'bg-status-confirmed-base border-status-confirmed-base text-white',
  conflict: 'bg-status-conflict-base border-status-conflict-base text-white',
  paid: 'bg-status-paid-base border-status-paid-base text-white',
  unpaid: 'bg-status-unpaid-base border-status-unpaid-base text-white',
  done: 'bg-status-done-base border-status-done-base text-white',
  void: 'bg-status-void-base border-status-void-base text-white',
}

const OUTLINE = {
  draft: 'bg-white border-status-draft-border text-status-draft-text',
  review: 'bg-white border-status-review-border text-status-review-text',
  confirmed: 'bg-white border-status-confirmed-border text-status-confirmed-text',
  conflict: 'bg-white border-status-conflict-border text-status-conflict-text',
  paid: 'bg-white border-status-paid-border text-status-paid-text',
  unpaid: 'bg-white border-status-unpaid-border text-status-unpaid-text',
  done: 'bg-white border-status-done-border text-status-done-text',
  void: 'bg-white border-status-void-border text-status-void-text',
}

const ICON_COLOR = {
  draft: 'text-status-draft-base',
  review: 'text-status-review-base',
  confirmed: 'text-status-confirmed-base',
  conflict: 'text-status-conflict-base',
  paid: 'text-status-paid-base',
  unpaid: 'text-status-unpaid-base',
  done: 'text-status-done-base',
  void: 'text-status-void-base',
}

const RAIL_BG = {
  draft: 'bg-status-draft-base',
  review: 'bg-status-review-base',
  confirmed: 'bg-status-confirmed-base',
  conflict: 'bg-status-conflict-base',
  paid: 'bg-status-paid-base',
  unpaid: 'bg-status-unpaid-base',
  done: 'bg-status-done-base',
  void: 'bg-status-void-base',
}

const RAIL_TEXT = {
  draft: 'text-status-draft-base',
  review: 'text-status-review-base',
  confirmed: 'text-status-confirmed-base',
  conflict: 'text-status-conflict-base',
  paid: 'text-status-paid-base',
  unpaid: 'text-status-unpaid-base',
  done: 'text-status-done-base',
  void: 'text-status-void-base',
}

const BADGE_SIZES = {
  sm: 'h-[18px] gap-1 rounded-sm px-1.5 text-2xs tracking-normal',
  md: 'h-5.5 gap-1.5 rounded px-2 text-xs',
  lg: 'h-6 gap-1.5 rounded px-2.5 text-base',
}

const BADGE_ICON_SIZE = { sm: 10, md: 12, lg: 13 }

/**
 * Бейдж статуса. variant: soft (по умолчанию) | solid | outline
 */
export function StatusBadge({
  status,
  label,
  size = 'md',
  variant = 'soft',
  withIcon = true,
  className,
  ...rest
}) {
  const meta = getStatus(status)
  const key = meta.key
  const palette = variant === 'solid' ? SOLID : variant === 'outline' ? OUTLINE : SOFT

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center border font-medium leading-none',
        palette[key],
        BADGE_SIZES[size] ?? BADGE_SIZES.md,
        className,
      )}
      title={meta.description}
      {...rest}
    >
      {withIcon ? (
        <Icon
          name={meta.icon}
          size={BADGE_ICON_SIZE[size] ?? 12}
          strokeWidth={1.8}
          className={variant === 'solid' ? 'text-white' : ICON_COLOR[key]}
        />
      ) : null}
      <span className="truncate">{label ?? meta.label}</span>
    </span>
  )
}

/**
 * Сигнальная кромка. Растягивается по высоте родителя (родителю нужен `relative`).
 * Для статуса «конфликт» включается диагональная штриховка.
 */
export function StatusRail({ status, className, rounded = true, ...rest }) {
  const meta = getStatus(status)
  const isConflict = meta.key === 'conflict'

  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-y-0 left-0 w-rail',
        isConflict ? cn('hazard-stripes', RAIL_TEXT[meta.key]) : RAIL_BG[meta.key],
        rounded && 'rounded-l-[5px]',
        className,
      )}
      {...rest}
    />
  )
}

/** Компактная точка статуса — для плотных списков и легенд календаря */
export function StatusDot({ status, size = 8, className, withLabel = false, labelClassName }) {
  const meta = getStatus(status)
  const dot = (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block shrink-0 rounded-full',
        RAIL_BG[meta.key],
        meta.key === 'conflict' && 'ring-2 ring-status-conflict-soft',
        className,
      )}
      style={{ width: size, height: size }}
    />
  )
  if (!withLabel) return dot
  return (
    <span className="inline-flex items-center gap-1.5">
      {dot}
      <span className={cn('text-xs text-ink-600', labelClassName)}>{meta.label}</span>
    </span>
  )
}

/** Метка-полоса для календаря: кромка + текст в одну строку */
export function StatusStrip({ status, children, className }) {
  const meta = getStatus(status)
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-sm border py-1 pl-2.5 pr-2 text-xs',
        SOFT[meta.key],
        className,
      )}
    >
      <StatusRail status={status} rounded={false} />
      <div className="truncate font-medium">{children}</div>
    </div>
  )
}

export default StatusBadge
