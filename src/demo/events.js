/**
 * ДЕМО-ДАННЫЕ ДАШБОРДА — реестр мероприятий.
 *
 * 27 мероприятий по трём объектам с разными статусами, оплатами и
 * согласованиями. Даты фиксированы (не генерируются от текущего дня),
 * чтобы демонстрация была воспроизводимой и её можно было вычитать.
 *
 * Заложено намеренно: 2 конфликта бронирования, 2 просроченных платежа,
 * 2 договора с истекающим сроком и 4 незакрытых согласования —
 * блок «Требуют внимания» на дашборде не бывает пустым.
 */

import { HALL_ID_BY_CODE } from './halls'
import { TENANT_ID_BY_NAME } from './tenants'

/** Точка отсчёта демонстрации. Всё «предстоящее» считается от этой даты. */
export const DEMO_TODAY = '2026-07-31'

export const OBJECTS = [
  { key: 'kc', name: 'Конгресс-центр', short: 'КЦ', halls: 4, planLoad: 65 },
  { key: 'mvc', name: 'Международный выставочный центр', short: 'МВЦ', halls: 4, planLoad: 70 },
  { key: 'alem', name: 'Alem.AI', short: 'Alem.AI', halls: 3, planLoad: 45 },
]

export function objectByKey(key) {
  return OBJECTS.find((o) => o.key === key)
}

/**
 * ЗАНЯТОСТЬ ПОМЕЩЕНИЙ по месяцам, % (индекс 0 — январь).
 *
 * Это агрегат, а не производная от списка ниже: в продуктивной системе
 * занятость приходит из эксплуатации и учитывает все брони, включая
 * технические окна и внутренние мероприятия Общества, — их в реестре
 * демонстрации нет. Профиль повторяется по годам: провал в июле,
 * пики в марте и октябре — обычная сезонность выставочного комплекса.
 */
export const LOAD_BY_MONTH = {
  kc: [52, 61, 74, 68, 58, 41, 33, 47, 66, 78, 71, 63],
  mvc: [58, 66, 88, 79, 71, 52, 38, 55, 74, 92, 84, 69],
  alem: [31, 37, 45, 42, 39, 28, 22, 34, 44, 52, 48, 36],
}

/**
 * approval: null — согласование закрыто; массив — кто ещё не согласовал.
 * overdueDays: 0 — просрочки нет.
 */
