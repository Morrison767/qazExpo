import { DEMO_TODAY, EVENTS, LOAD_BY_MONTH, OBJECTS, objectByKey } from './events'
import { CONTRACTS, joinEvents } from './contracts'

/** Значения по умолчанию — мероприятия, склеенные с договорами */
const DEFAULT_SOURCE = joinEvents(EVENTS, CONTRACTS)

/**
 * АГРЕГАТЫ ДАШБОРДА.
 *
 * Всё считается из реестра мероприятий, а не задаётся числами вручную —
 * поэтому переключатель периода и фильтр по объекту реально меняют
 * и KPI, и графики, и списки, а не только подписи.
 *
 * Период — скользящее окно вперёд от «сегодня»: дашборд руководителя
 * отвечает на вопрос «что нас ждёт». Для дельт и линии сравнения
 * берётся окно такой же длины назад.
 */

export const PERIODS = [
  { key: 'week', label: 'Неделя', days: 7, granularity: 'day', prevLabel: 'прошлая неделя' },
  { key: 'month', label: 'Месяц', days: 30, granularity: 'week', prevLabel: 'прошлый месяц' },
  { key: 'quarter', label: 'Квартал', days: 92, granularity: 'month', prevLabel: 'прошлый квартал' },
  { key: 'year', label: 'Год', days: 365, granularity: 'month', prevLabel: 'прошлый год' },
]

export function periodByKey(key) {
  return PERIODS.find((p) => p.key === key) ?? PERIODS[1]
}

const MONTHS_SHORT = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
]

const DAY = 86400000

