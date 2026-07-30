import { cn } from '@/lib/cn'
import { Icon } from './Icon'
import { HallPlate } from './HallPlate'

/**
 * Хлебные крошки — путь по комплексу: Объект → Помещение → Мероприятие.
 * Последний элемент может нести табличку-идентификатор объекта.
 * onDark — версия для корпуса (топбар, шапка панели).
 */
export function Breadcrumbs({ items, onDark = false, className }) {
  return (
    <nav aria-label="Навигационная цепочка" className={cn('flex min-w-0 items-center', className)}>
      <ol className="flex min-w-0 items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.label ?? index} className="flex min-w-0 items-center gap-1">
              {index > 0 ? (
                <Icon
                  name="chevron-right"
                  size={12}
                  className={cn('shrink-0', onDark ? 'text-obsidian-400' : 'text-ink-300')}
                />
              ) : null}
              {isLast ? (
                <span className="flex min-w-0 items-center gap-1.5">
                  {item.plate ? (
                    <HallPlate size="sm" tone={onDark ? 'beam' : 'outline'}>
                      {item.plate}
                    </HallPlate>
                  ) : null}
                  <span
                    aria-current="page"
                    className={cn(
                      'truncate text-base font-medium',
                      onDark ? 'text-obsidian-50' : 'text-ink-900',
                    )}
                  >
                    {item.label}
                  </span>
                </span>
              ) : (
                <a
                  href={item.href ?? '#'}
                  onClick={
                    item.onClick
                      ? (event) => {
                          event.preventDefault()
                          item.onClick()
                        }
                      : undefined
                  }
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1 rounded-sm px-0.5 text-base transition-colors duration-fast',
                    onDark
                      ? 'focus-ring-dark text-obsidian-200 hover:text-beam-300'
                      : 'focus-ring text-ink-500 hover:text-beam-700',
                  )}
                >
                  {index === 0 && item.icon ? <Icon name={item.icon} size={13} /> : null}
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
