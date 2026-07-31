import { useEffect, useMemo, useState } from 'react'
import { SidePanel } from './Modal'
import { Button } from './Button'
import { Field, Input, Select, Switch, Textarea, DateField } from './Field'
import { ConflictBlockNotice } from './ConflictNotice'
import { Icon } from './Icon'
import { useEvents } from '@/app/EventsContext'
import { useToast } from './Toast'
import { formatRangeShort, phaseSegments } from '@/lib/timeline'
import { EVENTS, OBJECTS, derivePhases } from '@/demo/events'
import { HALLS, hallById } from '@/demo/halls'
import { EVENT_TYPES } from '@/demo/data'

/**
 * ФОРМА СОЗДАНИЯ МЕРОПРИЯТИЯ — одна на календарь и реестр.
 *
 * Проверка пересечений идёт по ходу заполнения через тот же store,
 * что и в календаре. Пока есть пересечение, «Подтвердить бронирование»
 * заблокирована — доступна только отправка на согласование.
 *
 * onDraftChange отдаёт наружу текущий черновик: календарь рисует по нему
 * призрачную полосу на таймлайне.
 */
const MANAGERS = Array.from(new Set(EVENTS.map((e) => e.manager))).sort()
const TENANTS = Array.from(new Set(EVENTS.map((e) => e.tenant))).sort()

const DEFAULT_DRAFT = {
  name: '',
  type: 'Конференция',
  description: '',
  tenant: TENANTS[0] ?? '',
  manager: MANAGERS[0] ?? '',
  objectKey: 'kc',
  hallId: 'kc-a1',
  mountFrom: '2026-08-19',
  eventFrom: '2026-08-20',
  eventTo: '2026-08-21',
  dismountTo: '2026-08-22',
  techWindow: true,
  guests: 300,
}

/** Черновик формы → мероприятие, пригодное для проверки и записи в store */
export function draftToEvent(draft, id = '__draft__') {
  const phases = derivePhases(draft)
  if (!draft.techWindow) phases.tech = null
  const hall = hallById(draft.hallId)

  return {
    id,
    name: draft.name || 'Новое мероприятие',
    type: draft.type,
    description: draft.description,
    format: 'open',
    tenant: draft.tenant,
    contact: { name: '—', position: '—', phone: '—', email: '—' },
    participants: [],
    manager: draft.manager,
    objectKey: hall?.objectKey ?? draft.objectKey,
    hall: hall?.code ?? '',
    hallId: draft.hallId,
    mountFrom: draft.mountFrom,
    eventFrom: draft.eventFrom,
    eventTo: draft.eventTo,
    dismountTo: draft.dismountTo,
    phases,
    guests: Number(draft.guests) || 0,
    amount: 0,
    /* Договор не привязан: оплата подтянется из договора после привязки */
    contractId: null,
    approval: null,
    services: { security: false, cleaning: true, catering: false, tech: true },
    equipment: [],
    status: 'draft',
  }
}