/* ── Работа с датами: всё в UTC, чтобы не зависеть от часового пояса ── */
function parseDate(value) {
  const [y, m, d] = value.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function addDays(time, days) {
  return time + days * DAY
}

function dayLabel(time) {
  const d = new Date(time)
  return `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

function monthLabel(time) {
  const d = new Date(time)
  return MONTHS_SHORT[d.getUTCMonth()]
}

/** Пересекается ли отрезок мероприятия с окном периода */
function intersects(fromTime, toTime, windowFrom, windowTo) {
  return fromTime <= windowTo && toTime >= windowFrom
}

/**
 * Занятость объекта за окно — средневзвешенная по месяцам, которые окно
 * покрывает (вес = число дней окна, попавших в месяц).
 *
 * Берётся из агрегата LOAD_BY_MONTH, а не из списка мероприятий:
 * занятость учитывает все брони объекта, включая технические окна и
 * внутренние мероприятия Общества, которых в демо-реестре нет.
 */
function objectLoadPercent(objectKey, windowFrom, windowTo) {
  const profile = LOAD_BY_MONTH[objectKey]
  if (!profile) return 0

  let weighted = 0
  let days = 0
  for (let t = windowFrom; t <= windowTo; t += DAY) {
    weighted += profile[new Date(t).getUTCMonth()]
    days += 1
  }

  return days ? Math.round(weighted / days) : 0
}

/** Бины для графика динамики */
function buildBins(windowFrom, windowTo, granularity) {
  const bins = []

  if (granularity === 'day') {
    for (let t = windowFrom; t <= windowTo; t += DAY) {
      bins.push({ from: t, to: t + DAY - 1, label: dayLabel(t) })
    }
    return bins
  }

  if (granularity === 'week') {
    for (let t = windowFrom; t <= windowTo; t = addDays(t, 7)) {
      const to = Math.min(addDays(t, 7) - 1, windowTo)
      bins.push({ from: t, to, label: dayLabel(t) })
    }
    return bins
  }

  /* месяцы */
  const start = new Date(windowFrom)
  let cursor = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1)
  while (cursor <= windowTo) {
    const next = new Date(cursor)
    const nextMonth = Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 1)
    bins.push({ from: cursor, to: nextMonth - 1, label: monthLabel(cursor) })
    cursor = nextMonth
  }
  return bins
}

function countInBin(events, bin, shift = 0) {
  return events.filter((event) => {
    const start = parseDate(event.eventFrom)
    return start >= bin.from + shift && start <= bin.to + shift
  }).length
}

function sum(items, pick) {
  return items.reduce((acc, item) => acc + pick(item), 0)
}

/** Разница в процентах для дельты KPI */
function deltaPercent(current, previous) {
  if (!previous) return current > 0 ? null : 0
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Главная функция дашборда.
 * @param {string} periodKey week | month | quarter | year
 * @param {string} objectKey all | kc | mvc | alem
 * @param {Array} source мероприятия из общего store; по умолчанию — демо-реестр
 */
export function getDashboardData(periodKey = 'month', objectKey = 'all', source = DEFAULT_SOURCE) {
  const period = periodByKey(periodKey)
  const today = parseDate(DEMO_TODAY)
  const windowFrom = today
  const windowTo = addDays(today, period.days)
  const prevFrom = addDays(today, -period.days)
  const prevTo = today - 1

  const all = source ?? DEFAULT_SOURCE
  const scoped = objectKey === 'all' ? all : all.filter((e) => e.objectKey === objectKey)
  const objects = objectKey === 'all' ? OBJECTS : OBJECTS.filter((o) => o.key === objectKey)

  const inWindow = scoped.filter((e) =>
    intersects(parseDate(e.eventFrom), parseDate(e.eventTo), windowFrom, windowTo),
  )
  const inPrev = scoped.filter((e) =>
    intersects(parseDate(e.eventFrom), parseDate(e.eventTo), prevFrom, prevTo),
  )

  /* ── Загрузка по объектам ── */
  const objectLoad = objects.map((object) => ({
    key: object.key,
    short: object.short,
    name: object.name,
    load: objectLoadPercent(object.key, windowFrom, windowTo),
    plan: object.planLoad,
  }))
  const avgLoad = objectLoad.length
    ? Math.round(sum(objectLoad, (o) => o.load) / objectLoad.length)
    : 0
  const prevObjectLoad = objects.map((object) =>
    objectLoadPercent(object.key, prevFrom, prevTo),
  )
  const prevAvgLoad = prevObjectLoad.length
    ? Math.round(prevObjectLoad.reduce((a, b) => a + b, 0) / prevObjectLoad.length)
    : 0

  /* ── Финансы ── */
  const billable = inWindow.filter((e) => e.status !== 'void')
  const contractsSum = sum(billable, (e) => e.amount)
  const prevContractsSum = sum(
    inPrev.filter((e) => e.status !== 'void'),
    (e) => e.amount,
  )

  const paid = billable.filter((e) => e.payment === 'paid')
  const overdue = billable.filter((e) => e.payment === 'unpaid' && e.overdueDays > 0)
  const unpaid = billable.filter((e) => e.payment === 'unpaid' && e.overdueDays === 0)
  const notBilled = billable.filter((e) => e.payment === 'draft')

  /* Дебиторка — ОСТАТОК по договору, а не полная сумма: после частичной
     оплаты долг уменьшается. Пока платежей не было, остаток равен сумме,
     поэтому до первой отметки оплаты цифры те же, что и раньше.
     «Счёт не выставлен» в дебиторку не попадает. */
  const remaining = (event) => event.debt ?? event.amount ?? 0
  const settled = (event) => event.paidAmount ?? 0

  const debt = sum(overdue, remaining) + sum(unpaid, remaining)
  const prevDebt = sum(
    inPrev.filter((e) => e.status !== 'void' && e.payment === 'unpaid'),
    remaining,
  )

  const finance = [
    { key: 'paid', label: 'Оплачено', value: sum(billable, settled), count: paid.length },
    {
      key: 'unpaid',
      label: 'Не оплачено',
      value: sum(unpaid, remaining),
      count: unpaid.length,
    },
    {
      key: 'conflict',
      label: 'Просрочено',
      value: sum(overdue, remaining),
      count: overdue.length,
    },
    {
      key: 'draft',
      label: 'Счёт не выставлен',
      value: sum(notBilled, (e) => e.amount),
      count: notBilled.length,
    },
  ].filter((item) => item.value > 0)

  /* ── Динамика ── */
  const bins = buildBins(windowFrom, windowTo, period.granularity)
  const dynamics = bins.map((bin) => ({
    label: bin.label,
    current: countInBin(scoped, bin),
    previous: countInBin(scoped, bin, -period.days * DAY),
  }))

  /* ── Проблемные вопросы ── */
  const conflicts = scoped.filter((e) => e.status === 'conflict')
  const overdueAll = scoped.filter((e) => e.payment === 'unpaid' && e.overdueDays > 0)
  const expiring = scoped
    .filter((e) => {
      if (e.status === 'void' || e.status === 'done') return false
      if (!e.contract?.validTo) return false
      const days = Math.round((parseDate(e.contract.validTo) - today) / DAY)
      return days >= 0 && days <= 30
    })
    .map((e) => ({ ...e, daysLeft: Math.round((parseDate(e.contract.validTo) - today) / DAY) }))
  const pendingApproval = scoped.filter((e) => Array.isArray(e.approval) && e.approval.length > 0)

  /* ── Ближайшие мероприятия ── */
  const upcoming = [...scoped]
    .filter(
      (e) =>
        e.status !== 'void' && e.status !== 'done' && parseDate(e.eventTo) >= today,
    )
    .sort((a, b) => parseDate(a.eventFrom) - parseDate(b.eventFrom))
    .slice(0, 7)

  const confirmedCount = inWindow.filter((e) => e.status === 'confirmed').length

  return {
    period,
    objectKey,
    window: { from: windowFrom, to: windowTo, days: period.days },

    kpi: {
      events: {
        value: inWindow.length,
        confirmed: confirmedCount,
        delta: deltaPercent(inWindow.length, inPrev.length),
      },
      /* Загрузка — в процентных пунктах, а не в процентах от процента */
      load: { value: avgLoad, delta: avgLoad - prevAvgLoad },
      contracts: { value: contractsSum, delta: deltaPercent(contractsSum, prevContractsSum) },
      debt: {
        value: debt,
        delta: deltaPercent(debt, prevDebt),
        overdueCount: overdueAll.length,
      },
      approvals: { value: pendingApproval.length },
      conflicts: { value: conflicts.length },
    },

    objectLoad,
    dynamics,
    finance,
    upcoming,
    attention: {
      conflicts,
      overdue: overdueAll,
      expiring,
      approvals: pendingApproval,
      total: conflicts.length + overdueAll.length + expiring.length + pendingApproval.length,
    },
  }
}

/** 412 400 000 → «412,4» (млн) */
export function toMillions(value) {
  return (value / 1_000_000).toLocaleString('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

export const OBJECT_FILTER_OPTIONS = [
  { value: 'all', label: 'Все объекты' },
  ...OBJECTS.map((o) => ({ value: o.key, label: o.name })),
]

export { objectByKey }
