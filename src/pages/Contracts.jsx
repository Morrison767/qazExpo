import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/Topbar'
import { Button } from '@/components/Button'
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
import { ContractCreatePanel } from '@/components/ContractCreatePanel'

import { useEvents } from '@/app/EventsContext'
import { cn } from '@/lib/cn'
import { formatDate, formatMoney, plural } from '@/lib/format'
import { parseTime } from '@/lib/timeline'
import {
  APPROVAL_STATES,
  CONTRACT_TYPES,
  CONTRACT_TYPE_SHORT,
  PAYMENT_STATES,
  contractMetrics,
} from '@/demo/contracts'
import { OBJECTS, objectByKey } from '@/demo/events'
import { tenantById } from '@/demo/tenants'
import { toMillions } from '@/demo/dashboard'

const APPROVAL_KEYS = ['draft', 'review', 'signed', 'archived', 'terminated']
const PAYMENT_KEYS = ['none', 'unpaid', 'partial', 'overdue', 'paid']

/**
 * РЕЕСТР ДОГОВОРОВ (п. 5.3 ТЗ).
 *
 * Договоры берутся из общего store и ссылаются на мероприятия и арендаторов
 * по id. Проблемные — просроченная оплата и истекающий срок — помечены той же
 * красной кромкой, что конфликты в календаре: один класс сигнала.
 */
