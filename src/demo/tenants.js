/**
 * СПРАВОЧНИК АРЕНДАТОРОВ.
 *
 * Мероприятия и договоры ссылаются сюда по `tenantId`, а не хранят копию
 * наименования и реквизитов. Наименование в карточках берётся отсюда.
 */
const RAW_TENANTS = [
  {
    id: 'TN-00',
    name: 'АО «НК «QazExpoCongress»',
    short: 'QazExpoCongress',
    bin: '170140012345',
    address: 'г. Астана, пр. Мангилик Ел, 55/21',
    phone: '+7 7172 79 90 00',
    email: 'info@qazexpocongress.kz',
    since: 2017,
    internal: true,
    contacts: [{ name: 'Д. Ахметова', position: 'Департамент по работе с клиентами', phone: '+7 7172 79 90 12' }],
  },
  {
    id: 'TN-01',
    name: 'ТОО «Iteca Kazakhstan»',
    short: 'Iteca',
    bin: '990340001234',
    address: 'г. Алматы, ул. Тимирязева, 42, корпус 23',
    phone: '+7 727 258 34 34',
    email: 'astana@iteca.kz',
    since: 2018,
    contacts: [
      { name: 'И. Кравцов', position: 'Технический директор', phone: '+7 707 610 22 48' },
      { name: 'Ж. Байжанова', position: 'Координатор проектов', phone: '+7 705 442 90 31' },
    ],
  },
  {
    id: 'TN-02',
    name: 'АО «НИТ»',
    short: 'НИТ',
    bin: '000240004567',
    address: 'г. Астана, ул. Достык, 13',
    phone: '+7 7172 55 12 00',
    email: 'office@nitec.kz',
    since: 2019,
    contacts: [{ name: 'Т. Мухамедов', position: 'Менеджер мероприятий', phone: '+7 702 887 14 05' }],
  },
  {
    id: 'TN-03',
    name: 'ТОО «AutoExpo KZ»',
    short: 'AutoExpo',
    bin: '110540007788',
    address: 'г. Астана, ул. Кабанбай батыра, 17',
    phone: '+7 7172 64 22 10',
    email: 'info@autoexpo.kz',
    since: 2021,
    contacts: [{ name: 'С. Нурпеисова', position: 'Директор по маркетингу', phone: '+7 700 318 76 92' }],
  },
  {
    id: 'TN-04',
    name: 'ТОО «Qazaq Energy»',
    short: 'Qazaq Energy',
    bin: '060340009911',
    address: 'г. Астана, пр. Кабанбай батыра, 28',
    phone: '+7 7172 70 44 90',
    email: 'office@qazaqenergy.kz',
    since: 2020,
    contacts: [{ name: 'А. Тулегенова', position: 'Руководитель PR-службы', phone: '+7 701 909 44 12' }],
  },
  {
    id: 'TN-05',
    name: 'ТОО «Digital Qazaqstan»',
    short: 'Digital Qazaqstan',
    bin: '190240003344',
    address: 'г. Астана, ул. Сыганак, 25',
    phone: '+7 7172 27 88 55',
    email: 'hello@dq.kz',
    since: 2022,
    contacts: [{ name: 'М. Сапаров', position: 'Продюсер', phone: '+7 705 120 33 87' }],
  },
  {
    id: 'TN-06',
    name: 'ТОО «Astana Retail Group»',
    short: 'Astana Retail',
    bin: '140640005566',
    address: 'г. Астана, ул. Туран, 37',
    phone: '+7 7172 31 09 44',
    email: 'events@astanaretail.kz',
    since: 2019,
    contacts: [{ name: 'Л. Оразбаева', position: 'Менеджер по событиям', phone: '+7 707 233 51 09' }],
  },
  {
    id: 'TN-07',
    name: 'ТОО «Astana Expo Group»',
    short: 'Astana Expo Group',
    bin: '180440012345',
    address: 'г. Астана, пр. Мангилик Ел, 55',
    phone: '+7 7172 79 55 40',
    email: 'office@astanaexpo.kz',
    since: 2018,
    contacts: [
      { name: 'А. Сагинтаева', position: 'Руководитель проектов', phone: '+7 701 234 56 78' },
      { name: 'Е. Досжанов', position: 'Технический координатор', phone: '+7 702 664 18 23' },
    ],
  },
  {
    id: 'TN-08',
    name: 'ТОО «Nomad Group»',
    short: 'Nomad Group',
    bin: '130240008877',
    address: 'г. Астана, ул. Достык, 5/1',
    phone: '+7 7172 45 66 12',
    email: 'info@nomadgroup.kz',
    since: 2021,
    contacts: [{ name: 'К. Алтынбеков', position: 'Директор по развитию', phone: '+7 700 771 25 63' }],
  },
  {
    id: 'TN-09',
    name: 'Корпоративный фонд «Alem.AI»',
    short: 'Alem.AI',
    bin: '220340001100',
    address: 'г. Астана, пр. Мангилик Ел, 55/8',
    phone: '+7 7172 79 91 20',
    email: 'hello@alem.ai',
    since: 2022,
    contacts: [{ name: 'Д. Есимова', position: 'Программный директор', phone: '+7 705 884 60 17' }],
  },
  {
    id: 'TN-10',
    name: 'ТОО «AgroExpo KZ»',
    short: 'AgroExpo',
    bin: '120840004422',
    address: 'г. Астана, ул. Бейбитшилик, 18',
    phone: '+7 7172 22 71 05',
    email: 'agro@agroexpo.kz',
    since: 2020,
    contacts: [{ name: 'М. Сапаров', position: 'Руководитель выставки', phone: '+7 707 401 92 38' }],
  },
  {
    id: 'TN-11',
    name: 'РГП «Национальный центр здравоохранения»',
    short: 'НЦЗ',
    bin: '040240006677',
    address: 'г. Астана, ул. Мангилик Ел, 20',
    phone: '+7 7172 70 95 00',
    email: 'info@nrchd.kz',
    since: 2019,
    contacts: [{ name: 'А. Тулегенова', position: 'Начальник отдела', phone: '+7 701 556 40 29' }],
  },
  {
    id: 'TN-12',
    name: 'ТОО «TransExpo Central Asia»',
    short: 'TransExpo',
    bin: '160540002299',
    address: 'г. Алматы, ул. Байзакова, 280',
    phone: '+7 727 344 12 90',
    email: 'astana@transexpo.kz',
    since: 2021,
    contacts: [{ name: 'Е. Досжанов', position: 'Менеджер проекта', phone: '+7 702 118 74 55' }],
  },
  {
    id: 'TN-13',
    name: 'ТОО «Fashion Astana»',
    short: 'Fashion Astana',
    bin: '200140007733',
    address: 'г. Астана, ул. Кунаева, 12/1',
    phone: '+7 7172 60 18 33',
    email: 'info@fashionastana.kz',
    since: 2023,
    contacts: [{ name: 'Л. Оразбаева', position: 'Продюсер показа', phone: '+7 705 990 12 44' }],
  },
  {
    id: 'TN-14',
    name: 'НПП РК «Атамекен»',
    short: 'Атамекен',
    bin: '130940001188',
    address: 'г. Астана, пр. Мангилик Ел, 55/20',
    phone: '+7 7172 91 91 91',
    email: 'info@atameken.kz',
    since: 2018,
    contacts: [{ name: 'К. Алтынбеков', position: 'Руководитель управления', phone: '+7 701 300 55 71' }],
  },
  {
    id: 'TN-15',
    name: 'ГКП «Астана Опера»',
    short: 'Астана Опера',
    bin: '130140002255',
    address: 'г. Астана, ул. Династия, 1',
    phone: '+7 7172 79 90 30',
    email: 'info@astanaopera.kz',
    since: 2020,
    contacts: [{ name: 'Д. Есимова', position: 'Заведующая постановочной частью', phone: '+7 707 662 03 18' }],
  },
  {
    id: 'TN-16',
    name: 'АО «Kazakh Tourism»',
    short: 'Kazakh Tourism',
    bin: '170340009900',
    address: 'г. Астана, ул. Сарайшык, 7Б',
    phone: '+7 7172 76 88 22',
    email: 'info@qaztourism.kz',
    since: 2022,
    contacts: [{ name: 'Ж. Байжанова', position: 'Менеджер по мероприятиям', phone: '+7 705 771 46 02' }],
  },
  {
    id: 'TN-17',
    name: 'ТОО «Event Master»',
    short: 'Event Master',
    bin: '210740003311',
    address: 'г. Астана, ул. Отырар, 4',
    phone: '+7 7172 38 55 17',
    email: 'hello@eventmaster.kz',
    since: 2023,
    contacts: [{ name: 'С. Нурпеисова', position: 'Управляющий партнёр', phone: '+7 700 449 81 26' }],
  },
  {
    id: 'TN-18',
    name: 'ТОО «EduExpo KZ»',
    short: 'EduExpo',
    bin: '150240008844',
    address: 'г. Астана, ул. Иманова, 19',
    phone: '+7 7172 29 40 60',
    email: 'info@eduexpo.kz',
    since: 2021,
    contacts: [{ name: 'Т. Мухамедов', position: 'Директор выставки', phone: '+7 702 315 77 90' }],
  },
  {
    id: 'TN-19',
    name: 'ТОО «Астана Групп»',
    short: 'Астана Групп',
    bin: '080540001177',
    address: 'г. Астана, пр. Республики, 44',
    phone: '+7 7172 50 22 88',
    email: 'office@astanagroup.kz',
    since: 2019,
    contacts: [{ name: 'И. Кравцов', position: 'Административный директор', phone: '+7 707 220 64 31' }],
  },
]

