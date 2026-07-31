import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { HallPlate } from '@/components/HallPlate'
import { StatusBadge, StatusDot } from '@/components/Status'
import { Icon } from '@/components/Icon'
import { HeroPanel } from '@/components/Card'
import { CountUp } from '@/components/Motion'
import { RingGauge, Sparkline, MeterBar } from '@/components/Instruments'
import { cn } from '@/lib/cn'
import { formatMoney } from '@/lib/format'
import { HALL_LOAD, TREND_REVENUE } from '@/demo/data'
import { ColorsSection } from './design-system/sections/ColorsSection'
import { TypographySection } from './design-system/sections/TypographySection'
import { StatusSection } from './design-system/sections/StatusSection'
import { DepthSection } from './design-system/sections/DepthSection'
import { InstrumentsSection } from './design-system/sections/InstrumentsSection'
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
  { id: 'depth', num: '04', label: 'Свет и глубина' },
  { id: 'instruments', num: '05', label: 'Инструменты' },
  { id: 'layout', num: '06', label: 'Сетка' },
  { id: 'buttons', num: '07', label: 'Кнопки' },
  { id: 'forms', num: '08', label: 'Поля' },
  { id: 'cards', num: '09', label: 'Карточки' },
  { id: 'tables', num: '10', label: 'Таблицы' },
  { id: 'overlays', num: '11', label: 'Окна и панели' },
  { id: 'navigation', num: '12', label: 'Навигация' },
  { id: 'feedback', num: '13', label: 'Уведомления' },
]

const SECTION_IDS = SECTIONS.map((section) => section.id)

/** Отслеживание видимого раздела для подсветки в липкой навигации */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])

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

  return active
}

