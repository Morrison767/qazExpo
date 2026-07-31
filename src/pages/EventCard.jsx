import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, IconButton } from '@/components/Button'
import { Tabs } from '@/components/Tabs'
import { Field, Input, Select, Switch, Textarea, DateField } from '@/components/Field'
import { StatusBadge } from '@/components/Status'
import { HallPlate } from '@/components/HallPlate'
import { Badge } from '@/components/Badge'
import { Card, CardBody, CardHeader, MetaGrid, MetaItem } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { Modal } from '@/components/Modal'
import { Icon } from '@/components/Icon'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { useToast } from '@/components/Toast'
import { ConflictBlockNotice, ConflictNotice } from '@/components/ConflictNotice'

import { useEvents } from '@/app/EventsContext'
import { cn } from '@/lib/cn'
import { useEscapeKey, useOutsideClick } from '@/lib/hooks'
import { formatDate, formatDateRange, formatMoney, formatNumber } from '@/lib/format'
import {
  formatDuration,
  formatRangeShort,
  occupiedRange,
  parseTime,
  phaseSegments,
  phaseStyle,
  statusBase,
} from '@/lib/timeline'
import { STATUSES } from '@/design/statuses'
import { FORMAT_LABELS, SERVICE_LABELS, OBJECTS, derivePhases, objectByKey } from '@/demo/events'
import { HALLS, hallById } from '@/demo/halls'
import { HISTORY_ACTIONS } from '@/demo/history'
import { EVENT_TYPES } from '@/demo/data'

const TABS = [
  { key: 'main', label: 'Основное', icon: 'presentation' },
  { key: 'periods', label: 'Периоды', icon: 'calendar' },
  { key: 'tenant', label: 'Арендатор', icon: 'building' },
  { key: 'finance', label: 'Договор и финансы', icon: 'wallet' },
  { key: 'services', label: 'Услуги и ресурсы', icon: 'hard-hat' },
  { key: 'history', label: 'История', icon: 'clock' },
]

/** Допустимые статусы для смены вручную */
const STATUS_OPTIONS = ['draft', 'review', 'confirmed', 'done', 'void']

/* ─────────────────────────────────────────────────────────────
   Меню смены статуса
   ───────────────────────────────────────────────────────────── */
