import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/Topbar'
import { Button, IconButton } from '@/components/Button'
import { Tabs } from '@/components/Tabs'
import { Field, Select, SearchInput, DateField } from '@/components/Field'
import { StatusBadge } from '@/components/Status'
import { HallPlate } from '@/components/HallPlate'
import { Badge } from '@/components/Badge'
import { DataTable, TableToolbar } from '@/components/Table'
import { Pagination } from '@/components/Pagination'
import { EmptyState } from '@/components/EmptyState'
import { Icon } from '@/components/Icon'
import { useToast } from '@/components/Toast'
import { EventCreatePanel } from '@/components/EventCreatePanel'

import { useEvents } from '@/app/EventsContext'
import { cn } from '@/lib/cn'
import { formatDateRange, formatMoney, plural } from '@/lib/format'
import { occupiedRange, parseTime } from '@/lib/timeline'
import { OBJECTS, objectByKey } from '@/demo/events'
import { HALLS } from '@/demo/halls'
import { EVENT_TYPES } from '@/demo/data'

const FILTER_STATUSES = ['draft', 'review', 'confirmed', 'conflict', 'done', 'void']

/**
 * РЕЕСТР МЕРОПРИЯТИЙ (п. 5.1 ТЗ).
 * Работает с тем же store, что календарь и карточка: статус, изменённый
 * в карточке, здесь виден сразу.
 */
