import { DAY, parseTime, toIsoMinutes } from '@/lib/timeline'

/**
 * ЛЕНТА ИЗМЕНЕНИЙ.
 *
 * Базовые записи выводятся из статуса мероприятия и даты подписания
 * договора — так у каждой карточки есть правдоподобная история согласований,
 * а руками её для 34 мероприятий писать не нужно. Реальные действия
 * пользователя дописываются в ленту поверх этих записей.
 */

export const HISTORY_ACTIONS = {
  created: { label: 'Заявка создана', icon: 'plus', tone: 'draft' },
  status: { label: 'Статус изменён', icon: 'refresh', tone: 'review' },
  sent: { label: 'Отправлено на согласование', icon: 'clock', tone: 'review' },
  approved: { label: 'Согласовано', icon: 'check', tone: 'confirmed' },
  confirmed: { label: 'Бронирование подтверждено', icon: 'check-circle', tone: 'confirmed' },
  schedule: { label: 'Изменены периоды', icon: 'calendar', tone: 'review' },
  hall: { label: 'Изменено помещение', icon: 'building', tone: 'review' },
  fields: { label: 'Изменены сведения', icon: 'pencil', tone: 'draft' },
  conflict: { label: 'Обнаружено пересечение', icon: 'alert-triangle', tone: 'conflict' },
  payment: { label: 'Поступила оплата', icon: 'wallet', tone: 'paid' },
  completed: { label: 'Мероприятие проведено', icon: 'check-double', tone: 'done' },
  terminated: { label: 'Договор расторгнут', icon: 'ban', tone: 'void' },
  services: { label: 'Изменены услуги', icon: 'hard-hat', tone: 'draft' },
}

let counter = 0
function nextId() {
  counter += 1
  return `h${counter}`
}

function entry(at, actor, role, action, details) {
  return { id: nextId(), at: toIsoMinutes(at), actor, role, action, details }
}

/** История одного мероприятия по его состоянию */
function buildFor(event) {
  const entries = []
  const signed = event.contract?.signedAt ? parseTime(event.contract.signedAt) : null
  const start = signed ?? parseTime(event.mountFrom) - 60 * DAY
  const manager = event.manager
  const occupied = parseTime(event.eventFrom)

  entries.push(
    entry(start, manager, 'Менеджер по аренде', 'created', `Тип: ${event.type} · ${event.hall}`),
  )

  if (event.status !== 'draft') {
    entries.push(
      entry(start + 2 * DAY, manager, 'Менеджер по аренде', 'sent', 'Направлено ответственным подразделениям'),
    )
  }

  if (event.approval?.length) {
    entries.push(
      entry(
        start + 4 * DAY,
        'Система',
        'Маршрут согласования',
        'status',
        `Ожидают: ${event.approval.join(', ')}`,
      ),
    )
  }

  if (['confirmed', 'done'].includes(event.status)) {
    entries.push(entry(start + 5 * DAY, 'Р. Жумабаев', 'Юридический сотрудник', 'approved', 'Договор согласован'))
    entries.push(
      entry(start + 6 * DAY, 'Г. Оспанова', 'Финансовый сотрудник', 'approved', 'Финансовые условия согласованы'),
    )
    entries.push(
      entry(start + 7 * DAY, manager, 'Менеджер по аренде', 'confirmed', `Зал ${event.hall} забронирован`),
    )
  }

  if (event.payment === 'paid') {
    entries.push(
      entry(start + 9 * DAY, 'Г. Оспанова', 'Финансовый сотрудник', 'payment', 'Оплата в полном объёме'),
    )
  }

  if (event.status === 'conflict') {
    entries.push(
      entry(
        occupied - 6 * DAY,
        'Система',
        'Контроль бронирования',
        'conflict',
        event.conflictNote ?? 'Пересечение по помещению с учётом монтажа и демонтажа',
      ),
    )
  }

  if (event.status === 'done') {
    entries.push(
      entry(parseTime(event.eventTo) + DAY, manager, 'Менеджер по аренде', 'completed', 'Акт направлен арендатору'),
    )
  }

  if (event.status === 'void') {
    entries.push(
      entry(
        occupied - 10 * DAY,
        'Р. Жумабаев',
        'Юридический сотрудник',
        'terminated',
        'Расторжение по инициативе арендатора',
      ),
    )
  }

  return entries.sort((a, b) => parseTime(b.at) - parseTime(a.at))
}

/** Map: id мероприятия → массив записей, свежие сверху */
export function seedHistory(events) {
  const map = {}
  for (const event of events) {
    map[event.id] = buildFor(event)
  }
  return map
}

export function makeEntry(actor, role, action, details, at) {
  return entry(at ?? Date.now(), actor, role, action, details)
}

/**
 * История взаимодействия с арендатором.
 * Собирается из реальных событий его мероприятий и договоров, плюс
 * несколько обращений — чтобы лента показывала отношения, а не только
 * технические действия.
 */