const RAW_EVENTS = [
  /* ── Проведённые: нужны для сравнения с предыдущим периодом ── */
  {
    id: 'EV-0112',
    name: 'Выставка «Нефть и газ Каспия»',
    type: 'Выставка',
    tenant: 'ТОО «Iteca Kazakhstan»',
    objectKey: 'mvc',
    hall: 'МВЦ-П1',
    mountFrom: '2026-04-17',
    eventFrom: '2026-04-20',
    eventTo: '2026-04-23',
    dismountTo: '2026-04-25',
    guests: 9800,
    amount: 68400000,
    contract: { id: '0112/26-АР', signedAt: '2026-01-22', validTo: '2026-05-31' },
    status: 'done',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'М. Ким',
  },
  {
    id: 'EV-0118',
    name: 'Конференция «Умный город»',
    type: 'Конференция',
    tenant: 'АО «НИТ»',
    objectKey: 'kc',
    hall: 'КЦ-Б2',
    mountFrom: '2026-05-13',
    eventFrom: '2026-05-14',
    eventTo: '2026-05-15',
    dismountTo: '2026-05-16',
    guests: 380,
    amount: 12700000,
    contract: { id: '0118/26-АР', signedAt: '2026-02-10', validTo: '2026-06-30' },
    status: 'done',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'Д. Ахметова',
  },
  {
    id: 'EV-0121',
    name: 'Astana Motor Show',
    type: 'Выставка',
    tenant: 'ТОО «AutoExpo KZ»',
    objectKey: 'mvc',
    hall: 'МВЦ-П3',
    mountFrom: '2026-06-01',
    eventFrom: '2026-06-04',
    eventTo: '2026-06-07',
    dismountTo: '2026-06-09',
    guests: 8600,
    amount: 74200000,
    contract: { id: '0121/26-АР', signedAt: '2026-02-28', validTo: '2026-07-15' },
    status: 'done',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'М. Ким',
  },
  {
    id: 'EV-0128',
    name: 'Симпозиум «Энергия будущего»',
    type: 'Конференция',
    tenant: 'ТОО «Qazaq Energy»',
    objectKey: 'kc',
    hall: 'КЦ-А1',
    mountFrom: '2026-07-14',
    eventFrom: '2026-07-16',
    eventTo: '2026-07-17',
    dismountTo: '2026-07-18',
    guests: 1200,
    amount: 21000000,
    contract: { id: '0128/26-АР', signedAt: '2026-04-06', validTo: '2026-08-15' },
    status: 'done',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'Д. Ахметова',
  },
  {
    id: 'EV-0131',
    name: 'Форум «Цифровой Казахстан»',
    type: 'Форум',
    tenant: 'ТОО «Digital Qazaqstan»',
    objectKey: 'kc',
    hall: 'КЦ-А1',
    mountFrom: '2026-07-20',
    eventFrom: '2026-07-22',
    eventTo: '2026-07-23',
    dismountTo: '2026-07-24',
    guests: 900,
    amount: 18400000,
    contract: { id: '0131/26-АР', signedAt: '2026-05-12', validTo: '2026-08-10' },
    status: 'void',
    payment: 'draft',
    overdueDays: 0,
    approval: null,
    manager: 'М. Ким',
  },

  /* ── Август 2026 ── */
  {
    id: 'EV-0141',
    name: 'Ярмарка «Школьный базар»',
    type: 'Выставка',
    tenant: 'ТОО «Astana Retail Group»',
    objectKey: 'mvc',
    hall: 'МВЦ-П2',
    mountFrom: '2026-07-30',
    eventFrom: '2026-07-31',
    eventTo: '2026-08-02',
    dismountTo: '2026-08-03',
    guests: 4200,
    amount: 9600000,
    contract: { id: '0141/26-АР', signedAt: '2026-06-18', validTo: '2026-09-30' },
    status: 'confirmed',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'Д. Ахметова',
  },
  {
    id: 'EV-0142',
    name: 'Astana Finance Days 2026',
    type: 'Форум',
    tenant: 'ТОО «Astana Expo Group»',
    objectKey: 'kc',
    hall: 'КЦ-А1',
    mountFrom: '2026-08-01',
    eventFrom: '2026-08-03',
    eventTo: '2026-08-05',
    dismountTo: '2026-08-06',
    guests: 2400,
    amount: 48500000,
    contract: { id: '0142/26-АР', signedAt: '2026-03-18', validTo: '2026-08-20' },
    phases: {
      mount: { from: '2026-08-01T08:00', to: '2026-08-02T20:00' },
      prep: { from: '2026-08-03T06:00', to: '2026-08-03T09:00' },
      event: { from: '2026-08-03T09:00', to: '2026-08-05T19:00' },
      dismount: { from: '2026-08-05T20:00', to: '2026-08-06T18:00' },
      tech: { from: '2026-08-06T18:00', to: '2026-08-07T08:00' },
    },
    status: 'confirmed',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'М. Ким',
  },
  {
    id: 'EV-0143',
    name: 'Nomad Business Night',
    type: 'Корпоративное мероприятие',
    tenant: 'ТОО «Nomad Group»',
    objectKey: 'kc',
    hall: 'КЦ-А1',
    mountFrom: '2026-08-06',
    eventFrom: '2026-08-06',
    eventTo: '2026-08-06',
    dismountTo: '2026-08-07',
    guests: 380,
    amount: 8900000,
    contract: { id: '0143/26-АР', signedAt: '2026-06-02', validTo: '2026-09-15' },
    phases: {
      mount: { from: '2026-08-06T10:00', to: '2026-08-06T18:00' },
      prep: { from: '2026-08-06T18:00', to: '2026-08-06T19:00' },
      event: { from: '2026-08-06T19:00', to: '2026-08-06T23:30' },
      dismount: { from: '2026-08-07T00:00', to: '2026-08-07T06:00' },
      tech: null,
    },
    status: 'conflict',
    payment: 'unpaid',
    overdueDays: 3,
    approval: null,
    conflictWith: 'EV-0142',
    conflictNote:
      'Монтаж 06.08 заходит на демонтаж и техническое окно Astana Finance Days в том же зале',
    manager: 'Д. Ахметова',
  },
  {
    id: 'EV-0144',
    name: 'Хакатон Alem.AI Summer',
    type: 'Иное',
    tenant: 'Корпоративный фонд «Alem.AI»',
    objectKey: 'alem',
    hall: 'ALEM-К',
    mountFrom: '2026-07-31',
    eventFrom: '2026-08-01',
    eventTo: '2026-08-02',
    dismountTo: '2026-08-02',
    guests: 220,
    amount: 2100000,
    contract: { id: '0144/26-АР', signedAt: '2026-06-25', validTo: '2026-09-30' },
    status: 'review',
    payment: 'draft',
    overdueDays: 0,
    approval: ['Департамент безопасности'],
    manager: 'М. Ким',
  },
  {
    id: 'EV-0145',
    name: 'Digital Bridge — сессия Alem.AI',
    type: 'Конференция',
    tenant: 'АО «НИТ»',
    objectKey: 'alem',
    hall: 'ALEM-Л',
    mountFrom: '2026-08-05',
    eventFrom: '2026-08-06',
    eventTo: '2026-08-06',
    dismountTo: '2026-08-07',
    guests: 160,
    amount: 3400000,
    contract: { id: '0145/26-АР', signedAt: '2026-05-28', validTo: '2026-08-28' },
    status: 'confirmed',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'Д. Ахметова',
  },
  {
    id: 'EV-0146',
    name: 'KazBuild / Aquatherm Astana',
    type: 'Выставка',
    tenant: 'ТОО «Iteca Kazakhstan»',
    objectKey: 'mvc',
    hall: 'МВЦ-П1',
    mountFrom: '2026-08-17',
    eventFrom: '2026-08-19',
    eventTo: '2026-08-22',
    dismountTo: '2026-08-23',
    guests: 12000,
    amount: 126000000,
    contract: { id: '0146/26-АР', signedAt: '2026-04-14', validTo: '2026-09-30' },
    phases: {
      mount: { from: '2026-08-17T08:00', to: '2026-08-18T20:00' },
      prep: { from: '2026-08-19T06:00', to: '2026-08-19T09:00' },
      event: { from: '2026-08-19T09:00', to: '2026-08-22T19:00' },
      dismount: { from: '2026-08-22T20:00', to: '2026-08-23T18:00' },
      tech: { from: '2026-08-23T18:00', to: '2026-08-24T08:00' },
    },
    status: 'review',
    payment: 'unpaid',
    overdueDays: 12,
    approval: ['Юридическая служба', 'Финансовый департамент'],
    manager: 'М. Ким',
  },
  {
    id: 'EV-0147',
    name: 'Съезд «Агропром-2026»',
    type: 'Форум',
    tenant: 'ТОО «AgroExpo KZ»',
    objectKey: 'mvc',
    hall: 'МВЦ-П1',
    mountFrom: '2026-08-23',
    eventFrom: '2026-08-24',
    eventTo: '2026-08-26',
    dismountTo: '2026-08-27',
    guests: 5400,
    amount: 34500000,
    contract: { id: '0147/26-АР', signedAt: '2026-06-11', validTo: '2026-09-30' },
    phases: {
      mount: { from: '2026-08-23T08:00', to: '2026-08-23T22:00' },
      prep: { from: '2026-08-24T06:00', to: '2026-08-24T09:00' },
      event: { from: '2026-08-24T09:00', to: '2026-08-26T19:00' },
      dismount: { from: '2026-08-26T20:00', to: '2026-08-27T18:00' },
      tech: { from: '2026-08-27T18:00', to: '2026-08-28T06:00' },
    },
    status: 'conflict',
    payment: 'unpaid',
    overdueDays: 0,
    conflictWith: 'EV-0146',
    conflictNote:
      'Монтаж 23.08 накладывается на демонтаж и техническое окно KazBuild в павильоне 1',
    approval: null,
    manager: 'Д. Ахметова',
  },
  {
    id: 'EV-0148',
    name: 'Конференция «Здравоохранение Казахстана»',
    type: 'Конференция',
    tenant: 'РГП «Национальный центр здравоохранения»',
    objectKey: 'kc',
    hall: 'КЦ-А1',
    mountFrom: '2026-08-26',
    eventFrom: '2026-08-27',
    eventTo: '2026-08-28',
    dismountTo: '2026-08-29',
    guests: 1100,
    amount: 27600000,
    contract: { id: '0148/26-АР', signedAt: '2026-05-06', validTo: '2026-09-30' },
    status: 'confirmed',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'М. Ким',
  },

  /* ── Сентябрь 2026 ── */
  {
    id: 'EV-0149',
    name: 'Международная выставка «Транспорт и логистика»',
    type: 'Выставка',
    tenant: 'ТОО «TransExpo Central Asia»',
    objectKey: 'mvc',
    hall: 'МВЦ-П2',
    mountFrom: '2026-09-06',
    eventFrom: '2026-09-09',
    eventTo: '2026-09-12',
    dismountTo: '2026-09-14',
    guests: 7300,
    amount: 62800000,
    contract: { id: '0149/26-АР', signedAt: '2026-06-30', validTo: '2026-10-31' },
    status: 'confirmed',
    payment: 'unpaid',
    overdueDays: 0,
    approval: null,
    manager: 'Д. Ахметова',
  },
  {
    id: 'EV-0150',
    name: 'Корпоратив ТОО «Qazaq Energy»',
    type: 'Корпоративное мероприятие',
    tenant: 'ТОО «Qazaq Energy»',
    objectKey: 'kc',
    hall: 'КЦ-В1',
    mountFrom: '2026-09-17',
    eventFrom: '2026-09-18',
    eventTo: '2026-09-18',
    dismountTo: '2026-09-19',
    guests: 240,
    amount: 6200000,
    contract: { id: '0150/26-АР', signedAt: '2026-07-21', validTo: '2026-10-15' },
    status: 'draft',
    payment: 'draft',
    overdueDays: 0,
    approval: null,
    manager: 'М. Ким',
  },
  {
    id: 'EV-0151',
    name: 'Astana Fashion Week',
    type: 'Иное',
    tenant: 'ТОО «Fashion Astana»',
    objectKey: 'mvc',
    hall: 'МВЦ-ОП',
    mountFrom: '2026-09-21',
    eventFrom: '2026-09-24',
    eventTo: '2026-09-26',
    dismountTo: '2026-09-28',
    guests: 3100,
    amount: 41000000,
    contract: { id: '0151/26-АР', signedAt: '2026-07-08', validTo: '2026-10-31' },
    status: 'review',
    payment: 'unpaid',
    overdueDays: 0,
    approval: ['Юридическая служба'],
    manager: 'Д. Ахметова',
  },

  /* ── Октябрь 2026 ── */
  {
    id: 'EV-0152',
    name: 'AI Summit Astana',
    type: 'Форум',
    tenant: 'Корпоративный фонд «Alem.AI»',
    objectKey: 'alem',
    hall: 'ALEM-Л',
    mountFrom: '2026-10-05',
    eventFrom: '2026-10-07',
    eventTo: '2026-10-08',
    dismountTo: '2026-10-09',
    guests: 640,
    amount: 19800000,
    contract: { id: '0152/26-АР', signedAt: '2026-07-02', validTo: '2026-11-15' },
    status: 'confirmed',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'М. Ким',
  },
  {
    id: 'EV-0153',
    name: 'Выставка «Мебель и интерьер»',
    type: 'Выставка',
    tenant: 'ТОО «Astana Retail Group»',
    objectKey: 'mvc',
    hall: 'МВЦ-П1',
    mountFrom: '2026-10-11',
    eventFrom: '2026-10-14',
    eventTo: '2026-10-17',
    dismountTo: '2026-10-19',
    guests: 5900,
    amount: 55300000,
    contract: { id: '0153/26-АР', signedAt: '2026-07-15', validTo: '2026-11-30' },
    status: 'confirmed',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'Д. Ахметова',
  },
  {
    id: 'EV-0154',
    name: 'Форум предпринимателей «Атамекен»',
    type: 'Форум',
    tenant: 'НПП РК «Атамекен»',
    objectKey: 'kc',
    hall: 'КЦ-А1',
    mountFrom: '2026-10-20',
    eventFrom: '2026-10-22',
    eventTo: '2026-10-23',
    dismountTo: '2026-10-24',
    guests: 1600,
    amount: 23900000,
    contract: { id: '0154/26-АР', signedAt: '2026-07-24', validTo: '2026-11-30' },
    status: 'review',
    payment: 'draft',
    overdueDays: 0,
    approval: ['Финансовый департамент', 'Юридическая служба'],
    manager: 'М. Ким',
  },

  /* ── Ноябрь–декабрь 2026 ── */
  {
    id: 'EV-0155',
    name: 'Концерт «Астана Симфония»',
    type: 'Концерт',
    tenant: 'ГКП «Астана Опера»',
    objectKey: 'kc',
    hall: 'КЦ-А1',
    mountFrom: '2026-11-19',
    eventFrom: '2026-11-21',
    eventTo: '2026-11-21',
    dismountTo: '2026-11-22',
    guests: 2800,
    amount: 31200000,
    contract: { id: '0155/26-АР', signedAt: '2026-07-29', validTo: '2026-12-15' },
    status: 'confirmed',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'Д. Ахметова',
  },
  {
    id: 'EV-0156',
    name: 'Демо-день акселератора Alem.AI',
    type: 'Деловая встреча',
    tenant: 'Корпоративный фонд «Alem.AI»',
    objectKey: 'alem',
    hall: 'ALEM-Д',
    mountFrom: '2026-12-10',
    eventFrom: '2026-12-11',
    eventTo: '2026-12-11',
    dismountTo: '2026-12-11',
    guests: 120,
    amount: 1800000,
    contract: { id: '0156/26-АР', signedAt: '2026-07-30', validTo: '2027-01-15' },
    status: 'draft',
    payment: 'draft',
    overdueDays: 0,
    approval: null,
    manager: 'М. Ким',
  },

  /* ── 2027: заполняют годовой горизонт планирования ── */
  {
    id: 'EV-0161',
    name: 'Astana Finance Days 2027',
    type: 'Форум',
    tenant: 'ТОО «Astana Expo Group»',
    objectKey: 'kc',
    hall: 'КЦ-А1',
    mountFrom: '2027-02-02',
    eventFrom: '2027-02-04',
    eventTo: '2027-02-06',
    dismountTo: '2027-02-07',
    guests: 2600,
    amount: 52000000,
    contract: { id: '0161/27-АР', signedAt: '2026-07-28', validTo: '2027-03-15' },
    status: 'review',
    payment: 'draft',
    overdueDays: 0,
    approval: null,
    manager: 'М. Ким',
  },
  {
    id: 'EV-0162',
    name: 'Выставка «Строительство и ЖКХ»',
    type: 'Выставка',
    tenant: 'ТОО «Iteca Kazakhstan»',
    objectKey: 'mvc',
    hall: 'МВЦ-П1',
    mountFrom: '2027-03-14',
    eventFrom: '2027-03-17',
    eventTo: '2027-03-20',
    dismountTo: '2027-03-22',
    guests: 8100,
    amount: 71500000,
    contract: { id: '0162/27-АР', signedAt: '2026-07-20', validTo: '2027-04-30' },
    status: 'confirmed',
    payment: 'unpaid',
    overdueDays: 0,
    approval: null,
    manager: 'Д. Ахметова',
  },
  {
    id: 'EV-0163',
    name: 'Форум «Женское предпринимательство»',
    type: 'Форум',
    tenant: 'НПП РК «Атамекен»',
    objectKey: 'kc',
    hall: 'КЦ-Б2',
    mountFrom: '2027-04-07',
    eventFrom: '2027-04-08',
    eventTo: '2027-04-08',
    dismountTo: '2027-04-09',
    guests: 420,
    amount: 14300000,
    contract: { id: '0163/27-АР', signedAt: '2026-07-25', validTo: '2027-05-15' },
    status: 'confirmed',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'М. Ким',
  },
  {
    id: 'EV-0164',
    name: 'Alem.AI Spring School',
    type: 'Иное',
    tenant: 'Корпоративный фонд «Alem.AI»',
    objectKey: 'alem',
    hall: 'ALEM-К',
    mountFrom: '2027-04-19',
    eventFrom: '2027-04-20',
    eventTo: '2027-04-24',
    dismountTo: '2027-04-25',
    guests: 180,
    amount: 4600000,
    contract: { id: '0164/27-АР', signedAt: '2026-07-27', validTo: '2027-05-31' },
    status: 'draft',
    payment: 'draft',
    overdueDays: 0,
    approval: null,
    manager: 'Д. Ахметова',
  },
  {
    id: 'EV-0165',
    name: 'Выставка «Нефть и газ Каспия 2027»',
    type: 'Выставка',
    tenant: 'ТОО «Iteca Kazakhstan»',
    objectKey: 'mvc',
    hall: 'МВЦ-П1',
    mountFrom: '2027-05-16',
    eventFrom: '2027-05-19',
    eventTo: '2027-05-22',
    dismountTo: '2027-05-24',
    guests: 10200,
    amount: 72000000,
    contract: { id: '0165/27-АР', signedAt: '2026-07-31', validTo: '2027-06-30' },
    status: 'review',
    payment: 'draft',
    overdueDays: 0,
    approval: null,
    manager: 'М. Ким',
  },
  {
    id: 'EV-0166',
    name: 'Международный туристический форум',
    type: 'Форум',
    tenant: 'АО «Kazakh Tourism»',
    objectKey: 'kc',
    hall: 'КЦ-А1',
    mountFrom: '2027-06-14',
    eventFrom: '2027-06-16',
    eventTo: '2027-06-17',
    dismountTo: '2027-06-18',
    guests: 1400,
    amount: 29400000,
    contract: { id: '0166/27-АР', signedAt: '2026-07-31', validTo: '2027-07-31' },
    status: 'confirmed',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'Д. Ахметова',
  },

  /* ── Добавлено для календаря: плотное окно август–сентябрь 2026 ── */
  {
    id: 'EV-0140',
    name: 'Воркшоп Alem.AI: продуктовая аналитика',
    type: 'Иное',
    tenant: 'Корпоративный фонд «Alem.AI»',
    objectKey: 'alem',
    hall: 'ALEM-К',
    mountFrom: '2026-07-28',
    eventFrom: '2026-07-29',
    eventTo: '2026-07-30',
    dismountTo: '2026-07-30',
    guests: 90,
    amount: 1400000,
    contract: { id: '0140/26-АР', signedAt: '2026-06-15', validTo: '2026-08-31' },
    phases: {
      mount: { from: '2026-07-28T10:00', to: '2026-07-28T18:00' },
      prep: { from: '2026-07-29T07:00', to: '2026-07-29T09:00' },
      event: { from: '2026-07-29T09:00', to: '2026-07-30T18:00' },
      dismount: { from: '2026-07-30T19:00', to: '2026-07-30T23:00' },
      /* Техническое окно заканчивается ровно там, где начинается монтаж
         хакатона: встык система конфликтом не считает */
      tech: { from: '2026-07-30T23:00', to: '2026-07-31T08:00' },
    },
    status: 'done',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'М. Ким',
  },
  {
    id: 'EV-0157',
    name: 'Форум машиностроителей Казахстана',
    type: 'Форум',
    tenant: 'НПП РК «Атамекен»',
    objectKey: 'kc',
    hall: 'КЦ-Б2',
    mountFrom: '2026-08-10',
    eventFrom: '2026-08-11',
    eventTo: '2026-08-12',
    dismountTo: '2026-08-13',
    guests: 410,
    amount: 16800000,
    contract: { id: '0157/26-АР', signedAt: '2026-06-20', validTo: '2026-09-15' },
    status: 'confirmed',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'М. Ким',
  },
  {
    id: 'EV-0158',
    name: 'Astana Wedding Expo',
    type: 'Выставка',
    tenant: 'ТОО «Event Master»',
    objectKey: 'mvc',
    hall: 'МВЦ-П2',
    mountFrom: '2026-08-14',
    eventFrom: '2026-08-15',
    eventTo: '2026-08-16',
    dismountTo: '2026-08-17',
    guests: 2600,
    amount: 11200000,
    contract: { id: '0158/26-АР', signedAt: '2026-07-10', validTo: '2026-09-30' },
    status: 'draft',
    payment: 'draft',
    overdueDays: 0,
    approval: null,
    manager: 'Д. Ахметова',
  },
  {
    id: 'EV-0159',
    name: 'Астана Симфония: летняя программа',
    type: 'Концерт',
    tenant: 'ГКП «Астана Опера»',
    objectKey: 'kc',
    hall: 'КЦ-А1',
    mountFrom: '2026-08-18',
    eventFrom: '2026-08-19',
    eventTo: '2026-08-19',
    dismountTo: '2026-08-20',
    guests: 2800,
    amount: 22400000,
    contract: { id: '0159/26-АР', signedAt: '2026-07-12', validTo: '2026-09-15' },
    status: 'confirmed',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'Д. Ахметова',
  },
  {
    id: 'EV-0160',
    name: 'Обучение арендаторов: работа в ИС',
    type: 'Деловая встреча',
    tenant: 'АО «НК «QazExpoCongress»',
    objectKey: 'alem',
    hall: 'ALEM-Д',
    mountFrom: '2026-08-20',
    eventFrom: '2026-08-20',
    eventTo: '2026-08-20',
    dismountTo: '2026-08-20',
    guests: 60,
    amount: 600000,
    contract: { id: '0160/26-АР', signedAt: '2026-07-18', validTo: '2026-09-01' },
    phases: {
      mount: { from: '2026-08-20T08:00', to: '2026-08-20T09:30' },
      prep: { from: '2026-08-20T09:30', to: '2026-08-20T10:00' },
      event: { from: '2026-08-20T10:00', to: '2026-08-20T17:00' },
      dismount: { from: '2026-08-20T17:00', to: '2026-08-20T19:00' },
      tech: null,
    },
    status: 'draft',
    payment: 'draft',
    overdueDays: 0,
    approval: null,
    manager: 'М. Ким',
  },
  {
    id: 'EV-0167',
    name: 'Выставка «Образование и карьера»',
    type: 'Выставка',
    tenant: 'ТОО «EduExpo KZ»',
    objectKey: 'mvc',
    hall: 'МВЦ-П3',
    mountFrom: '2026-09-07',
    eventFrom: '2026-09-08',
    eventTo: '2026-09-10',
    dismountTo: '2026-09-11',
    guests: 4700,
    amount: 28300000,
    contract: { id: '0167/26-АР', signedAt: '2026-07-06', validTo: '2026-10-15' },
    status: 'review',
    payment: 'unpaid',
    overdueDays: 0,
    approval: ['Финансовый департамент'],
    manager: 'М. Ким',
  },
  {
    id: 'EV-0168',
    name: 'Корпоративный вечер «Астана Групп»',
    type: 'Корпоративное мероприятие',
    tenant: 'ТОО «Астана Групп»',
    objectKey: 'kc',
    hall: 'КЦ-Ф',
    mountFrom: '2026-09-25',
    eventFrom: '2026-09-26',
    eventTo: '2026-09-26',
    dismountTo: '2026-09-27',
    guests: 520,
    amount: 13900000,
    contract: { id: '0168/26-АР', signedAt: '2026-07-22', validTo: '2026-10-31' },
    status: 'confirmed',
    payment: 'paid',
    overdueDays: 0,
    approval: null,
    manager: 'Д. Ахметова',
  },
]

