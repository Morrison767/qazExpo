import { cn } from '@/lib/cn'
import { Icon } from './Icon'

/**
 * ПУСТОЕ СОСТОЯНИЕ. Подложка — сетка «плана зала»: тонкая отсылка
 * к схемам павильонов, которая отличает пустой экран от сломанного.
 *
 * tone: default (нет данных) | search (ничего не найдено) | error (сбой)
 */
const TONES = {
  default: {
    icon: 'inbox',
    iconClass: 'text-accent-fg bg-accent-soft border-accent-line shadow-beam-sm',
  },
  search: { icon: 'search', iconClass: 'text-content-faint bg-surface-sunken border-hairline shadow-bevel' },
  error: {
    icon: 'alert-triangle',
    iconClass: 'text-danger-600 bg-danger-50 border-danger-200',
  },
  locked: { icon: 'lock', iconClass: 'text-content-faint bg-surface-sunken border-hairline shadow-bevel' },
}

const SIZES = {
  sm: { wrap: 'px-5 py-7', icon: 'h-8 w-8', iconSize: 16, title: 'text-base', gap: 'gap-2' },
  md: { wrap: 'px-6 py-11', icon: 'h-11 w-11', iconSize: 20, title: 'text-lg', gap: 'gap-3' },
  lg: { wrap: 'px-6 py-16', icon: 'h-14 w-14', iconSize: 24, title: 'text-xl', gap: 'gap-3.5' },
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  tone = 'default',
  size = 'md',
  bordered = false,
  grid = true,
  className,
}) {
  const t = TONES[tone] ?? TONES.default
  const s = SIZES[size] ?? SIZES.md

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        grid && 'floorplan-grid',
        bordered && 'rounded-md border border-dashed border-hairline-strong bg-surface',
        s.wrap,
        s.gap,
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-md border',
          s.icon,
          t.iconClass,
        )}
      >
        <Icon name={icon ?? t.icon} size={s.iconSize} strokeWidth={1.5} />
      </div>
      <div className="max-w-md">
        <p className={cn('font-semibold text-content', s.title)}>{title}</p>
        {description ? (
          <p className="mt-1 text-base leading-normal text-content-subtle">{description}</p>
        ) : null}
      </div>
      {action || secondaryAction ? (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  )
}

export default EmptyState
