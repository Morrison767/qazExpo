/** Демонстрационные данные — только для проверки компонентов дизайн-системы. */

export const OBJECTS = [
  { key: 'kc', label: 'Конгресс-центр', plate: 'КЦ' },
  { key: 'mvc', label: 'Международный выставочный центр', plate: 'МВЦ' },
  { key: 'alem', label: 'Alem.AI', plate: 'ALEM' },
]

export const HALLS = [
  { code: 'КЦ-А1', name: 'Пленарный зал', object: 'Конгресс-центр', capacity: 3000 },
  { code: 'КЦ-Б2', name: 'Конференц-зал B2', object: 'Конгресс-центр', capacity: 420 },
  { code: 'МВЦ-П1', name: 'Павильон 1', object: 'Международный выставочный центр', capacity: 5200 },
  { code: 'МВЦ-П3', name: 'Павильон 3', object: 'Международный выставочный центр', capacity: 2800 },
  { code: 'ALEM-Л', name: 'Лекторий Alem.AI', object: 'Alem.AI', capacity: 180 },
]

export const EVENTS = [
  {
    id: 'EV-0142',
    name: 'Astana Finance Days 2026',
    type: 'Форум',
    tenant: 'ТОО «Astana Expo Group»',
    hall: 'КЦ-А1',
    object: 'Конгресс-центр',
    mountFrom: '2026-03-12',
    eventFrom: '2026-03-14',
    eventTo: '2026-03-16',
    dismountTo: '2026-03-17',
    guests: 2400,
    amount: 48500000,
    status: 'confirmed',
    payment: 'paid',
    manager: 'М. Ким',
  },
  {
    id: 'EV-0143',
    name: 'KazBuild / Aquatherm Astana',
    type: 'Выставка',
    tenant: 'Iteca Kazakhstan',
    hall: 'МВЦ-П1',
    object: 'Международный выставочный центр',
    mountFrom: '2026-04-01',
    eventFrom: '2026-04-06',
    eventTo: '2026-04-09',
    dismountTo: '2026-04-11',
    guests: 12000,
    amount: 126000000,
    status: 'review',
    payment: 'unpaid',
    manager: 'Д. Ахметова',
  },
  {
    id: 'EV-0144',
    name: 'Digital Bridge — сессия Alem.AI',
    type: 'Конференция',
    tenant: 'АО «НИТ»',
    hall: 'ALEM-Л',
    object: 'Alem.AI',
    mountFrom: '2026-05-18',
    eventFrom: '2026-05-19',
    eventTo: '2026-05-19',
    dismountTo: '2026-05-20',
    guests: 160,
    amount: 3400000,
    status: 'draft',
    payment: 'draft',
    manager: 'М. Ким',
  },
  {
    id: 'EV-0145',
    name: 'Корпоративный вечер Nomad Group',
    type: 'Корпоративное',
    tenant: 'ТОО «Nomad Group»',
    hall: 'КЦ-Б2',
    object: 'Конгресс-центр',
    mountFrom: '2026-03-14',
    eventFrom: '2026-03-15',
    eventTo: '2026-03-15',
    dismountTo: '2026-03-16',
    guests: 380,
    amount: 8900000,
    status: 'conflict',
    payment: 'unpaid',
    manager: 'Д. Ахметова',
  },
  {
    id: 'EV-0139',
    name: 'Astana Motor Show',
    type: 'Выставка',
    tenant: 'ТОО «AutoExpo KZ»',
    hall: 'МВЦ-П3',
    object: 'Международный выставочный центр',
    mountFrom: '2026-02-02',
    eventFrom: '2026-02-06',
    eventTo: '2026-02-09',
    dismountTo: '2026-02-10',
    guests: 8600,
    amount: 74200000,
    status: 'done',
    payment: 'paid',
    manager: 'М. Ким',
  },
  {
    id: 'EV-0138',
    name: 'Симпозиум «Энергия будущего»',
    type: 'Конференция',
    tenant: 'ТОО «Qazaq Energy»',
    hall: 'КЦ-А1',
    object: 'Конгресс-центр',
    mountFrom: '2026-01-20',
    eventFrom: '2026-01-22',
    eventTo: '2026-01-23',
    dismountTo: '2026-01-24',
    guests: 1200,
    amount: 21000000,
    status: 'void',
    payment: 'draft',
    manager: 'Д. Ахметова',
  },
]

export const CONTRACTS = [
  {
    id: '0142/25-АР',
    signedAt: '2025-11-18',
    validTo: '2026-03-31',
    tenant: 'ТОО «Astana Expo Group»',
    event: 'Astana Finance Days 2026',
    amount: 48500000,
    currency: '₸',
    status: 'confirmed',
    payment: 'paid',
    responsible: 'Р. Жумабаев',
    hasInvoice: true,
    hasAct: false,
  },
  {
    id: '0151/26-АР',
    signedAt: '2026-01-14',
    validTo: '2026-04-30',
    tenant: 'Iteca Kazakhstan',
    event: 'KazBuild / Aquatherm Astana',
    amount: 126000000,
    currency: '₸',
    status: 'review',
    payment: 'unpaid',
    responsible: 'Р. Жумабаев',
    hasInvoice: true,
    hasAct: false,
  },
  {
    id: '0155/26-АР',
    signedAt: '2026-02-03',
    validTo: '2026-05-31',
    tenant: 'АО «НИТ»',
    event: 'Digital Bridge — сессия Alem.AI',
    amount: 3400000,
    currency: '₸',
    status: 'draft',
    payment: 'draft',
    responsible: 'Г. Оспанова',
    hasInvoice: false,
    hasAct: false,
  },
  {
    id: '0121/25-АР',
    signedAt: '2025-08-30',
    validTo: '2026-02-28',
    tenant: 'ТОО «AutoExpo KZ»',
    event: 'Astana Motor Show',
    amount: 74200000,
    currency: '₸',
    status: 'done',
    payment: 'paid',
    responsible: 'Р. Жумабаев',
    hasInvoice: true,
    hasAct: true,
  },
]

