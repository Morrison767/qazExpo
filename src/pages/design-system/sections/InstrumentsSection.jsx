import { Section, DemoBlock, DemoLabel, SpecTable } from '../parts'
import {
  Sparkline,
  MeterBar,
  OccupancyStrip,
  RingGauge,
  HeatCells,
  MiniBars,
} from '@/components/Instruments'
import { StatTile, HeroPanel } from '@/components/Card'
import { StatusDot } from '@/components/Status'
import { HallPlate } from '@/components/HallPlate'
import { Button } from '@/components/Button'
import { CountUp } from '@/components/Motion'
import {
  HALL_LOAD,
  HALL_OCCUPANCY,
  HEAT_ROWS,
  MONTHS,
  TREND_DEBT,
  TREND_EVENTS,
  TREND_REVENUE,
} from '@/demo/data'
import { formatMoney } from '@/lib/format'

/** Локальная подложка под инструменты */
function Panel({ children, className = '' }) {
  return (
    <div
      className={`rounded-md border border-hairline bg-surface-raised p-4 shadow-card ${className}`}
    >
      {children}
    </div>
  )
}

export function InstrumentsSection() {
  return (
    <Section
      id="instruments"
      num="05"
      title="Инструменты"
      description="Система про загрузку помещений, деньги и сроки не должна подавать эти величины только текстом. Каждый инструмент решает конкретную задачу отчётности из раздела 5.8 ТЗ. Тон линий приходит из активной темы — переключите тему в топбаре, чтобы проверить оба состояния."
    >
      {/* ── Спарклайны и плитки ───────────────────────────── */}
      <DemoBlock
        title="Приборные плитки"
        note="Чип иконки, досчёт величины, слот под инструмент"
        tone="canvas"
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Мероприятий в марте"
            countTo={14}
            delta="+3"
            deltaTone="up"
            hint="к февралю"
            icon="presentation"
            chip="accent"
            instrument={<Sparkline data={TREND_EVENTS} />}
          />
          <StatTile
            label="Сумма договоров"
            countTo={252}
            unit="млн ₸"
            delta="+18,4%"
            deltaTone="up"
            hint="к плану квартала"
            icon="wallet"
            chip="confirmed"
            instrument={<Sparkline data={TREND_REVENUE} tone="confirmed" />}
          />
          <StatTile
            label="Задолженность"
            countTo={126}
            unit="млн ₸"
            delta="−4,2%"
            deltaTone="down"
            hint="1 договор просрочен"
            icon="alert-circle"
            chip="unpaid"
            status="unpaid"
            instrument={<Sparkline data={TREND_DEBT} tone="unpaid" />}
          />
          <StatTile
            label="Загрузка комплекса"
            countTo={68}
            unit="%"
            hint="все объекты"
            icon="chart"
            chip="paid"
            instrument={<RingGauge value={68} size={56} stroke={5} animate />}
          />
        </div>
      </DemoBlock>

      {/* ── Шкалы ─────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Шкала заполнения" note="Загрузка зала, исполнение плана, доля оплаты">
          <Panel>
            <div className="space-y-3.5">
              {HALL_LOAD.map((item) => (
                <MeterBar
                  key={item.hall}
                  label={item.hall}
                  value={item.load}
                  valueLabel={`${item.load}%`}
                  threshold={item.plan}
                  thresholdLabel={`План ${item.plan}%`}
                  tone={item.load >= item.plan ? 'confirmed' : item.load < 25 ? 'unpaid' : 'beam'}
                  hint={`план ${item.plan}%`}
                />
              ))}
            </div>
          </Panel>
          <p className="mt-3 text-xs leading-normal text-content-faint">
            Вертикальная риска — план. Тон шкалы меняется по отношению к плану: перевыполнено —
            зелёный, критично низко — оранжевый. Цвет дублируется числом, поэтому дальтонизм не
            мешает.
          </p>
        </DemoBlock>

        <DemoBlock title="Кольцевые шкалы" note="Один показатель крупно">
          <Panel>
            <div className="flex flex-wrap items-start justify-around gap-4">
              <RingGauge value={68} label="Загрузка" sublabel="март" tone="beam" />
              <RingGauge value={82} label="Согласовано" sublabel="договоров" tone="confirmed" />
              <RingGauge value={34} label="Оплачено" sublabel="от суммы" tone="unpaid" />
            </div>
          </Panel>
        </DemoBlock>
      </div>

      {/* ── Полоса занятости ──────────────────────────────── */}
      <DemoBlock
        title="Полоса занятости"
        note="Календарная лента по дням — основа календаря помещений"
      >
        <Panel>
          <div className="space-y-3">
            {HALL_OCCUPANCY.map((row) => (
              <OccupancyStrip
                key={row.hall}
                label={row.hall}
                hint={row.hint}
                days={row.days.map((s, i) => ({ status: s, label: `${i + 1}.03` }))}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-hairline-soft pt-3">
            {['confirmed', 'review', 'conflict', 'done', 'draft'].map((key) => (
              <StatusDot key={key} status={key} withLabel />
            ))}
          </div>
        </Panel>
        <p className="mt-3 max-w-3xl text-xs leading-normal text-content-faint">
          Конфликт по КЦ-Б2 на 15 марта виден как разрыв ритма — штриховая ячейка между двумя
          согласованиями. Именно это требование раздела 5.2 ТЗ: пересечения по помещениям и
          времени должны быть видны на календаре.
        </p>
      </DemoBlock>

      {/* ── Матрица и столбцы ─────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Тепловая матрица" note="Сезонность: объекты × месяцы">
          <Panel>
            <HeatCells rows={HEAT_ROWS} columns={MONTHS} />
          </Panel>
          <p className="mt-3 text-xs leading-normal text-content-faint">
            Видно, где комплекс простаивает (июль–август) и где перегружен (март, октябрь). Основа
            отчёта «эффективность использования объектов».
          </p>
        </DemoBlock>

        <DemoBlock title="Столбцы" note="Распределение по месяцам">
          <Panel>
            <DemoLabel>Мероприятий по месяцам</DemoLabel>
            <MiniBars data={TREND_EVENTS} labels={MONTHS} highlightIndex={2} height={64} />
            <div className="mt-4 border-t border-hairline-soft pt-3">
              <DemoLabel>Выручка, млн ₸</DemoLabel>
              <MiniBars
                data={TREND_REVENUE}
                labels={MONTHS}
                highlightIndex={9}
                height={48}
                tone="confirmed"
              />
            </div>
          </Panel>
        </DemoBlock>
      </div>

      {/* ── Hero-полоса ───────────────────────────────────── */}
      <div>
        <DemoLabel>Hero-полоса сводки — как это соберётся на дашборде</DemoLabel>
        <HeroPanel className="rounded-md border-x">
          <div className="px-5 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <HallPlate tone="beam">Март 2026</HallPlate>
                  <span className="text-2xs font-semibold uppercase tracking-label text-content-subtle">
                    Сводка по комплексу
                  </span>
                </div>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="text-7xl font-semibold leading-none tabular-nums text-content">
                    <CountUp value={14} />
                  </span>
                  <span className="text-lg text-content-subtle">мероприятий</span>
                </p>
                <p className="mt-2 text-base text-content-muted">
                  <span className="font-semibold text-accent-fg">
                    <CountUp value={252100000} format={(v) => formatMoney(v)} />
                  </span>{' '}
                  по договорам · 2 конфликта брони требуют решения
                </p>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  <Button variant="beam" size="sm" iconLeft="alert-triangle">
                    Разрешить конфликты
                  </Button>
                  <Button variant="secondary" size="sm" iconLeft="download">
                    Отчёт для руководства
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <RingGauge value={68} label="Загрузка" sublabel="комплекс" size={104} />
                <div className="w-52 space-y-3">
                  {HALL_LOAD.slice(0, 3).map((item) => (
                    <MeterBar
                      key={item.hall}
                      label={item.hall}
                      value={item.load}
                      valueLabel={`${item.load}%`}
                      threshold={item.plan}
                      size="sm"
                      tone={item.load >= item.plan ? 'confirmed' : 'beam'}
                    />
                  ))}
                </div>
                <div className="w-44">
                  <p className="mb-1.5 text-2xs font-semibold uppercase tracking-label text-content-subtle">
                    Выручка, 12 мес.
                  </p>
                  <Sparkline data={TREND_REVENUE} width={176} height={52} strokeWidth={1.75} />
                </div>
              </div>
            </div>
          </div>
        </HeroPanel>
      </div>

      <DemoBlock title="Какой инструмент под какую задачу ТЗ">
        <SpecTable
          head={['Инструмент', 'Отчёт / раздел ТЗ']}
          rows={[
            [
              'Sparkline',
              'Количество мероприятий, сумма договоров, задолженность — тренд за период',
            ],
            ['MeterBar', 'Загрузка помещений против плана; доля оплаченного в договоре'],
            ['OccupancyStrip', 'Календарь занятости: свободные/занятые даты, монтаж, пересечения'],
            [
              'RingGauge',
              'Загрузка объекта, доля согласованных договоров — один показатель крупно',
            ],
            ['HeatCells', 'Эффективность использования объектов: сезонность по месяцам'],
            ['MiniBars', 'Количество мероприятий по объектам и арендаторам'],
          ]}
        />
      </DemoBlock>
    </Section>
  )
}

export default InstrumentsSection
