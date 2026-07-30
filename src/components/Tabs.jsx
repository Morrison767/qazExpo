import { cn } from '@/lib/cn'
import { Icon } from './Icon'
import { Counter } from './Badge'

/**
 * Табы. Два варианта:
 *  underline — навигация внутри карточки объекта (Основное / Договоры / Подрядчики / История)
 *  segmented — переключение режимов данных (День / Неделя / Месяц / Год)
 */
export function Tabs({ items, value, onChange, variant = 'underline', size = 'md', className }) {
  if (variant === 'segmented') {
    return (
      <div
        role="tablist"
        className={cn(
          'inline-flex items-center gap-0.5 rounded-md border border-hairline bg-ink-100 p-0.5',
          className,
        )}
      >
        {items.map((item) => {
          const active = item.key === value
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={item.disabled}
              onClick={() => onChange?.(item.key)}
              className={cn(
                'focus-ring inline-flex items-center gap-1.5 rounded-[4px] px-2.5 font-medium transition-colors duration-fast disabled:opacity-40',
                size === 'sm' ? 'h-6 text-xs' : 'h-7 text-base',
                active
                  ? 'bg-white text-ink-900 shadow-xs'
                  : 'text-ink-500 hover:text-ink-800',
              )}
            >
              {item.icon ? <Icon name={item.icon} size={13} /> : null}
              {item.label}
              {item.count != null ? (
                <Counter value={item.count} tone={active ? 'navy' : 'neutral'} />
              ) : null}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div role="tablist" className={cn('flex items-center gap-1 border-b border-hairline', className)}>
      {items.map((item) => {
        const active = item.key === value
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onChange?.(item.key)}
            className={cn(
              'focus-ring relative inline-flex items-center gap-1.5 rounded-t-sm px-3 font-medium transition-colors duration-fast disabled:opacity-40',
              size === 'sm' ? 'h-8 text-base' : 'h-9 text-md',
              active
                ? 'text-navy-700 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-t-sm after:bg-navy-600'
                : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800',
            )}
          >
            {item.icon ? <Icon name={item.icon} size={14} /> : null}
            {item.label}
            {item.count != null ? (
              <Counter value={item.count} tone={active ? 'navy' : 'neutral'} />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
