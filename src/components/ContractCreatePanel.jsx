import { useEffect, useMemo, useState } from 'react'
import { SidePanel } from './Modal'
import { Button } from './Button'
import { Field, Input, Select, Textarea, DateField } from './Field'
import { Icon } from './Icon'
import { useEvents } from '@/app/EventsContext'
import { useToast } from './Toast'
import { formatMoney } from '@/lib/format'
import { CONTRACT_TYPES } from '@/demo/contracts'
import { OBJECTS } from '@/demo/events'

/**
 * ФОРМА СОЗДАНИЯ ДОГОВОРА — одна на карточку арендатора и реестр договоров.
 * Договор создаётся черновиком: маршрут согласования встаёт на первый шаг,
 * график платежей появляется после выставления счёта.
 */
const DEFAULT_DRAFT = {
  number: '',
  type: 'rent',
  tenantId: '',
  eventId: '',
  objectKey: 'kc',
  signedAt: '2026-08-01',
  validTo: '2026-12-31',
  amount: 0,
  paymentTerms: 'Предоплата 70% в течение 10 банковских дней, окончательный расчёт 30% по акту',
  comment: '',
}

export function ContractCreatePanel({ open, onClose, initialTenantId, initialEventId, onCreated }) {
  const { tenants, events, createContract } = useEvents()
  const toast = useToast()
  const [draft, setDraft] = useState(DEFAULT_DRAFT)

  useEffect(() => {
    if (!open) return
    setDraft((prev) => ({
      ...prev,
      tenantId: initialTenantId ?? prev.tenantId ?? tenants[0]?.id ?? '',
      eventId: initialEventId ?? '',
    }))
  }, [open, initialTenantId, initialEventId, tenants])

  /* Мероприятия выбранного арендатора без договора */
  const linkableEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.tenantId === draft.tenantId && (!event.contractId || event.id === initialEventId),
      ),
    [events, draft.tenantId, initialEventId],
  )

  const selectedEvent = events.find((event) => event.id === draft.eventId) ?? null
  const valid = draft.number.trim() !== '' && draft.tenantId && Number(draft.amount) > 0

  function submit() {
    const result = createContract({
      ...draft,
      amount: Number(draft.amount) || 0,
      eventId: draft.eventId || null,
      objectKey: selectedEvent?.objectKey ?? draft.objectKey,
      manager: tenants.find((t) => t.id === draft.tenantId)?.manager,
    })
    if (!result.ok) return

    toast.success({
      title: 'Договор создан',
      description: `№ ${draft.number} · черновик. Маршрут согласования ожидает менеджера.`,
    })
    setDraft(DEFAULT_DRAFT)
    onClose?.()
    onCreated?.(result.id)
  }

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      size="md"
      plate="Новый договор"
      title="Создать договор"
      subtitle="Создаётся черновиком, без графика платежей"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" iconLeft="check" disabled={!valid} onClick={submit}>
            Создать черновик
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-md border border-accent-line bg-accent-soft p-2.5">
          <Icon name="info" size={14} className="mt-px shrink-0 text-accent-fg" />
          <p className="text-xs leading-normal text-accent-strong">
            Договор появится в реестре со статусом «Черновик». Счёт и график платежей выставляются
            в карточке договора после согласования.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Номер договора" required hint="Формат: NNNN/ГГ-АР">
            <Input
              mono
              value={draft.number}
              onChange={(e) => setDraft({ ...draft, number: e.target.value })}
              placeholder="0205/26-АР"
            />
          </Field>
          <Field label="Тип договора" required>
            <Select
              value={draft.type}
              onChange={(e) => setDraft({ ...draft, type: e.target.value })}
              options={Object.entries(CONTRACT_TYPES).map(([value, label]) => ({ value, label }))}
            />
          </Field>
        </div>

        <Field label="Арендатор" required>
          <Select
            value={draft.tenantId}
            onChange={(e) => setDraft({ ...draft, tenantId: e.target.value, eventId: '' })}
            options={tenants.map((tenant) => ({
              value: tenant.id,
              label: `${tenant.name} · БИН ${tenant.bin}`,
            }))}
          />
        </Field>

        <Field
          label="Мероприятие"
          hint={
            linkableEvents.length
              ? 'Показаны мероприятия арендатора без договора'
              : 'У арендатора нет мероприятий без договора — можно оставить рамочным'
          }
        >
          <Select
            value={draft.eventId}
            onChange={(e) => setDraft({ ...draft, eventId: e.target.value })}
            options={[
              { value: '', label: '— рамочный, без мероприятия —' },
              ...linkableEvents.map((event) => ({
                value: event.id,
                label: `${event.id} · ${event.name} · ${event.hall}`,
              })),
            ]}
          />
        </Field>

        {!draft.eventId ? (
          <Field label="Объект">
            <Select
              value={draft.objectKey}
              onChange={(e) => setDraft({ ...draft, objectKey: e.target.value })}
              options={OBJECTS.map((o) => ({ value: o.key, label: o.name }))}
            />
          </Field>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Дата заключения">
            <DateField
              value={draft.signedAt}
              onChange={(e) => setDraft({ ...draft, signedAt: e.target.value })}
            />
          </Field>
          <Field label="Действует до">
            <DateField
              value={draft.validTo}
              onChange={(e) => setDraft({ ...draft, validTo: e.target.value })}
            />
          </Field>
        </div>

        <Field
          label="Сумма договора"
          required
          hint={Number(draft.amount) > 0 ? formatMoney(Number(draft.amount)) : 'Без НДС'}
        >
          <Input
            type="number"
            value={draft.amount}
            onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
            suffix="₸"
            className="text-right"
          />
        </Field>

        <Field label="Условия оплаты">
          <Textarea
            rows={2}
            value={draft.paymentTerms}
            onChange={(e) => setDraft({ ...draft, paymentTerms: e.target.value })}
          />
        </Field>

        <Field label="Служебная отметка">
          <Textarea
            rows={2}
            value={draft.comment}
            onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
            placeholder="Особые условия, основание, комментарий юриста…"
          />
        </Field>
      </div>
    </SidePanel>
  )
}

export default ContractCreatePanel
