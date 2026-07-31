import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, IconButton } from '@/components/Button'
import { Tabs } from '@/components/Tabs'
import { Field, Input, Select, Textarea } from '@/components/Field'
import { StatusBadge } from '@/components/Status'
import { HallPlate } from '@/components/HallPlate'
import { Badge } from '@/components/Badge'
import { Card, CardBody, CardHeader, MetaGrid, MetaItem } from '@/components/Card'
import { DataTable } from '@/components/Table'
import { MeterBar } from '@/components/Instruments'
import { EmptyState } from '@/components/EmptyState'
import { Modal } from '@/components/Modal'
import { Icon } from '@/components/Icon'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { useToast } from '@/components/Toast'
import { EventCreatePanel } from '@/components/EventCreatePanel'
import { ContractCreatePanel } from '@/components/ContractCreatePanel'

import { useEvents } from '@/app/EventsContext'
import { cn } from '@/lib/cn'
import { useEscapeKey, useOutsideClick } from '@/lib/hooks'
import { formatDate, formatDateRange, formatMoney, formatNumber, plural } from '@/lib/format'
import { STATUSES } from '@/design/statuses'
import { TENANT_STATUSES, TENANT_STATUS_KEYS } from '@/demo/tenants'
import {
  APPROVAL_STATES,
  CONTRACT_TYPE_SHORT,
  PAYMENT_STATES,
  PAYMENT_STATUSES,
  contractMetrics,
} from '@/demo/contracts'
import { objectByKey } from '@/demo/events'
import { HISTORY_ACTIONS } from '@/demo/history'
import { toMillions } from '@/demo/dashboard'

const TABS = [
  { key: 'main', label: 'Реквизиты и контакты', icon: 'building' },
  { key: 'events', label: 'Мероприятия', icon: 'presentation' },
  { key: 'contracts', label: 'Договоры', icon: 'contract' },
  { key: 'finance', label: 'Финансы', icon: 'wallet' },
  { key: 'history', label: 'История взаимодействия', icon: 'clock' },
]

