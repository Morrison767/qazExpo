/** Форматирование под ru-KZ: суммы, даты, склонения. */

const MONTHS_SHORT = [
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
]

/** 12 500 000 ₸ */
export function formatMoney(value, currency = '₸') {
  if (value == null || Number.isNaN(value)) return '—'
  const formatted = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)
  return currency ? `${formatted} ${currency}` : formatted
}

/** 1 250 */
export function formatNumber(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('ru-RU').format(value)
}

/** '2026-03-14' → '14.03.2026' */
export function formatDate(value) {
  if (!value) return '—'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}

/** '2026-03-14T09:30' → '14.03.2026, 09:30' */
export function formatDateTime(value) {
  if (!value) return '—'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${formatDate(d)}, ${hh}:${mi}`
}

/** '14–17 мар 2026' — компактный период для календаря и карточек */
export function formatDateRange(from, to) {
  if (!from) return '—'
  const a = from instanceof Date ? from : new Date(from)
  const b = to ? (to instanceof Date ? to : new Date(to)) : null
  if (Number.isNaN(a.getTime())) return '—'
  if (!b || Number.isNaN(b.getTime())) return formatDate(a)
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  if (sameMonth) {
    return `${a.getDate()}–${b.getDate()} ${MONTHS_SHORT[a.getMonth()]} ${a.getFullYear()}`
  }
  return `${a.getDate()} ${MONTHS_SHORT[a.getMonth()]} – ${b.getDate()} ${MONTHS_SHORT[b.getMonth()]} ${b.getFullYear()}`
}

/**
 * Склонение: plural(5, ['запись', 'записи', 'записей']) → 'записей'
 */
export function plural(count, forms) {
  const n = Math.abs(count) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return forms[2]
  if (n1 > 1 && n1 < 5) return forms[1]
  if (n1 === 1) return forms[0]
  return forms[2]
}

export function pluralWithCount(count, forms) {
  return `${formatNumber(count)} ${plural(count, forms)}`
}
