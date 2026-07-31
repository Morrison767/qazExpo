import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/Topbar'
import { Button } from '@/components/Button'
import { Tabs } from '@/components/Tabs'
import { Field, Input, Select, SearchInput, Textarea } from '@/components/Field'
import { StatusBadge } from '@/components/Status'
import { HallPlate } from '@/components/HallPlate'
import { DataTable, TableToolbar } from '@/components/Table'
import { Pagination } from '@/components/Pagination'
import { EmptyState } from '@/components/EmptyState'
import { SidePanel } from '@/components/Modal'
import { Icon } from '@/components/Icon'
import { useToast } from '@/components/Toast'

import { useEvents } from '@/app/EventsContext'
import { cn } from '@/lib/cn'
import { formatMoney, formatNumber, plural } from '@/lib/format'
import { TENANT_STATUSES, TENANT_STATUS_KEYS } from '@/demo/tenants'
import { toMillions } from '@/demo/dashboard'

const DEBT_FILTERS = [
  { value: 'all', label: 'Любая задолженность' },
  { value: 'debt', label: 'Есть задолженность' },
  { value: 'overdue', label: 'Есть просрочка' },
  { value: 'clean', label: 'Без задолженности' },
]

const EMPTY_TENANT = {
  name: '',
  short: '',
  bin: '',
  address: '',
  phone: '',
  email: '',
  site: '',
  status: 'prospect',
  since: 2026,
  contactName: '',
  contactPosition: '',
  contactPhone: '',
}

/**
 * РЕЕСТР АРЕНДАТОРОВ (п. 5.4 ТЗ) — внутренний справочник для сотрудников.
 * Количество мероприятий, договоров и задолженность считаются из общего
 * store фильтрацией по id арендатора, а не хранятся отдельными полями.
 */
