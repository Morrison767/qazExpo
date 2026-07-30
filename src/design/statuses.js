import { status as statusColors } from './tokens.js'

/**
 * СТАТУСЫ СИСТЕМЫ — 8 токенов.
 *
 * Правило доступности: цвет НИКОГДА не единственный носитель смысла.
 * Каждый статус = цвет + собственная иконка-форма + текстовая метка.
 * Поэтому палитра остаётся читаемой при протанопии/дейтеранопии/тританопии
 * и при печати в оттенках серого (см. раздел «Статусы» на /design-system).
 */
export const STATUSES = {
  draft: {
    key: 'draft',
    label: 'Черновик',
    icon: 'circle-dashed',
    shortLabel: 'Черновик',
    description: 'Карточка создана, данные не отправлены на согласование',
    colors: statusColors.draft,
  },
  review: {
    key: 'review',
    label: 'На согласовании',
    icon: 'clock',
    shortLabel: 'Согласование',
    description: 'Ожидает решения ответственного подразделения Общества',
    colors: statusColors.review,
  },
  confirmed: {
    key: 'confirmed',
    label: 'Подтверждено',
    icon: 'check',
    shortLabel: 'Подтверждено',
    description: 'Бронирование подтверждено, договор действует',
    colors: statusColors.confirmed,
  },
  conflict: {
    key: 'conflict',
    label: 'Конфликт',
    icon: 'alert-triangle',
    shortLabel: 'Конфликт',
    description: 'Пересечение по дате, времени или помещению — требует разрешения',
    colors: statusColors.conflict,
  },
  paid: {
    key: 'paid',
    label: 'Оплачено',
    icon: 'circle-dot',
    shortLabel: 'Оплачено',
    description: 'Сумма договора поступила в полном объёме',
    colors: statusColors.paid,
  },
  unpaid: {
    key: 'unpaid',
    label: 'Не оплачено',
    icon: 'circle',
    shortLabel: 'Не оплачено',
    description: 'Счёт выставлен, оплата не поступила',
    colors: statusColors.unpaid,
  },
  done: {
    key: 'done',
    label: 'Завершено',
    icon: 'check-double',
    shortLabel: 'Завершено',
    description: 'Мероприятие проведено, договор закрыт, акт оформлен',
    colors: statusColors.done,
  },
  void: {
    key: 'void',
    label: 'Расторгнуто',
    icon: 'ban',
    shortLabel: 'Расторгнуто',
    description: 'Договор прекращён, заявка аннулирована',
    colors: statusColors.void,
  },
}

export const STATUS_KEYS = Object.keys(STATUSES)

export function getStatus(key) {
  return STATUSES[key] ?? STATUSES.draft
}

/**
 * Отображение доменных статусов ТЗ на 8 токенов палитры.
 * Один токен обслуживает несколько сущностей — колонки не пересекаются,
 * поэтому переиспользование цвета не создаёт двусмысленности.
 */
export const STATUS_MAPPING = [
  {
    domain: 'Мероприятие',
    field: 'Статус мероприятия',
    values: [
      { label: 'Черновик заявки', token: 'draft' },
      { label: 'Предварительно согласовано', token: 'review' },
      { label: 'Подтверждено', token: 'confirmed' },
      { label: 'Конфликт бронирования', token: 'conflict' },
      { label: 'Проведено', token: 'done' },
      { label: 'Отменено', token: 'void' },
    ],
  },
  {
    domain: 'Договор',
    field: 'Статус договора',
    values: [
      { label: 'Проект', token: 'draft' },
      { label: 'На согласовании', token: 'review' },
      { label: 'Подписан / Действует', token: 'confirmed' },
      { label: 'Завершён / Архив', token: 'done' },
      { label: 'Расторгнут', token: 'void' },
    ],
  },
  {
    domain: 'Оплата',
    field: 'Статус оплаты',
    values: [
      { label: 'Счёт не выставлен', token: 'draft' },
      { label: 'Оплачено', token: 'paid' },
      { label: 'Не оплачено', token: 'unpaid' },
      { label: 'Просрочено', token: 'conflict' },
    ],
  },
  {
    domain: 'Допуск подрядчика',
    field: 'Статус допуска',
    values: [
      { label: 'Заявка подана', token: 'review' },
      { label: 'Допуск оформлен', token: 'confirmed' },
      { label: 'Отказано', token: 'void' },
    ],
  },
]