/**
 * СТАТУС КЛИЕНТА — хранимый атрибут справочника (редактируется в карточке),
 * а не производная. Раскладка по существующей палитре статусов.
 */
export const TENANT_STATUSES = {
  active: { label: 'Активный', token: 'confirmed', hint: 'есть действующий договор или предстоящие мероприятия' },
  occasional: { label: 'Разовый', token: 'draft', hint: 'единичные мероприятия в прошлом' },
  prospect: { label: 'Потенциальный', token: 'review', hint: 'обращался, договоров пока нет' },
  blacklist: { label: 'В чёрном списке', token: 'void', hint: 'расторжения и задолженность' },
}

export const TENANT_STATUS_KEYS = Object.keys(TENANT_STATUSES)

/* Статусы клиентов: расставлены по фактической истории в реестре */
const STATUS_BY_ID = {
  'TN-00': 'active',
  'TN-01': 'active',
  'TN-02': 'active',
  'TN-03': 'occasional',
  'TN-04': 'active',
  'TN-05': 'blacklist',
  'TN-06': 'active',
  'TN-07': 'active',
  'TN-08': 'active',
  'TN-09': 'active',
  'TN-10': 'active',
  'TN-11': 'occasional',
  'TN-12': 'active',
  'TN-13': 'active',
  'TN-14': 'active',
  'TN-15': 'active',
  'TN-16': 'occasional',
  'TN-17': 'active',
  'TN-18': 'occasional',
  'TN-19': 'active',
}

