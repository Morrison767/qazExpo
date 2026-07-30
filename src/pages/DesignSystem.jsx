import { useEffect, useRef, useState } from 'react'
import { PageHeader } from '@/components/Topbar'
import { Button } from '@/components/Button'
import { HallPlate } from '@/components/HallPlate'
import { StatusBadge } from '@/components/Status'
import { Icon } from '@/components/Icon'
import { cn } from '@/lib/cn'
import { ColorsSection } from './design-system/sections/ColorsSection'
import { TypographySection } from './design-system/sections/TypographySection'
import { StatusSection } from './design-system/sections/StatusSection'
import { LayoutSection } from './design-system/sections/LayoutSection'
import { ButtonsSection } from './design-system/sections/ButtonsSection'
import { FormsSection } from './design-system/sections/FormsSection'
import { CardsSection } from './design-system/sections/CardsSection'
import { TableSection } from './design-system/sections/TableSection'
import { OverlaysSection } from './design-system/sections/OverlaysSection'
import { NavigationSection } from './design-system/sections/NavigationSection'
import { FeedbackSection } from './design-system/sections/FeedbackSection'

const SECTIONS = [
  { id: 'colors', num: '01', label: 'Цвет' },
  { id: 'typography', num: '02', label: 'Типографика' },
  { id: 'statuses', num: '03', label: 'Статусы' },
  { id: 'layout', num: '04', label: 'Сетка' },
  { id: 'buttons', num: '05', label: 'Кнопки' },
  { id: 'forms', num: '06', label: 'Поля' },
  { id: 'cards', num: '07', label: 'Карточки' },
  { id: 'tables', num: '08', label: 'Таблицы' },
  { id: 'overlays', num: '09', label: 'Окна и панели' },
  { id: 'navigation', num: '10', label: 'Навигация' },
  { id: 'feedback', num: '11', label: 'Уведомления' },
]

/** Отслеживание видимого раздела для подсветки в липкой навигации */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-72px 0px -70% 0px', threshold: 0 },
    )
    ids.forEach((id) => {
      const node = document.getElementById(id)
      if (node) observer.observe(node)
    })
    return () => observer.disconnect()
  }, [ids])

  return [active, ref]
}

const SECTION_IDS = SECTIONS.map((section) => section.id)

