import { DAY, parseTime, toIsoMinutes } from '@/lib/timeline'
import { DEMO_TODAY, EVENT_CONTRACT_SEEDS, contractIdFromNumber } from './events'
import { TENANT_ID_BY_NAME } from './tenants'

/**
 * ═══════════════════════════════════════════════════════════════
 *  ДОГОВОРЫ — самостоятельная сущность
 * ═══════════════════════════════════════════════════════════════
 *
 * Договор ссылается на мероприятие (`eventId`) и арендатора (`tenantId`)
 * по идентификаторам и не дублирует их данные. Истина по оплате живёт
 * здесь: мероприятие получает `payment` и `overdueDays` склейкой
 * (см. joinEvents ниже), а не собственным полем.
 */

const TODAY = parseTime(DEMO_TODAY)

export const CONTRACT_TYPES = {
  rent: 'Договор аренды',
  services: 'Договор оказания услуг',
  addendum: 'Дополнительное соглашение',
}

export const CONTRACT_TYPE_SHORT = {
  rent: 'Аренда',
  services: 'Услуги',
  addendum: 'Доп. соглашение',
}

/** Статус согласования → токен палитры статусов */
export const APPROVAL_STATES = {
  draft: { label: 'Черновик', token: 'draft' },
  review: { label: 'На согласовании', token: 'review' },
  signed: { label: 'Подписан', token: 'confirmed' },
  archived: { label: 'Завершён', token: 'done' },
  terminated: { label: 'Расторгнут', token: 'void' },
}

export const APPROVAL_ORDER = ['draft', 'review', 'signed', 'archived', 'terminated']

/** Состояние оплаты → токен палитры. Новых цветов не вводим. */
export const PAYMENT_STATES = {
  none: { label: 'Счёт не выставлен', token: 'draft' },
  unpaid: { label: 'Не оплачен', token: 'unpaid' },
  partial: { label: 'Частично оплачен', token: 'review' },
  overdue: { label: 'Просрочен', token: 'conflict' },
  paid: { label: 'Оплачен', token: 'paid' },
}

export const PAYMENT_STATUSES = {
  expected: { label: 'Ожидается', token: 'draft' },
  overdue: { label: 'Просрочен', token: 'conflict' },
  paid: { label: 'Оплачен', token: 'paid' },
}

/* ── Стороны согласования: ключ совпадает с ролями системы ── */
const ROUTE_TEMPLATE = [
  { role: 'manager', roleLabel: 'Менеджер по аренде' },
  { role: 'legal', roleLabel: 'Юридическая служба', person: 'Р. Жумабаев' },
  { role: 'finance', roleLabel: 'Финансовый департамент', person: 'Г. Оспанова' },
  { role: 'head', roleLabel: 'Руководитель', person: 'Б. Нурланов' },
]

/** Сколько шагов маршрута уже закрыто при данном статусе */
const APPROVED_STEPS = { draft: 0, review: 1, signed: 4, archived: 4, terminated: 4 }

function iso(time) {
  return toIsoMinutes(time).slice(0, 10)
}

function shift(dateString, days) {
  return iso(parseTime(dateString) + days * DAY)
}

function buildRoute(approvalStatus, manager, signedAt) {
  const approved = APPROVED_STEPS[approvalStatus] ?? 0
  const base = parseTime(signedAt ?? DEMO_TODAY)

  return ROUTE_TEMPLATE.map((step, index) => ({
    ...step,
    person: step.person ?? manager,
    status: index < approved ? 'approved' : index === approved ? 'pending' : 'waiting',
    at: index < approved ? iso(base + (index + 1) * 2 * DAY) : null,
    comment: index < approved ? 'Замечаний нет' : null,
  }))
}

function buildDocuments(seed, approvalStatus, hasPayments) {
  const at = seed.signedAt ?? DEMO_TODAY
  const documents = [
    { name: `Договор № ${seed.number}.pdf`, kind: 'Скан договора', size: '2,4 МБ', at },
    { name: 'Приложение №1. Схема размещения.pdf', kind: 'Приложение', size: '1,1 МБ', at: shift(at, 1) },
    { name: 'Смета.xlsx', kind: 'Смета', size: '86 КБ', at: shift(at, 1) },
  ]
  if (hasPayments) {
    documents.push({
      name: `Счёт на оплату № ${seed.number.slice(0, 4)}.pdf`,
      kind: 'Счёт',
      size: '240 КБ',
      at: shift(at, 3),
    })
  }
  if (approvalStatus === 'archived') {
    documents.push({
      name: 'Акт выполненных работ.pdf',
      kind: 'Акт',
      size: '520 КБ',
      at: shift(seed.eventTo ?? at, 2),
    })
  }
  if (approvalStatus === 'terminated') {
    documents.push({
      name: 'Соглашение о расторжении.pdf',
      kind: 'Расторжение',
      size: '310 КБ',
      at: shift(at, 30),
    })
  }
  return documents.map((document, index) => ({ id: `${seed.number}-D${index + 1}`, ...document }))
}