export function EventCreatePanel({
  open,
  onClose,
  initialHallId,
  initialTenant,
  onDraftChange,
  onCreated,
}) {
  const { createEvent, checkConflicts } = useEvents()
  const toast = useToast()
  const [draft, setDraft] = useState(DEFAULT_DRAFT)

  /* Открыли из клика по свободной дорожке — подставляем зал */
  useEffect(() => {
    if (open && initialHallId) {
      const hall = hallById(initialHallId)
      setDraft((prev) => ({ ...prev, hallId: initialHallId, objectKey: hall?.objectKey ?? prev.objectKey }))
    }
  }, [open, initialHallId])

  /* Открыли из карточки арендатора — подставляем арендатора */
  useEffect(() => {
    if (open && initialTenant) {
      setDraft((prev) => ({ ...prev, tenant: initialTenant }))
    }
  }, [open, initialTenant])

  const candidate = useMemo(() => draftToEvent(draft), [draft])
  const conflicts = useMemo(
    () => (open ? checkConflicts(candidate, '__draft__') : []),
    [open, candidate, checkConflicts],
  )

  /* Отдаём черновик наружу для призрачной полосы на таймлайне */
  useEffect(() => {
    onDraftChange?.(open ? { candidate, conflicts } : null)
  }, [open, candidate, conflicts, onDraftChange])

  const hallOptions = useMemo(
    () =>
      HALLS.filter((h) => h.objectKey === draft.objectKey).map((h) => ({
        value: h.id,
        label: `${h.code} · ${h.name} (${h.capacity} чел.)`,
      })),
    [draft.objectKey],
  )

  const datesValid =
    draft.mountFrom <= draft.eventFrom &&
    draft.eventFrom <= draft.eventTo &&
    draft.eventTo <= draft.dismountTo

  function submit(status) {
    const result = createEvent(draftToEvent(draft, undefined), status)
    if (!result.ok) {
      toast.error({
        title: 'Подтвердить бронирование нельзя',
        description: 'Помещение занято в выбранные даты с учётом монтажа и демонтажа.',
      })
      return
    }

    if (status === 'confirmed') {
      toast.success({
        title: 'Бронирование подтверждено',
        description: `${draft.name} · ${hallById(draft.hallId)?.code} · с ${draft.eventFrom}`,
      })
    } else {
      toast.warning({
        title: 'Заявка отправлена на согласование',
        description:
          conflicts.length > 0
            ? 'Подтверждение недоступно: есть пересечение по помещению.'
            : 'Мероприятие создано со статусом «На согласовании».',
      })
    }

    setDraft(DEFAULT_DRAFT)
    onClose?.()
    onCreated?.(result.id)
  }

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      size="md"
      plate="Новая заявка"
      title="Создать мероприятие"
      subtitle="Проверка пересечений идёт по ходу заполнения"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="secondary"
            iconLeft="clock"
            disabled={!draft.name || !datesValid}
            onClick={() => submit('review')}
          >
            Отправить на согласование
          </Button>
          <Button
            variant="primary"
            iconLeft="check"
            disabled={conflicts.length > 0 || !draft.name || !datesValid}
            title={
              conflicts.length > 0 ? 'Недоступно: помещение занято в выбранные даты' : undefined
            }
            onClick={() => submit('confirmed')}
          >
            Подтвердить бронирование
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {conflicts.length > 0 ? (
          <ConflictBlockNotice conflicts={conflicts} />
        ) : draft.name && datesValid ? (
          <div className="flex items-start gap-2 rounded-md border border-status-confirmed-border bg-status-confirmed-soft p-2.5">
            <Icon
              name="check-circle"
              size={14}
              className="mt-px shrink-0 text-status-confirmed-base"
            />
            <p className="text-xs leading-normal text-status-confirmed-text">
              Помещение свободно в выбранный период, включая монтаж и демонтаж. Бронирование можно
              подтвердить.
            </p>
          </div>
        ) : null}

        {!datesValid ? (
          <div className="flex items-start gap-2 rounded-md border border-status-review-border bg-status-review-soft p-2.5">
            <Icon name="alert-circle" size={14} className="mt-px shrink-0 text-status-review-base" />
            <p className="text-xs leading-normal text-status-review-text">
              Порядок дат нарушен: монтаж ≤ начало проведения ≤ окончание ≤ демонтаж.
            </p>
          </div>
        ) : null}

        <Field label="Наименование мероприятия" required>
          <Input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Например: Форум «Индустрия 5.0»"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Тип" required>
            <Select
              value={draft.type}
              onChange={(e) => setDraft({ ...draft, type: e.target.value })}
              options={EVENT_TYPES.map((type) => ({ value: type, label: type }))}
            />
          </Field>
          <Field label="Ответственный" required>
            <Select
              value={draft.manager}
              onChange={(e) => setDraft({ ...draft, manager: e.target.value })}
              options={MANAGERS.map((m) => ({ value: m, label: m }))}
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Арендатор" required>
            <Select
              value={draft.tenant}
              onChange={(e) => setDraft({ ...draft, tenant: e.target.value })}
              options={Array.from(new Set([...TENANTS, draft.tenant].filter(Boolean))).map((t) => ({
                value: t,
                label: t,
              }))}
            />
          </Field>
          <Field label="Участников">
            <Input
              type="number"
              value={draft.guests}
              onChange={(e) => setDraft({ ...draft, guests: e.target.value })}
              suffix="чел."
              className="text-right"
            />
          </Field>
        </div>

        <Field label="Краткое описание">
          <Textarea
            rows={2}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Формат, особенности застройки, требования…"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Объект" required>
            <Select
              value={draft.objectKey}
              onChange={(e) => {
                const objectKey = e.target.value
                const firstHall = HALLS.find((h) => h.objectKey === objectKey)
                setDraft({ ...draft, objectKey, hallId: firstHall?.id })
              }}
              options={OBJECTS.map((o) => ({ value: o.key, label: o.name }))}
            />
          </Field>
          <Field label="Помещение" required>
            <Select
              value={draft.hallId}
              onChange={(e) => setDraft({ ...draft, hallId: e.target.value })}
              options={hallOptions}
            />
          </Field>
        </div>

        <div className="rounded-md border border-hairline bg-surface-sunken p-3">
          <p className="mb-2.5 text-2xs font-semibold uppercase tracking-label text-content-subtle">
            Периоды занятости помещения
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Монтаж с" required>
              <DateField
                size="sm"
                value={draft.mountFrom}
                onChange={(e) => setDraft({ ...draft, mountFrom: e.target.value })}
              />
            </Field>
            <Field label="Проведение с" required>
              <DateField
                size="sm"
                value={draft.eventFrom}
                onChange={(e) => setDraft({ ...draft, eventFrom: e.target.value })}
              />
            </Field>
            <Field label="Проведение по" required>
              <DateField
                size="sm"
                value={draft.eventTo}
                onChange={(e) => setDraft({ ...draft, eventTo: e.target.value })}
              />
            </Field>
            <Field label="Демонтаж до" required>
              <DateField
                size="sm"
                value={draft.dismountTo}
                onChange={(e) => setDraft({ ...draft, dismountTo: e.target.value })}
              />
            </Field>
          </div>

          <div className="mt-3 border-t border-hairline-soft pt-2.5">
            <Switch
              label="Техническое окно после демонтажа (12 ч)"
              checked={draft.techWindow}
              onChange={(e) => setDraft({ ...draft, techWindow: e.target.checked })}
            />
          </div>

          {datesValid ? (
            <ul className="mt-3 space-y-1 border-t border-hairline-soft pt-2.5">
              {phaseSegments(candidate).map((segment) => (
                <li key={segment.key} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-content-muted">{segment.label}</span>
                  <span className="text-2xs tabular-nums text-content-subtle">
                    {formatRangeShort(segment.from, segment.to)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </SidePanel>
  )
}

export default EventCreatePanel
