import { cn } from '@/lib/cn'
import { Icon } from './Icon'
import { Counter } from './Badge'

/**
 * Табы. Два варианта:
 *  underline — навигация внутри карточки объекта (Основное / Договоры / Подрядчики / История)
 *  segmented — переключение режимов данных (День / Неделя / Месяц / Год)
 *
 * Активный таб в underline подчёркнут светящейся линией — тот же
 * световой язык, что у кромки статуса и активного пункта навигации.
 */
export function Tabs({
  items,
  value,
  onChange,
  variant = 'underline',
  size = 'md',
  onDark = false,
  className,
}) {
  if (variant === 'segmented') {
    return (
      <div
        role="tablist"
        className={cn(
          'inline-flex items-center gap-0.5 rounded-md border p-0.5',
          onDark ? 'border-white/[0.1] bg-white/[0.05]' : 'border-hairline bg-ink-100',
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
                'inline-flex items-center gap-1.5 rounded-[4px] px-2.5 font-medium transition-all duration-fast disabled:opacity-40',
                onDark ? 'focus-ring-dark' : 'focus-ring',
                size === 'sm' ? 'h-6 text-xs' : 'h-7 text-base',
                active
                  ? onDark
                    ? 'bg-white/[0.1] text-obsidian-50 shadow-button-dark'
                    : 'bg-white text-ink-900 shadow-button-light'
                  : onDark
                    ? 'text-obsidian-300 hover:text-obsidian-50'
                    : 'text-ink-500 hover:text-ink-800',
              )}
            >
              {item.icon ? <Icon name={item.icon} size={13} /> : null}
              {item.label}
              {item.count != null ? (
                <Counter
                  value={item.count}
                  tone={active ? 'beam' : 'neutral'}
                  className={onDark && !active ? 'bg-white/[0.08] text-obsidian-200' : undefined}
                />
              ) : null}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 border-b',
        onDark ? 'border-white/[0.08]' : 'border-hairline',
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
              'relative inline-flex items-center gap-1.5 rounded-t-sm px-3 font-medium transition-colors duration-fast disabled:opacity-40',
              onDark ? 'focus-ring-dark' : 'focus-ring',
              size === 'sm' ? 'h-8 text-base' : 'h-9 text-md',
              active
                ? onDark
                  ? 'text-beam-300'
                  : 'text-beam-800'
                : onDark
                  ? 'text-obsidian-300 hover:bg-white/[0.05] hover:text-obsidian-50'
                  : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800',
            )}
          >
            {item.icon ? <Icon name={item.icon} size={14} /> : null}
            {item.label}
            {item.count != null ? (
              <Counter
                value={item.count}
                tone={active ? 'beam' : 'neutral'}
                className={onDark && !active ? 'bg-white/[0.08] text-obsidian-200' : undefined}
              />
            ) : null}
            {active ? (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-0 -bottom-px h-0.5 rounded-t-sm',
                  onDark ? 'bg-beam-400' : 'bg-beam-700',
                )}
                style={{
                  boxShadow: onDark
                    ? '0 0 10px 0 rgba(53,214,240,0.7)'
                    : '0 0 8px 0 rgba(11,124,147,0.4)',
                }}
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