/** График платежей: предоплата 70% + расчёт 30% */
function buildPayments(seed) {
  const { amount, paymentSeed, overdueSeed, signedAt, eventFrom, eventTo, number } = seed
  if (paymentSeed === 'draft' || !amount) return []

  const advance = Math.round(amount * 0.7)
  const rest = amount - advance
  const make = (index, kind, dueDate, value, status, paidAt = null) => ({
    id: `${number}-P${index}`,
    kind,
    dueDate,
    amount: value,
    status,
    paidAt,
  })

  if (paymentSeed === 'paid') {
    return [
      make(1, 'Предоплата 70%', shift(signedAt, 10), advance, 'paid', shift(signedAt, 8)),
      make(2, 'Окончательный расчёт 30%', shift(eventTo, 5), rest, 'paid', shift(eventTo, 3)),
    ]
  }

  if (overdueSeed > 0) {
    return [
      make(1, 'Предоплата 70%', iso(TODAY - overdueSeed * DAY), advance, 'overdue'),
      make(2, 'Окончательный расчёт 30%', shift(eventTo, 5), rest, 'expected'),
    ]
  }

  return [
    make(1, 'Предоплата 70%', shift(eventFrom, -14), advance, 'expected'),
    make(2, 'Окончательный расчёт 30%', shift(eventTo, 5), rest, 'expected'),
  ]
}

/** Статус согласования выводим из статуса мероприятия */
function approvalFromEvent(eventStatus) {
  switch (eventStatus) {
    case 'draft':
      return 'draft'
    case 'review':
    case 'conflict':
      return 'review'
    case 'confirmed':
      return 'signed'
    case 'done':
      return 'archived'
    case 'void':
      return 'terminated'
    default:
      return 'draft'
  }
}

const PAYMENT_TERMS = 'Предоплата 70% в течение 10 банковских дней, окончательный расчёт 30% по акту'

/* ── Договоры аренды из семян реестра мероприятий ── */
const RENT_CONTRACTS = EVENT_CONTRACT_SEEDS.map((seed) => {
  const approvalStatus = approvalFromEvent(seed.eventStatus)
  const payments = buildPayments(seed)

  return {
    id: contractIdFromNumber(seed.number),
    number: seed.number,
    type: 'rent',
    parentId: null,
    tenantId: seed.tenantId,
    eventId: seed.eventId,
    objectKey: seed.objectKey,
    signedAt: seed.signedAt,
    validTo: seed.validTo,
    amount: seed.amount,
    currency: '₸',
    paymentTerms: PAYMENT_TERMS,
    approvalStatus,
    payments,
    route: buildRoute(approvalStatus, seed.manager, seed.signedAt),
    documents: buildDocuments(seed, approvalStatus, payments.length > 0),
    manager: seed.manager,
    lawyer: 'Р. Жумабаев',
    comment: null,
  }
})

