import { hexToRgba } from './color'
import { getStatus } from '@/design/statuses'

/**
 * ═══════════════════════════════════════════════════════════════
 *  МОДЕЛЬ ВРЕМЕНИ ТАЙМЛАЙНА И ПРОВЕРКА ПЕРЕСЕЧЕНИЙ
 * ═══════════════════════════════════════════════════════════════
 *
 * Чистые функции без React: масштабы, колонки, перевод время ↔ пиксели,
 * интервал занятости помещения и поиск конфликтов. Логика бронирования
 * живёт здесь, экран только рисует её результат.
 *
 * Всё время — миллисекунды UTC. Даты в данных задаются как
 * '2026-08-03T09:00' и трактуются как UTC, чтобы демонстрация выглядела
 * одинаково в любом часовом поясе.
 */

export const MINUTE = 60_000
export const HOUR = 3_600_000
export const DAY = 86_400_000

const MONTHS_GEN = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

const MONTHS_NOM = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

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

const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

/** '2026-08-03T09:00' | '2026-08-03' → ms (UTC) */
export function parseTime(value) {
  if (value == null) return null
  if (typeof value === 'number') return value
  const [datePart, timePart] = value.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh = 0, mm = 0] = (timePart ?? '').split(':').map(Number)
  return Date.UTC(y, m - 1, d, hh, mm)
}

export function startOfDay(time) {
  const d = new Date(time)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

export function startOfWeek(time) {
  const d = new Date(startOfDay(time))
  const weekday = d.getUTCDay()
  const shift = weekday === 0 ? 6 : weekday - 1 /* неделя с понедельника */
  return d.getTime() - shift * DAY
}

export function startOfMonth(time) {
  const d = new Date(time)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)
}

export function startOfYear(time) {
  const d = new Date(time)
  return Date.UTC(d.getUTCFullYear(), 0, 1)
}

export function addMonths(time, count) {
  const d = new Date(time)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + count, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes())
}

/* ─────────────────────────────────────────────────────────────
   МАСШТАБЫ
   ───────────────────────────────────────────────────────────── */
export const SCALES = {
  day: { key: 'day', label: 'День', colWidth: 56, snap: HOUR, moveStep: HOUR },
  week: { key: 'week', label: 'Неделя', colWidth: 148, snap: HOUR, moveStep: 6 * HOUR },
  month: { key: 'month', label: 'Месяц', colWidth: 40, snap: DAY, moveStep: DAY },
  year: { key: 'year', label: 'Год', colWidth: 96, snap: DAY, moveStep: DAY },
}

export const SCALE_LIST = [SCALES.day, SCALES.week, SCALES.month, SCALES.year]

/** Границы окна для масштаба и опорной даты */
export function scaleWindow(scaleKey, anchor) {
  switch (scaleKey) {
    case 'day': {
      const from = startOfDay(anchor)
      return { from, to: from + DAY }
    }
    case 'week': {
      const from = startOfWeek(anchor)
      return { from, to: from + 7 * DAY }
    }
    case 'year': {
      const from = startOfYear(anchor)
      const d = new Date(from)
      return { from, to: Date.UTC(d.getUTCFullYear() + 1, 0, 1) }
    }
    case 'month':
    default: {
      const from = startOfMonth(anchor)
      const d = new Date(from)
      return { from, to: Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1) }
    }
  }
}

/** Сдвиг окна на один шаг вперёд/назад */
export function shiftAnchor(scaleKey, anchor, direction) {
  switch (scaleKey) {
    case 'day':
      return anchor + direction * DAY
    case 'week':
      return anchor + direction * 7 * DAY
    case 'year': {
      const d = new Date(anchor)
      return Date.UTC(d.getUTCFullYear() + direction, d.getUTCMonth(), 1)
    }
    case 'month':
    default:
      return addMonths(startOfMonth(anchor), direction)
  }
}

/**
 * Колонки таймлайна с накопленным смещением по X.
 * У года колонки-месяцы разной длины, поэтому перевод времени в пиксели
 * идёт через поиск колонки, а не линейной пропорцией по всему окну.
 */