/** Опора дизайн-направления в hero-полосе */
function Pillar({ label, title, description, children }) {
  return (
    <div className="relative overflow-hidden rounded-md border border-nav-line bg-nav-hover p-3.5">
      <p className="text-2xs font-semibold uppercase tracking-label text-nav-subtle">{label}</p>
      <div className="mt-2 flex items-center gap-2.5">
        {children}
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-nav-fg">{title}</p>
          <p className="mt-0.5 text-xs leading-snug text-nav-subtle">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default function DesignSystem() {
  const active = useActiveSection(SECTION_IDS)

  function goTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="pb-16">
      {/* ═══ HERO — корпус прибора ═══════════════════════════ */}
      <HeroPanel className="border-t-0">
        <div className="px-5 pb-6 pt-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <HallPlate tone="beam" size="lg">
                  Шаг 0
                </HallPlate>
                <StatusBadge status="confirmed" label="Дизайн-система" />
                <span className="text-2xs font-semibold uppercase tracking-label text-nav-subtle">
                  v0.2 · приборная панель
                </span>
              </div>

              <h1 className="mt-3.5 text-4xl font-semibold leading-tight tracking-tight text-nav-fg">
                Информационная система учёта мероприятий
              </h1>
              <p className="mt-2 text-md leading-normal text-nav-muted">
                Токены и библиотека компонентов для объектов АО «НК «QazExpoCongress»:
                Конгресс-центр, Международный выставочный центр, Alem.AI. Тёмный корпус несёт
                навигацию и сводку, светлые поверхности — рабочие данные.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button variant="primary-dark" iconLeft="layers" onClick={() => goTo('instruments')}>
                  Смотреть инструменты
                </Button>
                <Button variant="secondary-dark" iconLeft="palette" onClick={() => goTo('depth')}>
                  Свет и глубина
                </Button>
                <Button variant="ghost-dark" iconLeft="download">
                  Экспорт токенов
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-nav-line pt-3.5">
                <span className="text-2xs font-semibold uppercase tracking-label text-nav-subtle">
                  8 статусных токенов
                </span>
                {['confirmed', 'review', 'conflict', 'unpaid', 'done'].map((key) => (
                  <StatusDot key={key} status={key} withLabel onDark />
                ))}
              </div>
            </div>

            {/* Живая сводка: показывает систему в работе, а не в описании */}
            <div className="flex min-w-0 flex-wrap items-start gap-5">
              <div className="flex flex-col items-center">
                <RingGauge value={68} onDark size={112} stroke={7} sublabel="загрузка" />
                <span className="mt-2 text-2xs uppercase tracking-label text-nav-subtle">
                  комплекс · март
                </span>
              </div>

              <div className="w-48 space-y-3">
                {HALL_LOAD.slice(0, 3).map((item) => (
                  <MeterBar
                    key={item.hall}
                    label={item.hall}
                    value={item.load}
                    valueLabel={`${item.load}%`}
                    threshold={item.plan}
                    thresholdLabel={`план ${item.plan}%`}
                    onDark
                    size="sm"
                    tone={item.load >= item.plan ? 'confirmed' : 'beam'}
                  />
                ))}
              </div>

              <div className="w-52">
                <p className="text-2xs font-semibold uppercase tracking-label text-nav-subtle">
                  Сумма договоров
                </p>
                <p className="mt-1 text-3xl font-semibold leading-none tabular-nums text-nav-fg">
                  <CountUp value={252100000} format={(v) => formatMoney(v)} />
                </p>
                <Sparkline data={TREND_REVENUE} width={208} height={44} onDark className="mt-2" />
              </div>
            </div>
          </div>

          {/* Три опоры направления */}
          <div className="mt-6 grid gap-3 lg:grid-cols-3">
            <Pillar
              label="Корпус и структура"
              title="Каркас + структура"
              description="Тёмная навигация, синие действия, холодная нейтральная шкала"
            >
              <span className="flex shrink-0 gap-1">
                <span className="h-9 w-5 rounded-sm border border-nav-line bg-nav" />
                <span className="h-9 w-5 rounded-sm border border-nav-line bg-primary" />
              </span>
            </Pillar>

            <Pillar
              label="Свет"
              title="Свет · только линии"
              description="Активный пункт, фокус, индикаторы, графики. Заливок нет"
            >
              <span
                className="h-9 w-10 shrink-0 rounded-sm border border-accent-line bg-nav-sunken"
                style={{ boxShadow: 'inset 0 0 12px 0 rgba(53,214,240,0.35)' }}
              />
            </Pillar>

            <Pillar
              label="Подписная деталь"
              title="Кромка + табличка"
              description="Светящаяся кромка 3px у всего, что имеет статус"
            >
              <span className="flex shrink-0 flex-col gap-1">
                <HallPlate size="sm" tone="beam">
                  КЦ-А1
                </HallPlate>
                <HallPlate size="sm" tone="inverse">
                  0142/25
                </HallPlate>
              </span>
            </Pillar>
          </div>
        </div>
      </HeroPanel>

      {/* ═══ Липкая навигация по разделам ════════════════════ */}
      <nav
        aria-label="Разделы дизайн-системы"
        className="sticky top-0 z-sticky border-b border-hairline bg-surface/95 shadow-bevel backdrop-blur"
      >
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto px-5 py-2">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => goTo(section.id)}
              className={cn(
                'focus-ring relative inline-flex h-7 shrink-0 items-center gap-1.5 rounded border px-2 text-xs font-medium transition-all duration-fast',
                active === section.id
                  ? 'border-accent-line bg-accent-soft text-accent-strong shadow-beam-sm'
                  : 'border-transparent text-content-subtle hover:bg-surface-muted hover:text-content',
              )}
            >
              <span
                className={cn(
                  'font-mono text-2xs',
                  active === section.id ? 'text-accent' : 'text-content-faint',
                )}
              >
                {section.num}
              </span>
              {section.label}
            </button>
          ))}
          <span className="ml-auto hidden shrink-0 items-center gap-1.5 pl-4 text-2xs text-content-faint xl:flex">
            <Icon name="info" size={11} />
            Проверка визуальной консистентности
          </span>
        </div>
      </nav>

      {/* ═══ Разделы ════════════════════════════════════════ */}
      <div className="px-5">
        <ColorsSection />
        <TypographySection />
        <StatusSection />
        <DepthSection />
        <InstrumentsSection />
        <LayoutSection />
        <ButtonsSection />
        <FormsSection />
        <CardsSection />
        <TableSection />
        <OverlaysSection />
        <NavigationSection />
        <FeedbackSection />

        {/* ═══ Итог ═════════════════════════════════════════ */}
        <section className="pt-9">
          <div className="on-nav relative overflow-hidden rounded-md border border-nav-line bg-surface-nav shadow-card">
            <span aria-hidden="true" className="dot-grid absolute inset-0 opacity-60" />
            <span aria-hidden="true" className="bloom-beam absolute inset-0" />
            <span aria-hidden="true" className="beam-edge-soft absolute inset-x-0 top-0" />
            <div className="relative p-5">
              <div className="flex flex-wrap items-center gap-2">
                <HallPlate tone="beam">Шаг 0</HallPlate>
                <StatusBadge status="confirmed" label="Дизайн-система готова" />
              </div>
              <h2 className="mt-2.5 text-xl font-semibold text-nav-fg">Что дальше</h2>
              <p className="mt-1 max-w-3xl text-base leading-normal text-nav-muted">
                Токены, палитра статусов, слой света и глубины, инструменты визуализации и
                библиотека компонентов закрыты. Следующие шаги собираются из этих блоков без новых
                визуальных решений.
              </p>
              <ul className="mt-3.5 grid gap-1.5 text-base text-nav-muted sm:grid-cols-2 lg:grid-cols-3">
                {[
                  'Дашборд руководителя',
                  'Календарь занятости помещений',
                  'Реестр мероприятий',
                  'Реестр договоров',
                  'Карточки арендаторов и подрядчиков',
                  'Личный кабинет арендатора',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Icon name="chevron-right" size={12} className="text-accent" />
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
