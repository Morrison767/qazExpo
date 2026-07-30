/**
 * РОЛИ ПОЛЬЗОВАТЕЛЕЙ — раздел 4 ТЗ.
 * Используются переключателем роли в топбаре (демо-режим)
 * и фильтрацией разделов навигации.
 */
export const ROLES = {
  admin: {
    key: 'admin',
    name: 'Администратор системы',
    short: 'Администратор',
    group: 'internal',
    icon: 'sliders',
    scope: 'Пользователи, роли, справочники, помещения, статусы, шаблоны, права доступа',
    person: 'А. Сериков',
    unit: 'Департамент ИТ',
  },
  staff: {
    key: 'staff',
    name: 'Сотрудник Общества',
    short: 'Сотрудник',
    group: 'internal',
    icon: 'user',
    scope: 'Мероприятия, договоры, арендаторы, календарь, графики, подрядчики, отчёты',
    person: 'Д. Ахметова',
    unit: 'Департамент по работе с клиентами',
  },
  head: {
    key: 'head',
    name: 'Руководитель / куратор',
    short: 'Руководитель',
    group: 'internal',
    icon: 'chart',
    scope: 'Сводная информация, календарь занятости, финпоказатели, контрольные точки',
    person: 'Б. Нурланов',
    unit: 'Правление',
  },
  manager: {
    key: 'manager',
    name: 'Менеджер по аренде / мероприятиям',
    short: 'Менеджер',
    group: 'internal',
    icon: 'presentation',
    scope: 'Заявки, переговоры, данные арендатора, договора, помещений, дат, подрядчиков',
    person: 'М. Ким',
    unit: 'Отдел аренды',
  },
  finance: {
    key: 'finance',
    name: 'Финансовый сотрудник',
    short: 'Финансы',
    group: 'internal',
    icon: 'wallet',
    scope: 'Суммы договоров, статус оплаты, счета, задолженность, акты, финаналитика',
    person: 'Г. Оспанова',
    unit: 'Финансовый департамент',
  },
  legal: {
    key: 'legal',
    name: 'Юридический сотрудник',
    short: 'Юрист',
    group: 'internal',
    icon: 'scale',
    scope: 'Согласование договоров, доп. соглашений, приложений и корректировок',
    person: 'Р. Жумабаев',
    unit: 'Юридическая служба',
  },
  technical: {
    key: 'technical',
    name: 'Техническая служба',
    short: 'Тех. служба',
    group: 'internal',
    icon: 'hard-hat',
    scope: 'Графики монтажа/демонтажа, техтребования, оборудование, заявки на сопровождение',
    person: 'С. Ибраев',
    unit: 'Служба эксплуатации',
  },
  security: {
    key: 'security',
    name: 'Департамент безопасности и охраны труда',
    short: 'Безопасность',
    group: 'internal',
    icon: 'shield',
    scope: 'Даты, списки подрядчиков, допуски, транспорт, матпропуска, зоны доступа',
    person: 'Т. Абенов',
    unit: 'ДБ и ОТ',
  },
  tenant: {
    key: 'tenant',
    name: 'Арендатор',
    short: 'Арендатор',
    group: 'external',
    icon: 'building',
    scope: 'Только свои мероприятия, договоры, заявки, корректировки и документы',
    person: 'ТОО «Astana Expo Group»',
    unit: 'Внешняя организация',
  },
}

export const ROLE_KEYS = Object.keys(ROLES)

export const ROLE_GROUPS = [
  { key: 'internal', label: 'Сотрудники Общества' },
  { key: 'external', label: 'Внешние пользователи' },
]

export function getRole(key) {
  return ROLES[key] ?? ROLES.admin
}
