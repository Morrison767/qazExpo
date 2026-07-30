import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { getStatus } from '@/design/statuses'
import { Icon } from './Icon'
import { Checkbox } from './Field'

/**
 * РЕЕСТРОВАЯ ТАБЛИЦА.
 *
 * Плотность — приоритет: строка 36px, кегль 12–13px, табличные цифры,
 * липкая шапка, CAPS-заголовки как на указателях.
 * Слева у каждой строки — сигнальная кромка статуса (подписная деталь):
 * оператор видит состояние всего реестра одним движением взгляда.
 */

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

const DENSITY = {
  compact: { row: 'h-row', cell: 'px-3 text-sm', head: 'h-8 px-3' },
  comfortable: { row: 'h-row-lg', cell: 'px-3.5 text-base', head: 'h-9 px-3.5' },
}

const ALIGN = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
}

function defaultCompare(a, b) {
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'ru')
}

/**
 * columns: [{
 *   key, header, align, width, sortable, mono, nowrap,
 *   accessor?: (row) => any,      // значение для сортировки
 *   render?: (row) => ReactNode,  // содержимое ячейки
 * }]
 */
export function DataTable({
  columns,
  rows,
  rowKey = (row, index) => row.id ?? index,
  statusKey,
  selectable = false,
  selected = [],
  onSelectedChange,
  density = 'compact',
  initialSort = null,
  onRowClick,
  emptyState,
  stickyHeader = false,
  frame = true,
  className,
}) {
  const [sort, setSort] = useState(initialSort)
  const d = DENSITY[density] ?? DENSITY.compact

  const sortedRows = useMemo(() => {
    if (!sort?.key) return rows
    const column = columns.find((c) => c.key === sort.key)
    if (!column) return rows
    const accessor = column.accessor ?? ((row) => row[column.key])
    const factor = sort.dir === 'desc' ? -1 : 1
    return [...rows].sort((a, b) => defaultCompare(accessor(a), accessor(b)) * factor)
  }, [rows, sort, columns])

  function toggleSort(key) {
    setSort((current) => {
      if (current?.key !== key) return { key, dir: 'asc' }
      if (current.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }

  const allSelected = rows.length > 0 && selected.length === rows.length
  const someSelected = selected.length > 0 && !allSelected

  function toggleAll() {
    onSelectedChange?.(allSelected ? [] : rows.map((row, index) => rowKey(row, index)))
  }

  function toggleRow(key) {
    if (!onSelectedChange) return
    onSelectedChange(
      selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key],
    )
  }

  const colCount = columns.length + (selectable ? 1 : 0) + (statusKey ? 1 : 0)

  return (
    <div
      className={cn(
        'overflow-hidden bg-white',
        frame
          ? 'rounded-md border border-hairline shadow-xs'
          : 'border-x border-hairline',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className={cn(stickyHeader && 'sticky top-0 z-sticky')}>
            <tr className="bg-ink-50">
              {statusKey ? <th className="w-rail p-0" aria-label="Статус" /> : null}
              {selectable ? (
                <th className={cn('w-9 border-b border-hairline bg-ink-50', d.head)}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    aria-label="Выбрать все строки"
                  />
                </th>
              ) : null}
              {columns.map((column) => {
                const isSorted = sort?.key === column.key
                const align = ALIGN[column.align] ?? ALIGN.left
                return (
                  <th
                    key={column.key}
                    scope="col"
                    style={column.width ? { width: column.width } : undefined}
                    className={cn(
                      'border-b border-hairline bg-ink-50 text-2xs font-semibold uppercase tracking-label text-ink-500',
                      d.head,
                      align,
                      column.headClassName,
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={cn(
                          'focus-ring group -mx-1 inline-flex h-6 max-w-full items-center gap-1 rounded-sm px-1 transition-colors duration-fast hover:text-navy-700',
                          isSorted && 'text-navy-700',
                          column.align === 'right' && 'flex-row-reverse',
                        )}
                        aria-label={`Сортировать по «${column.header}»`}
                      >
                        <span className="truncate uppercase tracking-label">{column.header}</span>
                        <Icon
                          name={
                            isSorted ? (sort.dir === 'asc' ? 'sort-asc' : 'sort-desc') : 'sort'
                          }
                          size={11}
                          className={cn(
                            'shrink-0 transition-opacity duration-fast',
                            isSorted
                              ? 'text-navy-600 opacity-100'
                              : 'text-ink-300 opacity-60 group-hover:opacity-100',
                          )}
                        />
                      </button>
                    ) : (
                      <span className="truncate">{column.header}</span>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="p-0">
                  {emptyState}
                </td>
              </tr>
            ) : (
              sortedRows.map((row, index) => {
                const key = rowKey(row, index)
                const isSelected = selected.includes(key)
                const statusValue = statusKey ? statusKey(row) : null
                const statusMeta = statusValue ? getStatus(statusValue) : null
                const isConflict = statusMeta?.key === 'conflict'

                return (
                  <tr
                    key={key}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'group border-b border-hairline-soft transition-colors duration-fast last:border-b-0',
                      isSelected ? 'bg-navy-50' : 'hover:bg-navy-50/50',
                      onRowClick && 'cursor-pointer',
                    )}
                  >
                    {statusKey ? (
                      <td
                        className={cn(
                          'w-rail p-0',
                          isConflict
                            ? cn('hazard-stripes', RAIL_TEXT[statusMeta.key])
                            : statusMeta
                              ? RAIL_BG[statusMeta.key]
                              : null,
                        )}
                        aria-hidden="true"
                      />
                    ) : null}
                    {selectable ? (
                      <td className={cn(d.row, d.cell, 'w-9')} onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleRow(key)}
                          aria-label="Выбрать строку"
                        />
                      </td>
                    ) : null}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          d.row,
                          d.cell,
                          'text-ink-800 tabular-nums',
                          ALIGN[column.align] ?? ALIGN.left,
                          column.mono && 'font-mono',
                          column.nowrap && 'whitespace-nowrap',
                          column.cellClassName,
                        )}
                      >
                        {column.render ? column.render(row) : (row[column.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Панель над таблицей: поиск, фильтры, счётчик, действия */
export function TableToolbar({ left, right, className, children }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 rounded-t-md border border-b-0 border-hairline bg-white px-3 py-2.5',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">{left ?? children}</div>
      {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
    </div>
  )
}

/** Легенда статусов под таблицей или календарём */
export function TableCaption({ children, className }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 pt-2 text-xs text-ink-500',
        className,
      )}
    >
      {children}
    </div>
  )
}

export default DataTable