function StatusMenu({ current, onPick, blocked }) {
  const [open, setOpen] = useState(false)
  const ref = useOutsideClick(() => setOpen(false), open)
  useEscapeKey(() => setOpen(false), open)

  return (
    <div ref={ref} className="relative">
      <Button variant="secondary" iconRight="chevron-down" onClick={() => setOpen((v) => !v)}>
        Сменить статус
      </Button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+6px)] z-dropdown w-[17rem] animate-scale-in overflow-hidden rounded-md border border-hairline bg-surface shadow-lg">
          <p className="border-b border-hairline bg-surface-sunken px-3 py-2 text-2xs font-semibold uppercase tracking-label text-content-subtle">
            Статус мероприятия
          </p>
          <div className="py-1">
            {STATUS_OPTIONS.map((key) => {
              const active = key === current
              const locked = key === 'confirmed' && blocked
              return (
                <button
                  key={key}
                  type="button"
                  disabled={active || locked}
                  onClick={() => {
                    onPick(key)
                    setOpen(false)
                  }}
                  title={locked ? 'Недоступно: есть пересечение по помещению' : undefined}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors duration-fast',
                    active
                      ? 'bg-accent-soft'
                      : locked
                        ? 'cursor-not-allowed opacity-45'
                        : 'hover:bg-surface-sunken',
                  )}
                >
                  <StatusBadge status={key} size="sm" />
                  {active ? (
                    <Icon name="check" size={13} className="shrink-0 text-accent-fg" />
                  ) : locked ? (
                    <Icon name="lock" size={12} className="shrink-0 text-content-faint" />
                  ) : null}
                </button>
              )
            })}
          </div>
          {blocked ? (
            <p className="border-t border-hairline bg-status-conflict-soft px-3 py-2 text-2xs leading-snug text-status-conflict-text">
              «Подтверждено» заблокировано: помещение занято в эти даты другим мероприятием.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Карточка мероприятия
   ───────────────────────────────────────────────────────────── */
export default function EventCard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const {
    getEvent,
    applyEvent,
    applySchedule,
    setStatus,
    checkConflicts,
    conflictsFor,
    history,
    contracts,
    linkContract,
    getTenant,
  } = useEvents()

  const event = getEvent(id)
  const [tab, setTab] = useState('main')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [linkModal, setLinkModal] = useState(false)
  const [linkContractId, setLinkContractId] = useState('')

  /* Договоры без мероприятия + текущий, чтобы можно было отвязать */
  const linkableContracts = useMemo(
    () => contracts.filter((c) => c.type !== 'addendum' && (!c.eventId || c.eventId === id)),
    [contracts, id],
  )

  const conflicts = conflictsFor(id)
  const entries = history[id] ?? []

  /* Черновик периодов: инициализируется при первом входе на таб */
  const scheduleDraft = useMemo(() => {
    if (schedule) return schedule
    if (!event) return null
    return {
      hallId: event.hallId,
      objectKey: event.objectKey,
      mountFrom: event.mountFrom,
      eventFrom: event.eventFrom,
      eventTo: event.eventTo,
      dismountTo: event.dismountTo,
      techWindow: Boolean(event.phases?.tech),
    }
  }, [schedule, event])

  const scheduleCandidate = useMemo(() => {
    if (!event || !scheduleDraft) return null
    const phases = derivePhases(scheduleDraft)
    if (!scheduleDraft.techWindow) phases.tech = null
    const hall = hallById(scheduleDraft.hallId)
    return {
      ...event,
      hallId: scheduleDraft.hallId,
      hall: hall?.code,
      objectKey: hall?.objectKey,
      phases,
    }
  }, [event, scheduleDraft])

  const scheduleConflicts = useMemo(
    () => (scheduleCandidate ? checkConflicts(scheduleCandidate, id) : []),
    [scheduleCandidate, checkConflicts, id],
  )

  const scheduleDirty = useMemo(() => {
    if (!event || !scheduleDraft) return false
    return (
      scheduleDraft.hallId !== event.hallId ||
      scheduleDraft.mountFrom !== event.mountFrom ||
      scheduleDraft.eventFrom !== event.eventFrom ||
      scheduleDraft.eventTo !== event.eventTo ||
      scheduleDraft.dismountTo !== event.dismountTo ||
      scheduleDraft.techWindow !== Boolean(event.phases?.tech)
    )
  }, [event, scheduleDraft])

  if (!event) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <EmptyState
          size="lg"
          tone="search"
          title="Мероприятие не найдено"
          description={`В реестре нет записи с кодом ${id}.`}
          action={
            <Button variant="primary" iconLeft="list" onClick={() => navigate('/events')}>
              К реестру мероприятий
            </Button>
          }
        />
      </div>
    )
  }

  const range = occupiedRange(event)
  const object = objectByKey(event.objectKey)
  const blocked = conflicts.length > 0
  /* Арендатор — из store, чтобы правки реквизитов были видны здесь */
  const tenant = getTenant(event.tenantId)

  function startEdit() {
    setForm({
      name: event.name,
      type: event.type,
      format: event.format,
      description: event.description,
      manager: event.manager,
      guests: event.guests,
    })
    setEditing(true)
    setTab('main')
  }

  function saveEdit() {
    applyEvent(
      id,
      { ...form, guests: Number(form.guests) || 0 },
      { action: 'fields', details: 'Основные сведения обновлены' },
    )
    setEditing(false)
    toast.success({ title: 'Сведения сохранены' })
  }

  function changeStatus(next) {
    const result = setStatus(id, next)
    if (!result.ok) {
      toast.error({
        title: 'Статус «Подтверждено» недоступен',
        description: 'Помещение занято в эти даты. Разрешите пересечение или измените периоды.',
      })
      return
    }
    toast.success({
      title: 'Статус изменён',
      description: `${event.name} → ${STATUSES[next].label}`,
    })
  }

  function saveSchedule(status) {
    const result = applySchedule(
      id,
      { hallId: scheduleCandidate.hallId, phases: scheduleCandidate.phases },
      { status },
    )
    if (!result.ok) {
      toast.error({
        title: 'Подтвердить нельзя',
        description: 'Новые даты пересекаются с другим мероприятием в этом же зале.',
      })
      return
    }
    setSchedule(null)
    if (status === 'review') {
      toast.warning({
        title: 'Периоды сохранены, отправлено на согласование',
        description: 'Подтверждение бронирования недоступно из-за пересечения.',
      })
    } else {
      toast.success({ title: 'Периоды сохранены' })
    }
  }

  const stub = (title) => () =>
    toast.info({ title, description: 'Раздел будет собран на следующем шаге прототипа.' })

  return (
    <div className="pb-10">
      {/* ═══ Шапка ═══════════════════════════════════════ */}
      <div className="border-b border-hairline bg-surface-raised">
        <div className="px-5 pt-3">
          <Breadcrumbs
            items={[
              { label: 'Мероприятия', icon: 'presentation', onClick: () => navigate('/events') },
              { label: event.name, plate: event.id },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-3.5 pt-2.5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <HallPlate>{event.id}</HallPlate>
              <StatusBadge status={event.status} />
              {blocked ? (
                <Badge tone="outline" icon="alert-triangle" className="border-status-conflict-border text-status-conflict-text">
                  Пересечение по помещению
                </Badge>
              ) : null}
              <span className="text-xs text-content-faint">
                {event.type} · {FORMAT_LABELS[event.format]}
              </span>
            </div>
            <h1 className="mt-1.5 text-2xl font-semibold leading-tight text-content">
              {event.name}
            </h1>
            <p className="mt-0.5 text-base text-content-subtle">
              {event.tenant} · {object?.name}, {event.hall}
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
                <IconButton icon="printer" label="Печать" onClick={stub('Печать карточки')} />
                <Button
                  variant="secondary"
                  iconLeft="contract"
                  onClick={() =>
                    event.contractId
                      ? navigate(`/contracts/${event.contractId}`)
                      : (setLinkContractId(''), setLinkModal(true))
                  }
                >
                  {event.contractId ? 'Договор' : 'Привязать договор'}
                </Button>
                <StatusMenu current={event.status} onPick={changeStatus} blocked={blocked} />
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
        {/* ═══ Содержимое таба ═══════════════════════════ */}
        <div className="min-w-0 space-y-4 xl:col-span-2">
          {blocked ? (
            <ConflictBlockNotice conflicts={conflicts}>
              Мероприятие пересекается с другим в том же зале. Пока пересечение не разрешено, статус
              «Подтверждено» недоступен — измените периоды на соседнем табе или согласуйте
              пересечение с уполномоченным лицом.
            </ConflictBlockNotice>
          ) : null}

          {/* ── Основное ── */}
          {tab === 'main' ? (
            <Card>
              <CardHeader plate="ОСН" plateTone="outline" title="Основные сведения" />
              <CardBody>
                {editing ? (
                  <div className="space-y-4">
                    <Field label="Наименование" required>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Тип">
                        <Select
                          value={form.type}
                          onChange={(e) => setForm({ ...form, type: e.target.value })}
                          options={EVENT_TYPES.map((t) => ({ value: t, label: t }))}
                        />
                      </Field>
                      <Field label="Формат">
                        <Select
                          value={form.format}
                          onChange={(e) => setForm({ ...form, format: e.target.value })}
                          options={Object.entries(FORMAT_LABELS).map(([value, label]) => ({
                            value,
                            label,
                          }))}
                        />
                      </Field>
                      <Field label="Ответственный сотрудник">
                        <Input
                          value={form.manager}
                          onChange={(e) => setForm({ ...form, manager: e.target.value })}
                        />
                      </Field>
                      <Field label="Количество участников">
                        <Input
                          type="number"
                          value={form.guests}
                          onChange={(e) => setForm({ ...form, guests: e.target.value })}
                          suffix="чел."
                          className="text-right"
                        />
                      </Field>
                    </div>
                    <Field label="Описание">
                      <Textarea
                        rows={4}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </Field>
                  </div>
                ) : (
                  <>
                    <MetaGrid columns={3}>
                      <MetaItem label="Тип" value={event.type} />
                      <MetaItem label="Формат" value={FORMAT_LABELS[event.format]} />
                      <MetaItem label="Участников" value={formatNumber(event.guests)} icon="users" />
                      <MetaItem label="Объект" value={object?.name} icon="building" />
                      <MetaItem label="Помещение" value={event.hall} mono />
                      <MetaItem
                        label="Вместимость зала"
                        value={formatNumber(hallById(event.hallId)?.capacity ?? 0)}
                      />
                      <MetaItem
                        label="Ответственный"
                        value={event.manager}
                        icon="user"
                        tone="strong"
                      />
                      <MetaItem
                        label="Согласование"
                        value={
                          event.approval?.length ? (
                            <span className="text-status-review-text">
                              {event.approval.join(', ')}
                            </span>
                          ) : (
                            'закрыто'
                          )
                        }
                      />
                      <MetaItem label="Заявка создана" value={formatDate(event.contract?.signedAt)} />
                    </MetaGrid>

                    <div className="mt-3 border-t border-hairline-soft pt-3">
                      <p className="mb-1 text-2xs font-semibold uppercase tracking-label text-content-faint">
                        Описание
                      </p>
                      <p className="max-w-3xl text-base leading-normal text-content-muted">
                        {event.description}
                      </p>
                    </div>

                    {event.participants?.length ? (
                      <div className="mt-3 border-t border-hairline-soft pt-3">
                        <p className="mb-2 text-2xs font-semibold uppercase tracking-label text-content-faint">
                          Участники со стороны организатора
                        </p>
                        <ul className="space-y-1.5">
                          {event.participants.map((person) => (
                            <li
                              key={person.name}
                              className="flex flex-wrap items-center justify-between gap-2 rounded border border-hairline bg-surface-sunken px-2.5 py-1.5"
                            >
                              <span className="min-w-0">
                                <span className="text-base font-medium text-content">
                                  {person.name}
                                </span>
                                <span className="ml-2 text-xs text-content-subtle">
                                  {person.role}
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
                  </>
                )}
              </CardBody>
            </Card>
          ) : null}

          {/* ── Периоды ── */}
          {tab === 'periods' ? (
            <>
              {scheduleConflicts.length > 0 ? (
                <ConflictBlockNotice conflicts={scheduleConflicts}>
                  Выбранные периоды пересекаются с другим мероприятием в этом зале. Сохранить со
                  статусом «Подтверждено» нельзя — доступна отправка на согласование.
                </ConflictBlockNotice>
              ) : scheduleDirty ? (
                <div className="flex items-start gap-2 rounded-md border border-status-confirmed-border bg-status-confirmed-soft p-2.5">
                  <Icon
                    name="check-circle"
                    size={14}
                    className="mt-px shrink-0 text-status-confirmed-base"
                  />
                  <p className="text-xs leading-normal text-status-confirmed-text">
                    Помещение свободно в новые даты, включая монтаж, демонтаж и техническое окно.
                  </p>
                </div>
              ) : null}

              <Card>
                <CardHeader
                  plate="СРОКИ"
                  plateTone="outline"
                  title="Периоды занятости помещения"
                  actions={
                    <Button
                      variant="link"
                      size="sm"
                      iconRight="arrow-right"
                      onClick={() =>
                        navigate(`/calendar?event=${event.id}&date=${event.eventFrom}`)
                      }
                    >
                      В календаре
                    </Button>
                  }
                />
                <CardBody>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Объект">
                      <Select
                        value={scheduleDraft.objectKey}
                        onChange={(e) => {
                          const objectKey = e.target.value
                          const first = HALLS.find((h) => h.objectKey === objectKey)
                          setSchedule({ ...scheduleDraft, objectKey, hallId: first?.id })
                        }}
                        options={OBJECTS.map((o) => ({ value: o.key, label: o.name }))}
                      />
                    </Field>
                    <Field label="Помещение">
                      <Select
                        value={scheduleDraft.hallId}
                        onChange={(e) =>
                          setSchedule({ ...scheduleDraft, hallId: e.target.value })
                        }
                        options={HALLS.filter((h) => h.objectKey === scheduleDraft.objectKey).map(
                          (h) => ({ value: h.id, label: `${h.code} · ${h.name}` }),
                        )}
                      />
                    </Field>
                    <Field label="Монтаж с">
                      <DateField
                        value={scheduleDraft.mountFrom}
                        onChange={(e) =>
                          setSchedule({ ...scheduleDraft, mountFrom: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Проведение с">
                      <DateField
                        value={scheduleDraft.eventFrom}
                        onChange={(e) =>
                          setSchedule({ ...scheduleDraft, eventFrom: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Проведение по">
                      <DateField
                        value={scheduleDraft.eventTo}
                        onChange={(e) => setSchedule({ ...scheduleDraft, eventTo: e.target.value })}
                      />
                    </Field>
                    <Field label="Демонтаж до">
                      <DateField
                        value={scheduleDraft.dismountTo}
                        onChange={(e) =>
                          setSchedule({ ...scheduleDraft, dismountTo: e.target.value })
                        }
                      />
                    </Field>
                  </div>

                  <div className="mt-3 border-t border-hairline-soft pt-3">
                    <Switch
                      label="Техническое окно после демонтажа"
                      checked={scheduleDraft.techWindow}
                      onChange={(e) =>
                        setSchedule({ ...scheduleDraft, techWindow: e.target.checked })
                      }
                    />
                  </div>

                  <ul className="mt-3 space-y-1.5 border-t border-hairline-soft pt-3">
                    {phaseSegments(scheduleCandidate ?? event).map((segment) => (
                      <li key={segment.key} className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="h-3 w-6 shrink-0 rounded-xs border border-hairline"
                            style={phaseStyle(segment.key, statusBase(event.status))}
                          />
                          <span className="truncate text-base text-content">{segment.label}</span>
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-content-subtle">
                          {formatRangeShort(segment.from, segment.to)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardBody>

                {scheduleDirty ? (
                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-hairline-soft bg-surface-sunken px-4 py-2.5">
                    <Button variant="ghost" size="sm" onClick={() => setSchedule(null)}>
                      Отменить изменения
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      iconLeft="clock"
                      onClick={() => saveSchedule('review')}
                    >
                      Сохранить и отправить на согласование
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      iconLeft="check"
                      disabled={scheduleConflicts.length > 0}
                      title={
                        scheduleConflicts.length > 0
                          ? 'Недоступно: помещение занято в новые даты'
                          : undefined
                      }
                      onClick={() => saveSchedule('confirmed')}
                    >
                      Сохранить и подтвердить
                    </Button>
                  </div>
                ) : null}
              </Card>
            </>
          ) : null}

          {/* ── Арендатор ── */}
          {tab === 'tenant' ? (
            <Card>
              <CardHeader
                plate="АР"
                plateTone="outline"
                title={event.tenant}
                subtitle="Организация-заказчик"
                actions={
                  <Button
                    variant="link"
                    size="sm"
                    iconRight="arrow-right"
                    onClick={() => navigate(`/tenants/${event.tenantId}`)}
                  >
                    Карточка арендатора
                  </Button>
                }
              />
              <CardBody>
                <MetaGrid columns={2}>
                  <MetaItem label="БИН / ИИН" value={tenant?.bin} mono />
                  <MetaItem label="Клиент с" value={tenant?.since} />
                  <MetaItem label="Юридический адрес" value={tenant?.address} icon="map-pin" />
                  <MetaItem label="Телефон" value={tenant?.phone} mono icon="phone" />
                  <MetaItem label="Электронная почта" value={tenant?.email} icon="mail" />
                </MetaGrid>

                {tenant?.contacts?.length ? (
                  <div className="mt-3 border-t border-hairline-soft pt-3">
                    <p className="mb-2 text-2xs font-semibold uppercase tracking-label text-content-faint">
                      Контактные лица арендатора
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
          ) : null}

          {/* ── Договор и финансы ── */}
          {tab === 'finance' ? (
            <Card status={event.payment === 'unpaid' ? 'unpaid' : undefined}>
              <CardHeader
                plate={event.contract ? `№ ${event.contract.number}` : 'БЕЗ ДОГОВОРА'}
                plateTone="outline"
                title="Договор аренды"
                status={event.payment}
                actions={
                  event.contractId ? (
                    <Button
                      variant="link"
                      size="sm"
                      iconRight="arrow-right"
                      onClick={() => navigate(`/contracts/${event.contractId}`)}
                    >
                      Карточка договора
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      iconLeft="layers"
                      onClick={() => {
                        setLinkContractId('')
                        setLinkModal(true)
                      }}
                    >
                      Привязать договор
                    </Button>
                  )
                }
              />
              <CardBody>
                <MetaGrid columns={3}>
                  <MetaItem label="Номер" value={event.contract?.number} mono />
                  <MetaItem label="Заключён" value={formatDate(event.contract?.signedAt)} mono />
                  <MetaItem label="Действует до" value={formatDate(event.contract?.validTo)} mono />
                  <MetaItem
                    label="Сумма договора"
                    value={event.amount ? formatMoney(event.amount) : '—'}
                    tone="accent"
                  />
                  <MetaItem
                    label="Статус оплаты"
                    value={<StatusBadge status={event.payment} size="sm" />}
                  />
                  <MetaItem
                    label="Просрочка"
                    value={
                      event.overdueDays > 0 ? (
                        <span className="text-status-conflict-text">{event.overdueDays} дн.</span>
                      ) : (
                        'нет'
                      )
                    }
                  />
                </MetaGrid>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-hairline-soft pt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft="layers"
                    onClick={() => {
                      setLinkContractId(event.contractId ?? '')
                      setLinkModal(true)
                    }}
                  >
                    {event.contractId ? 'Изменить привязку' : 'Привязать договор'}
                  </Button>
                  {event.contractId ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      iconLeft="wallet"
                      onClick={() => navigate(`/contracts/${event.contractId}`)}
                    >
                      Платежи и документы
                    </Button>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          ) : null}

          {/* ── Услуги и ресурсы ── */}
          {tab === 'services' ? (
            <>
              <Card>
                <CardHeader plate="УСЛ" plateTone="outline" title="Заказанные услуги" />
                <CardBody>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                      <Switch
                        key={key}
                        label={label}
                        checked={Boolean(event.services?.[key])}
                        onChange={(e) =>
                          applyEvent(
                            id,
                            { services: { ...event.services, [key]: e.target.checked } },
                            {
                              action: 'services',
                              details: `${label}: ${e.target.checked ? 'заказано' : 'снято'}`,
                            },
                          )
                        }
                      />
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  plate="ОБОР"
                  plateTone="outline"
                  title="Оборудование и техническое сопровождение"
                />
                <CardBody>
                  {event.equipment?.length ? (
                    <ul className="space-y-1.5">
                      {event.equipment.map((item) => (
                        <li
                          key={item.name}
                          className="flex items-center justify-between gap-2 rounded border border-hairline bg-surface-sunken px-2.5 py-1.5"
                        >
                          <span className="min-w-0 truncate text-base text-content">
                            {item.name}
                          </span>
                          <span className="shrink-0 font-mono text-xs tabular-nums text-content-muted">
                            {formatNumber(item.qty)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-content-faint">Оборудование не заявлено</p>
                  )}
                  <p className="mt-3 border-t border-hairline-soft pt-3 text-xs leading-normal text-content-faint">
                    Подрядные организации, материальные пропуска и списки техники ведутся в модуле
                    «Подрядчики».
                  </p>
                </CardBody>
              </Card>
            </>
          ) : null}

          {/* ── История ── */}
          {tab === 'history' ? (
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
                            <span className="text-base font-medium text-content">{meta.label}</span>
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
          ) : null}
        </div>

        {/* ═══ Правая колонка — всегда на виду ═══════════ */}
        <div className="min-w-0 space-y-3">
          <Card status={blocked ? 'conflict' : event.status}>
            <CardHeader plate={event.hall} title="Ключевые сведения" />
            <CardBody>
              <MetaGrid columns={1}>
                <MetaItem label="Статус" value={<StatusBadge status={event.status} size="sm" />} />
                <MetaItem
                  label="Проведение"
                  value={formatDateRange(event.eventFrom, event.eventTo)}
                  icon="calendar"
                  tone="strong"
                />
                <MetaItem
                  label="Занятость зала"
                  value={range ? formatRangeShort(range.from, range.to) : '—'}
                />
                <MetaItem
                  label="Всего занято"
                  value={range ? formatDuration(range.to - range.from) : '—'}
                />
                <MetaItem
                  label="Сумма договора"
                  value={event.amount ? formatMoney(event.amount) : '—'}
                  tone="accent"
                />
                <MetaItem label="Оплата" value={<StatusBadge status={event.payment} size="sm" />} />
                <MetaItem label="Ответственный" value={event.manager} icon="user" />
              </MetaGrid>
            </CardBody>
          </Card>

          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              block
              iconLeft="calendar"
              onClick={() => navigate(`/calendar?event=${event.id}&date=${event.eventFrom}`)}
            >
              Показать в календаре
            </Button>
            <Button variant="secondary" block iconLeft="list" onClick={() => navigate('/events')}>
              Вернуться в реестр
            </Button>
          </div>

          <div className="rounded-md border border-hairline bg-surface-raised p-3">
            <p className="text-2xs font-semibold uppercase tracking-label text-content-faint">
              Последнее действие
            </p>
            {entries[0] ? (
              <>
                <p className="mt-1.5 text-base font-medium text-content">
                  {(HISTORY_ACTIONS[entries[0].action] ?? HISTORY_ACTIONS.status).label}
                </p>
                <p className="mt-0.5 text-xs text-content-muted">{entries[0].details}</p>
                <p className="mt-1 text-2xs text-content-faint">
                  {entries[0].actor} · {formatDate(entries[0].at)}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1.5"
                  iconRight="arrow-right"
                  onClick={() => setTab('history')}
                >
                  Вся история
                </Button>
              </>
            ) : (
              <p className="mt-1 text-xs text-content-faint">Записей нет</p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Привязка договора ═════════════════════════════ */}
      <Modal
        open={linkModal}
        onClose={() => setLinkModal(false)}
        size="md"
        plate={event.id}
        title="Привязка договора"
        subtitle="Связь хранится в одном поле и видна с обеих сторон"
        footer={
          <>
            <Button variant="ghost" onClick={() => setLinkModal(false)}>
              Отмена
            </Button>
            <Button
              variant="primary"
              iconLeft="check"
              onClick={() => {
                if (linkContractId) {
                  linkContract(linkContractId, event.id)
                  toast.success({
                    title: 'Договор привязан',
                    description: 'Статус оплаты и сумма подтянулись из договора.',
                  })
                } else if (event.contractId) {
                  linkContract(event.contractId, null)
                  toast.warning({
                    title: 'Договор отвязан',
                    description: 'Оплата по мероприятию больше не рассчитывается.',
                  })
                }
                setLinkModal(false)
              }}
            >
              Сохранить привязку
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Договор" hint="Показаны договоры без мероприятия и текущий привязанный">
            <Select
              value={linkContractId}
              onChange={(e) => setLinkContractId(e.target.value)}
              options={[
                { value: '', label: '— без договора —' },
                ...linkableContracts.map((contract) => ({
                  value: contract.id,
                  label: `№ ${contract.number} · ${formatMoney(contract.amount)}`,
                })),
              ]}
            />
          </Field>
          <p className="text-xs leading-normal text-content-faint">
            Сумма, статус оплаты и просрочка мероприятия вычисляются из договора — отдельного поля
            оплаты у мероприятия нет, поэтому расхождений быть не может.
          </p>
        </div>
      </Modal>
    </div>
  )
}