/* ── Дополнительные соглашения и рамочные договоры ── */
const EXTRA_CONTRACTS = [
  {
    id: 'CT-0142-1',
    number: '0142/26-АР/ДС-1',
    type: 'addendum',
    parentId: 'CT-0142',
    tenantId: TENANT_ID_BY_NAME['ТОО «Astana Expo Group»'],
    eventId: 'EV-0142',
    objectKey: 'kc',
    signedAt: '2026-06-12',
    validTo: '2026-08-20',
    amount: 6400000,
    currency: '₸',
    paymentTerms: 'Единовременно в течение 10 банковских дней',
    approvalStatus: 'signed',
    payments: [
      {
        id: '0142-DS1-P1',
        kind: 'Единовременный платёж',
        dueDate: '2026-06-22',
        amount: 6400000,
        status: 'paid',
        paidAt: '2026-06-20',
      },
    ],
    route: buildRoute('signed', 'М. Ким', '2026-06-12'),
    documents: [
      {
        id: 'CT-0142-1-D1',
        name: 'Доп. соглашение №1.pdf',
        kind: 'Скан соглашения',
        size: '780 КБ',
        at: '2026-06-12',
      },
    ],
    manager: 'М. Ким',
    lawyer: 'Р. Жумабаев',
    comment: 'Дополнительная площадь под зону регистрации, 240 кв. м',
  },
  {
    id: 'CT-0146-1',
    number: '0146/26-АР/ДС-1',
    type: 'addendum',
    parentId: 'CT-0146',
    tenantId: TENANT_ID_BY_NAME['ТОО «Iteca Kazakhstan»'],
    eventId: 'EV-0146',
    objectKey: 'mvc',
    signedAt: '2026-07-14',
    validTo: '2026-09-30',
    amount: 12500000,
    currency: '₸',
    paymentTerms: 'Единовременно до начала монтажа',
    approvalStatus: 'review',
    payments: [
      {
        id: '0146-DS1-P1',
        kind: 'Единовременный платёж',
        dueDate: '2026-08-14',
        amount: 12500000,
        status: 'expected',
      },
    ],
    route: buildRoute('review', 'М. Ким', '2026-07-14'),
    documents: [
      {
        id: 'CT-0146-1-D1',
        name: 'Доп. соглашение №1 (проект).pdf',
        kind: 'Проект соглашения',
        size: '690 КБ',
        at: '2026-07-14',
      },
    ],
    manager: 'М. Ким',
    lawyer: 'Р. Жумабаев',
    comment: 'Продление монтажного окна на сутки и дополнительное электропитание',
  },
  {
    id: 'CT-0153-1',
    number: '0153/26-АР/ДС-1',
    type: 'addendum',
    parentId: 'CT-0153',
    tenantId: TENANT_ID_BY_NAME['ТОО «Astana Retail Group»'],
    eventId: 'EV-0153',
    objectKey: 'mvc',
    signedAt: '2026-07-26',
    validTo: '2026-11-30',
    amount: 4100000,
    currency: '₸',
    paymentTerms: 'Единовременно по счёту',
    approvalStatus: 'draft',
    payments: [],
    route: buildRoute('draft', 'Д. Ахметова', '2026-07-26'),
    documents: [
      {
        id: 'CT-0153-1-D1',
        name: 'Доп. соглашение №1 (черновик).docx',
        kind: 'Черновик',
        size: '54 КБ',
        at: '2026-07-26',
      },
    ],
    manager: 'Д. Ахметова',
    lawyer: 'Р. Жумабаев',
    comment: 'Перенос даты демонтажа на сутки',
  },
  {
    id: 'CT-0301',
    number: '0301/26-У',
    type: 'services',
    parentId: null,
    tenantId: TENANT_ID_BY_NAME['ТОО «Iteca Kazakhstan»'],
    eventId: null,
    objectKey: 'mvc',
    signedAt: '2026-01-15',
    validTo: '2026-12-31',
    amount: 38000000,
    currency: '₸',
    paymentTerms: 'Ежеквартально, равными долями',
    approvalStatus: 'signed',
    payments: [
      { id: '0301-P1', kind: 'I квартал', dueDate: '2026-03-31', amount: 9500000, status: 'paid', paidAt: '2026-03-28' },
      { id: '0301-P2', kind: 'II квартал', dueDate: '2026-06-30', amount: 9500000, status: 'paid', paidAt: '2026-06-26' },
      { id: '0301-P3', kind: 'III квартал', dueDate: '2026-09-30', amount: 9500000, status: 'expected' },
      { id: '0301-P4', kind: 'IV квартал', dueDate: '2026-12-31', amount: 9500000, status: 'expected' },
    ],
    route: buildRoute('signed', 'Д. Ахметова', '2026-01-15'),
    documents: buildDocuments(
      { number: '0301/26-У', signedAt: '2026-01-15', eventTo: '2026-12-31' },
      'signed',
      true,
    ),
    manager: 'Д. Ахметова',
    lawyer: 'Р. Жумабаев',
    comment: 'Рамочный договор на техническое сопровождение выставок в течение года',
  },
  {
    id: 'CT-0302',
    number: '0302/26-У',
    type: 'services',
    parentId: null,
    tenantId: TENANT_ID_BY_NAME['ТОО «Event Master»'],
    eventId: null,
    objectKey: 'kc',
    signedAt: '2026-04-02',
    validTo: '2026-08-25',
    amount: 7600000,
    currency: '₸',
    paymentTerms: 'Двумя платежами',
    approvalStatus: 'signed',
    payments: [
      { id: '0302-P1', kind: 'Первый платёж', dueDate: '2026-04-20', amount: 3800000, status: 'paid', paidAt: '2026-04-18' },
      { id: '0302-P2', kind: 'Второй платёж', dueDate: '2026-07-20', amount: 3800000, status: 'overdue' },
    ],
    route: buildRoute('signed', 'М. Ким', '2026-04-02'),
    documents: buildDocuments(
      { number: '0302/26-У', signedAt: '2026-04-02', eventTo: '2026-08-25' },
      'signed',
      true,
    ),
    manager: 'М. Ким',
    lawyer: 'Р. Жумабаев',
    comment: 'Организация кейтеринга на мероприятиях Конгресс-центра',
  },
]