export const CONTRACTORS = [
  {
    id: 'CN-0071',
    name: 'ТОО «ExpoMontage»',
    bin: '180440012345',
    work: 'Монтаж стендов',
    people: 24,
    vehicles: 4,
    from: '2026-03-12',
    to: '2026-03-17',
    status: 'confirmed',
  },
  {
    id: 'CN-0072',
    name: 'ТОО «Astana Clean Service»',
    bin: '020940098765',
    work: 'Клининг',
    people: 12,
    vehicles: 2,
    from: '2026-03-14',
    to: '2026-03-17',
    status: 'review',
  },
  {
    id: 'CN-0073',
    name: 'ЧОП «Qorgan Security»',
    bin: '141240055512',
    work: 'Охрана',
    people: 18,
    vehicles: 3,
    from: '2026-03-13',
    to: '2026-03-17',
    status: 'unpaid',
  },
]

export const EVENT_TYPES = [
  'Форум',
  'Выставка',
  'Конференция',
  'Концерт',
  'Корпоративное мероприятие',
  'Деловая встреча',
  'Иное',
]

/* ── Данные для инструментов ─────────────────────────────── */

export const MONTHS = [
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

/** Мероприятий в месяц за 12 месяцев */
export const TREND_EVENTS = [6, 8, 14, 11, 9, 5, 3, 4, 10, 16, 13, 11]

/** Выручка по месяцам, млн ₸ */
export const TREND_REVENUE = [42, 58, 126, 94, 71, 38, 22, 29, 88, 142, 118, 96]

/** Дебиторская задолженность, млн ₸ */
export const TREND_DEBT = [18, 22, 19, 31, 28, 34, 30, 26, 24, 29, 33, 26]

/**
 * Занятость залов по дням марта: статус на каждый день.
 * null — свободно. Видно, что 15.03 по КЦ-Б2 идёт конфликт.
 */
export const HALL_OCCUPANCY = [
  {
    hall: 'КЦ-А1',
    hint: '14 из 31 дня',
    days: [
      ...Array(11).fill(null),
      ...Array(2).fill('review'),
      ...Array(3).fill('confirmed'),
      'done',
      ...Array(6).fill(null),
      ...Array(4).fill('confirmed'),
      ...Array(4).fill(null),
    ],
  },
  {
    hall: 'КЦ-Б2',
    hint: '6 из 31 дня · 1 конфликт',
    days: [
      ...Array(13).fill(null),
      'review',
      'conflict',
      'review',
      ...Array(9).fill(null),
      ...Array(3).fill('confirmed'),
      ...Array(4).fill(null),
    ],
  },
  {
    hall: 'МВЦ-П1',
    hint: '22 из 31 дня',
    days: [
      ...Array(4).fill('done'),
      ...Array(3).fill(null),
      ...Array(8).fill('confirmed'),
      ...Array(2).fill(null),
      ...Array(7).fill('review'),
      ...Array(3).fill('confirmed'),
      ...Array(4).fill(null),
    ],
  },
  {
    hall: 'ALEM-Л',
    hint: '4 из 31 дня',
    days: [
      ...Array(7).fill(null),
      'confirmed',
      'confirmed',
      ...Array(12).fill(null),
      'draft',
      'draft',
      ...Array(10).fill(null),
    ],
  },
]

/** Сезонность: объекты × месяцы, интенсивность 0..1 */
export const HEAT_ROWS = [
  {
    label: 'КЦ',
    values: [0.2, 0.35, 0.85, 0.6, 0.45, 0.2, 0.08, 0.12, 0.55, 0.95, 0.7, 0.5],
  },
  {
    label: 'МВЦ',
    values: [0.3, 0.5, 0.95, 0.8, 0.6, 0.3, 0.1, 0.15, 0.65, 1, 0.85, 0.55],
  },
  {
    label: 'ALEM',
    values: [0.1, 0.2, 0.45, 0.35, 0.3, 0.15, 0.05, 0.08, 0.4, 0.6, 0.5, 0.25],
  },
]

/** Загрузка залов на текущий период, % */
export const HALL_LOAD = [
  { hall: 'МВЦ-П1', load: 71, plan: 65 },
  { hall: 'КЦ-А1', load: 45, plan: 60 },
  { hall: 'МВЦ-П3', load: 38, plan: 55 },
  { hall: 'КЦ-Б2', load: 19, plan: 40 },
  { hall: 'ALEM-Л', load: 13, plan: 35 },
]

export const EVENT_FORMATS = [
  { value: 'open', label: 'Открытое' },
  { value: 'closed', label: 'Закрытое' },
  { value: 'hybrid', label: 'Гибридное', description: 'Офлайн + онлайн-трансляция' },
  { value: 'online', label: 'Только онлайн-трансляция' },
]