const BANKS = [
  { name: 'АО «Halyk Bank»', bik: 'HSBKKZKX' },
  { name: 'АО «Kaspi Bank»', bik: 'CASPKZKA' },
  { name: 'АО «ForteBank»', bik: 'IRTYKZKA' },
  { name: 'АО «Банк ЦентрКредит»', bik: 'KCJBKZKX' },
]

const SITE_BY_ID = {
  'TN-01': 'iteca.kz',
  'TN-02': 'nitec.kz',
  'TN-05': 'dq.kz',
  'TN-07': 'astanaexpo.kz',
  'TN-09': 'alem.ai',
  'TN-14': 'atameken.kz',
  'TN-15': 'astanaopera.kz',
  'TN-16': 'qaztourism.kz',
}

/** Банковские реквизиты выводятся из БИН — устойчиво и без ручной писанины */
function bankFor(tenant) {
  const digits = tenant.bin.replace(/\D/g, '')
  const bank = BANKS[Number(digits.slice(-1)) % BANKS.length]
  return {
    name: bank.name,
    bik: bank.bik,
    iik: `KZ${digits.slice(0, 2)}${bank.bik.slice(0, 4)}${digits.slice(2, 8)}${digits.slice(-4)}`,
    kbe: tenant.internal ? '11' : '17',
  }
}

/* Потенциальные клиенты: обращались, но договоров и мероприятий ещё нет */
const PROSPECTS = [
  {
    id: 'TN-20',
    name: 'ТОО «Caspian Energy Forum»',
    short: 'Caspian Energy',
    bin: '240540001122',
    address: 'г. Актау, мкр. 15, дом 42',
    phone: '+7 7292 50 11 40',
    email: 'info@caspianenergy.kz',
    site: 'caspianenergy.kz',
    since: 2026,
    status: 'prospect',
    contacts: [{ name: 'Б. Утегенов', position: 'Директор по развитию', phone: '+7 701 447 22 90' }],
  },
  {
    id: 'TN-21',
    name: 'ТОО «MedExpo Astana»',
    short: 'MedExpo',
    bin: '250140003344',
    address: 'г. Астана, ул. Абая, 8',
    phone: '+7 7172 44 90 12',
    email: 'hello@medexpo.kz',
    site: null,
    since: 2026,
    status: 'prospect',
    contacts: [{ name: 'Н. Абдразакова', position: 'Руководитель проекта', phone: '+7 705 611 08 47' }],
  },
  {
    id: 'TN-22',
    name: 'ТОО «Silk Road Logistics»',
    short: 'Silk Road',
    bin: '230940005566',
    address: 'г. Алматы, ул. Розыбакиева, 247',
    phone: '+7 727 390 44 21',
    email: 'office@silkroad.kz',
    site: 'silkroad.kz',
    since: 2026,
    status: 'prospect',
    contacts: [{ name: 'Р. Сейтжанов', position: 'Коммерческий директор', phone: '+7 700 205 63 18' }],
  },
]

export const TENANTS = [
  ...RAW_TENANTS.map((tenant) => ({
    ...tenant,
    status: tenant.status ?? STATUS_BY_ID[tenant.id] ?? 'occasional',
    site: tenant.site ?? SITE_BY_ID[tenant.id] ?? null,
    bank: tenant.bank ?? bankFor(tenant),
  })),
  ...PROSPECTS.map((tenant) => ({ ...tenant, bank: bankFor(tenant) })),
]

export function tenantById(id) {
  return TENANTS.find((tenant) => tenant.id === id)
}

/** Наименование → id: реестр мероприятий заполнялся строкой */
export const TENANT_ID_BY_NAME = TENANTS.reduce((acc, tenant) => {
  acc[tenant.name] = tenant.id
  return acc
}, {})

export function tenantByName(name) {
  return tenantById(TENANT_ID_BY_NAME[name])
}
