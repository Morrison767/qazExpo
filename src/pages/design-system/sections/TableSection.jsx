import { useState } from 'react'
import { DataTable, TableToolbar, TableCaption } from '@/components/Table'
import { Pagination } from '@/components/Pagination'
import { StatusBadge, StatusDot } from '@/components/Status'
import { Badge } from '@/components/Badge'
import { Button, IconButton } from '@/components/Button'
import { SearchInput, Select } from '@/components/Field'
import { EmptyState } from '@/components/EmptyState'
import { Tabs } from '@/components/Tabs'
import { HallPlate } from '@/components/HallPlate'
import { formatDate, formatDateRange, formatMoney, formatNumber } from '@/lib/format'
import { EVENTS, CONTRACTORS } from '@/demo/data'
import { STATUS_KEYS, STATUSES } from '@/design/statuses'
import { Section, DemoBlock, DemoLabel } from '../parts'

const EVENT_COLUMNS = [
  {
    key: 'id',
    header: 'Заявка',
    width: 96,
    sortable: true,
    nowrap: true,
    render: (row) => <HallPlate tone="muted">{row.id}</HallPlate>,
  },
  {
    key: 'name',
    header: 'Мероприятие',
    sortable: true,
    render: (row) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-ink-900">{row.name}</p>
        <p className="truncate text-xs text-ink-400">
          {row.type} · {row.tenant}
        </p>
      </div>
    ),
  },
  {
    key: 'hall',
    header: 'Зал',
    width: 88,
    sortable: true,
    mono: true,
    nowrap: true,
  },
  {
    key: 'eventFrom',
    header: 'Проведение',
    width: 148,
    sortable: true,
    nowrap: true,
    render: (row) => formatDateRange(row.eventFrom, row.eventTo),
  },
  {
    key: 'guests',
    header: 'Участн.',
    width: 84,
    align: 'right',
    sortable: true,
    render: (row) => formatNumber(row.guests),
  },
  {
    key: 'amount',
    header: 'Сумма',
    width: 136,
    align: 'right',
    sortable: true,
    nowrap: true,
    render: (row) => <span className="font-medium">{formatMoney(row.amount)}</span>,
  },
  {
    key: 'status',
    header: 'Статус',
    width: 152,
    sortable: true,
    accessor: (row) => STATUSES[row.status]?.label,
    render: (row) => <StatusBadge status={row.status} size="sm" />,
  },
  {
    key: 'payment',
    header: 'Оплата',
    width: 132,
    sortable: true,
    accessor: (row) => STATUSES[row.payment]?.label,
    render: (row) => <StatusBadge status={row.payment} size="sm" />,
  },
  {
    key: 'actions',
    header: '',
    width: 40,
    render: () => <IconButton icon="more-horizontal" label="Действия по строке" size="sm" />,
  },
]

const CONTRACTOR_COLUMNS = [
  { key: 'id', header: 'Код', width: 88, mono: true, sortable: true },
  { key: 'name', header: 'Организация', sortable: true },
  { key: 'bin', header: 'БИН', width: 120, mono: true },
  { key: 'work', header: 'Вид работ', width: 140, render: (row) => <Badge tone="outline">{row.work}</Badge> },
  { key: 'people', header: 'Люди', width: 64, align: 'right', sortable: true },
  { key: 'vehicles', header: 'ТС', width: 56, align: 'right', sortable: true },
  {
    key: 'from',
    header: 'На территории',
    width: 148,
    nowrap: true,
    render: (row) => formatDateRange(row.from, row.to),
  },
  {
    key: 'status',
    header: 'Допуск',
    width: 148,
    render: (row) => <StatusBadge status={row.status} size="sm" />,
  },
]

export function TableSection() {
  const [selected, setSelected] = useState([])
  const [density, setDensity] = useState('compact')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [search, setSearch] = useState('')

  const filtered = EVENTS.filter((event) =>
    search ? event.name.toLowerCase().includes(search.toLowerCase()) : true,
  )

  return (
    <Section
      id="tables"
      num="10"
      title="Таблицы"
      description="Реестр — главный экран системы. Сортировка по любому заголовку, hover-строки, сигнальная кромка статуса у левого края, табличные цифры, липкая шапка. Слева читается состояние всей выборки, не глядя в колонку «Статус»."
    >
      <DemoBlock title="Реестр мероприятий" note="Сортировка · выбор строк · плотность">
        <div>
          <TableToolbar
            left={
              <>
                <SearchInput
                  size="sm"
                  placeholder="Поиск по реестру…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onClear={() => setSearch('')}
                  className="w-56"
                />
                <Select
                  size="sm"
                  defaultValue=""
                  placeholder="Все объекты"
                  options={[
                    { value: 'kc', label: 'Конгресс-центр' },
                    { value: 'mvc', label: 'МВЦ' },
                    { value: 'alem', label: 'Alem.AI' },
                  ]}
                  className="w-40"
                />
                {selected.length > 0 ? (
                  <span className="text-xs tabular-nums text-navy-700">
                    Выбрано: {selected.length}
                  </span>
                ) : null}
              </>
            }
            right={
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
                <Button variant="secondary" size="sm" iconLeft="download">
                  Excel
                </Button>
                <Button variant="primary" size="sm" iconLeft="plus">
                  Мероприятие
                </Button>
              </>
            }
          />
          <DataTable
            frame={false}
            columns={EVENT_COLUMNS}
            rows={filtered}
            rowKey={(row) => row.id}
            statusKey={(row) => row.status}
            selectable
            selected={selected}
            onSelectedChange={setSelected}
            density={density}
            initialSort={{ key: 'eventFrom', dir: 'asc' }}
            onRowClick={() => {}}
            emptyState={
              <EmptyState
                tone="search"
                size="sm"
                title="Ничего не найдено"
                description="Измените поисковый запрос или сбросьте фильтры."
                grid={false}
              />
            }
          />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={348}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            entityForms={['мероприятие', 'мероприятия', 'мероприятий']}
          />
        </div>

        <TableCaption>
          <span className="font-semibold uppercase tracking-label text-ink-400">Кромка статуса:</span>
          {STATUS_KEYS.slice(0, 6).map((key) => (
            <StatusDot key={key} status={key} withLabel />
          ))}
        </TableCaption>
      </DemoBlock>

      <div className="grid gap-4 xl:grid-cols-2">
        <DemoBlock title="Подрядные организации" note="Реестр без выбора строк">
          <DataTable
            columns={CONTRACTOR_COLUMNS}
            rows={CONTRACTORS}
            rowKey={(row) => row.id}
            statusKey={(row) => row.status}
            density="comfortable"
          />
        </DemoBlock>

        <DemoBlock title="Пустой реестр">
          <DemoLabel>Нет данных</DemoLabel>
          <DataTable
            columns={CONTRACTOR_COLUMNS.slice(0, 4)}
            rows={[]}
            emptyState={
              <EmptyState
                size="md"
                title="Подрядчики не добавлены"
                description="Арендатор ещё не заявил подрядные организации для этого мероприятия."
                action={
                  <Button variant="primary" size="sm" iconLeft="plus">
                    Добавить подрядчика
                  </Button>
                }
              />
            }
          />
        </DemoBlock>
      </div>
    </Section>
  )
}

export default TableSection