/* ── Меню статуса клиента ── */
function StatusMenu({ current, onPick }) {
  const [open, setOpen] = useState(false)
  const ref = useOutsideClick(() => setOpen(false), open)
  useEscapeKey(() => setOpen(false), open)

  return (
    <div ref={ref} className="relative">
      <Button variant="secondary" iconRight="chevron-down" onClick={() => setOpen((v) => !v)}>
        Статус клиента
      </Button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+6px)] z-dropdown w-[19rem] animate-scale-in overflow-hidden rounded-md border border-hairline bg-surface shadow-lg">
          <p className="border-b border-hairline bg-surface-sunken px-3 py-2 text-2xs font-semibold uppercase tracking-label text-content-subtle">
            Статус клиента
          </p>
          <div className="py-1">
            {TENANT_STATUS_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                disabled={key === current}
                onClick={() => {
                  onPick(key)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-start justify-between gap-2 px-3 py-2 text-left transition-colors duration-fast',
                  key === current ? 'bg-accent-soft' : 'hover:bg-surface-sunken',
                )}
              >
                <span className="min-w-0">
                  <StatusBadge
                    status={TENANT_STATUSES[key].token}
                    label={TENANT_STATUSES[key].label}
                    size="sm"
                  />
                  <span className="mt-1 block text-2xs leading-snug text-content-faint">
                    {TENANT_STATUSES[key].hint}
                  </span>
                </span>
                {key === current ? (
                  <Icon name="check" size={13} className="mt-1 shrink-0 text-accent-fg" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Карточка арендатора
   ───────────────────────────────────────────────────────────── */
export default function TenantCard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getTenant, updateTenant, addContact, removeContact, tenantStats, history, log } =
    useEvents()

  const tenant = getTenant(id)
  const [tab, setTab] = useState('main')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [contactModal, setContactModal] = useState(false)
  const [contact, setContact] = useState({ name: '', position: '', phone: '', email: '' })
  const [noteModal, setNoteModal] = useState(false)
  const [note, setNote] = useState('')
  const [creatingEvent, setCreatingEvent] = useState(false)
  const [creatingContract, setCreatingContract] = useState(false)

  const stats = useMemo(() => (tenant ? tenantStats(tenant.id) : null), [tenant, tenantStats])
  const entries = history[id] ?? []

  if (!tenant) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <EmptyState
          size="lg"
          tone="search"
          title="Арендатор не найден"
          description={`В справочнике нет записи с идентификатором ${id}.`}
          action={
            <Button variant="primary" iconLeft="building" onClick={() => navigate('/tenants')}>
              К реестру арендаторов
            </Button>
          }
        />
      </div>
    )
  }

  const status = TENANT_STATUSES[tenant.status]
  const stub = (title) => () =>
    toast.info({ title, description: 'Раздел будет собран на следующем шаге прототипа.' })

  function startEdit() {
    setForm({
      name: tenant.name,
      short: tenant.short ?? '',
      bin: tenant.bin,
      address: tenant.address ?? '',
      phone: tenant.phone ?? '',
      email: tenant.email ?? '',
      site: tenant.site ?? '',
      since: tenant.since,
    })
    setEditing(true)
    setTab('main')
  }

  function saveEdit() {
    updateTenant(id, { ...form, since: Number(form.since) || tenant.since })
    setEditing(false)
    toast.success({ title: 'Реквизиты сохранены' })
  }

  function pickStatus(next) {
    updateTenant(
      id,
      { status: next },
      { action: 'status', details: `${status.label} → ${TENANT_STATUSES[next].label}` },
    )
    toast.success({
      title: 'Статус клиента изменён',
      description: `${tenant.short ?? tenant.name} → ${TENANT_STATUSES[next].label}`,
    })
  }

  function submitContact() {
    addContact(id, contact)
    setContactModal(false)
    setContact({ name: '', position: '', phone: '', email: '' })
    toast.success({ title: 'Контактное лицо добавлено' })
  }

  function submitNote() {
    log(id, 'status', `Заметка: ${note}`)
    setNoteModal(false)
    setNote('')
    toast.success({ title: 'Заметка добавлена в историю' })
  }

  return (
    <div className="pb-10">
      {/* ═══ Шапка ═══════════════════════════════════════ */}
      <div className="border-b border-hairline bg-surface-raised">
        <div className="px-5 pt-3">
          <Breadcrumbs
            items={[
              { label: 'Арендаторы', icon: 'building', onClick: () => navigate('/tenants') },
              { label: tenant.name, plate: tenant.id },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-3.5 pt-2.5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <HallPlate>{tenant.id}</HallPlate>
              <StatusBadge status={status.token} label={status.label} />
              {stats.overdueAmount > 0 ? (
                <Badge
                  tone="outline"
                  icon="alert-triangle"
                  className="border-status-conflict-border text-status-conflict-text"
                >
                  Просрочка {stats.overdueDays} {plural(stats.overdueDays, ['день', 'дня', 'дней'])}
                </Badge>
              ) : stats.debt > 0 ? (
                <Badge
                  tone="outline"
                  icon="alert-circle"
                  className="border-status-unpaid-border text-status-unpaid-text"
                >
                  Задолженность {toMillions(stats.debt)} млн ₸
                </Badge>
              ) : null}
              {tenant.internal ? <Badge tone="navy">Внутренний заказчик</Badge> : null}
            </div>
            <h1 className="mt-1.5 text-2xl font-semibold leading-tight text-content">
              {tenant.name}
            </h1>
            <p className="mt-0.5 text-base text-content-subtle">
              БИН {tenant.bin} · клиент с {tenant.since} года
              {tenant.site ? ` · ${tenant.site}` : ''}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {editing ? (
              <>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Отмена
                </Button>
                <Button variant="primary" iconLeft="check" onClick={saveEdit}>
                  Сохранить
                </Button>
              </>
            ) : (
              <>
                <IconButton icon="download" label="Экспорт карточки" onClick={stub('Экспорт карточки арендатора')} />
                <StatusMenu current={tenant.status} onPick={pickStatus} />
                <Button variant="primary" iconLeft="pencil" onClick={startEdit}>
                  Редактировать
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="px-5">
          <Tabs items={TABS} value={tab} onChange={setTab} />
        </div>
      </div>

      <div className="grid gap-4 p-5 xl:grid-cols-3">
        <div className="min-w-0 space-y-4 xl:col-span-2">
          {/* Предупреждение о просрочке */}
          {stats.overdueAmount > 0 ? (
            <div className="rounded-md border border-status-conflict-border bg-status-conflict-soft p-3">
              <p className="flex items-center gap-2 text-base font-semibold text-status-conflict-text">
                <Icon name="alert-triangle" size={15} />
                Просроченная оплата: {formatMoney(stats.overdueAmount)}
              </p>
              <p className="mt-1 text-xs leading-normal text-status-conflict-text">
                Максимальная просрочка — {stats.overdueDays}{' '}
                {plural(stats.overdueDays, ['день', 'дня', 'дней'])}. Клиент попадает в блок
                «Требуют внимания» на дашборде и в реестре договоров.
              </p>
            </div>
          ) : null}

          {/* ── Реквизиты и контакты ── */}
          {tab === 'main' ? (
            <>
              <Card>
                <CardHeader plate="РЕКВ" plateTone="outline" title="Реквизиты" />
                <CardBody>
                  {editing ? (
                    <div className="space-y-4">
                      <Field label="Полное наименование" required>
                        <Input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                      </Field>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Краткое наименование">
                          <Input
                            value={form.short}
                            onChange={(e) => setForm({ ...form, short: e.target.value })}
                          />
                        </Field>
                        <Field label="БИН / ИИН" required>
                          <Input
                            mono
                            value={form.bin}
                            onChange={(e) => setForm({ ...form, bin: e.target.value })}
                          />
                        </Field>
                        <Field label="Телефон">
                          <Input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          />
                        </Field>
                        <Field label="Электронная почта">
                          <Input
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                          />
                        </Field>
                        <Field label="Сайт">
                          <Input
                            value={form.site}
                            onChange={(e) => setForm({ ...form, site: e.target.value })}
                          />
                        </Field>
                        <Field label="Клиент с года">
                          <Input
                            type="number"
                            value={form.since}
                            onChange={(e) => setForm({ ...form, since: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label="Юридический адрес">
                        <Textarea
                          rows={2}
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                        />
                      </Field>
                    </div>
                  ) : (
                    <MetaGrid columns={2}>
                      <MetaItem label="БИН / ИИН" value={tenant.bin} mono />
                      <MetaItem label="Клиент с" value={tenant.since} />
                      <MetaItem label="Юридический адрес" value={tenant.address} icon="map-pin" />
                      <MetaItem label="Телефон" value={tenant.phone} mono icon="phone" />
                      <MetaItem label="Электронная почта" value={tenant.email} icon="mail" />
                      <MetaItem label="Сайт" value={tenant.site ?? '—'} />
                    </MetaGrid>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  plate="БАНК"
                  plateTone="outline"
                  title="Банковские реквизиты"
                  actions={
                    <Button
                      variant="link"
                      size="sm"
                      iconLeft="copy"
                      onClick={stub('Копирование реквизитов')}
                    >
                      Скопировать
                    </Button>
                  }
                />
                <CardBody>
                  <MetaGrid columns={2}>
                    <MetaItem label="Банк" value={tenant.bank?.name} />
                    <MetaItem label="БИК" value={tenant.bank?.bik} mono />
                    <MetaItem label="ИИК" value={tenant.bank?.iik} mono />
                    <MetaItem label="КБе" value={tenant.bank?.kbe} mono />
                  </MetaGrid>
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  plate="КОНТ"
                  plateTone="outline"
                  title="Контактные лица"
                  subtitle={`${tenant.contacts?.length ?? 0} ${plural(tenant.contacts?.length ?? 0, ['контакт', 'контакта', 'контактов'])}`}
                  actions={
                    <Button
                      variant="secondary"
                      size="sm"
                      iconLeft="plus"
                      onClick={() => setContactModal(true)}
                    >
                      Добавить
                    </Button>
                  }
                />
                <CardBody>
                  {tenant.contacts?.length ? (
                    <ul className="space-y-1.5">
                      {tenant.contacts.map((person) => (
                        <li
                          key={person.name}
                          className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded border border-hairline bg-surface-sunken px-2.5 py-2"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent-line bg-accent-soft text-accent-fg">
                            <Icon name="user" size={14} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-base font-medium text-content">
                              {person.name}
                            </span>
                            <span className="block truncate text-xs text-content-subtle">
                              {person.position}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="block font-mono text-xs tabular-nums text-content-muted">
                              {person.phone}
                            </span>
                            {person.email ? (
                              <span className="block text-2xs text-content-faint">
                                {person.email}
                              </span>
                            ) : null}
                          </span>
                          <IconButton
                            icon="trash"
                            label="Удалить контакт"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              removeContact(id, person.name)
                              toast.warning({ title: 'Контактное лицо удалено' })
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState
                      size="sm"
                      title="Контактных лиц нет"
                      description="Добавьте ответственного со стороны арендатора."
                      grid={false}
                    />
                  )}
                </CardBody>
              </Card>
            </>
          ) : null}

          {/* ── Мероприятия ── */}
          {tab === 'events' ? (
            <Card>
              <CardHeader
                plate="МЕР"
                plateTone="outline"
                title="Мероприятия арендатора"
                subtitle={`${stats.eventCount} всего · ${stats.upcomingCount} предстоящих`}
                actions={
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft="plus"
                    onClick={() => setCreatingEvent(true)}
                  >
                    Создать мероприятие
                  </Button>
                }
              />
              <CardBody divided={false} className="px-0 pb-0">
                <DataTable
                  frame={false}
                  className="border-x-0"
                  rows={stats.events}
                  rowKey={(row) => row.id}
                  statusKey={(row) => row.status}
                  density="compact"
                  initialSort={{ key: 'eventFrom', dir: 'desc' }}
                  onRowClick={(row) => navigate(`/events/${row.id}`)}
                  emptyState={
                    <EmptyState
                      size="sm"
                      title="Мероприятий пока нет"
                      description="Создайте первое мероприятие для этого арендатора."
                      grid={false}
                      action={
                        <Button
                          variant="primary"
                          size="sm"
                          iconLeft="plus"
                          onClick={() => setCreatingEvent(true)}
                        >
                          Создать мероприятие
                        </Button>
                      }
                    />
                  }
                  columns={[
                    {
                      key: 'id',
                      header: 'Заявка',
                      width: 88,
                      nowrap: true,
                      render: (row) => <HallPlate tone="muted">{row.id}</HallPlate>,
                    },
                    {
                      key: 'name',
                      header: 'Мероприятие',
                      sortable: true,
                      render: (row) => (
                        <div className="min-w-0">
                          <p className="truncate font-medium text-content">{row.name}</p>
                          <p className="truncate text-2xs text-content-faint">{row.type}</p>
                        </div>
                      ),
                    },
                    {
                      key: 'hall',
                      header: 'Объект / зал',
                      width: 140,
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
                      key: 'eventFrom',
                      header: 'Даты',
                      width: 132,
                      sortable: true,
                      nowrap: true,
                      render: (row) => formatDateRange(row.eventFrom, row.eventTo),
                    },
                    {
                      key: 'status',
                      header: 'Статус',
                      width: 144,
                      sortable: true,
                      render: (row) => <StatusBadge status={row.status} size="sm" />,
                    },
                    {
                      key: 'amount',
                      header: 'Сумма',
                      width: 128,
                      align: 'right',
                      sortable: true,
                      nowrap: true,
                      render: (row) => (row.amount ? formatMoney(row.amount) : '—'),
                    },
                  ]}
                />
              </CardBody>
            </Card>
          ) : null}

          {/* ── Договоры ── */}
          {tab === 'contracts' ? (
            <Card>
              <CardHeader
                plate="ДОГ"
                plateTone="outline"
                title="Договоры арендатора"
                subtitle={`${stats.contractCount} всего · ${stats.activeContractCount} действующих`}
                actions={
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft="plus"
                    onClick={() => setCreatingContract(true)}
                  >
                    Создать договор
                  </Button>
                }
              />
              <CardBody divided={false} className="px-0 pb-0">
                <DataTable
                  frame={false}
                  className="border-x-0"
                  rows={stats.contracts.map((contract) => ({
                    ...contract,
                    metrics: contractMetrics(contract),
                  }))}
                  rowKey={(row) => row.id}
                  statusKey={(row) =>
                    row.metrics.attention ? 'conflict' : APPROVAL_STATES[row.approvalStatus].token
                  }
                  density="compact"
                  initialSort={{ key: 'signedAt', dir: 'desc' }}
                  onRowClick={(row) => navigate(`/contracts/${row.id}`)}
                  emptyState={
                    <EmptyState
                      size="sm"
                      title="Договоров пока нет"
                      description="Потенциальный клиент — договоры ещё не заключались."
                      grid={false}
                      action={
                        <Button
                          variant="primary"
                          size="sm"
                          iconLeft="plus"
                          onClick={() => setCreatingContract(true)}
                        >
                          Создать договор
                        </Button>
                      }
                    />
                  }
                  columns={[
                    {
                      key: 'number',
                      header: 'Номер',
                      width: 160,
                      sortable: true,
                      render: (row) => (
                        <div className="min-w-0">
                          <p className="truncate font-mono text-xs font-semibold text-content">
                            № {row.number}
                          </p>
                          <p className="truncate text-2xs text-content-faint">
                            {CONTRACT_TYPE_SHORT[row.type]}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: 'signedAt',
                      header: 'Заключён / до',
                      width: 148,
                      sortable: true,
                      nowrap: true,
                      render: (row) => (
                        <div className="min-w-0">
                          <p className="tabular-nums text-content">{formatDate(row.signedAt)}</p>
                          <p className="text-2xs tabular-nums text-content-faint">
                            до {formatDate(row.validTo)}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: 'amount',
                      header: 'Сумма',
                      width: 140,
                      align: 'right',
                      sortable: true,
                      nowrap: true,
                      render: (row) => (
                        <div className="min-w-0">
                          <p className="font-medium tabular-nums text-content">
                            {formatMoney(row.amount)}
                          </p>
                          <p className="text-2xs tabular-nums text-content-faint">
                            {row.metrics.debt > 0
                              ? `остаток ${toMillions(row.metrics.debt)} млн`
                              : 'оплачен'}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: 'approvalStatus',
                      header: 'Согласование',
                      width: 146,
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
                      width: 160,
                      sortable: true,
                      accessor: (row) => row.metrics.paymentState,
                      render: (row) => (
                        <StatusBadge
                          status={PAYMENT_STATES[row.metrics.paymentState].token}
                          label={PAYMENT_STATES[row.metrics.paymentState].label}
                          size="sm"
                        />
                      ),
                    },
                  ]}
                />
              </CardBody>
            </Card>
          ) : null}

          {/* ── Финансы ── */}
          {tab === 'finance' ? (
            <>
              <Card>
                <CardHeader plate="ФИН" plateTone="outline" title="Финансовое состояние" />
                <CardBody>
                  <MetaGrid columns={3}>
                    <MetaItem
                      label="Заключено договоров"
                      value={formatMoney(stats.signedAmount)}
                      tone="accent"
                    />
                    <MetaItem label="Оплачено" value={formatMoney(stats.paidAmount)} />
                    <MetaItem
                      label="Задолженность"
                      value={formatMoney(stats.debt)}
                      tone={stats.debt > 0 ? 'strong' : 'muted'}
                    />
                  </MetaGrid>

                  <div className="mt-3.5">
                    <MeterBar
                      label="Исполнение по оплате"
                      value={stats.progress}
                      valueLabel={`${stats.progress}%`}
                      tone={
                        stats.overdueAmount > 0
                          ? 'conflict'
                          : stats.debt > 0
                            ? 'beam'
                            : 'confirmed'
                      }
                      size="lg"
                      hint={`${stats.contractCount} ${plural(stats.contractCount, ['договор', 'договора', 'договоров'])}, из них действующих ${stats.activeContractCount}`}
                    />
                  </div>

                  <p className="mt-3 border-t border-hairline-soft pt-3 text-xs leading-normal text-content-faint">
                    Задолженность — сумма остатков по договорам со статусом «не оплачен»,
                    «частично» и «просрочен». Договоры без выставленного счёта в неё не входят —
                    та же логика, что в дебиторке на дашборде.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  plate="ПЛАТ"
                  plateTone="outline"
                  title="История платежей"
                  subtitle={`${stats.payments.length} ${plural(stats.payments.length, ['платёж', 'платежа', 'платежей'])} по всем договорам`}
                />
                <CardBody>
                  {stats.payments.length ? (
                    <ul className="space-y-1.5">
                      {stats.payments.map((item) => {
                        const state = PAYMENT_STATUSES[item.status]
                        return (
                          <li
                            key={`${item.contractId}-${item.id}`}
                            className={cn(
                              'relative flex flex-wrap items-center gap-x-3 gap-y-1 overflow-hidden rounded border px-2.5 py-2',
                              item.status === 'overdue'
                                ? 'border-status-conflict-border bg-status-conflict-soft pl-rail'
                                : 'border-hairline bg-surface-sunken',
                            )}
                          >
                            {item.status === 'overdue' ? (
                              <span
                                aria-hidden="true"
                                className="absolute inset-y-0 left-0 w-rail bg-status-conflict-base"
                              />
                            ) : null}
                            <button
                              type="button"
                              onClick={() => navigate(`/contracts/${item.contractId}`)}
                              className="focus-ring min-w-0 flex-1 rounded-sm text-left"
                            >
                              <span className="block truncate text-base text-content">
                                {item.kind}
                              </span>
                              <span className="block truncate font-mono text-2xs text-content-faint">
                                № {item.contractNumber} · срок {formatDate(item.dueDate)}
                                {item.paidAt ? ` · оплачен ${formatDate(item.paidAt)}` : ''}
                              </span>
                            </button>
                            <span className="shrink-0 font-medium tabular-nums text-content">
                              {formatMoney(item.amount)}
                            </span>
                            <StatusBadge status={state.token} label={state.label} size="sm" />
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <EmptyState
                      size="sm"
                      title="Платежей нет"
                      description="Счета по договорам этого арендатора ещё не выставлялись."
                      grid={false}
                    />
                  )}
                </CardBody>
              </Card>
            </>
          ) : null}

          {/* ── История взаимодействия ── */}
          {tab === 'history' ? (
            <Card>
              <CardHeader
                plate="ЛОГ"
                plateTone="outline"
                title="История взаимодействия"
                subtitle={`${entries.length} записей · обращения, заявки, договоры и оплаты`}
                actions={
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft="plus"
                    onClick={() => setNoteModal(true)}
                  >
                    Добавить заметку
                  </Button>
                }
              />
              <CardBody>
                {entries.length ? (
                  <ol className="space-y-0">
                    {entries.map((entry, index) => {
                      const meta = HISTORY_ACTIONS[entry.action] ?? HISTORY_ACTIONS.status
                      return (
                        <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
                          {index < entries.length - 1 ? (
                            <span
                              aria-hidden="true"
                              className="absolute left-[13px] top-7 h-full w-px bg-hairline"
                            />
                          ) : null}
                          <span
                            className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
                            style={{
                              borderColor: STATUSES[meta.tone]?.colors.border,
                              backgroundColor: STATUSES[meta.tone]?.colors.soft,
                              color: STATUSES[meta.tone]?.colors.text,
                            }}
                          >
                            <Icon name={meta.icon} size={13} />
                          </span>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <p className="flex flex-wrap items-baseline gap-x-2">
                              <span className="text-base font-medium text-content">
                                {meta.label}
                              </span>
                              <span className="text-2xs tabular-nums text-content-faint">
                                {formatDate(entry.at)}
                              </span>
                            </p>
                            {entry.details ? (
                              <p className="mt-0.5 text-xs leading-snug text-content-muted">
                                {entry.details}
                              </p>
                            ) : null}
                            <p className="mt-0.5 text-2xs text-content-faint">
                              {entry.actor} · {entry.role}
                            </p>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                ) : (
                  <EmptyState size="sm" title="Записей нет" grid={false} />
                )}
              </CardBody>
            </Card>
          ) : null}
        </div>

        {/* ═══ Правая колонка ════════════════════════════ */}
        <div className="min-w-0 space-y-3">
          <Card status={stats.overdueAmount > 0 ? 'conflict' : status.token}>
            <CardHeader plate={tenant.short ?? tenant.name} title="Сводка по клиенту" />
            <CardBody>
              <MetaGrid columns={1}>
                <MetaItem
                  label="Статус клиента"
                  value={<StatusBadge status={status.token} label={status.label} size="sm" />}
                />
                <MetaItem label="БИН / ИИН" value={tenant.bin} mono />
                <MetaItem
                  label="Основной контакт"
                  value={tenant.contacts?.[0]?.name ?? 'не указан'}
                  icon="user"
                />
                <MetaItem
                  label="Мероприятий"
                  value={`${formatNumber(stats.eventCount)} · предстоит ${stats.upcomingCount}`}
                  icon="presentation"
                />
                <MetaItem
                  label="Договоров"
                  value={`${formatNumber(stats.contractCount)} · действ. ${stats.activeContractCount}`}
                  icon="contract"
                />
                <MetaItem
                  label="Заключено на сумму"
                  value={formatMoney(stats.signedAmount)}
                  tone="accent"
                />
                <MetaItem
                  label="Задолженность"
                  value={stats.debt > 0 ? formatMoney(stats.debt) : 'нет'}
                  tone={stats.debt > 0 ? 'strong' : 'muted'}
                />
              </MetaGrid>

              <div className="mt-3 space-y-2 border-t border-hairline-soft pt-3">
                {stats.nextEvent ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/events/${stats.nextEvent.id}`)}
                    className="focus-ring w-full rounded border border-hairline bg-surface-sunken px-2.5 py-2 text-left transition-colors duration-fast hover:border-hairline-strong"
                  >
                    <p className="text-2xs font-semibold uppercase tracking-label text-content-faint">
                      Следующее мероприятие
                    </p>
                    <p className="mt-0.5 truncate text-base font-medium text-content">
                      {stats.nextEvent.name}
                    </p>
                    <p className="text-2xs tabular-nums text-content-subtle">
                      {formatDateRange(stats.nextEvent.eventFrom, stats.nextEvent.eventTo)} ·{' '}
                      {stats.nextEvent.hall}
                    </p>
                  </button>
                ) : (
                  <p className="rounded border border-dashed border-hairline px-2.5 py-2 text-center text-xs text-content-faint">
                    Предстоящих мероприятий нет
                  </p>
                )}

                {stats.lastEvent ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/events/${stats.lastEvent.id}`)}
                    className="focus-ring w-full rounded border border-hairline bg-surface-sunken px-2.5 py-2 text-left transition-colors duration-fast hover:border-hairline-strong"
                  >
                    <p className="text-2xs font-semibold uppercase tracking-label text-content-faint">
                      Последнее мероприятие
                    </p>
                    <p className="mt-0.5 truncate text-base font-medium text-content">
                      {stats.lastEvent.name}
                    </p>
                    <p className="text-2xs tabular-nums text-content-subtle">
                      {formatDateRange(stats.lastEvent.eventFrom, stats.lastEvent.eventTo)}
                    </p>
                  </button>
                ) : null}
              </div>
            </CardBody>
          </Card>

          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              block
              iconLeft="plus"
              onClick={() => setCreatingEvent(true)}
            >
              Создать мероприятие
            </Button>
            <Button
              variant="secondary"
              block
              iconLeft="contract"
              onClick={() => setCreatingContract(true)}
            >
              Создать договор
            </Button>
            <Button
              variant="secondary"
              block
              iconLeft="building"
              onClick={() => navigate('/tenants')}
            >
              Вернуться в реестр
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ Создание мероприятия с предзаполненным арендатором ═══ */}
      <EventCreatePanel
        open={creatingEvent}
        initialTenant={tenant.name}
        onClose={() => setCreatingEvent(false)}
        onCreated={(newId) => navigate(`/events/${newId}`)}
      />

      {/* ═══ Создание договора с предзаполненным арендатором ═══ */}
      <ContractCreatePanel
        open={creatingContract}
        initialTenantId={tenant.id}
        onClose={() => setCreatingContract(false)}
        onCreated={(newId) => navigate(`/contracts/${newId}`)}
      />

      {/* ═══ Контактное лицо ═══════════════════════════════ */}
      <Modal
        open={contactModal}
        onClose={() => setContactModal(false)}
        size="sm"
        plate={tenant.id}
        title="Добавить контактное лицо"
        footer={
          <>
            <Button variant="ghost" onClick={() => setContactModal(false)}>
              Отмена
            </Button>
            <Button
              variant="primary"
              iconLeft="check"
              disabled={!contact.name.trim()}
              onClick={submitContact}
            >
              Добавить
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="ФИО" required>
            <Input
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              placeholder="А. Сагинтаева"
            />
          </Field>
          <Field label="Должность">
            <Input
              value={contact.position}
              onChange={(e) => setContact({ ...contact, position: e.target.value })}
              placeholder="Руководитель проектов"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Телефон">
              <Input
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                placeholder="+7 701 000 00 00"
              />
            </Field>
            <Field label="Электронная почта">
              <Input
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </Modal>

      {/* ═══ Заметка в историю ═════════════════════════════ */}
      <Modal
        open={noteModal}
        onClose={() => setNoteModal(false)}
        size="sm"
        plate={tenant.id}
        title="Добавить заметку"
        subtitle="Запись появится в истории взаимодействия"
        footer={
          <>
            <Button variant="ghost" onClick={() => setNoteModal(false)}>
              Отмена
            </Button>
            <Button
              variant="primary"
              iconLeft="check"
              disabled={!note.trim()}
              onClick={submitNote}
            >
              Добавить
            </Button>
          </>
        }
      >
        <Field label="Текст заметки" required>
          <Textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Звонок: обсудили перенос выставки на октябрь…"
          />
        </Field>
      </Modal>
    </div>
  )
}