const TENANT_TOUCHPOINTS = {
  'TN-01': [
    { offset: -140, action: 'status', details: 'Обращение: запрос на бронирование павильона 1 под KazBuild 2027' },
    { offset: -35, action: 'conflict', details: 'Обращение: жалоба на график монтажа, разбор с технической службой' },
  ],
  'TN-05': [
    { offset: -80, action: 'status', details: 'Обращение: просьба перенести форум на осень' },
    { offset: -20, action: 'terminated', details: 'Клиент переведён в чёрный список: расторжение и неоплата' },
  ],
  'TN-07': [
    { offset: -200, action: 'status', details: 'Встреча: обсуждение рамочного сотрудничества на 2027 год' },
  ],
  'TN-20': [{ offset: -12, action: 'status', details: 'Обращение: запрос коммерческого предложения на форум в мае' }],
  'TN-21': [{ offset: -6, action: 'status', details: 'Обращение: интересуются Конгресс-центром на 400 человек' }],
  'TN-22': [{ offset: -25, action: 'status', details: 'Обращение: запрос на открытую площадку под выставку техники' }],
}

export function seedTenantHistory(tenants, events, contracts) {
  const map = {}
  const today = parseTime('2026-07-31')

  for (const tenant of tenants) {
    const entries = []

    entries.push(
      entry(
        Date.UTC(tenant.since, 0, 15),
        'Д. Ахметова',
        'Менеджер по аренде',
        'created',
        `Арендатор добавлен в справочник · БИН ${tenant.bin}`,
      ),
    )

    for (const touch of TENANT_TOUCHPOINTS[tenant.id] ?? []) {
      entries.push(
        entry(today + touch.offset * DAY, 'М. Ким', 'Менеджер по аренде', touch.action, touch.details),
      )
    }

    for (const event of events.filter((item) => item.tenantId === tenant.id)) {
      entries.push(
        entry(
          parseTime(event.contract?.signedAt ?? event.mountFrom) - 30 * DAY,
          event.manager,
          'Менеджер по аренде',
          'created',
          `Заявка на мероприятие «${event.name}» · ${event.hall}`,
        ),
      )
    }

    for (const contract of contracts.filter((item) => item.tenantId === tenant.id)) {
      if (['signed', 'archived'].includes(contract.approvalStatus)) {
        entries.push(
          entry(
            parseTime(contract.signedAt) + 8 * DAY,
            contract.lawyer,
            'Юридический сотрудник',
            'confirmed',
            `Договор № ${contract.number} подписан`,
          ),
        )
      }
      for (const payment of contract.payments ?? []) {
        if (payment.status === 'paid' && payment.paidAt) {
          entries.push(
            entry(
              parseTime(payment.paidAt),
              'Г. Оспанова',
              'Финансовый сотрудник',
              'payment',
              `№ ${contract.number}: ${payment.kind} — оплата поступила`,
            ),
          )
        }
        if (payment.status === 'overdue') {
          entries.push(
            entry(
              parseTime(payment.dueDate),
              'Система',
              'Контроль оплат',
              'conflict',
              `№ ${contract.number}: ${payment.kind} — срок оплаты истёк`,
            ),
          )
        }
      }
    }

    map[tenant.id] = entries.sort((a, b) => parseTime(b.at) - parseTime(a.at))
  }

  return map
}

/** История договоров: создание + закрытые шаги маршрута + платежи */
export function seedContractHistory(contracts) {
  const map = {}

  for (const contract of contracts) {
    const entries = []
    const base = parseTime(contract.signedAt ?? '2026-01-01')

    entries.push(
      entry(base, contract.manager, 'Менеджер по аренде', 'created', `Тип: ${contract.number}`),
    )

    for (const step of contract.route ?? []) {
      if (step.status === 'approved' && step.at) {
        entries.push(
          entry(parseTime(step.at), step.person, step.roleLabel, 'approved', 'Замечаний нет'),
        )
      }
    }

    if (contract.approvalStatus === 'signed' || contract.approvalStatus === 'archived') {
      entries.push(
        entry(base + 8 * DAY, contract.lawyer, 'Юридический сотрудник', 'confirmed', 'Договор подписан сторонами'),
      )
    }

    for (const payment of contract.payments ?? []) {
      if (payment.status === 'paid' && payment.paidAt) {
        entries.push(
          entry(
            parseTime(payment.paidAt),
            'Г. Оспанова',
            'Финансовый сотрудник',
            'payment',
            `${payment.kind} — поступила оплата`,
          ),
        )
      }
      if (payment.status === 'overdue') {
        entries.push(
          entry(
            parseTime(payment.dueDate),
            'Система',
            'Контроль оплат',
            'conflict',
            `${payment.kind} — срок оплаты истёк`,
          ),
        )
      }
    }

    if (contract.approvalStatus === 'terminated') {
      entries.push(
        entry(base + 30 * DAY, contract.lawyer, 'Юридический сотрудник', 'terminated', 'Договор расторгнут'),
      )
    }

    map[contract.id] = entries.sort((a, b) => parseTime(b.at) - parseTime(a.at))
  }

  return map
}
