import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DEMO_TODAY, EVENTS } from '@/demo/events'
import { CONTRACTS, contractMetrics, joinEvents } from '@/demo/contracts'
import { hallById } from '@/demo/halls'
import { TENANTS } from '@/demo/tenants'
import { makeEntry, seedContractHistory, seedHistory, seedTenantHistory } from '@/demo/history'
import { useRole } from './RoleContext'
import {
  canConfirm,
  conflictingEventIds,
  findAllConflicts,
  findConflicts,
  formatRangeShort,
  occupiedRange,
  parseTime,
  toIsoMinutes,
} from '@/lib/timeline'

/** Точка отсчёта демонстрации — «сегодня» для предстоящих и сроков */
const TODAY_TIME = parseTime(DEMO_TODAY)

/**
 * ═══════════════════════════════════════════════════════════════
 *  ЕДИНЫЙ STORE: МЕРОПРИЯТИЯ + ДОГОВОРЫ + АРЕНДАТОРЫ
 * ═══════════════════════════════════════════════════════════════
 *
 * Один источник данных для календаря, реестра мероприятий, реестра
 * договоров, карточек и дашборда.
 *
 * Хранятся ДВЕ коллекции: мероприятия и договоры. Связь одна —
 * `contract.eventId` ↔ `event.contractId`. Наружу отдаются мероприятия,
 * склеенные с договорами (`joinEvents`): поля `payment`, `overdueDays`,
 * `amount`, `debt` вычисляются из договора, а не дублируются.
 *
 * Поэтому отметка оплаты в карточке договора автоматически меняет
 * дебиторку на дашборде и статус оплаты в карточке мероприятия —
 * синхронизировать нечего, поле одно.
 *
 * ПРАВИЛО БРОНИРОВАНИЯ (п. 5.2 ТЗ) живёт здесь: операция, которая привела
 * бы к статусу «Подтверждено» при пересечении по помещению, отклоняется.
 */
const EventsContext = createContext(null)

let createdEvents = 0
let createdContracts = 0

const STATUS_LABELS = {
  draft: 'Черновик',
  review: 'На согласовании',
  confirmed: 'Подтверждено',
  conflict: 'Конфликт',
  done: 'Завершено',
  void: 'Расторгнуто',
  signed: 'Подписан',
  archived: 'Завершён',
  terminated: 'Расторгнут',
}

function statusLabel(key) {
  return STATUS_LABELS[key] ?? key
}