export function buildColumns(scaleKey, windowFrom, windowTo, today) {
  const scale = SCALES[scaleKey] ?? SCALES.month
  const columns = []
  let x = 0

  const push = (from, to, label, sublabel, group, flags = {}) => {
    columns.push({ from, to, x, width: scale.colWidth, label, sublabel, group, ...flags })
    x += scale.colWidth
  }

  if (scaleKey === 'day') {
    for (let t = windowFrom; t < windowTo; t += HOUR) {
      const d = new Date(t)
      const hour = d.getUTCHours()
      push(t, t + HOUR, `${String(hour).padStart(2, '0')}:00`, null, dayGroupLabel(windowFrom), {
        isNight: hour < 8 || hour >= 20,
      })
    }
  } else if (scaleKey === 'week' || scaleKey === 'month') {
    for (let t = windowFrom; t < windowTo; t += DAY) {
      const d = new Date(t)
      const weekday = d.getUTCDay()
      push(
        t,
        t + DAY,
        String(d.getUTCDate()).padStart(2, '0'),
        WEEKDAYS_SHORT[weekday],
        `${MONTHS_NOM[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
        {
          isWeekend: weekday === 0 || weekday === 6,
          isToday: today != null && startOfDay(today) === t,
        },
      )
    }
  } else {
    let cursor = windowFrom
    while (cursor < windowTo) {
      const d = new Date(cursor)
      const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)
      push(cursor, next, MONTHS_SHORT[d.getUTCMonth()], null, String(d.getUTCFullYear()), {
        isToday: today != null && startOfMonth(today) === cursor,
      })
      cursor = next
    }
  }

  return columns
}

function dayGroupLabel(time) {
  const d = new Date(time)
  return `${d.getUTCDate()} ${MONTHS_GEN[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${WEEKDAYS_SHORT[d.getUTCDay()]}`
}

/** Верхний ярус шапки: группы одинаковых подписей */
export function buildColumnGroups(columns) {
  const groups = []
  for (const column of columns) {
    const last = groups[groups.length - 1]
    if (last && last.label === column.group) {
      last.width += column.width
    } else {
      groups.push({ label: column.group, x: column.x, width: column.width })
    }
  }
  return groups
}

export function totalWidth(columns) {
  return columns.reduce((acc, column) => acc + column.width, 0)
}

/** Время → X в пикселях внутри области колонок */
export function timeToX(time, columns) {
  if (!columns.length) return 0
  const first = columns[0]
  const last = columns[columns.length - 1]
  if (time <= first.from) return 0
  if (time >= last.to) return last.x + last.width

  for (const column of columns) {
    if (time >= column.from && time < column.to) {
      const ratio = (time - column.from) / (column.to - column.from)
      return column.x + ratio * column.width
    }
  }
  return last.x + last.width
}

/** X в пикселях → время */
export function xToTime(x, columns) {
  if (!columns.length) return 0
  const last = columns[columns.length - 1]
  if (x <= 0) return columns[0].from
  if (x >= last.x + last.width) return last.to

  for (const column of columns) {
    if (x >= column.x && x < column.x + column.width) {
      const ratio = (x - column.x) / column.width
      return column.from + ratio * (column.to - column.from)
    }
  }
  return last.to
}

/** Сколько миллисекунд «стоит» смещение в пикселях (по средней колонке) */
export function pxToDuration(px, columns) {
  if (!columns.length) return 0
  const width = totalWidth(columns)
  const span = columns[columns.length - 1].to - columns[0].from
  return (px / width) * span
}

export function snapTime(time, step) {
  return Math.round(time / step) * step
}

/* ─────────────────────────────────────────────────────────────
   ФАЗЫ МЕРОПРИЯТИЯ
   Цвет сегмента = статус мероприятия. Фаза различается ПАТТЕРНОМ,
   поэтому полоса читается и в ч/б, и при цветовой слепоте.
   ───────────────────────────────────────────────────────────── */
export const PHASES = [
  { key: 'mount', label: 'Монтаж' },
  { key: 'prep', label: 'Подготовка' },
  { key: 'event', label: 'Проведение' },
  { key: 'dismount', label: 'Демонтаж' },
  { key: 'tech', label: 'Техническое окно' },
]

export const PHASE_LABELS = PHASES.reduce((acc, phase) => {
  acc[phase.key] = phase.label
  return acc
}, {})

export function phaseStyle(phaseKey, base) {
  switch (phaseKey) {
    case 'mount':
      return {
        backgroundColor: hexToRgba(base, 0.18),
        backgroundImage: `repeating-linear-gradient(45deg, ${base} 0 3px, transparent 3px 7px)`,
      }
    case 'prep':
      return {
        backgroundColor: hexToRgba(base, 0.12),
        backgroundImage: `radial-gradient(${base} 1.1px, transparent 1.1px)`,
        backgroundSize: '5px 5px',
      }
    case 'event':
      return { backgroundColor: base }
    case 'dismount':
      return {
        backgroundColor: hexToRgba(base, 0.18),
        backgroundImage: `repeating-linear-gradient(135deg, ${base} 0 3px, transparent 3px 7px)`,
      }
    case 'tech':
      return {
        backgroundColor: hexToRgba(base, 0.08),
        backgroundImage: `repeating-linear-gradient(0deg, ${base} 0 1.5px, transparent 1.5px 5px)`,
      }
    default:
      return { backgroundColor: base }
  }
}

/** Сегменты фаз мероприятия в миллисекундах, только заполненные */
export function phaseSegments(event) {
  const phases = event.phases ?? {}
  return PHASES.filter((phase) => phases[phase.key]?.from && phases[phase.key]?.to)
    .map((phase) => ({
      key: phase.key,
      label: phase.label,
      from: parseTime(phases[phase.key].from),
      to: parseTime(phases[phase.key].to),
    }))
    .filter((segment) => segment.to > segment.from)
}

/**
 * Интервал занятости помещения: от начала монтажа до конца технического
 * окна (или демонтажа, если окна нет). Именно он проверяется на
 * пересечения — требование п. 5.2 ТЗ «с учётом монтажа/демонтажа».
 */
export function occupiedRange(event) {
  const segments = phaseSegments(event)
  if (!segments.length) return null
  return {
    from: Math.min(...segments.map((s) => s.from)),
    to: Math.max(...segments.map((s) => s.to)),
  }
}

function intersect(a, b) {
  const from = Math.max(a.from, b.from)
  const to = Math.min(a.to, b.to)
  return to > from ? { from, to } : null
}

/** Какие именно фазы столкнулись — для текста предупреждения */
function collidingPhases(a, b) {
  const result = []
  for (const segmentA of phaseSegments(a)) {
    for (const segmentB of phaseSegments(b)) {
      const overlap = intersect(segmentA, segmentB)
      if (overlap) {
        result.push({
          phaseA: segmentA.label,
          phaseB: segmentB.label,
          from: overlap.from,
          to: overlap.to,
        })
      }
    }
  }
  return result
}

/** Мероприятие занимает помещение (расторгнутые не занимают) */
export function occupiesHall(event) {
  return event.status !== 'void'
}

/**
 * Конфликты кандидата с остальными мероприятиями того же зала.
 * candidate — черновик или перетаскиваемое мероприятие.
 */
export function findConflicts(candidate, events, options = {}) {
  const { ignoreId = candidate?.id } = options
  const range = occupiedRange(candidate)
  if (!range || !candidate?.hallId || !occupiesHall(candidate)) return []

  const conflicts = []
  for (const other of events) {
    if (other.id === ignoreId) continue
    if (other.hallId !== candidate.hallId) continue
    if (!occupiesHall(other)) continue

    const otherRange = occupiedRange(other)
    if (!otherRange) continue

    const overlap = intersect(range, otherRange)
    if (!overlap) continue

    conflicts.push({
      id: `${candidate.id ?? 'draft'}~${other.id}`,
      event: other,
      hallId: candidate.hallId,
      from: overlap.from,
      to: overlap.to,
      phases: collidingPhases(candidate, other),
    })
  }
  return conflicts
}

/**
 * ПРАВИЛО БРОНИРОВАНИЯ (п. 5.2 ТЗ).
 * Подтвердить бронирование нельзя, пока есть пересечение по помещению
 * с учётом монтажа, демонтажа и технического окна.
 *
 * Вынесено отдельной функцией, чтобы store, форма создания, карточка и
 * календарь проверяли одно и то же условие — и чтобы его можно было
 * проверить тестом без React.
 */
export function canConfirm(candidate, events, ignoreId = candidate?.id) {
  return findConflicts(candidate, events, { ignoreId }).length === 0
}

/** Все пересечения в наборе: попарно внутри каждого зала */
export function findAllConflicts(events) {
  const byHall = new Map()
  for (const event of events) {
    if (!occupiesHall(event) || !event.hallId) continue
    if (!byHall.has(event.hallId)) byHall.set(event.hallId, [])
    byHall.get(event.hallId).push(event)
  }

  const conflicts = []
  for (const [hallId, list] of byHall) {
    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1) {
        const a = list[i]
        const b = list[j]
        const rangeA = occupiedRange(a)
        const rangeB = occupiedRange(b)
        if (!rangeA || !rangeB) continue
        const overlap = intersect(rangeA, rangeB)
        if (!overlap) continue
        conflicts.push({
          id: `${a.id}~${b.id}`,
          hallId,
          a,
          b,
          from: overlap.from,
          to: overlap.to,
          phases: collidingPhases(a, b),
        })
      }
    }
  }
  return conflicts
}

/** Идентификаторы мероприятий, участвующих хотя бы в одном пересечении */
export function conflictingEventIds(conflicts) {
  const set = new Set()
  for (const conflict of conflicts) {
    if (conflict.a) set.add(conflict.a.id)
    if (conflict.b) set.add(conflict.b.id)
    if (conflict.event) set.add(conflict.event.id)
  }
  return set
}

/** Сдвиг всех фаз мероприятия на delta мс + возможная смена зала */
export function moveEvent(event, deltaMs, hallId = event.hallId) {
  const phases = {}
  for (const phase of PHASES) {
    const value = event.phases?.[phase.key]
    if (!value?.from || !value?.to) continue
    phases[phase.key] = {
      from: toIsoMinutes(parseTime(value.from) + deltaMs),
      to: toIsoMinutes(parseTime(value.to) + deltaMs),
    }
  }
  return { ...event, hallId, phases }
}

/** ms → '2026-08-03T09:00' */
export function toIsoMinutes(time) {
  const d = new Date(time)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

/* ─────────────────────────────────────────────────────────────
   ФОРМАТИРОВАНИЕ
   ───────────────────────────────────────────────────────────── */
export function formatTimeShort(time) {
  const d = new Date(time)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

export function formatDateTimeShort(time) {
  const d = new Date(time)
  return `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')} ${formatTimeShort(time)}`
}

export function formatRangeShort(from, to) {
  const sameDay = startOfDay(from) === startOfDay(to)
  return sameDay
    ? `${formatDateTimeShort(from)}–${formatTimeShort(to)}`
    : `${formatDateTimeShort(from)} — ${formatDateTimeShort(to)}`
}

export function formatWindowLabel(scaleKey, windowFrom) {
  const d = new Date(windowFrom)
  switch (scaleKey) {
    case 'day':
      return dayGroupLabel(windowFrom)
    case 'week': {
      const end = new Date(windowFrom + 6 * DAY)
      const sameMonth = d.getUTCMonth() === end.getUTCMonth()
      return sameMonth
        ? `${d.getUTCDate()}–${end.getUTCDate()} ${MONTHS_GEN[d.getUTCMonth()]} ${d.getUTCFullYear()}`
        : `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} — ${end.getUTCDate()} ${MONTHS_SHORT[end.getUTCMonth()]} ${end.getUTCFullYear()}`
    }
    case 'year':
      return `${d.getUTCFullYear()} год`
    case 'month':
    default:
      return `${MONTHS_NOM[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  }
}

/** Длительность в человекочитаемом виде: «2 дня 4 ч» */
export function formatDuration(ms) {
  const days = Math.floor(ms / DAY)
  const hours = Math.round((ms % DAY) / HOUR)
  const parts = []
  if (days > 0) parts.push(`${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`)
  if (hours > 0) parts.push(`${hours} ч`)
  return parts.length ? parts.join(' ') : 'меньше часа'
}

/** Цвет статуса мероприятия для полосы */
export function statusBase(statusKey) {
  return getStatus(statusKey).colors.base
}