export default function Events() {
  const navigate = useNavigate()
  const toast = useToast()
  const { events, conflictIds } = useEvents()

  const [query, setQuery] = useState('')
  const [objectFilter, setObjectFilter] = useState('all')
  const [hallFilter, setHallFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [managerFilter, setManagerFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState(FILTER_STATUSES)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [density, setDensity] = useState('compact')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [creating, setCreating] = useState(false)

  const managers = useMemo(
    () => Array.from(new Set(events.map((e) => e.manager))).sort(),
    [events],
  )

  const hallOptions = useMemo(() => {
    const halls = objectFilter === 'all' ? HALLS : HALLS.filter((h) => h.objectKey === objectFilter)
    return [
      { value: 'all', label: 'Все помещения' },
      ...halls.map((h) => ({ value: h.id, label: `${h.code} · ${h.name}` })),
    ]
  }, [objectFilter])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const from = dateFrom ? parseTime(dateFrom) : null
    const to = dateTo ? parseTime(dateTo) + 86_400_000 : null

    return events.filter((event) => {
      if (needle) {
        const haystack = `${event.name} ${event.tenant} ${event.id}`.toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      if (objectFilter !== 'all' && event.objectKey !== objectFilter) return false
      if (hallFilter !== 'all' && event.hallId !== hallFilter) return false
      if (typeFilter !== 'all' && event.type !== typeFilter) return false
      if (managerFilter !== 'all' && event.manager !== managerFilter) return false
      if (!statusFilter.includes(event.status)) return false

      if (from || to) {
        const start = parseTime(event.eventFrom)
        const end = parseTime(event.eventTo)
        if (from && end < from) return false
        if (to && start > to) return false
      }
      return true
    })
  }, [events, query, objectFilter, hallFilter, typeFilter, managerFilter, statusFilter, dateFrom, dateTo])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const rows = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  )

  const filtersActive =
    query !== '' ||
    objectFilter !== 'all' ||
    hallFilter !== 'all' ||
    typeFilter !== 'all' ||
    managerFilter !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    statusFilter.length !== FILTER_STATUSES.length

  function resetFilters() {
    setQuery('')
    setObjectFilter('all')
    setHallFilter('all')
    setTypeFilter('all')
    setManagerFilter('all')
    setStatusFilter(FILTER_STATUSES)
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const columns = [
    {
      key: 'id',
      header: 'Заявка',
      width: 92,
      sortable: true,
      nowrap: true,
      render: (row) => (
        <span className="flex items-center gap-1">
          <HallPlate tone="muted">{row.id}</HallPlate>
          {conflictIds.has(row.id) ? (
            <Icon
              name="alert-triangle"
              size={11}
              className="shrink-0 text-status-conflict-base"
              title="Пересечение по помещению"
            />
          ) : null}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Название мероприятия',
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-content">{row.name}</p>
          <p className="truncate text-xs text-content-faint">{row.description}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Тип',
      width: 138,
      sortable: true,
      render: (row) => (
        <Badge tone="outline" size="sm">
          {row.type}
        </Badge>
      ),
    },
    {
      key: 'hall',
      header: 'Объект / зал',
      width: 150,
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-content">{row.hall}</p>
          <p className="truncate text-2xs text-content-faint">
            {objectByKey(row.objectKey)?.short}
          </p>
        </div>
      ),
    },
    {
      key: 'tenant',
      header: 'Арендатор',
      width: 190,
      sortable: true,
      render: (row) => <span className="truncate text-content-muted">{row.tenant}</span>,
    },
    {
      key: 'eventFrom',
      header: 'Проведение',
      width: 136,
      sortable: true,
      nowrap: true,
      render: (row) => formatDateRange(row.eventFrom, row.eventTo),
    },
    {
      key: 'status',
      header: 'Статус',
      width: 148,
      sortable: true,
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'manager',
      header: 'Ответственный',
      width: 118,
      sortable: true,
      nowrap: true,
    },
    {
      key: 'contract',
      header: 'Договор',
      width: 152,
      sortable: true,
      accessor: (row) => row.contract?.id,
      render: (row) =>
        row.contract?.number ? (
          <button
            type="button"
            onClick={(clickEvent) => {
              clickEvent.stopPropagation()
              navigate(`/contracts/${row.contract.id}`)
            }}
            className="focus-ring group flex min-w-0 flex-col items-start rounded-sm text-left"
          >
            <span className="truncate font-mono text-xs text-accent-fg group-hover:underline">
              № {row.contract.number}
            </span>
            <span className="mt-0.5">
              <StatusBadge status={row.payment} size="sm" />
            </span>
          </button>
        ) : (
          <span className="text-xs text-content-faint">не привязан</span>
        ),
    },
  ]

  return (
    <div className="pb-10">
      <PageHeader
        icon="presentation"
        title="Реестр мероприятий"
        plate={`${events.length} всего`}
        subtitle="Все мероприятия на объектах Общества. Клик по строке открывает карточку мероприятия."
        actions={
          <>
            <Tabs
              variant="segmented"
              size="sm"
              value={density}
              onChange={setDensity}
              items={[
                { key: 'compact', label: 'Плотно' },
                { key: 'comfortable', label: 'Комфортно' },
              ]}
            />
            <Button variant="secondary" iconLeft="calendar" onClick={() => navigate('/calendar')}>
              Календарь
            </Button>
            <Button
              variant="secondary"
              iconLeft="download"
              onClick={() =>
                toast.info({
                  title: 'Выгрузка реестра',
                  description: 'Экспорт в Excel и PDF будет собран на следующем шаге.',
                })
              }
            >
              Excel
            </Button>
            <Button variant="primary" iconLeft="plus" onClick={() => setCreating(true)}>
              Создать мероприятие
            </Button>
          </>
        }
      />

      <div className="space-y-3 p-5">
        {/* ═══ Фильтры ═════════════════════════════════════ */}
        <div className="rounded-md border border-hairline bg-surface-raised p-3">
          <div className="grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <Field label="Поиск" className="xl:col-span-2">
              <SearchInput
                size="sm"
                placeholder="Название, арендатор или код заявки…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                onClear={() => setQuery('')}
              />
            </Field>
            <Field label="Объект">
              <Select
                size="sm"
                value={objectFilter}
                onChange={(e) => {
                  setObjectFilter(e.target.value)
                  setHallFilter('all')
                  setPage(1)
                }}
                options={[
                  { value: 'all', label: 'Все объекты' },
                  ...OBJECTS.map((o) => ({ value: o.key, label: o.name })),
                ]}
              />
            </Field>
            <Field label="Помещение">
              <Select
                size="sm"
                value={hallFilter}
                onChange={(e) => {
                  setHallFilter(e.target.value)
                  setPage(1)
                }}
                options={hallOptions}
              />
            </Field>
            <Field label="Тип">
              <Select
                size="sm"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setPage(1)
                }}
                options={[
                  { value: 'all', label: 'Все типы' },
                  ...EVENT_TYPES.map((t) => ({ value: t, label: t })),
                ]}
              />
            </Field>
            <Field label="Ответственный">
              <Select
                size="sm"
                value={managerFilter}
                onChange={(e) => {
                  setManagerFilter(e.target.value)
                  setPage(1)
                }}
                options={[
                  { value: 'all', label: 'Все сотрудники' },
                  ...managers.map((m) => ({ value: m, label: m })),
                ]}
              />
            </Field>
          </div>

          <div className="mt-3 grid gap-3 border-t border-hairline-soft pt-3 lg:grid-cols-3">
            <Field label="Период проведения с">
              <DateField
                size="sm"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(1)
                }}
              />
            </Field>
            <Field label="по">
              <DateField
                size="sm"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(1)
                }}
              />
            </Field>
            <Field label="Статус">
              <div className="flex h-control flex-wrap items-center gap-1.5">
                {FILTER_STATUSES.map((key) => {
                  const active = statusFilter.includes(key)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setStatusFilter((prev) =>
                          prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
                        )
                        setPage(1)
                      }}
                      className={cn(
                        'focus-ring rounded transition-opacity duration-fast',
                        !active && 'opacity-35 saturate-50',
                      )}
                      aria-pressed={active}
                    >
                      <StatusBadge status={key} size="sm" />
                    </button>
                  )
                })}
              </div>
            </Field>
          </div>
        </div>

        {/* ═══ Таблица ═════════════════════════════════════ */}
        <div>
          <TableToolbar
            left={
              <>
                <span className="text-xs tabular-nums text-content-muted">
                  Найдено{' '}
                  <span className="font-semibold text-content">{filtered.length}</span>{' '}
                  {plural(filtered.length, ['мероприятие', 'мероприятия', 'мероприятий'])}
                </span>
                {filtered.length !== events.length ? (
                  <span className="text-2xs text-content-faint">из {events.length}</span>
                ) : null}
              </>
            }
            right={
              filtersActive ? (
                <Button variant="ghost" size="sm" iconLeft="refresh" onClick={resetFilters}>
                  Сбросить фильтры
                </Button>
              ) : null
            }
          />

          <DataTable
            frame={false}
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            statusKey={(row) => (conflictIds.has(row.id) ? 'conflict' : row.status)}
            density={density}
            initialSort={{ key: 'eventFrom', dir: 'asc' }}
            stickyHeader
            onRowClick={(row) => navigate(`/events/${row.id}`)}
            emptyState={
              <EmptyState
                size="md"
                tone="search"
                title="Под фильтры ничего не подошло"
                description="Измените поисковый запрос, период или сбросьте фильтры — в реестре есть мероприятия по всем трём объектам."
                action={
                  <Button variant="primary" size="sm" iconLeft="refresh" onClick={resetFilters}>
                    Сбросить фильтры
                  </Button>
                }
              />
            }
          />

          {filtered.length > 0 ? (
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
              entityForms={['мероприятие', 'мероприятия', 'мероприятий']}
            />
          ) : null}
        </div>
      </div>

      <EventCreatePanel
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(id) => navigate(`/events/${id}`)}
      />
    </div>
  )
}
