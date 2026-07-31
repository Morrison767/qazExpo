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
                  className={cn('shrink-0', onDark ? 'text-nav-faint' : 'text-content-faint')}
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
                      onDark ? 'text-nav-fg' : 'text-content',
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
                      ? 'focus-ring-nav text-nav-muted hover:text-accent-strong'
                      : 'focus-ring text-content-subtle hover:text-accent-fg',
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
