import { cn } from '@/lib/cn'
import { Icon } from './Icon'

/**
 * ПУСТОЕ СОСТОЯНИЕ. Подложка — сетка «плана зала»: тонкая отсылка
 * к схемам павильонов, которая отличает пустой экран от сломанного.
 *
 * tone: default (нет данных) | search (ничего не найдено) | error (сбой)
 */
const TONES = {
  default: { icon: 'inbox', iconClass: 'text-navy-400 bg-navy-50 border-navy-100' },
  search: { icon: 'search', iconClass: 'text-ink-400 bg-ink-50 border-hairline' },
  error: {
    icon: 'alert-triangle',
    iconClass: 'text-danger-600 bg-danger-50 border-danger-200',
  },
  locked: { icon: 'lock', iconClass: 'text-ink-400 bg-ink-50 border-hairline' },
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
        bordered && 'rounded-md border border-dashed border-hairline-strong bg-white',
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
        <p className={cn('font-semibold text-ink-900', s.title)}>{title}</p>
        {description ? (
          <p className="mt-1 text-base leading-normal text-ink-500">{description}</p>
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