export default function Contracts() {
  const navigate = useNavigate()
  const toast = useToast()
  const { contracts, events } = useEvents()

  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [approvalFilter, setApprovalFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [objectFilter, setObjectFilter] = useState('all')
  const [managerFilter, setManagerFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [onlyAttention, setOnlyAttention] = useState(false)

  const [density, setDensity] = useState('compact')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [creating, setCreating] = useState(false)

  const eventById = useMemo(() => new Map(events.map((event) => [event.id, event])), [events])

  /* Договоры с производными показателями оплаты и срока */
  const rowsAll = useMemo(
    () =>
      contracts.map((contract) => ({
        ...contract,
        metrics: contractMetrics(contract),
        tenant: tenantById(contract.tenantId),
        event: contract.eventId ? eventById.get(contract.eventId) : null,
      })),
    [contracts, eventById],
  )

  const attentionCount = rowsAll.filter((row) => row.metrics.attention).length

  const managers = useMemo(
    () => Array.from(new Set(contracts.map((c) => c.manager))).sort(),
    [contracts],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const from = dateFrom ? parseTime(dateFrom) : null
    const to = dateTo ? parseTime(dateTo) + 86_400_000 : null

    return rowsAll.filter((row) => {
      if (needle) {
        const haystack = `${row.number} ${row.tenant?.name ?? ''} ${row.event?.name ?? ''}`.toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      if (typeFilter !== 'all' && row.type !== typeFilter) return false
      if (approvalFilter !== 'all' && row.approvalStatus !== approvalFilter) return false
      if (paymentFilter !== 'all' && row.metrics.paymentState !== paymentFilter) return false
      if (objectFilter !== 'all' && row.objectKey !== objectFilter) return false
      if (managerFilter !== 'all' && row.manager !== managerFilter) return false
      if (onlyAttention && !row.metrics.attention) return false

      if ((from || to) && row.signedAt) {
        const signed = parseTime(row.signedAt)
        if (from && signed < from) return false
        if (to && signed > to) return false
      }
      return true
    })
  }, [
    rowsAll,
    query,
    typeFilter,
    approvalFilter,
    paymentFilter,
    objectFilter,
    managerFilter,
    onlyAttention,
    dateFrom,
    dateTo,
  ])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const rows = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  )

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, row) => ({
          amount: acc.amount + (row.amount ?? 0),
          paid: acc.paid + row.metrics.paidAmount,
          debt: acc.debt + row.metrics.debt,
        }),
        { amount: 0, paid: 0, debt: 0 },
      ),
    [filtered],
  )

  const filtersActive =
    query !== '' ||
    typeFilter !== 'all' ||
    approvalFilter !== 'all' ||
    paymentFilter !== 'all' ||
    objectFilter !== 'all' ||
    managerFilter !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    onlyAttention

  function resetFilters() {
    setQuery('')
    setTypeFilter('all')
    setApprovalFilter('all')
    setPaymentFilter('all')
    setObjectFilter('all')
    setManagerFilter('all')
    setDateFrom('')
    setDateTo('')
    setOnlyAttention(false)
    setPage(1)
  }

  const columns = [
    {
      key: 'number',
      header: 'Номер договора',
      width: 176,
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="flex items-center gap-1.5">
            <span className="truncate font-mono text-xs font-semibold text-content">
              № {row.number}
            </span>
            {row.metrics.attention ? (
              <Icon
                name="alert-triangle"
                size={11}
                className="shrink-0 text-status-conflict-base"
                title={
                  row.metrics.overdueDays > 0
                    ? `Просрочка ${row.metrics.overdueDays} дн.`
                    : 'Истекает срок действия'
                }
              />
            ) : null}
          </p>
          <p className="truncate text-2xs text-content-faint">{CONTRACT_TYPE_SHORT[row.type]}</p>
        </div>
      ),
    },
    {
      key: 'tenant',
      header: 'Арендатор',
      width: 196,
      sortable: true,
      accessor: (row) => row.tenant?.name,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-content">{row.tenant?.short ?? '—'}</p>
          <p className="truncate font-mono text-2xs text-content-faint">
            БИН {row.tenant?.bin ?? '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'event',
      header: 'Мероприятие',
      sortable: true,
      accessor: (row) => row.event?.name ?? '',
      render: (row) =>
        row.event ? (
          <button
            type="button"
            onClick={(clickEvent) => {
              clickEvent.stopPropagation()
              navigate(`/events/${row.event.id}`)
            }}
            className="focus-ring group min-w-0 rounded-sm text-left"
          >
            <p className="truncate text-content group-hover:text-accent-fg group-hover:underline">
              {row.event.name}
            </p>
            <p className="truncate font-mono text-2xs text-content-faint">
              {row.event.id} · {row.event.hall}
            </p>
          </button>
        ) : (
          <span className="text-xs text-content-faint">рамочный, без мероприятия</span>
        ),
    },
    {
      key: 'signedAt',
      header: 'Заключён / действует до',
      width: 158,
      sortable: true,
      nowrap: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="tabular-nums text-content">{formatDate(row.signedAt)}</p>
          <p className="flex items-center gap-1 text-2xs tabular-nums text-content-faint">
            до {formatDate(row.validTo)}
            {row.metrics.expiringSoon ? (
              <span className="rounded-sm bg-status-review-soft px-1 font-semibold text-status-review-text">
                {row.metrics.expiringInDays} дн.
              </span>
            ) : null}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Сумма',
      width: 148,
      align: 'right',
      sortable: true,
      nowrap: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium tabular-nums text-content">{formatMoney(row.amount)}</p>
          <p className="text-2xs tabular-nums text-content-faint">
            {row.metrics.debt > 0
              ? `остаток ${toMillions(row.metrics.debt)} млн`
              : 'оплачен полностью'}
          </p>
        </div>
      ),
    },
    {
      key: 'approvalStatus',
      header: 'Согласование',
      width: 150,
      sortable: true,
      render: (row) => (
        <StatusBadge
          status={APPROVAL_STATES[row.approvalStatus].token}
          label={APPROVAL_STATES[row.approvalStatus].label}
          size="sm"
        />
      ),
    },
    {
      key: 'payment',
      header: 'Оплата',
      width: 168,
      sortable: true,
      accessor: (row) => row.metrics.paymentState,
      render: (row) => (
        <div className="min-w-0">
          <StatusBadge
            status={PAYMENT_STATES[row.metrics.paymentState].token}
            label={PAYMENT_STATES[row.metrics.paymentState].label}
            size="sm"
          />
          {row.metrics.overdueDays > 0 ? (
            <p className="mt-0.5 text-2xs tabular-nums text-status-conflict-text">
              просрочка {row.metrics.overdueDays}{' '}
              {plural(row.metrics.overdueDays, ['день', 'дня', 'дней'])}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'manager',
      header: 'Ответственные',
      width: 132,
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-content">{row.manager}</p>
          <p className="truncate text-2xs text-content-faint">юрист: {row.lawyer}</p>
        </div>
      ),
    },
  ]

  return (
    <div className="pb-10">
      <PageHeader
        icon="contract"
        title="Реестр договоров"
        plate={`${contracts.length} всего`}
        subtitle="Договоры аренды, оказания услуг и дополнительные соглашения. Клик по строке открывает карточку договора."
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
            <Button
              variant="secondary"
              iconLeft="download"
              onClick={() =>
                toast.info({
                  title: 'Выгрузка реестра договоров',
                  description: 'Экспорт в Excel и PDF будет собран на следующем шаге.',
                })
              }
            >
              Excel
            </Button>
            <Button variant="primary" iconLeft="plus" onClick={() => setCreating(true)}>
              Создать договор
            </Button>
          </>
        }
      />

      <div className="space-y-3 p-5">
        {/* ═══ Быстрый фильтр «Требуют внимания» ═══════════ */}
        {attentionCount > 0 ? (
          <button
            type="button"
            onClick={() => {
              setOnlyAttention((v) => !v)
              setPage(1)
            }}
            aria-pressed={onlyAttention}
            className={cn(
              'focus-ring group flex w-full items-center gap-3 overflow-hidden rounded-md border text-left transition-all duration-fast',
              onlyAttention
                ? 'border-status-conflict-base bg-status-conflict-soft shadow-sm'
                : 'border-status-conflict-border bg-status-conflict-soft hover:shadow-sm',
            )}
          >
            <span
              aria-hidden="true"
              className="h-full w-rail shrink-0 self-stretch bg-status-conflict-base"
            />
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
              <span className="flex items-center gap-2 text-base font-semibold text-status-conflict-text">
                <Icon name="alert-triangle" size={15} />
                {attentionCount} {plural(attentionCount, ['договор', 'договора', 'договоров'])}{' '}
                требуют внимания
              </span>
              <span className="text-xs text-status-conflict-text">
                просроченная оплата и истекающий срок действия — та же выборка, что в блоке
                дашборда
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 pr-3 text-xs font-medium text-status-conflict-text">
              {onlyAttention ? 'Показать все' : 'Показать только их'}
              <Icon name={onlyAttention ? 'x' : 'filter'} size={13} />
            </span>
          </button>
        ) : null}

        {/* ═══ Фильтры ═════════════════════════════════════ */}
        <div className="rounded-md border border-hairline bg-surface-raised p-3">
          <div className="grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <Field label="Поиск" className="xl:col-span-2">
              <SearchInput
                size="sm"
                placeholder="Номер, арендатор или мероприятие…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                onClear={() => setQuery('')}
              />
            </Field>
            <Field label="Тип договора">
              <Select
                size="sm"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setPage(1)
                }}
                options={[
                  { value: 'all', label: 'Все типы' },
                  ...Object.entries(CONTRACT_TYPES).map(([value, label]) => ({ value, label })),
                ]}
              />
            </Field>
            <Field label="Согласование">
              <Select
                size="sm"
                value={approvalFilter}
                onChange={(e) => {
                  setApprovalFilter(e.target.value)
                  setPage(1)
                }}
                options={[
                  { value: 'all', label: 'Любой статус' },
                  ...APPROVAL_KEYS.map((key) => ({ value: key, label: APPROVAL_STATES[key].label })),
                ]}
              />
            </Field>
            <Field label="Оплата">
              <Select
                size="sm"
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value)
                  setPage(1)
                }}
                options={[
                  { value: 'all', label: 'Любая' },
                  ...PAYMENT_KEYS.map((key) => ({ value: key, label: PAYMENT_STATES[key].label })),
                ]}
              />
            </Field>
            <Field label="Объект">
              <Select
                size="sm"
                value={objectFilter}
                onChange={(e) => {
                  setObjectFilter(e.target.value)
                  setPage(1)
                }}
                options={[
                  { value: 'all', label: 'Все объекты' },
                  ...OBJECTS.map((o) => ({ value: o.key, label: o.name })),
                ]}
              />
            </Field>
          </div>

          <div className="mt-3 grid gap-3 border-t border-hairline-soft pt-3 lg:grid-cols-3">
            <Field label="Заключён с">
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
        </div>

        {/* ═══ Таблица ═════════════════════════════════════ */}
        <div>
          <TableToolbar
            left={
              <>
                <span className="text-xs tabular-nums text-content-muted">
                  Найдено <span className="font-semibold text-content">{filtered.length}</span>{' '}
                  {plural(filtered.length, ['договор', 'договора', 'договоров'])}
                </span>
                <span className="hidden items-center gap-3 text-2xs tabular-nums text-content-faint sm:flex">
                  <span>сумма {toMillions(totals.amount)} млн ₸</span>
                  <span>оплачено {toMillions(totals.paid)} млн ₸</span>
                  <span className={totals.debt > 0 ? 'text-status-unpaid-text' : undefined}>
                    остаток {toMillions(totals.debt)} млн ₸
                  </span>
                </span>
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
            statusKey={(row) =>
              row.metrics.attention ? 'conflict' : APPROVAL_STATES[row.approvalStatus].token
            }
            density={density}
            initialSort={{ key: 'signedAt', dir: 'desc' }}
            stickyHeader
            onRowClick={(row) => navigate(`/contracts/${row.id}`)}
            emptyState={
              <EmptyState
                size="md"
                tone="search"
                title="Под фильтры ничего не подошло"
                description="Измените поиск, период или сбросьте фильтры — в реестре есть договоры по всем трём объектам."
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
              entityForms={['договор', 'договора', 'договоров']}
            />
          ) : null}
        </div>
      </div>

      <ContractCreatePanel
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(newId) => navigate(`/contracts/${newId}`)}
      />
    </div>
  )
}
