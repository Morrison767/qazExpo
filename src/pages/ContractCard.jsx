import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, IconButton } from '@/components/Button'
import { Tabs } from '@/components/Tabs'
import { Field, Input, Select, Textarea, DateField } from '@/components/Field'
import { StatusBadge } from '@/components/Status'
import { HallPlate } from '@/components/HallPlate'
import { Badge } from '@/components/Badge'
import { Card, CardBody, CardHeader, MetaGrid, MetaItem } from '@/components/Card'
import { MeterBar } from '@/components/Instruments'
import { EmptyState } from '@/components/EmptyState'
import { Modal } from '@/components/Modal'
import { Icon } from '@/components/Icon'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { useToast } from '@/components/Toast'

import { useEvents } from '@/app/EventsContext'
import { useRole } from '@/app/RoleContext'
import { cn } from '@/lib/cn'
import { useEscapeKey, useOutsideClick } from '@/lib/hooks'
import { formatDate, formatDateRange, formatMoney, plural } from '@/lib/format'
import { STATUSES } from '@/design/statuses'
import {
  APPROVAL_STATES,
  CONTRACT_TYPES,
  PAYMENT_STATES,
  PAYMENT_STATUSES,
  addendaOf,
  contractMetrics,
} from '@/demo/contracts'
import { objectByKey } from '@/demo/events'
import { tenantById } from '@/demo/tenants'
import { HISTORY_ACTIONS } from '@/demo/history'
import { toMillions } from '@/demo/dashboard'

const TABS = [
  { key: 'main', label: 'Основное', icon: 'contract' },
  { key: 'parties', label: 'Стороны', icon: 'building' },
  { key: 'event', label: 'Мероприятие', icon: 'presentation' },
  { key: 'finance', label: 'Финансы', icon: 'wallet' },
  { key: 'documents', label: 'Документы', icon: 'paperclip' },
  { key: 'approval', label: 'Согласование и история', icon: 'check-double' },
]

const APPROVAL_KEYS = ['draft', 'review', 'signed', 'archived', 'terminated']

const DOC_ICONS = {
  'Скан договора': 'contract',
  Приложение: 'paperclip',
  Смета: 'table',
  Счёт: 'wallet',
  Акт: 'check-double',
  Расторжение: 'ban',
  'Скан соглашения': 'contract',
  'Проект соглашения': 'pencil',
  Черновик: 'pencil',
}