export default function DesignSystem() {
  const [active] = useActiveSection(SECTION_IDS)

  function goTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="pb-16">
      <PageHeader
        icon="palette"
        title="Дизайн-система"
        plate="v0.1 · шаг 0"
        subtitle="Токены и библиотека компонентов информационной системы учёта, планирования и сопровождения мероприятий на объектах АО «НК «QazExpoCongress». Экраны собираются из этих блоков на следующих шагах."
        actions={
          <>
            <Button variant="secondary" iconLeft="download">
              Экспорт токенов
            </Button>
            <Button variant="primary" iconLeft="layers">
              Собрать экран
            </Button>
          </>
        }
      />

      {/* ── Три опоры дизайн-направления ────────────────── */}
      <div className="border-b border-hairline bg-white px-5 py-5">
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-md border border-hairline bg-canvas pl-rail">
            <span className="absolute inset-y-0 left-0 w-rail rounded-l-[5px] bg-navy-600" />
            <div className="p-3.5">
              <p className="text-2xs font-semibold uppercase tracking-label text-ink-400">
                Акцент
              </p>
              <div className="mt-2 flex items-center gap-2.5">
                <span className="h-9 w-9 shrink-0 rounded border border-black/5 bg-navy-600" />
                <div className="min-w-0">
                  <p className="text-base font-semibold text-ink-900">Ink Navy · #1B3A6B</p>
                  <p className="text-xs text-ink-500">
                    Синий навигационных табло комплекса + сигнальный янтарь #D97706
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-md border border-hairline bg-canvas pl-rail">
            <span className="absolute inset-y-0 left-0 w-rail rounded-l-[5px] bg-ink-400" />
            <div className="p-3.5">
              <p className="text-2xs font-semibold uppercase tracking-label text-ink-400">
                Шрифт
              </p>
              <div className="mt-2 flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-hairline bg-white text-lg font-semibold text-ink-900">
                  Аа
                </span>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-ink-900">IBM Plex Sans · 13px</p>
                  <p className="text-xs text-ink-500">
                    Кириллица-native, табличные цифры; Plex Mono — только идентификаторы
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-md border border-navy-200 bg-navy-50 pl-rail">
            <span className="absolute inset-y-0 left-0 w-rail rounded-l-[5px] bg-status-conflict-base hazard-stripes text-status-conflict-base" />
            <div className="p-3.5">
              <p className="text-2xs font-semibold uppercase tracking-label text-navy-600">
                Подписная деталь
              </p>
              <div className="mt-2 flex items-center gap-2.5">
                <div className="flex shrink-0 flex-col gap-1">
                  <HallPlate size="sm">КЦ-А1</HallPlate>
                  <HallPlate size="sm" tone="outline">
                    0142/25
                  </HallPlate>
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-navy-900">
                    Сигнальная кромка + табличка
                  </p>
                  <p className="text-xs text-navy-700">
                    Кромка 4px слева у всего, что имеет статус; моно-табличка с идентификатором
                    объекта
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Липкая навигация по разделам ────────────────── */}
      <nav
        aria-label="Разделы дизайн-системы"
        className="sticky top-0 z-sticky border-b border-hairline bg-white/95 backdrop-blur"
      >
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto px-5 py-2">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => goTo(section.id)}
              className={cn(
                'focus-ring inline-flex h-7 shrink-0 items-center gap-1.5 rounded border px-2 text-xs font-medium transition-colors duration-fast',
                active === section.id
                  ? 'border-navy-200 bg-navy-50 text-navy-700'
                  : 'border-transparent text-ink-500 hover:bg-ink-100 hover:text-ink-900',
              )}
            >
              <span
                className={cn(
                  'font-mono text-2xs',
                  active === section.id ? 'text-navy-500' : 'text-ink-300',
                )}
              >
                {section.num}
              </span>
              {section.label}
            </button>
          ))}
          <span className="ml-auto hidden shrink-0 items-center gap-1.5 pl-4 text-2xs text-ink-400 xl:flex">
            <Icon name="info" size={11} />
            Проверка визуальной консистентности
          </span>
        </div>
      </nav>

      {/* ── Разделы ─────────────────────────────────────── */}
      <div className="px-5">
        <ColorsSection />
        <TypographySection />
        <StatusSection />
        <LayoutSection />
        <ButtonsSection />
        <FormsSection />
        <CardsSection />
        <TableSection />
        <OverlaysSection />
        <NavigationSection />
        <FeedbackSection />

        {/* ── Итог ─────────────────────────────────────── */}
        <section className="pt-9">
          <div className="relative overflow-hidden rounded-md border border-hairline bg-white pl-rail shadow-xs">
            <span className="absolute inset-y-0 left-0 w-rail rounded-l-[5px] bg-status-confirmed-base" />
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <HallPlate>Шаг 0</HallPlate>
                <StatusBadge status="confirmed" label="Дизайн-система готова" />
              </div>
              <h2 className="mt-2.5 text-xl font-semibold text-ink-900">Что дальше</h2>
              <p className="mt-1 max-w-3xl text-base leading-normal text-ink-500">
                Токены, палитра статусов и библиотека компонентов закрыты. Следующие шаги собираются
                из этих блоков без новых визуальных решений: дашборд с KPI-плитками, календарь
                занятости помещений, реестры мероприятий и договоров, карточки объектов в
                слайд-панелях, личный кабинет арендатора.
              </p>
              <ul className="mt-3 grid gap-1.5 text-base text-ink-600 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  'Дашборд руководителя',
                  'Календарь занятости помещений',
                  'Реестр мероприятий',
                  'Реестр договоров',
                  'Карточки арендаторов и подрядчиков',
                  'Личный кабинет арендатора',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Icon name="chevron-right" size={12} className="text-navy-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