/* ─────────────────────────────────────────────────────────────
   ГИДРАТАЦИЯ: идентификатор зала и фазы мероприятия
   ─────────────────────────────────────────────────────────────
   Реестр хранит человекочитаемый код зала («КЦ-А1») и плоские даты —
   их читает дашборд. Календарю нужны идентификатор зала и фазы с
   точностью до часа, поэтому они достраиваются здесь.

   Там, где важна точная картина занятости (заложенные пересечения,
   короткие мероприятия), фазы заданы в данных явно и не пересчитываются.
   ───────────────────────────────────────────────────────────── */

const DAY_MS = 86_400_000

function at(dateString, time) {
  return `${dateString}T${time}`
}

function shiftDate(dateString, days) {
  const [y, m, d] = dateString.split('-').map(Number)
  const shifted = new Date(Date.UTC(y, m - 1, d) + days * DAY_MS)
  const pad = (n) => String(n).padStart(2, '0')
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`
}

/** Типовой график: монтаж с 08:00, проведение 09:00–19:00, техокно 12 ч */
export function derivePhases(event) {
  const { mountFrom, eventFrom, eventTo, dismountTo } = event

  const mount =
    mountFrom < eventFrom
      ? { from: at(mountFrom, '08:00'), to: at(shiftDate(eventFrom, -1), '20:00') }
      : { from: at(eventFrom, '06:00'), to: at(eventFrom, '08:00') }

  const prep = { from: at(eventFrom, '06:30'), to: at(eventFrom, '09:00') }
  const main = { from: at(eventFrom, '09:00'), to: at(eventTo, '19:00') }

  const dismount =
    dismountTo > eventTo
      ? { from: at(eventTo, '20:00'), to: at(dismountTo, '18:00') }
      : { from: at(eventTo, '20:00'), to: at(eventTo, '23:00') }

  const techStart = dismountTo > eventTo ? at(dismountTo, '18:00') : at(eventTo, '23:00')
  const techEnd = dismountTo > eventTo ? at(shiftDate(dismountTo, 1), '06:00') : at(shiftDate(eventTo, 1), '06:00')

  return {
    mount,
    prep: mount.to < prep.from ? prep : { from: mount.to, to: at(eventFrom, '09:00') },
    event: main,
    dismount,
    tech: { from: techStart, to: techEnd },
  }
}

/* ─────────────────────────────────────────────────────────────
   КАРТОЧКА МЕРОПРИЯТИЯ: сведения, которые не нужны ни календарю,
   ни дашборду, но нужны детальному виду.

   Выводятся детерминированно из типа, числа участников и объекта —
   писать их руками для 34 мероприятий незачем. Для показательных
   карточек значения заданы явно в OVERRIDES ниже.
   ───────────────────────────────────────────────────────────── */

export const FORMAT_LABELS = {
  open: 'Открытое',
  closed: 'Закрытое',
  hybrid: 'Гибридное',
  online: 'Онлайн-трансляция',
}

const CONTACTS = [
  { name: 'А. Сагинтаева', position: 'Руководитель проектов', phone: '+7 701 234 56 78' },
  { name: 'Т. Мухамедов', position: 'Менеджер мероприятий', phone: '+7 702 887 14 05' },
  { name: 'Ж. Байжанова', position: 'Координатор', phone: '+7 705 442 90 31' },
  { name: 'И. Кравцов', position: 'Технический директор', phone: '+7 707 610 22 48' },
  { name: 'С. Нурпеисова', position: 'Директор по маркетингу', phone: '+7 700 318 76 92' },
]

const PARTICIPANT_ROLES = [
  'Руководитель мероприятия',
  'Технический координатор',
  'Ответственный за застройку',
  'Пресс-служба',
]

const PARTICIPANT_NAMES = [
  'Е. Досжанов',
  'А. Тулегенова',
  'М. Сапаров',
  'Д. Есимова',
  'К. Алтынбеков',
  'Л. Оразбаева',
]

const EQUIPMENT_BY_TYPE = {
  Форум: [
    { name: 'Светодиодный экран 6×3 м', qty: 1 },
    { name: 'Комплект синхронного перевода', qty: 200 },
    { name: 'Микрофон беспроводной', qty: 12 },
    { name: 'Сцена сборная 12×8 м', qty: 1 },
  ],
  Выставка: [
    { name: 'Стендовая конструкция, кв. м', qty: 1800 },
    { name: 'Подключение 3×32А', qty: 24 },
    { name: 'Погрузчик', qty: 2 },
    { name: 'Ограждение, п. м', qty: 320 },
  ],
  Конференция: [
    { name: 'Проектор 10 000 лм', qty: 2 },
    { name: 'Микрофон петличный', qty: 8 },
    { name: 'Пульт для голосования', qty: 150 },
  ],
  Концерт: [
    { name: 'Звуковой комплект 40 кВт', qty: 1 },
    { name: 'Световое оборудование', qty: 1 },
    { name: 'Рояль концертный', qty: 1 },
  ],
  'Корпоративное мероприятие': [
    { name: 'Банкетная мебель, комплект', qty: 40 },
    { name: 'DJ-оборудование', qty: 1 },
    { name: 'Фотозона', qty: 1 },
  ],
  'Деловая встреча': [
    { name: 'Система видеоконференцсвязи', qty: 1 },
    { name: 'Флипчарт', qty: 2 },
  ],
  Иное: [
    { name: 'Ноутбук', qty: 30 },
    { name: 'Удлинитель, п. м', qty: 120 },
  ],
}

const FORMAT_BY_TYPE = {
  Форум: 'hybrid',
  Конференция: 'hybrid',
  Выставка: 'open',
  Концерт: 'open',
  'Корпоративное мероприятие': 'closed',
  'Деловая встреча': 'closed',
  Иное: 'open',
}

/** Устойчивый «псевдослучайный» ключ из идентификатора */
function seedOf(id) {
  let hash = 7
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 100_000
  return hash
}

function pick(list, seed, offset = 0) {
  return list[(seed + offset) % list.length]
}

function describe(event) {
  const object = OBJECTS.find((o) => o.key === event.objectKey)
  return (
    `${event.type} на площадке «${object?.name}», зал ${event.hall}. ` +
    `Ожидается около ${new Intl.NumberFormat('ru-RU').format(event.guests)} участников. ` +
    `Организатор — ${event.tenant}.`
  )
}

function servicesFor(event) {
  const heavy = event.guests >= 500
  return {
    security: heavy,
    cleaning: true,
    catering: ['Форум', 'Конференция', 'Корпоративное мероприятие'].includes(event.type),
    tech: ['Форум', 'Конференция', 'Концерт', 'Выставка'].includes(event.type),
    parking: heavy,
    accreditation: ['Форум', 'Выставка'].includes(event.type),
  }
}

function participantsFor(event) {
  const seed = seedOf(event.id)
  const count = event.guests >= 1000 ? 3 : 2
  return Array.from({ length: count }, (_, index) => ({
    name: pick(PARTICIPANT_NAMES, seed, index * 2),
    role: pick(PARTICIPANT_ROLES, seed, index),
    phone: `+7 7${String((seed + index * 137) % 100).padStart(2, '0')} ${String((seed * 3 + index) % 1000).padStart(3, '0')} ${String((seed * 7 + index) % 100).padStart(2, '0')} ${String((seed * 11 + index) % 100).padStart(2, '0')}`,
  }))
}

/** Явные значения для показательных карточек */
const OVERRIDES = {
  'EV-0142': {
    description:
      'Ключевое финансовое событие года: пленарная сессия, восемь тематических треков и закрытая ' +
      'встреча инвесторов. Требуется синхронный перевод на три языка и онлайн-трансляция на портал Общества.',
    contact: {
      name: 'А. Сагинтаева',
      position: 'Руководитель проектов',
      phone: '+7 701 234 56 78',
      email: 'a.sagintaeva@astanaexpo.kz',
    },
  },
  'EV-0146': {
    description:
      'Крупнейшая строительная выставка региона. Застройка стендов силами четырёх подрядных ' +
      'организаций, ввоз оборудования по материальным пропускам, круглосуточный монтаж.',
    contact: {
      name: 'И. Кравцов',
      position: 'Технический директор',
      phone: '+7 707 610 22 48',
      email: 'i.kravtsov@iteca.kz',
    },
  },
  'EV-0143': {
    description:
      'Закрытый вечер для партнёров компании. Банкетная посадка на 380 человек, живой звук, ' +
      'въезд транспорта кейтеринга через служебные ворота.',
  },
  'EV-0152': {
    description:
      'Саммит по искусственному интеллекту: демо-зона стартапов, питч-сессия и подписание ' +
      'меморандумов. Трансляция на площадке Alem.AI и в сети.',
  },
}

/**
 * СЕМЕНА ДОГОВОРОВ.
 *
 * Реестр мероприятий изначально хранил договор внутри карточки. Теперь
 * договор — самостоятельная сущность (`demo/contracts.js`), а здесь остаются
 * только исходные значения для его создания. У мероприятия остаётся ссылка
 * `contractId`; номер, суммы, платежи и статус оплаты живут в договоре.
 */
export const EVENT_CONTRACT_SEEDS = RAW_EVENTS.filter((event) => event.contract?.id).map(
  (event) => ({
    eventId: event.id,
    number: event.contract.id,
    signedAt: event.contract.signedAt,
    validTo: event.contract.validTo,
    amount: event.amount,
    tenantId: TENANT_ID_BY_NAME[event.tenant] ?? null,
    objectKey: event.objectKey,
    manager: event.manager,
    eventStatus: event.status,
    eventFrom: event.eventFrom,
    eventTo: event.eventTo,
    /* Как оплата выглядела в первой версии данных — сохраняем, чтобы
       агрегаты дашборда не поехали после нормализации */
    paymentSeed: event.payment,
    overdueSeed: event.overdueDays ?? 0,
  }),
)

/** Номер договора → идентификатор: «0142/26-АР» → «CT-0142» */
export function contractIdFromNumber(number) {
  return `CT-${number.slice(0, 4)}`
}

export const EVENTS = RAW_EVENTS.map((rawEvent) => {
  /* contract / payment / overdueDays уходят в договор — здесь только ссылка */
  const { contract, payment, overdueDays, ...event } = rawEvent
  const seed = seedOf(event.id)
  const contact = pick(CONTACTS, seed)
  const override = OVERRIDES[event.id] ?? {}

  return {
    ...event,
    hallId: HALL_ID_BY_CODE[event.hall] ?? null,
    tenantId: TENANT_ID_BY_NAME[event.tenant] ?? null,
    contractId: contract?.id ? contractIdFromNumber(contract.id) : null,
    phases: event.phases ?? derivePhases(rawEvent),
    format: event.format ?? FORMAT_BY_TYPE[event.type] ?? 'open',
    description: override.description ?? describe(event),
    contact:
      override.contact ??
      ({
        ...contact,
        email: `info@${['expo', 'events', 'group', 'kz'][seed % 4]}.kz`,
      }),
    participants: event.participants ?? participantsFor(event),
    services: event.services ?? servicesFor(event),
    equipment: event.equipment ?? EQUIPMENT_BY_TYPE[event.type] ?? EQUIPMENT_BY_TYPE.Иное,
  }
})

export const SERVICE_LABELS = {
  security: 'Охрана',
  cleaning: 'Клининг',
  catering: 'Кейтеринг',
  tech: 'Техническое сопровождение',
  parking: 'Организация парковки',
  accreditation: 'Аккредитация участников',
}
