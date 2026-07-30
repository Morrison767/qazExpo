/**
 * СТРУКТУРА НАВИГАЦИИ — раздел 8 ТЗ «Требования к интерфейсу».
 * `roles: 'all'` — раздел виден всем; иначе перечисление ключей ролей.
 * `count` — демонстрационные счётчики для прототипа.
 */
export const NAV_GROUPS = [
  {
    key: 'main',
    label: 'Рабочая область',
    items: [
      {
        key: 'dashboard',
        label: 'Дашборд',
        path: '/dashboard',
        icon: 'dashboard',
        roles: ['admin', 'staff', 'head', 'manager', 'finance', 'legal', 'technical', 'security'],
      },
      { key: 'calendar', label: 'Календарь', path: '/calendar', icon: 'calendar', roles: 'all' },
      {
        key: 'events',
        label: 'Мероприятия',
        path: '/events',
        icon: 'presentation',
        roles: 'all',
        count: 42,
      },
      {
        key: 'contracts',
        label: 'Договоры',
        path: '/contracts',
        icon: 'contract',
        roles: 'all',
        count: 18,
      },
      {
        key: 'tenants',
        label: 'Арендаторы',
        path: '/tenants',
        icon: 'building',
        roles: ['admin', 'staff', 'head', 'manager', 'finance', 'legal', 'security'],
      },
      {
        key: 'contractors',
        label: 'Подрядчики',
        path: '/contractors',
        icon: 'hard-hat',
        roles: 'all',
        count: 7,
      },
      {
        key: 'reports',
        label: 'Отчёты',
        path: '/reports',
        icon: 'chart',
        roles: ['admin', 'staff', 'head', 'manager', 'finance', 'legal', 'technical', 'security'],
      },
      {
        key: 'cabinet',
        label: 'Личный кабинет',
        path: '/cabinet',
        icon: 'user-circle',
        roles: 'all',
      },
    ],
  },
  {
    key: 'system',
    label: 'Настройка',
    items: [
      {
        key: 'catalogs',
        label: 'Справочники',
        path: '/catalogs',
        icon: 'list',
        roles: ['admin', 'staff'],
      },
      { key: 'admin', label: 'Администрирование', path: '/admin', icon: 'sliders', roles: ['admin'] },
      {
        key: 'design-system',
        label: 'Дизайн-система',
        path: '/design-system',
        icon: 'palette',
        roles: 'all',
      },
    ],
  },
]

/** Разделы, доступные роли */
export function navForRole(roleKey) {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles === 'all' || item.roles.includes(roleKey)),
  })).filter((group) => group.items.length > 0)
}

export const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items)

export function navItemByPath(path) {
  return ALL_NAV_ITEMS.find((item) => item.path === path)
}
