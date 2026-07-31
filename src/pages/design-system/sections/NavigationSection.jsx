import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Tabs } from '@/components/Tabs'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Pagination } from '@/components/Pagination'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { Topbar, PageHeader } from '@/components/Topbar'
import { Button } from '@/components/Button'
import { Counter } from '@/components/Badge'
import { HallPlate } from '@/components/HallPlate'
import { Icon } from '@/components/Icon'
import { navForRole } from '@/design/navigation'
import { getRole, ROLES } from '@/design/roles'
import { useRole } from '@/app/RoleContext'
import { Section, DemoBlock, DemoLabel } from '../parts'

export function NavigationSection() {
  const { roleKey, setRole } = useRole()
  const [demoRole, setDemoRole] = useState('tenant')
  const [tab, setTab] = useState('main')
  const [segment, setSegment] = useState('month')
  const [page, setPage] = useState(3)

  return (
    <Section
      id="navigation"
      num="12"
      title="Навигация"
      description="Сайдбар работает как указатель по комплексу: группы разделов подписаны CAPS-метками, активный пункт маркирован той же сигнальной кромкой, что карточки и строки реестра. Состав разделов зависит от роли — арендатор физически не видит чужих сущностей."
    >
      <DemoBlock
        title="Сайдбар"
        note="Корпус — основной вариант; светлый — для встраивания"
        tone="canvas"
      >
        <div className="flex flex-wrap gap-4">
          <div className="h-[30rem] overflow-hidden rounded-md border border-nav-line shadow-card">
            <Sidebar
              groups={navForRole(roleKey)}
              activePath="/design-system"
              role={getRole(roleKey)}
              onNavigate={() => {}}
            />
          </div>
          <div className="h-[30rem] overflow-hidden rounded-md border border-nav-line shadow-card">
            <Sidebar
              groups={navForRole(roleKey)}
              activePath="/events"
              role={getRole(roleKey)}
              collapsed
              onNavigate={() => {}}
            />
          </div>
          <div className="h-[30rem] overflow-hidden rounded-md border border-hairline shadow-card">
            <Sidebar
              groups={navForRole(roleKey)}
              activePath="/calendar"
              role={getRole(roleKey)}
              tone="light"
              onNavigate={() => {}}
            />
          </div>
          <div className="min-w-[16rem] flex-1">
            <DemoLabel>Разделы по ролям</DemoLabel>
            <div className="space-y-1.5">
              {Object.values(ROLES).map((role) => {
                const count = navForRole(role.key).reduce((sum, g) => sum + g.items.length, 0)
                return (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => setDemoRole(role.key)}
                    className={`focus-ring flex w-full items-center gap-2 rounded border px-2 py-1.5 text-left transition-colors duration-fast ${
                      demoRole === role.key
                        ? 'border-accent-line bg-accent-soft'
                        : 'border-hairline bg-surface hover:bg-surface-sunken'
                    }`}
                  >
                    <Icon name={role.icon} size={13} className="shrink-0 text-accent-fg" />
                    <span className="min-w-0 flex-1 truncate text-sm text-content">
                      {role.short}
                    </span>
                    <Counter value={count} tone={demoRole === role.key ? 'navy' : 'neutral'} />
                  </button>
                )
              })}
            </div>
            <div className="mt-3 rounded border border-hairline bg-surface p-2.5">
              <p className="text-2xs font-semibold uppercase tracking-label text-content-faint">
                Доступно роли «{getRole(demoRole).short}»
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {navForRole(demoRole).flatMap((g) =>
                  g.items.map((item) => (
                    <span
                      key={item.key}
                      className="inline-flex items-center gap-1 rounded-sm border border-hairline bg-surface-sunken px-1.5 py-0.5 text-2xs text-content-muted"
                    >
                      <Icon name={item.icon} size={10} />
                      {item.label}
                    </span>
                  )),
                )}
              </div>
            </div>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock title="Топбар и переключатель роли" note="Демо-режим прототипа">
        <div className="overflow-hidden rounded-md border border-hairline shadow-card">
          <div className="on-nav relative">
            <Topbar
              roleKey={roleKey}
              onRoleChange={setRole}
              notifications={4}
              breadcrumbs={[
                { label: 'QazExpoCongress', icon: 'building', href: '#' },
                { label: 'Мероприятия', href: '#' },
                { label: 'Astana Finance Days 2026', plate: 'EV-0142' },
              ]}
            />
          </div>
          <PageHeader
            icon="presentation"
            title="Реестр мероприятий"
            plate="348 записей"
            subtitle="Все мероприятия на объектах Общества: Конгресс-центр, Международный выставочный центр, Alem.AI."
            actions={
              <>
                <Button variant="secondary" iconLeft="download">
                  Выгрузить
                </Button>
                <Button variant="primary" iconLeft="plus">
                  Новое мероприятие
                </Button>
              </>
            }
            tabs={
              <Tabs
                value={tab}
                onChange={setTab}
                items={[
                  { key: 'main', label: 'Все', count: 348 },
                  { key: 'upcoming', label: 'Предстоящие', count: 42 },
                  { key: 'review', label: 'На согласовании', count: 11 },
                  { key: 'conflict', label: 'Конфликты', count: 2 },
                  { key: 'archive', label: 'Архив' },
                ]}
              />
            }
          />
        </div>
        <p className="mt-3 max-w-3xl text-xs leading-normal text-content-faint">
          Переключатель роли помечен табличкой «ДЕМО» и существует только в прототипе: в
          продуктивной системе роль приходит из Active Directory (раздел 6 ТЗ).
        </p>
      </DemoBlock>

      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Табы">
          <DemoLabel>underline — внутри карточки объекта</DemoLabel>
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { key: 'main', label: 'Основное' },
              { key: 'upcoming', label: 'Договоры', count: 2 },
              { key: 'review', label: 'Подрядчики', count: 3 },
              { key: 'conflict', label: 'Документы', count: 7 },
              { key: 'archive', label: 'История' },
            ]}
          />

          <DemoLabel className="mt-5">segmented — режим отображения данных</DemoLabel>
          <div className="flex flex-wrap gap-3">
            <Tabs
              variant="segmented"
              value={segment}
              onChange={setSegment}
              items={[
                { key: 'day', label: 'День' },
                { key: 'week', label: 'Неделя' },
                { key: 'month', label: 'Месяц' },
                { key: 'year', label: 'Год' },
              ]}
            />
            <Tabs
              variant="segmented"
              size="sm"
              value={segment}
              onChange={setSegment}
              items={[
                { key: 'day', label: 'Список', icon: 'list' },
                { key: 'month', label: 'Календарь', icon: 'calendar' },
              ]}
            />
          </div>

          <DemoLabel className="mt-5">С иконками и счётчиками</DemoLabel>
          <Tabs
            value={tab}
            onChange={setTab}
            size="sm"
            items={[
              { key: 'main', label: 'Мероприятия', icon: 'presentation', count: 42 },
              { key: 'upcoming', label: 'Договоры', icon: 'contract', count: 18 },
              { key: 'review', label: 'Пропуска', icon: 'shield', count: 5, disabled: true },
            ]}
          />
        </DemoBlock>

        <DemoBlock title="Крошки и пагинация">
          <DemoLabel>Путь по комплексу</DemoLabel>
          <div className="space-y-2.5">
            <Breadcrumbs
              items={[
                { label: 'QazExpoCongress', icon: 'building', href: '#' },
                { label: 'Календарь', href: '#' },
                { label: 'Март 2026' },
              ]}
            />
            <Breadcrumbs
              items={[
                { label: 'QazExpoCongress', icon: 'building', href: '#' },
                { label: 'Конгресс-центр', href: '#' },
                { label: 'Пленарный зал', plate: 'КЦ-А1' },
              ]}
            />
            <Breadcrumbs
              items={[
                { label: 'Договоры', href: '#' },
                { label: 'Astana Expo Group', href: '#' },
                { label: 'Договор аренды', plate: '№ 0142/25-АР' },
              ]}
            />
          </div>

          <DemoLabel className="mt-5">Пагинация</DemoLabel>
          <div className="space-y-3">
            <Pagination
              page={page}
              pageSize={25}
              total={348}
              onPageChange={setPage}
              onPageSizeChange={() => {}}
              entityForms={['мероприятие', 'мероприятия', 'мероприятий']}
              attached={false}
            />
            <Pagination
              page={1}
              pageSize={25}
              total={12}
              onPageChange={() => {}}
              entityForms={['договор', 'договора', 'договоров']}
              attached={false}
            />
            <Pagination
              page={1}
              pageSize={25}
              total={0}
              onPageChange={() => {}}
              attached={false}
            />
          </div>

          <DemoLabel className="mt-5">Таблички в навигации</DemoLabel>
          <div className="flex flex-wrap items-center gap-2">
            <HallPlate size="lg">QEC</HallPlate>
            <span className="text-xs text-content-faint">
              бренд-блок сайдбара — та же табличка, что у залов и договоров
            </span>
          </div>
        </DemoBlock>
      </div>
    </Section>
  )
}

export default NavigationSection