export const CONTRACTS = [...RENT_CONTRACTS, ...EXTRA_CONTRACTS]

/* ─────────────────────────────────────────────────────────────
   ПРОИЗВОДНЫЕ ПОКАЗАТЕЛИ ДОГОВОРА
   ───────────────────────────────────────────────────────────── */
export function contractMetrics(contract) {
  const payments = contract.payments ?? []
  const paidAmount = payments
    .filter((payment) => payment.status === 'paid')
    .reduce((acc, payment) => acc + payment.amount, 0)
  const debt = Math.max(0, (contract.amount ?? 0) - paidAmount)

  const overdue = payments.filter((payment) => payment.status === 'overdue')
  const overdueAmount = overdue.reduce((acc, payment) => acc + payment.amount, 0)
  const overdueDays = overdue.length
    ? Math.max(...overdue.map((payment) => Math.round((TODAY - parseTime(payment.dueDate)) / DAY)))
    : 0

  let paymentState
  if (!payments.length) paymentState = 'none'
  else if (debt <= 0) paymentState = 'paid'
  else if (overdue.length) paymentState = 'overdue'
  else if (paidAmount > 0) paymentState = 'partial'
  else paymentState = 'unpaid'

  const expiringInDays = contract.validTo
    ? Math.round((parseTime(contract.validTo) - TODAY) / DAY)
    : null

  const expiringSoon =
    contract.approvalStatus === 'signed' &&
    expiringInDays != null &&
    expiringInDays >= 0 &&
    expiringInDays <= 30

  return {
    paidAmount,
    debt,
    overdueAmount,
    overdueDays,
    paymentState,
    expiringInDays,
    expiringSoon,
    /* Тот же класс сигнала, что «конфликт» в календаре */
    attention: overdue.length > 0 || expiringSoon,
    progress: contract.amount ? Math.round((paidAmount / contract.amount) * 100) : 0,
  }
}

/**
 * Совместимость с реестром мероприятий: старые экраны читают
 * `event.payment` и `event.overdueDays`. Значения приходят из договора,
 * поэтому поле по-прежнему одно — просто живёт в другом месте.
 */
function eventPaymentFrom(state) {
  switch (state) {
    case 'paid':
      return 'paid'
    case 'none':
      return 'draft'
    default:
      return 'unpaid'
  }
}

/**
 * СКЛЕЙКА: мероприятия + их договоры.
 * Возвращает мероприятия с полями contract / payment / overdueDays / debt,
 * вычисленными из договоров. Единственное место, где связь материализуется.
 */
export function joinEvents(events, contracts) {
  const byId = new Map(contracts.map((contract) => [contract.id, contract]))
  const byEvent = new Map()
  for (const contract of contracts) {
    if (!contract.eventId || contract.type === 'addendum') continue
    byEvent.set(contract.eventId, contract)
  }

  return events.map((event) => {
    const contract = (event.contractId ? byId.get(event.contractId) : null) ?? byEvent.get(event.id) ?? null
    if (!contract) {
      return {
        ...event,
        contract: null,
        contractId: null,
        amount: event.amount ?? 0,
        payment: 'draft',
        overdueDays: 0,
        debt: 0,
        paidAmount: 0,
      }
    }

    const metrics = contractMetrics(contract)
    return {
      ...event,
      contractId: contract.id,
      contract,
      amount: contract.amount,
      payment: eventPaymentFrom(metrics.paymentState),
      paymentState: metrics.paymentState,
      overdueDays: metrics.overdueDays,
      debt: metrics.debt,
      paidAmount: metrics.paidAmount,
    }
  })
}

/** Дополнительные соглашения к договору */
export function addendaOf(contracts, contractId) {
  return contracts.filter((contract) => contract.parentId === contractId)
}

export function contractById(contracts, id) {
  return contracts.find((contract) => contract.id === id) ?? null
}