/* ── Меню смены статуса согласования ── */
function ApprovalMenu({ current, onPick }) {
  const [open, setOpen] = useState(false)
  const ref = useOutsideClick(() => setOpen(false), open)
  useEscapeKey(() => setOpen(false), open)

  return (
    <div ref={ref} className="relative">
      <Button variant="secondary" iconRight="chevron-down" onClick={() => setOpen((v) => !v)}>
        Сменить статус
      </Button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+6px)] z-dropdown w-[16rem] animate-scale-in overflow-hidden rounded-md border border-hairline bg-surface shadow-lg">
          <p className="border-b border-hairline bg-surface-sunken px-3 py-2 text-2xs font-semibold uppercase tracking-label text-content-subtle">
            Статус согласования
          </p>
          <div className="py-1">
            {APPROVAL_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                disabled={key === current}
                onClick={() => {
                  onPick(key)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors duration-fast',
                  key === current ? 'bg-accent-soft' : 'hover:bg-surface-sunken',
                )}
              >
                <StatusBadge
                  status={APPROVAL_STATES[key].token}
                  label={APPROVAL_STATES[key].label}
                  size="sm"
                />
                {key === current ? (
                  <Icon name="check" size={13} className="shrink-0 text-accent-fg" />
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
   Карточка договора
   ───────────────────────────────────────────────────────────── */
export default function ContractCard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { roleKey, role } = useRole()
  const {
    contracts,
    events,
    history,
    getContract,
    updateContract,
    setApprovalStatus,
    approveStep,
    registerPayment,
    linkContract,
    getTenant,
  } = useEvents()

  const contract = getContract(id)
  const [tab, setTab] = useState('main')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [payModal, setPayModal] = useState(null)
  const [linkModal, setLinkModal] = useState(false)
  const [linkEventId, setLinkEventId] = useState('')

  const metrics = useMemo(() => (contract ? contractMetrics(contract) : null), [contract])
  const addenda = useMemo(
    () => (contract ? addendaOf(contracts, contract.id) : []),
    [contracts, contract],
  )
  const entries = history[id] ?? []

  if (!contract) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <EmptyState
          size="lg"
          tone="search"
          title="Договор не найден"
          description={`В реестре нет договора с идентификатором ${id}.`}
          action={
            <Button variant="primary" iconLeft="contract" onClick={() => navigate('/contracts')}>
              К реестру договоров
            </Button>
          }
        />
      </div>
    )
  }

  /* Арендатор читается из store, а не из модуля: правки реквизитов видны здесь */
  const tenant = getTenant(contract.tenantId) ?? tenantById(contract.tenantId)
  const linkedEvent = contract.eventId ? events.find((e) => e.id === contract.eventId) : null
  const parent = contract.parentId ? getContract(contract.parentId) : null
  const approval = APPROVAL_STATES[contract.approvalStatus]
  const payment = PAYMENT_STATES[metrics.paymentState]
  const pendingStep = (contract.route ?? []).find((step) => step.status === 'pending')
  const canApprove = pendingStep?.role === roleKey

  const stub = (title) => () =>
    toast.info({ title, description: 'Раздел будет собран на следующем шаге прототипа.' })

  function startEdit() {
    setForm({
      number: contract.number,
      type: contract.type,
      signedAt: contract.signedAt ?? '',
      validTo: contract.validTo ?? '',
      amount: contract.amount,
      paymentTerms: contract.paymentTerms ?? '',
      manager: contract.manager,
      lawyer: contract.lawyer,
      comment: contract.comment ?? '',
    })
    setEditing(true)
    setTab('main')
  }

  function saveEdit() {
    updateContract(
      id,
      { ...form, amount: Number(form.amount) || 0 },
      { action: 'fields', details: 'Основные условия обновлены' },
    )
    setEditing(false)
    toast.success({ title: 'Договор сохранён' })
  }

  function pickApproval(next) {
    setApprovalStatus(id, next)
    toast.success({
      title: 'Статус согласования изменён',
      description: `№ ${contract.number} → ${APPROVAL_STATES[next].label}`,
    })
  }

  function doApprove() {
    const result = approveStep(id)
    if (!result.ok) {
      if (result.reason === 'wrong-role') {
        toast.error({
          title: 'Согласование недоступно',
          description: `Текущий шаг маршрута ожидает: ${result.expected.roleLabel}. Переключите роль в топбаре.`,
        })
      } else {
        toast.info({ title: 'Маршрут уже закрыт' })
      }
      return
    }
    toast.success({
      title: result.allApproved ? 'Договор согласован полностью' : 'Шаг согласован',
      description: result.allApproved
        ? `№ ${contract.number} переведён в статус «Подписан»`
        : `${role.short}: согласовано`,
    })
  }

  function confirmPayment() {
    const result = registerPayment(id, payModal.id)
    setPayModal(null)
    if (!result.ok) return
    toast.success({
      title: 'Оплата отмечена',
      description: `${payModal.kind} · ${formatMoney(payModal.amount)}. Дебиторка на дашборде пересчитана.`,
    })
  }

  function confirmLink() {
    linkContract(id, linkEventId || null)
    setLinkModal(false)
    toast.success({
      title: linkEventId ? 'Мероприятие привязано' : 'Мероприятие отвязано',
      description: linkEventId
        ? 'Связь видна и в карточке мероприятия — поле одно.'
        : 'Договор стал рамочным.',
    })
  }

  /* Мероприятия без договора + текущее, чтобы можно было отвязать */
  const linkableEvents = useMemo(
    () => events.filter((event) => !event.contractId || event.id === contract.eventId),
    [events, contract.eventId],
  )

  return (
    <div className="pb-10">
      {/* ═══ Шапка ═══════════════════════════════════════ */}
      <div className="border-b border-hairline bg-surface-raised">
        <div className="px-5 pt-3">
          <Breadcrumbs
            items={[
              { label: 'Договоры', icon: 'contract', onClick: () => navigate('/contracts') },
              { label: `№ ${contract.number}`, plate: contract.id },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-3.5 pt-2.5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <HallPlate>{contract.id}</HallPlate>
              <StatusBadge status={approval.token} label={approval.label} />
              <StatusBadge status={payment.token} label={payment.label} />
              {metrics.attention ? (
                <Badge
                  tone="outline"
                  icon="alert-triangle"
                  className="border-status-conflict-border text-status-conflict-text"
                >
                  {metrics.overdueDays > 0
                    ? `Просрочка ${metrics.overdueDays} ${plural(metrics.overdueDays, ['день', 'дня', 'дней'])}`
                    : `Истекает через ${metrics.expiringInDays} ${plural(metrics.expiringInDays, ['день', 'дня', 'дней'])}`}
                </Badge>
              ) : null}
            </div>
            <h1 className="mt-1.5 text-2xl font-semibold leading-tight text-content">
              № {contract.number}
            </h1>
            <p className="mt-0.5 text-base text-content-subtle">
              {CONTRACT_TYPES[contract.type]} · {tenant?.name ?? '—'}
              {parent ? ` · к договору № ${parent.number}` : ''}
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
                <IconButton icon="printer" label="Печать" onClick={stub('Печать договора')} />
                <Button
                  variant="secondary"
                  iconLeft="wallet"
                  onClick={() => setTab('finance')}
                  disabled={!contract.payments?.length}
                >
                  Отметить оплату
                </Button>
                <ApprovalMenu current={contract.approvalStatus} onPick={pickApproval} />
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
          {/* Просрочка — тревожный блок */}
          {metrics.overdueDays > 0 ? (
            <div className="rounded-md border border-status-conflict-border bg-status-conflict-soft p-3">
              <p className="flex items-center gap-2 text-base font-semibold text-status-conflict-text">
                <Icon name="alert-triangle" size={15} />
                Оплата просрочена на {metrics.overdueDays}{' '}
                {plural(metrics.overdueDays, ['день', 'дня', 'дней'])}
              </p>
              <p className="mt-1 text-xs leading-normal text-status-conflict-text">
                Просроченная сумма {formatMoney(metrics.overdueAmount)}. Договор попадает в блок
                «Требуют внимания» на дашборде и в реестре договоров.
              </p>
            </div>
          ) : metrics.expiringSoon ? (
            <div className="rounded-md border border-status-review-border bg-status-review-soft p-3">
              <p className="flex items-center gap-2 text-base font-semibold text-status-review-text">
                <Icon name="clock" size={15} />
                Срок действия истекает через {metrics.expiringInDays}{' '}
                {plural(metrics.expiringInDays, ['день', 'дня', 'дней'])}
              </p>
              <p className="mt-1 text-xs leading-normal text-status-review-text">
                Действует до {formatDate(contract.validTo)}. Требуется продление или закрытие
                договора актом.
              </p>
            </div>
          ) : null}

          {/* ── Основное ── */}
          {tab === 'main' ? (
            <Card>
              <CardHeader plate="ОСН" plateTone="outline" title="Основные условия" />
              <CardBody>
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Номер договора" required>
                        <Input
                          mono
                          value={form.number}
                          onChange={(e) => setForm({ ...form, number: e.target.value })}
                        />
                      </Field>
                      <Field label="Тип договора">
                        <Select
                          value={form.type}
                          onChange={(e) => setForm({ ...form, type: e.target.value })}
                          options={Object.entries(CONTRACT_TYPES).map(([value, label]) => ({
                            value,
                            label,
                          }))}
                        />
                      </Field>
                      <Field label="Дата заключения">
                        <DateField
                          value={form.signedAt}
                          onChange={(e) => setForm({ ...form, signedAt: e.target.value })}
                        />
                      </Field>
                      <Field label="Действует до">
                        <DateField
                          value={form.validTo}
                          onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                        />
                      </Field>
                      <Field label="Сумма договора" hint="Без НДС">
                        <Input
                          type="number"
                          value={form.amount}
                          onChange={(e) => setForm({ ...form, amount: e.target.value })}
                          suffix="₸"
                          className="text-right"
                        />
                      </Field>
                      <Field label="Ответственный менеджер">
                        <Input
                          value={form.manager}
                          onChange={(e) => setForm({ ...form, manager: e.target.value })}
                        />
                      </Field>
                      <Field label="Юрист">
                        <Input
                          value={form.lawyer}
                          onChange={(e) => setForm({ ...form, lawyer: e.target.value })}
                        />
                      </Field>
                    </div>
                    <Field label="Условия оплаты">
                      <Textarea
                        rows={2}
                        value={form.paymentTerms}
                        onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                      />
                    </Field>
                    <Field label="Служебная отметка">
                      <Textarea
                        rows={2}
                        value={form.comment}
                        onChange={(e) => setForm({ ...form, comment: e.target.value })}
                      />
                    </Field>
                  </div>
                ) : (
                  <>
                    <MetaGrid columns={3}>
                      <MetaItem label="Номер" value={contract.number} mono />
                      <MetaItem label="Тип" value={CONTRACT_TYPES[contract.type]} />
                      <MetaItem label="Объект" value={objectByKey(contract.objectKey)?.name} />
                      <MetaItem label="Заключён" value={formatDate(contract.signedAt)} mono />
                      <MetaItem label="Действует до" value={formatDate(contract.validTo)} mono />
                      <MetaItem
                        label="Осталось"
                        value={
                          metrics.expiringInDays == null
                            ? '—'
                            : metrics.expiringInDays < 0
                              ? 'срок истёк'
                              : `${metrics.expiringInDays} дн.`
                        }
                        tone={metrics.expiringSoon ? 'accent' : 'default'}
                      />
                      <MetaItem
                        label="Сумма договора"
                        value={formatMoney(contract.amount)}
                        tone="accent"
                      />
                      <MetaItem label="Менеджер" value={contract.manager} icon="user" />
                      <MetaItem label="Юрист" value={contract.lawyer} icon="scale" />
                    </MetaGrid>

                    <div className="mt-3 border-t border-hairline-soft pt-3">
                      <p className="mb-1 text-2xs font-semibold uppercase tracking-label text-content-faint">
                        Условия оплаты
                      </p>
                      <p className="text-base leading-normal text-content-muted">
                        {contract.paymentTerms || '—'}
                      </p>
                    </div>

                    {contract.comment ? (
                      <div className="mt-3 border-t border-hairline-soft pt-3">
                        <p className="mb-1 text-2xs font-semibold uppercase tracking-label text-content-faint">
                          Служебная отметка
                        </p>
                        <p className="text-base leading-normal text-content-muted">
                          {contract.comment}
                        </p>
                      </div>
                    ) : null}
                  </>
                )}
              </CardBody>
            </Card>
          ) : null}

          {/* Дополнительные соглашения */}
          {tab === 'main' && (addenda.length > 0 || parent) ? (
            <Card>
              <CardHeader
                plate="ДС"
                plateTone="outline"
                title={parent ? 'Основной договор' : 'Дополнительные соглашения'}
              />
              <CardBody>
                <ul className="space-y-1.5">
                  {(parent ? [parent] : addenda).map((item) => {
                    const itemMetrics = contractMetrics(item)
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => navigate(`/contracts/${item.id}`)}
                          className="focus-ring group flex w-full items-center gap-3 rounded border border-hairline bg-surface-sunken px-2.5 py-2 text-left transition-colors duration-fast hover:border-hairline-strong"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-mono text-xs text-content group-hover:text-accent-fg">
                              № {item.number}
                            </span>
                            <span className="block truncate text-2xs text-content-faint">
                              {item.comment ?? CONTRACT_TYPES[item.type]}
                            </span>
                          </span>
                          <span className="shrink-0 text-xs tabular-nums text-content-muted">
                            {formatMoney(item.amount)}
                          </span>
                          <StatusBadge
                            status={APPROVAL_STATES[item.approvalStatus].token}
                            label={APPROVAL_STATES[item.approvalStatus].label}
                            size="sm"
                          />
                          <Icon
                            name="chevron-right"
                            size={13}
                            className="shrink-0 text-content-faint"
                          />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </CardBody>
            </Card>
          ) : null}

          {/* ── Стороны ── */}
          {tab === 'parties' ? (
            <>
              <Card>
                <CardHeader
                  plate="АР"
                  plateTone="outline"
                  title={tenant?.name ?? '—'}
                  subtitle="Арендатор (заказчик)"
                  actions={
                    <Button
                      variant="link"
                      size="sm"
                      iconRight="arrow-right"
                      onClick={() => navigate(`/tenants/${contract.tenantId}`)}
                    >
                      Карточка арендатора
                    </Button>
                  }
                />
                <CardBody>
                  <MetaGrid columns={2}>
                    <MetaItem label="БИН" value={tenant?.bin} mono />
                    <MetaItem label="Работаем с" value={tenant?.since} />
                    <MetaItem label="Адрес" value={tenant?.address} />
                    <MetaItem label="Телефон" value={tenant?.phone} mono icon="phone" />
                    <MetaItem label="Электронная почта" value={tenant?.email} icon="mail" />
                  </MetaGrid>

                  {tenant?.contacts?.length ? (
                    <div className="mt-3 border-t border-hairline-soft pt-3">
                      <p className="mb-2 text-2xs font-semibold uppercase tracking-label text-content-faint">
                        Контактные лица
                      </p>
                      <ul className="space-y-1.5">
                        {tenant.contacts.map((person) => (
                          <li
                            key={person.name}
                            className="flex flex-wrap items-center justify-between gap-2 rounded border border-hairline bg-surface-sunken px-2.5 py-1.5"
                          >
                            <span className="min-w-0">
                              <span className="text-base font-medium text-content">
                                {person.name}
                              </span>
                              <span className="ml-2 text-xs text-content-subtle">
                                {person.position}
                              </span>
                            </span>
                            <span className="font-mono text-xs tabular-nums text-content-muted">
                              {person.phone}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  plate="QEC"
                  title="АО «НК «QazExpoCongress»"
                  subtitle="Сторона исполнителя"
                />
                <CardBody>
                  <MetaGrid columns={2}>
                    <MetaItem
                      label="Объект"
                      value={objectByKey(contract.objectKey)?.name}
                      icon="building"
                    />
                    <MetaItem label="БИН" value="170140012345" mono />
                    <MetaItem label="Ответственный менеджер" value={contract.manager} icon="user" />
                    <MetaItem label="Юридическое сопровождение" value={contract.lawyer} icon="scale" />
                  </MetaGrid>
                </CardBody>
              </Card>
            </>
          ) : null}

          {/* ── Мероприятие ── */}
          {tab === 'event' ? (
            <Card status={linkedEvent?.status}>
              <CardHeader
                plate={linkedEvent?.id ?? 'НЕ ПРИВЯЗАНО'}
                plateTone={linkedEvent ? 'navy' : 'outline'}
                title={linkedEvent?.name ?? 'Мероприятие не привязано'}
                subtitle={
                  linkedEvent
                    ? `${linkedEvent.type} · ${objectByKey(linkedEvent.objectKey)?.name}, ${linkedEvent.hall}`
                    : 'Рамочный договор без привязки к конкретному мероприятию'
                }
                status={linkedEvent?.status}
                actions={
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft="layers"
                    onClick={() => {
                      setLinkEventId(contract.eventId ?? '')
                      setLinkModal(true)
                    }}
                  >
                    {linkedEvent ? 'Изменить привязку' : 'Привязать мероприятие'}
                  </Button>
                }
              />
              {linkedEvent ? (
                <CardBody>
                  <MetaGrid columns={2}>
                    <MetaItem
                      label="Проведение"
                      value={formatDateRange(linkedEvent.eventFrom, linkedEvent.eventTo)}
                      icon="calendar"
                      tone="strong"
                    />
                    <MetaItem label="Помещение" value={linkedEvent.hall} mono />
                    <MetaItem label="Арендатор" value={linkedEvent.tenant} />
                    <MetaItem label="Ответственный" value={linkedEvent.manager} icon="user" />
                  </MetaGrid>

                  <div className="mt-3 flex flex-wrap gap-2 border-t border-hairline-soft pt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      iconRight="arrow-right"
                      onClick={() => navigate(`/events/${linkedEvent.id}`)}
                    >
                      Карточка мероприятия
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      iconLeft="calendar"
                      onClick={() =>
                        navigate(`/calendar?event=${linkedEvent.id}&date=${linkedEvent.eventFrom}`)
                      }
                    >
                      Показать в календаре
                    </Button>
                  </div>
                </CardBody>
              ) : (
                <CardBody>
                  <p className="text-base leading-normal text-content-muted">
                    Договор не связан с мероприятием. Привяжите его, чтобы статус оплаты
                    отображался в карточке мероприятия и в реестре.
                  </p>
                </CardBody>
              )}
            </Card>
          ) : null}

          {/* ── Финансы ── */}
          {tab === 'finance' ? (
            <>
              <Card>
                <CardHeader plate="ФИН" plateTone="outline" title="Сумма и оплата" />
                <CardBody>
                  <MetaGrid columns={3}>
                    <MetaItem
                      label="Сумма договора"
                      value={formatMoney(contract.amount)}
                      tone="accent"
                    />
                    <MetaItem label="Оплачено" value={formatMoney(metrics.paidAmount)} />
                    <MetaItem
                      label="Остаток задолженности"
                      value={formatMoney(metrics.debt)}
                      tone={metrics.debt > 0 ? 'strong' : 'muted'}
                    />
                  </MetaGrid>

                  <div className="mt-3.5">
                    <MeterBar
                      label="Исполнение по оплате"
                      value={metrics.progress}
                      valueLabel={`${metrics.progress}%`}
                      tone={
                        metrics.paymentState === 'paid'
                          ? 'confirmed'
                          : metrics.paymentState === 'overdue'
                            ? 'conflict'
                            : 'beam'
                      }
                      size="lg"
                      hint={contract.paymentTerms}
                    />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  plate="ГРАФИК"
                  plateTone="outline"
                  title="Платежи"
                  subtitle={`${contract.payments?.length ?? 0} ${plural(contract.payments?.length ?? 0, ['платёж', 'платежа', 'платежей'])} по графику`}
                  actions={
                    <Button
                      variant="link"
                      size="sm"
                      iconLeft="plus"
                      onClick={stub('Выставление счёта')}
                    >
                      Выставить счёт
                    </Button>
                  }
                />
                <CardBody>
                  {contract.payments?.length ? (
                    <ul className="space-y-1.5">
                      {contract.payments.map((item) => {
                        const state = PAYMENT_STATUSES[item.status]
                        return (
                          <li
                            key={item.id}
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
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-base text-content">
                                {item.kind}
                              </span>
                              <span className="block text-2xs tabular-nums text-content-faint">
                                срок {formatDate(item.dueDate)}
                                {item.paidAt ? ` · оплачен ${formatDate(item.paidAt)}` : ''}
                              </span>
                            </span>
                            <span className="shrink-0 font-medium tabular-nums text-content">
                              {formatMoney(item.amount)}
                            </span>
                            <StatusBadge status={state.token} label={state.label} size="sm" />
                            {item.status !== 'paid' ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                iconLeft="check"
                                onClick={() => setPayModal(item)}
                              >
                                Отметить оплату
                              </Button>
                            ) : null}
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <EmptyState
                      size="sm"
                      title="Счёт не выставлен"
                      description="График платежей появится после выставления счёта."
                      grid={false}
                    />
                  )}
                </CardBody>
              </Card>
            </>
          ) : null}

          {/* ── Документы ── */}
          {tab === 'documents' ? (
            <Card>
              <CardHeader
                plate="ДОК"
                plateTone="outline"
                title="Прикреплённые документы"
                subtitle={`${contract.documents?.length ?? 0} ${plural(contract.documents?.length ?? 0, ['файл', 'файла', 'файлов'])}`}
                actions={
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft="upload"
                    onClick={stub('Загрузка документа')}
                  >
                    Прикрепить
                  </Button>
                }
              />
              <CardBody>
                {contract.documents?.length ? (
                  <ul className="space-y-1.5">
                    {contract.documents.map((document) => (
                      <li
                        key={document.id}
                        className="flex items-center gap-3 rounded border border-hairline bg-surface-sunken px-2.5 py-2"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-accent-line bg-accent-soft text-accent-fg">
                          <Icon name={DOC_ICONS[document.kind] ?? 'paperclip'} size={14} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-base text-content">
                            {document.name}
                          </span>
                          <span className="block text-2xs text-content-faint">
                            {document.kind} · {document.size} · {formatDate(document.at)}
                          </span>
                        </span>
                        <IconButton
                          icon="download"
                          label="Скачать"
                          size="sm"
                          onClick={stub('Скачивание файла')}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    size="sm"
                    title="Документов нет"
                    description="Скан договора, приложения и акты появятся здесь."
                    grid={false}
                  />
                )}
                <p className="mt-3 border-t border-hairline-soft pt-3 text-xs leading-normal text-content-faint">
                  Загрузка файлов в прототипе не реализована — список демонстрирует состав
                  документов по договору.
                </p>
              </CardBody>
            </Card>
          ) : null}

          {/* ── Согласование и история ── */}
          {tab === 'approval' ? (
            <>
              <Card>
                <CardHeader
                  plate="МАРШРУТ"
                  plateTone="outline"
                  title="Маршрут согласования"
                  subtitle={
                    pendingStep
                      ? `Ожидает: ${pendingStep.roleLabel}`
                      : 'Все шаги закрыты'
                  }
                  actions={
                    pendingStep ? (
                      <Button
                        variant={canApprove ? 'primary' : 'secondary'}
                        size="sm"
                        iconLeft="check"
                        disabled={!canApprove}
                        title={
                          canApprove
                            ? undefined
                            : `Согласовать может только: ${pendingStep.roleLabel}`
                        }
                        onClick={doApprove}
                      >
                        Согласовать
                      </Button>
                    ) : null
                  }
                />
                <CardBody>
                  <ol className="space-y-0">
                    {(contract.route ?? []).map((step, index) => {
                      const tone =
                        step.status === 'approved'
                          ? 'confirmed'
                          : step.status === 'pending'
                            ? 'review'
                            : 'draft'
                      return (
                        <li key={step.role} className="relative flex gap-3 pb-4 last:pb-0">
                          {index < contract.route.length - 1 ? (
                            <span
                              aria-hidden="true"
                              className="absolute left-[13px] top-7 h-full w-px bg-hairline"
                            />
                          ) : null}
                          <span
                            className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
                            style={{
                              borderColor: STATUSES[tone].colors.border,
                              backgroundColor: STATUSES[tone].colors.soft,
                              color: STATUSES[tone].colors.text,
                            }}
                          >
                            <Icon
                              name={
                                step.status === 'approved'
                                  ? 'check'
                                  : step.status === 'pending'
                                    ? 'clock'
                                    : 'circle-dashed'
                              }
                              size={13}
                            />
                          </span>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <p className="flex flex-wrap items-baseline gap-x-2">
                              <span className="text-base font-medium text-content">
                                {step.roleLabel}
                              </span>
                              {step.at ? (
                                <span className="text-2xs tabular-nums text-content-faint">
                                  {formatDate(step.at)}
                                </span>
                              ) : null}
                              {step.status === 'pending' ? (
                                <StatusBadge status="review" label="Ожидает" size="sm" />
                              ) : null}
                            </p>
                            <p className="mt-0.5 text-xs text-content-muted">{step.person}</p>
                            {step.comment ? (
                              <p className="mt-0.5 text-2xs text-content-faint">{step.comment}</p>
                            ) : null}
                          </div>
                        </li>
                      )
                    })}
                  </ol>

                  {pendingStep && !canApprove ? (
                    <p className="mt-2 rounded border border-hairline bg-surface-sunken px-2.5 py-2 text-xs leading-normal text-content-muted">
                      Текущая роль — «{role.short}». Чтобы согласовать этот шаг, переключитесь на
                      роль «{pendingStep.roleLabel}» в топбаре.
                    </p>
                  ) : null}
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  plate="ЛОГ"
                  plateTone="outline"
                  title="История изменений"
                  subtitle={`${entries.length} записей · свежие сверху`}
                />
                <CardBody>
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
                </CardBody>
              </Card>
            </>
          ) : null}
        </div>

        {/* ═══ Правая колонка ════════════════════════════ */}
        <div className="min-w-0 space-y-3">
          <Card status={metrics.attention ? 'conflict' : APPROVAL_STATES[contract.approvalStatus].token}>
            <CardHeader plate={contract.number} title="Ключевые сведения" />
            <CardBody>
              <MetaGrid columns={1}>
                <MetaItem
                  label="Согласование"
                  value={<StatusBadge status={approval.token} label={approval.label} size="sm" />}
                />
                <MetaItem
                  label="Оплата"
                  value={<StatusBadge status={payment.token} label={payment.label} size="sm" />}
                />
                <MetaItem label="Сумма" value={formatMoney(contract.amount)} tone="accent" />
                <MetaItem label="Оплачено" value={formatMoney(metrics.paidAmount)} />
                <MetaItem
                  label="Остаток"
                  value={formatMoney(metrics.debt)}
                  tone={metrics.debt > 0 ? 'strong' : 'muted'}
                />
                <MetaItem
                  label="Действует до"
                  value={`${formatDate(contract.validTo)}${
                    metrics.expiringInDays != null && metrics.expiringInDays >= 0
                      ? ` · ${metrics.expiringInDays} дн.`
                      : ''
                  }`}
                  mono
                />
                <MetaItem label="Менеджер" value={contract.manager} icon="user" />
                <MetaItem label="Юрист" value={contract.lawyer} icon="scale" />
              </MetaGrid>

              <div className="mt-3 border-t border-hairline-soft pt-3">
                <MeterBar
                  label="Оплачено из суммы"
                  value={metrics.progress}
                  valueLabel={`${toMillions(metrics.paidAmount)} / ${toMillions(contract.amount)} млн`}
                  tone={metrics.paymentState === 'overdue' ? 'conflict' : 'confirmed'}
                />
              </div>
            </CardBody>
          </Card>

          <div className="flex flex-col gap-2">
            {linkedEvent ? (
              <Button
                variant="secondary"
                block
                iconLeft="presentation"
                onClick={() => navigate(`/events/${linkedEvent.id}`)}
              >
                Открыть мероприятие
              </Button>
            ) : null}
            {linkedEvent ? (
              <Button
                variant="secondary"
                block
                iconLeft="calendar"
                onClick={() =>
                  navigate(`/calendar?event=${linkedEvent.id}&date=${linkedEvent.eventFrom}`)
                }
              >
                Показать в календаре
              </Button>
            ) : null}
            <Button
              variant="secondary"
              block
              iconLeft="contract"
              onClick={() => navigate('/contracts')}
            >
              Вернуться в реестр
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ Отметка оплаты ════════════════════════════════ */}
      <Modal
        open={Boolean(payModal)}
        onClose={() => setPayModal(null)}
        size="sm"
        plate={contract.number}
        title="Отметить оплату"
        subtitle={payModal?.kind}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPayModal(null)}>
              Отмена
            </Button>
            <Button variant="primary" iconLeft="check" onClick={confirmPayment}>
              Отметить оплаченным
            </Button>
          </>
        }
      >
        {payModal ? (
          <div className="space-y-3">
            <MetaGrid columns={2}>
              <MetaItem label="Сумма платежа" value={formatMoney(payModal.amount)} tone="accent" />
              <MetaItem label="Срок оплаты" value={formatDate(payModal.dueDate)} mono />
            </MetaGrid>
            <div className="rounded border border-hairline bg-surface-sunken p-2.5">
              <p className="text-xs leading-normal text-content-muted">
                После отметки остаток задолженности станет{' '}
                <span className="font-semibold text-content">
                  {formatMoney(Math.max(0, metrics.debt - payModal.amount))}
                </span>
                . Значение пересчитается в дашборде (дебиторка и диаграмма оплат) и в карточке
                связанного мероприятия — поле хранится только в договоре.
              </p>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ═══ Привязка мероприятия ══════════════════════════ */}
      <Modal
        open={linkModal}
        onClose={() => setLinkModal(false)}
        size="md"
        plate={contract.number}
        title="Привязка мероприятия"
        subtitle="Связь хранится в одном поле и видна с обеих сторон"
        footer={
          <>
            <Button variant="ghost" onClick={() => setLinkModal(false)}>
              Отмена
            </Button>
            <Button variant="primary" iconLeft="check" onClick={confirmLink}>
              Сохранить привязку
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field
            label="Мероприятие"
            hint="Показаны мероприятия без договора и текущее привязанное"
          >
            <Select
              value={linkEventId}
              onChange={(e) => setLinkEventId(e.target.value)}
              options={[
                { value: '', label: '— без мероприятия (рамочный договор) —' },
                ...linkableEvents.map((event) => ({
                  value: event.id,
                  label: `${event.id} · ${event.name} · ${event.hall}`,
                })),
              ]}
            />
          </Field>
          <p className="text-xs leading-normal text-content-faint">
            При привязке прежний договор аренды этого мероприятия будет отвязан — на одно
            мероприятие приходится один договор аренды.
          </p>
        </div>
      </Modal>
    </div>
  )
}