export default function Tenants() {
  const navigate = useNavigate()
  const toast = useToast()
  const { tenants, tenantStats, createTenant } = useEvents()

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [debtFilter, setDebtFilter] = useState('all')
  const [upcomingOnly, setUpcomingOnly] = useState(false)
  const [density, setDensity] = useState('compact')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState(EMPTY_TENANT)

  /* Агрегаты по каждому арендатору — из store */
  const rowsAll = useMemo(
    () => tenants.map((tenant) => ({ ...tenant, stats: tenantStats(tenant.id) })),
    [tenants, tenantStats],
  )

  const totals = useMemo(
    () =>
      rowsAll.reduce(
        (acc, row) => ({
          debt: acc.debt + row.stats.debt,
          overdue: acc.overdue + (row.stats.overdueAmount > 0 ? 1 : 0),
          withDebt: acc.withDebt + (row.stats.debt > 0 ? 1 : 0),
        }),
        { debt: 0, overdue: 0, withDebt: 0 },
      ),
    [rowsAll],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return rowsAll.filter((row) => {
      if (needle) {
        const contacts = (row.contacts ?? []).map((c) => c.name).join(' ')
        const haystack = `${row.name} ${row.short} ${row.bin} ${contacts}`.toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (upcomingOnly && row.stats.upcomingCount === 0) return false

      if (debtFilter === 'debt' && row.stats.debt <= 0) return false
      if (debtFilter === 'overdue' && row.stats.overdueAmount <= 0) return false
      if (debtFilter === 'clean' && row.stats.debt > 0) return false
      return true
    })
  }, [rowsAll, query, statusFilter, debtFilter, upcomingOnly])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const rows = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  )

  const filtersActive =
    query !== '' || statusFilter !== 'all' || debtFilter !== 'all' || upcomingOnly

  function resetFilters() {
    setQuery('')
    setStatusFilter('all')
    setDebtFilter('all')
    setUpcomingOnly(false)
    setPage(1)
  }

  function submitTenant() {
    const result = createTenant({
      name: draft.name,
      short: draft.short || draft.name,
      bin: draft.bin,
      address: draft.address,
      phone: draft.phone,
      email: draft.email,
      site: draft.site || null,
      status: draft.status,
      since: Number(draft.since) || 2026,
      bank: {
        name: 'АО «Halyk Bank»',
        bik: 'HSBKKZKX',
        iik: `KZ00HSBK${draft.bin.slice(0, 8)}`,
        kbe: '17',
      },
      contacts: draft.contactName
        ? [
            {
              name: draft.contactName,
              position: draft.contactPosition || 'Контактное лицо',
              phone: draft.contactPhone || '—',
            },
          ]
        : [],
    })
    setCreating(false)
    setDraft(EMPTY_TENANT)
    toast.success({ title: 'Арендатор добавлен', description: draft.name })
    navigate(`/tenants/${result.id}`)
  }

  const columns = [
    {
      key: 'name',
      header: 'Название компании',
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="flex items-center gap-1.5">
            <span className="truncate font-medium text-content">{row.name}</span>
            {row.stats.overdueAmount > 0 ? (
              <Icon
                name="alert-triangle"
                size={11}
                className="shrink-0 text-status-conflict-base"
                title={`Просрочка ${row.stats.overdueDays} дн.`}
              />
            ) : null}
          </p>
          <p className="truncate text-2xs text-content-faint">
            {row.site ? row.site : `с ${row.since} года`}
          </p>
        </div>
      ),
    },
    {
      key: 'bin',
      header: 'БИН / ИИН',
      width: 130,
      sortable: true,
      mono: true,
      nowrap: true,
    },
    {
      key: 'contact',
      header: 'Контактное лицо',
      width: 178,
      sortable: true,
      accessor: (row) => row.contacts?.[0]?.name ?? '',
      render: (row) =>
        row.contacts?.length ? (
          <div className="min-w-0">
            <p className="truncate text-content">{row.contacts[0].name}</p>
            <p className="truncate text-2xs text-content-faint">{row.contacts[0].position}</p>
          </div>
        ) : (
          <span className="text-xs text-content-faint">не указано</span>
        ),
    },
    {
      key: 'phone',
      header: 'Телефон / почта',
      width: 186,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-mono text-xs tabular-nums text-content">{row.phone}</p>
          <p className="truncate text-2xs text-content-faint">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'events',
      header: 'Мероприятий',
      width: 116,
      align: 'right',
      sortable: true,
      accessor: (row) => row.stats.eventCount,
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium tabular-nums text-content">{row.stats.eventCount}</p>
          <p className="text-2xs tabular-nums text-content-faint">
            {row.stats.upcomingCount > 0 ? `${row.stats.upcomingCount} предстоит` : 'нет предстоящих'}
          </p>
        </div>
      ),
    },
    {
      key: 'contracts',
      header: 'Договоров',
      width: 108,
      align: 'right',
      sortable: true,
      accessor: (row) => row.stats.contractCount,
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium tabular-nums text-content">{row.stats.contractCount}</p>
          <p className="text-2xs tabular-nums text-content-faint">
            {row.stats.activeContractCount} действ.
          </p>
        </div>
      ),
    },
    {
      key: 'debt',
      header: 'Задолженность',
      width: 150,
      align: 'right',
      sortable: true,
      accessor: (row) => row.stats.debt,
      render: (row) =>
        row.stats.debt > 0 ? (
          <div className="min-w-0">
            <p
              className={cn(
                'font-semibold tabular-nums',
                row.stats.overdueAmount > 0
                  ? 'text-status-conflict-text'
                  : 'text-status-unpaid-text',
              )}
            >
              {formatMoney(row.stats.debt)}
            </p>
            {row.stats.overdueDays > 0 ? (
              <p className="text-2xs tabular-nums text-status-conflict-text">
                просрочка {row.stats.overdueDays}{' '}
                {plural(row.stats.overdueDays, ['день', 'дня', 'дней'])}
              </p>
            ) : null}
          </div>
        ) : (
          <span className="text-xs text-content-faint">нет</span>
        ),
    },
    {
      key: 'status',
      header: 'Статус клиента',
      width: 160,
      sortable: true,
      render: (row) => (
        <StatusBadge
          status={TENANT_STATUSES[row.status].token}
          label={TENANT_STATUSES[row.status].label}
          size="sm"
        />
      ),
    },
  ]

  return (
    <div className="pb-10">
      <PageHeader
        icon="building"
        title="Реестр арендаторов"
        plate={`${tenants.length} компаний`}
        subtitle="Внутренний справочник клиентов: история взаимодействия, договоры, мероприятия и финансовое состояние."
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
                  title: 'Выгрузка реестра арендаторов',
                  description: 'Экспорт в Excel и PDF будет собран на следующем шаге.',
                })
              }
            >
              Excel
            </Button>
            <Button variant="primary" iconLeft="plus" onClick={() => setCreating(true)}>
              Добавить арендатора
            </Button>
          </>
        }
      />

      <div className="space-y-3 p-5">
        {/* ═══ Сводка по задолженности ═════════════════════ */}
        {totals.debt > 0 ? (
          <button
            type="button"
            onClick={() => {
              setDebtFilter(debtFilter === 'debt' ? 'all' : 'debt')
              setPage(1)
            }}
            aria-pressed={debtFilter === 'debt'}
            className={cn(
              'focus-ring group flex w-full items-center gap-3 overflow-hidden rounded-md border text-left transition-all duration-fast',
              debtFilter === 'debt'
                ? 'border-status-unpaid-base bg-status-unpaid-soft shadow-sm'
                : 'border-status-unpaid-border bg-status-unpaid-soft hover:shadow-sm',
            )}
          >
            <span
              aria-hidden="true"
              className="h-full w-rail shrink-0 self-stretch bg-status-unpaid-base"
            />
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
              <span className="flex items-center gap-2 text-base font-semibold text-status-unpaid-text">
                <Icon name="alert-circle" size={15} />
                Задолженность {toMillions(totals.debt)} млн ₸ у {totals.withDebt}{' '}
                {plural(totals.withDebt, ['арендатора', 'арендаторов', 'арендаторов'])}
              </span>
              <span className="text-xs text-status-unpaid-text">
                из них с просрочкой: {totals.overdue} · считается из остатков по договорам, как
                дебиторка на дашборде
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 pr-3 text-xs font-medium text-status-unpaid-text">
              {debtFilter === 'debt' ? 'Показать всех' : 'Показать только их'}
              <Icon name={debtFilter === 'debt' ? 'x' : 'filter'} size={13} />
            </span>
          </button>
        ) : null}

        {/* ═══ Фильтры ═════════════════════════════════════ */}
        <div className="rounded-md border border-hairline bg-surface-raised p-3">
          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
            <Field label="Поиск">
              <SearchInput
                size="sm"
                placeholder="Название, БИН или контактное лицо…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                onClear={() => setQuery('')}
              />
            </Field>
            <Field label="Статус клиента">
              <Select
                size="sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                options={[
                  { value: 'all', label: 'Любой статус' },
                  ...TENANT_STATUS_KEYS.map((key) => ({
                    value: key,
                    label: TENANT_STATUSES[key].label,
                  })),
                ]}
              />
            </Field>
            <Field label="Задолженность">
              <Select
                size="sm"
                value={debtFilter}
                onChange={(e) => {
                  setDebtFilter(e.target.value)
                  setPage(1)
                }}
                options={DEBT_FILTERS}
              />
            </Field>
            <Field label="Предстоящие мероприятия">
              <Select
                size="sm"
                value={upcomingOnly ? 'yes' : 'all'}
                onChange={(e) => {
                  setUpcomingOnly(e.target.value === 'yes')
                  setPage(1)
                }}
                options={[
                  { value: 'all', label: 'Не важно' },
                  { value: 'yes', label: 'Только с предстоящими' },
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
                  {plural(filtered.length, ['компания', 'компании', 'компаний'])}
                </span>
                <span className="hidden items-center gap-3 text-2xs tabular-nums text-content-faint sm:flex">
                  <span>
                    мероприятий{' '}
                    {formatNumber(filtered.reduce((acc, r) => acc + r.stats.eventCount, 0))}
                  </span>
                  <span>
                    договоров{' '}
                    {formatNumber(filtered.reduce((acc, r) => acc + r.stats.contractCount, 0))}
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
              row.stats.overdueAmount > 0
                ? 'conflict'
                : row.stats.debt > 0
                  ? 'unpaid'
                  : TENANT_STATUSES[row.status].token
            }
            density={density}
            initialSort={{ key: 'name', dir: 'asc' }}
            stickyHeader
            onRowClick={(row) => navigate(`/tenants/${row.id}`)}
            emptyState={
              <EmptyState
                size="md"
                tone="search"
                title="Под фильтры ничего не подошло"
                description="Измените поиск или сбросьте фильтры — в справочнике есть активные, разовые и потенциальные клиенты."
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
              entityForms={['компания', 'компании', 'компаний']}
            />
          ) : null}
        </div>
      </div>

      {/* ═══ Добавление арендатора ═════════════════════════ */}
      <SidePanel
        open={creating}
        onClose={() => setCreating(false)}
        size="md"
        plate="Новый арендатор"
        title="Добавить арендатора"
        subtitle="Запись появится в справочнике и станет доступна при создании мероприятий и договоров"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Отмена
            </Button>
            <Button
              variant="primary"
              iconLeft="check"
              disabled={!draft.name.trim() || draft.bin.trim().length < 12}
              onClick={submitTenant}
            >
              Добавить
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Полное наименование" required>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="ТОО «Название»"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Краткое наименование">
              <Input
                value={draft.short}
                onChange={(e) => setDraft({ ...draft, short: e.target.value })}
              />
            </Field>
            <Field label="БИН / ИИН" required hint="12 цифр">
              <Input
                mono
                value={draft.bin}
                onChange={(e) => setDraft({ ...draft, bin: e.target.value })}
                placeholder="240540001122"
              />
            </Field>
          </div>
          <Field label="Юридический адрес">
            <Textarea
              rows={2}
              value={draft.address}
              onChange={(e) => setDraft({ ...draft, address: e.target.value })}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Телефон">
              <Input
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                placeholder="+7 7172 00 00 00"
              />
            </Field>
            <Field label="Электронная почта">
              <Input
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </Field>
            <Field label="Сайт">
              <Input
                value={draft.site}
                onChange={(e) => setDraft({ ...draft, site: e.target.value })}
              />
            </Field>
            <Field label="Статус клиента">
              <Select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                options={TENANT_STATUS_KEYS.map((key) => ({
                  value: key,
                  label: TENANT_STATUSES[key].label,
                }))}
              />
            </Field>
          </div>

          <div className="rounded-md border border-hairline bg-surface-sunken p-3">
            <p className="mb-2.5 text-2xs font-semibold uppercase tracking-label text-content-subtle">
              Контактное лицо
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="ФИО">
                <Input
                  size="sm"
                  value={draft.contactName}
                  onChange={(e) => setDraft({ ...draft, contactName: e.target.value })}
                />
              </Field>
              <Field label="Должность">
                <Input
                  size="sm"
                  value={draft.contactPosition}
                  onChange={(e) => setDraft({ ...draft, contactPosition: e.target.value })}
                />
              </Field>
              <Field label="Телефон" className="sm:col-span-2">
                <Input
                  size="sm"
                  value={draft.contactPhone}
                  onChange={(e) => setDraft({ ...draft, contactPhone: e.target.value })}
                />
              </Field>
            </div>
          </div>
        </div>
      </SidePanel>
    </div>
  )
}
