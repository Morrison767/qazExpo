import { cn } from '@/lib/cn'
import { formatNumber, plural } from '@/lib/format'
import { IconButton } from './Button'
import { Select } from './Field'

function pageList(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, '…', pages]
  if (page >= pages - 3) return [1, '…', pages - 4, pages - 3, pages - 2, pages - 1, pages]
  return [1, '…', page - 1, page, page + 1, '…', pages]
}

/**
 * Пагинация реестра. Слева — диапазон и общее количество записей
 * (оператору важно знать объём выборки), справа — переход по страницам.
 */
export function Pagination({
  page = 1,
  pageSize = 25,
  total = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100],
  entityForms = ['запись', 'записи', 'записей'],
  attached = true,
  className,
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border border-hairline bg-white px-3 py-2',
        attached ? 'rounded-b-md border-t-0' : 'rounded-md',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <p className="text-xs tabular-nums text-ink-500">
          Показано{' '}
          <span className="font-semibold text-ink-800">
            {formatNumber(from)}–{formatNumber(to)}
          </span>{' '}
          из <span className="font-semibold text-ink-800">{formatNumber(total)}</span>{' '}
          {plural(total, entityForms)}
        </p>
        {onPageSizeChange ? (
          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="text-xs text-ink-400">на странице</span>
            <Select
              size="sm"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              options={pageSizeOptions.map((option) => ({ value: option, label: String(option) }))}
              className="w-16"
            />
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          icon="chevron-left"
          label="Предыдущая страница"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
        />
        {pageList(page, pages).map((item, index) =>
          item === '…' ? (
            <span
              key={`gap-${index}`}
              className="px-1 text-xs text-ink-300"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange?.(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                'focus-ring h-control-sm min-w-control-sm rounded-sm border px-1.5 text-xs font-medium tabular-nums transition-colors duration-fast',
                item === page
                  ? 'border-navy-700 bg-navy-600 text-white'
                  : 'border-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-900',
              )}
            >
              {item}
            </button>
          ),
        )}
        <IconButton
          icon="chevron-right"
          label="Следующая страница"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange?.(page + 1)}
        />
      </div>
    </div>
  )
}

export default Pagination