export function EventsProvider({ children }) {
  const { role, roleKey } = useRole()
  const [rawEvents, setRawEvents] = useState(() => EVENTS)
  const [contracts, setContracts] = useState(() => CONTRACTS)
  const [tenants, setTenants] = useState(() => TENANTS)
  const [history, setHistory] = useState(() => ({
    ...seedHistory(joinEvents(EVENTS, CONTRACTS)),
    ...seedContractHistory(CONTRACTS),
    ...seedTenantHistory(TENANTS, joinEvents(EVENTS, CONTRACTS), CONTRACTS),
  }))

  /* Мероприятия наружу — всегда склеенные с договорами */
  const events = useMemo(() => joinEvents(rawEvents, contracts), [rawEvents, contracts])

  const conflicts = useMemo(() => findAllConflicts(events), [events])
  const conflictIds = useMemo(() => conflictingEventIds(conflicts), [conflicts])

  const actor = role?.person ?? 'Сотрудник Общества'
  const actorRole = role?.short ?? 'Сотрудник'

  const log = useCallback(
    (id, action, details) => {
      setHistory((prev) => ({
        ...prev,
        [id]: [makeEntry(actor, actorRole, action, details), ...(prev[id] ?? [])],
      }))
    },
    [actor, actorRole],
  )

  /* ═══ Мероприятия ═══════════════════════════════════════ */

  const getEvent = useCallback((id) => events.find((event) => event.id === id) ?? null, [events])

  const checkConflicts = useCallback(
    (candidate, ignoreId = candidate?.id) => findConflicts(candidate, events, { ignoreId }),
    [events],
  )

  const conflictsFor = useCallback(
    (id) => conflicts.filter((conflict) => conflict.a?.id === id || conflict.b?.id === id),
    [conflicts],
  )

  const applyEvent = useCallback(
    (id, patch, options = {}) => {
      const { status, action = 'fields', details } = options
      const current = events.find((event) => event.id === id)
      if (!current) return { ok: false, conflicts: [] }

      const candidate = { ...current, ...patch, status: status ?? current.status }
      const found = findConflicts(candidate, events, { ignoreId: id })

      if (status === 'confirmed' && !canConfirm(candidate, events, id)) {
        return { ok: false, conflicts: found }
      }

      setRawEvents((prev) =>
        prev.map((event) =>
          event.id === id ? { ...event, ...patch, status: status ?? event.status } : event,
        ),
      )
      log(id, action, details)
      return { ok: true, conflicts: found }
    },
    [events, log],
  )

  const applySchedule = useCallback(
    (id, { hallId, phases }, options = {}) => {
      const hall = hallById(hallId)
      const current = events.find((event) => event.id === id)
      const movedHall = current && current.hallId !== hallId
      const range = occupiedRange({ phases })

      return applyEvent(
        id,
        { hallId, phases, hall: hall?.code, objectKey: hall?.objectKey },
        {
          ...options,
          action: movedHall ? 'hall' : 'schedule',
          details:
            options.details ??
            `${movedHall ? `Помещение: ${current?.hall} → ${hall?.code}. ` : ''}Занятость зала: ${
              range ? formatRangeShort(range.from, range.to) : '—'
            }`,
        },
      )
    },
    [applyEvent, events],
  )

  const setStatus = useCallback(
    (id, status) => {
      const current = events.find((event) => event.id === id)
      if (!current) return { ok: false, conflicts: [] }
      if (current.status === status) return { ok: true, conflicts: [] }

      return applyEvent(id, {}, {
        status,
        action: status === 'confirmed' ? 'confirmed' : 'status',
        details: `${statusLabel(current.status)} → ${statusLabel(status)}`,
      })
    },
    [applyEvent, events],
  )

  const createEvent = useCallback(
    (draft, status) => {
      const candidate = { ...draft, id: '__new__' }
      const found = findConflicts(candidate, events, { ignoreId: '__new__' })
      if (status === 'confirmed' && !canConfirm(candidate, events, '__new__')) {
        return { ok: false, conflicts: found, id: null }
      }

      createdEvents += 1
      const id = `EV-${String(900 + createdEvents)}`
      setRawEvents((prev) => [...prev, { ...draft, id, status }])
      setHistory((prev) => ({
        ...prev,
        [id]: [
          makeEntry(
            actor,
            actorRole,
            'created',
            `Тип: ${draft.type} · ${draft.hall}${status === 'review' ? ' · отправлено на согласование' : ''}`,
          ),
        ],
      }))
      return { ok: true, conflicts: found, id }
    },
    [events, actor, actorRole],
  )

  /* ═══ Договоры ══════════════════════════════════════════ */

  const getContract = useCallback(
    (id) => contracts.find((contract) => contract.id === id) ?? null,
    [contracts],
  )

  /** Основной договор мероприятия + его дополнительные соглашения */
  const contractsForEvent = useCallback(
    (eventId) => contracts.filter((contract) => contract.eventId === eventId),
    [contracts],
  )

  const updateContract = useCallback(
    (id, patch, options = {}) => {
      const { action = 'fields', details } = options
      setContracts((prev) =>
        prev.map((contract) => (contract.id === id ? { ...contract, ...patch } : contract)),
      )
      log(id, action, details)
      return { ok: true }
    },
    [log],
  )

  /** Смена статуса согласования; маршрут подстраивается под новый статус */
  const setApprovalStatus = useCallback(
    (id, next) => {
      const contract = contracts.find((item) => item.id === id)
      if (!contract) return { ok: false }

      const approvedCount = { draft: 0, review: 1, signed: 4, archived: 4, terminated: 4 }[next] ?? 0
      const at = toIsoMinutes(Date.now()).slice(0, 10)

      const route = (contract.route ?? []).map((step, index) => ({
        ...step,
        status: index < approvedCount ? 'approved' : index === approvedCount ? 'pending' : 'waiting',
        at: index < approvedCount ? (step.at ?? at) : null,
      }))

      setContracts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, approvalStatus: next, route } : item)),
      )
      log(
        id,
        next === 'signed' ? 'confirmed' : next === 'terminated' ? 'terminated' : 'status',
        `${statusLabel(contract.approvalStatus)} → ${statusLabel(next)}`,
      )
      return { ok: true }
    },
    [contracts, log],
  )

  /** Согласование текущего шага маршрута — доступно только своей роли */
  const approveStep = useCallback(
    (id) => {
      const contract = contracts.find((item) => item.id === id)
      if (!contract) return { ok: false, reason: 'not-found' }

      const index = (contract.route ?? []).findIndex((step) => step.status === 'pending')
      if (index === -1) return { ok: false, reason: 'no-pending' }
      if (contract.route[index].role !== roleKey) {
        return { ok: false, reason: 'wrong-role', expected: contract.route[index] }
      }

      const at = toIsoMinutes(Date.now()).slice(0, 10)
      const route = contract.route.map((step, i) =>
        i === index
          ? { ...step, status: 'approved', at, person: actor, comment: 'Согласовано' }
          : i === index + 1
            ? { ...step, status: 'pending' }
            : step,
      )
      const allApproved = route.every((step) => step.status === 'approved')
      const approvalStatus = allApproved ? 'signed' : 'review'

      setContracts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, route, approvalStatus } : item)),
      )
      log(id, allApproved ? 'confirmed' : 'approved', `${contract.route[index].roleLabel}: согласовано`)
      return { ok: true, allApproved }
    },
    [contracts, roleKey, actor, log],
  )

  /** Отметка оплаты по конкретному платежу графика */
  const registerPayment = useCallback(
    (contractId, paymentId) => {
      const contract = contracts.find((item) => item.id === contractId)
      const payment = contract?.payments?.find((item) => item.id === paymentId)
      if (!contract || !payment) return { ok: false }

      const at = toIsoMinutes(Date.now()).slice(0, 10)
      const payments = contract.payments.map((item) =>
        item.id === paymentId ? { ...item, status: 'paid', paidAt: at } : item,
      )

      setContracts((prev) =>
        prev.map((item) => (item.id === contractId ? { ...item, payments } : item)),
      )
      log(contractId, 'payment', `${payment.kind} — оплата отмечена`)

      const metrics = contractMetrics({ ...contract, payments })
      return { ok: true, metrics }
    },
    [contracts, log],
  )

  /**
   * Привязка договора к мероприятию — в обе стороны через одно поле.
   * Прежний договор этого мероприятия отвязывается, чтобы аренда
   * оставалась «один договор — одно мероприятие».
   */
  const linkContract = useCallback(
    (contractId, eventId) => {
      const contract = contracts.find((item) => item.id === contractId)
      if (!contract) return { ok: false }

      setContracts((prev) =>
        prev.map((item) => {
          if (item.id === contractId) return { ...item, eventId }
          /* снимаем привязку у прежнего договора аренды этого мероприятия */
          if (eventId && item.eventId === eventId && item.type === 'rent' && item.id !== contractId) {
            return { ...item, eventId: null }
          }
          return item
        }),
      )

      setRawEvents((prev) =>
        prev.map((event) => {
          if (event.id === eventId) return { ...event, contractId }
          if (event.contractId === contractId && event.id !== eventId) {
            return { ...event, contractId: null }
          }
          return event
        }),
      )

      const eventName = rawEvents.find((event) => event.id === eventId)?.name
      log(contractId, 'status', eventId ? `Привязано мероприятие: ${eventName}` : 'Мероприятие отвязано')
      if (eventId) log(eventId, 'status', `Привязан договор № ${contract.number}`)
      return { ok: true }
    },
    [contracts, rawEvents, log],
  )

  const createContract = useCallback(
    (draft) => {
      createdContracts += 1
      const number = draft.number || `0${900 + createdContracts}/26-АР`
      const id = `CT-N${createdContracts}`
      const contract = {
        id,
        number,
        type: draft.type ?? 'rent',
        parentId: null,
        tenantId: draft.tenantId ?? null,
        eventId: draft.eventId ?? null,
        objectKey: draft.objectKey ?? null,
        signedAt: draft.signedAt ?? null,
        validTo: draft.validTo ?? null,
        amount: Number(draft.amount) || 0,
        currency: '₸',
        paymentTerms: draft.paymentTerms ?? '',
        approvalStatus: 'draft',
        payments: [],
        route: [
          { role: 'manager', roleLabel: 'Менеджер по аренде', person: actor, status: 'pending', at: null },
          { role: 'legal', roleLabel: 'Юридическая служба', person: 'Р. Жумабаев', status: 'waiting', at: null },
          { role: 'finance', roleLabel: 'Финансовый департамент', person: 'Г. Оспанова', status: 'waiting', at: null },
          { role: 'head', roleLabel: 'Руководитель', person: 'Б. Нурланов', status: 'waiting', at: null },
        ],
        documents: [],
        manager: draft.manager ?? actor,
        lawyer: 'Р. Жумабаев',
        comment: draft.comment ?? null,
      }

      setContracts((prev) => [...prev, contract])
      setHistory((prev) => ({
        ...prev,
        [id]: [makeEntry(actor, actorRole, 'created', `Договор № ${number}`)],
      }))

      if (draft.eventId) {
        setRawEvents((prev) =>
          prev.map((event) => (event.id === draft.eventId ? { ...event, contractId: id } : event)),
        )
      }

      return { ok: true, id }
    },
    [actor, actorRole],
  )

  /* ═══ Арендаторы ════════════════════════════════════════ */

  const getTenant = useCallback(
    (id) => tenants.find((tenant) => tenant.id === id) ?? null,
    [tenants],
  )

  const updateTenant = useCallback(
    (id, patch, options = {}) => {
      setTenants((prev) =>
        prev.map((tenant) => (tenant.id === id ? { ...tenant, ...patch } : tenant)),
      )
      log(id, options.action ?? 'fields', options.details ?? 'Реквизиты обновлены')
      return { ok: true }
    },
    [log],
  )

  const addContact = useCallback(
    (id, contact) => {
      setTenants((prev) =>
        prev.map((tenant) =>
          tenant.id === id ? { ...tenant, contacts: [...(tenant.contacts ?? []), contact] } : tenant,
        ),
      )
      log(id, 'fields', `Добавлено контактное лицо: ${contact.name}`)
      return { ok: true }
    },
    [log],
  )

  const removeContact = useCallback(
    (id, name) => {
      setTenants((prev) =>
        prev.map((tenant) =>
          tenant.id === id
            ? { ...tenant, contacts: (tenant.contacts ?? []).filter((c) => c.name !== name) }
            : tenant,
        ),
      )
      log(id, 'fields', `Удалено контактное лицо: ${name}`)
      return { ok: true }
    },
    [log],
  )

  const createTenant = useCallback(
    (draft) => {
      const id = `TN-${String(30 + tenants.length)}`
      const tenant = { ...draft, id, contacts: draft.contacts ?? [] }
      setTenants((prev) => [...prev, tenant])
      setHistory((prev) => ({
        ...prev,
        [id]: [makeEntry(actor, actorRole, 'created', `Арендатор добавлен · БИН ${draft.bin}`)],
      }))
      return { ok: true, id }
    },
    [tenants.length, actor, actorRole],
  )

  /**
   * Агрегаты по арендатору. Ничего не выдумывается: мероприятия и договоры
   * фильтруются по tenantId, задолженность считается из остатков по договорам
   * той же логикой, что дебиторка дашборда («счёт не выставлен» не входит).
   */
  const tenantStats = useCallback(
    (tenantId) => {
      const tenantEvents = events.filter((event) => event.tenantId === tenantId)
      const tenantContracts = contracts.filter((contract) => contract.tenantId === tenantId)

      const upcoming = tenantEvents.filter(
        (event) =>
          !['done', 'void'].includes(event.status) && parseTime(event.eventTo) >= TODAY_TIME,
      )

      const active = tenantContracts.filter(
        (contract) =>
          contract.approvalStatus === 'signed' &&
          (!contract.validTo || parseTime(contract.validTo) >= TODAY_TIME),
      )

      let signedAmount = 0
      let paidAmount = 0
      let debt = 0
      let overdueAmount = 0
      let overdueDays = 0
      const payments = []

      for (const contract of tenantContracts) {
        const metrics = contractMetrics(contract)
        if (contract.approvalStatus !== 'terminated') signedAmount += contract.amount ?? 0
        paidAmount += metrics.paidAmount
        if (['unpaid', 'partial', 'overdue'].includes(metrics.paymentState)) debt += metrics.debt
        if (metrics.paymentState === 'overdue') {
          overdueAmount += metrics.debt
          overdueDays = Math.max(overdueDays, metrics.overdueDays)
        }
        for (const payment of contract.payments ?? []) {
          payments.push({ ...payment, contractId: contract.id, contractNumber: contract.number })
        }
      }

      const sorted = [...tenantEvents].sort((a, b) => parseTime(a.eventFrom) - parseTime(b.eventFrom))
      const past = sorted.filter((event) => parseTime(event.eventTo) < TODAY_TIME)

      return {
        events: tenantEvents,
        contracts: tenantContracts,
        eventCount: tenantEvents.length,
        upcomingCount: upcoming.length,
        contractCount: tenantContracts.length,
        activeContractCount: active.length,
        signedAmount,
        paidAmount,
        debt,
        overdueAmount,
        overdueDays,
        progress: signedAmount ? Math.round((paidAmount / signedAmount) * 100) : 0,
        lastEvent: past[past.length - 1] ?? null,
        nextEvent: upcoming[0] ?? null,
        payments: payments.sort(
          (a, b) => parseTime(b.paidAt ?? b.dueDate) - parseTime(a.paidAt ?? a.dueDate),
        ),
      }
    },
    [events, contracts],
  )

  const value = useMemo(
    () => ({
      events,
      contracts,
      tenants,
      history,
      getTenant,
      updateTenant,
      addContact,
      removeContact,
      createTenant,
      tenantStats,
      conflicts,
      conflictIds,
      getEvent,
      checkConflicts,
      conflictsFor,
      applyEvent,
      applySchedule,
      setStatus,
      createEvent,
      getContract,
      contractsForEvent,
      updateContract,
      setApprovalStatus,
      approveStep,
      registerPayment,
      linkContract,
      createContract,
      log,
    }),
    [
      events,
      contracts,
      tenants,
      history,
      getTenant,
      updateTenant,
      addContact,
      removeContact,
      createTenant,
      tenantStats,
      conflicts,
      conflictIds,
      getEvent,
      checkConflicts,
      conflictsFor,
      applyEvent,
      applySchedule,
      setStatus,
      createEvent,
      getContract,
      contractsForEvent,
      updateContract,
      setApprovalStatus,
      approveStep,
      registerPayment,
      linkContract,
      createContract,
      log,
    ],
  )

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) throw new Error('useEvents должен вызываться внутри <EventsProvider>')
  return context
}
