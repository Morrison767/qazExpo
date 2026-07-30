import { useState } from 'react'
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
import { Tabs } from '@/components/Tabs'
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

export function InstrumentsSection() {
  const [surface, setSurface] = useState('light')
  const onDark = surface === 'dark'

  const Wrapper = ({ children, className = '' }) =>
    onDark ? (
      <div
        className={`on-obsidian relative overflow-hidden rounded-md border border-obsidian-600/70 bg-surface-obsidian p-4 ${className}`}
      >
        <span aria-hidden="true" className="dot-grid absolute inset-0 opacity-60" />
        <span aria-hidden="true" className="bloom-beam absolute inset-0" />
        <div className="relative">{children}</div>
      </div>
    ) : (
      <div className={`rounded-md border border-hairline bg-surface-raised p-4 shadow-card ${className}`}>
        {children}
      </div>
    )

  return (
    <Section
      id="instruments"
      num="05"
      title="Инструменты"
      description="Система про загрузку помещений, деньги и сроки не должна подавать эти величины только текстом. Каждый инструмент решает конкретную задачу отчётности из раздела 5.8 ТЗ и работает и на светлой поверхности, и на корпусе."
    >
      <div className="flex items-center gap-3">
        <Tabs
          variant="segmented"
          size="sm"
          value={surface}
          onChange={setSurface}
          items={[
            { key: 'light', label: 'Рабочая поверхность' },
            { key: 'dark', label: 'Корпус прибора' },
          ]}
        />
        <span className="text-xs text-ink-400">
          переключите, чтобы проверить оба состояния инструментов
        </span>
      </div>

      {/* ── Спарклайны и плитки ───────────────────────────── */}
      <DemoBlock title="Спарклайн" note="Тренд без осей — рядом с числом" tone="canvas">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            tone={surface}
            label="Мероприятий в марте"
            countTo={14}
            delta="+3"
            deltaTone="up"
            hint="к февралю"
            instrument={<Sparkline data={TREND_EVENTS} onDark={onDark} />}
          />
          <StatTile
            tone={surface}
            label="Сумма договоров"
            countTo={252}
            unit="млн ₸"
            delta="+18,4%"
            deltaTone="up"
            hint="к плану квартала"
            instrument={<Sparkline data={TREND_REVENUE} tone="confirmed" onDark={onDark} />}
          />
          <StatTile
            tone={surface}
            label="Задолженность"
            countTo={126}
            unit="млн ₸"
            delta="−4,2%"
            deltaTone="down"
            hint="1 договор просрочен"
            status="unpaid"
            instrument={<Sparkline data={TREND_DEBT} tone="unpaid" onDark={onDark} />}
          />
          <StatTile
            tone={surface}
            label="Загрузка комплекса"
            countTo={68}
            unit="%"
            hint="все объекты"
            instrument={
              <RingGauge value={68} size={56} stroke={5} onDark={onDark} animate />
            }
          />
        </div>
      </DemoBlock>

      {/* ── Шкалы ─────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Шкала заполнения" note="Загрузка зала, исполнение плана, доля оплаты">
          <Wrapper>
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
                  onDark={onDark}
                  hint={`план ${item.plan}%`}
                />
              ))}
            </div>
          </Wrapper>
          <p className="mt-3 text-xs leading-normal text-ink-400">
            Вертикальная риска — план. Тон шкалы меняется по отношению к плану: перевыполнено —
            зелёный, критично низко — оранжевый. Цвет дублируется числом, поэтому дальтонизм не
            мешает.
          </p>
        </DemoBlock>

        <DemoBlock title="Кольцевые шкалы" note="Один показатель крупно">
          <Wrapper>
            <div className="flex flex-wrap items-start justify-around gap-4">
              <RingGauge
                value={68}
                onDark={onDark}
                label="Загрузка"
                sublabel="март"
                tone="beam"
              />
              <RingGauge
                value={82}
                onDark={onDark}
                label="Согласовано"
                sublabel="договоров"
                tone="confirmed"
              />
              <RingGauge
                value={34}
                onDark={onDark}
                label="Оплачено"
                sublabel="от суммы"
                tone="unpaid"
              />
            </div>
          </Wrapper>
        </DemoBlock>
      </div>

      {/* ── Полоса занятости ──────────────────────────────── */}
      <DemoBlock
        title="Полоса занятости"
        note="Календарная лента по дням — основа календаря помещений"
      >
        <Wrapper>
          <div className="space-y-3">
            {HALL_OCCUPANCY.map((row) => (
              <OccupancyStrip
                key={row.hall}
                label={row.hall}
                hint={row.hint}
                days={row.days.map((s, i) => ({ status: s, label: `${i + 1}.03` }))}
                onDark={onDark}
              />
            ))}
          </div>
          <div
            className={`mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-3 ${
              onDark ? 'border-white/[0.08]' : 'border-hairline-soft'
            }`}
          >
            {['confirmed', 'review', 'conflict', 'done', 'draft'].map((key) => (
              <StatusDot key={key} status={key} withLabel onDark={onDark} />
            ))}
          </div>
        </Wrapper>
        <p className="mt-3 max-w-3xl text-xs leading-normal text-ink-400">
          Конфликт по КЦ-Б2 на 15 марта виден как разрыв ритма — штриховая ячейка между двумя
          согласованиями. Именно это требование раздела 5.2 ТЗ: пересечения по помещениям и
          времени должны быть видны на календаре.
        </p>
      </DemoBlock>

      {/* ── Матрица и столбцы ─────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Тепловая матрица" note="Сезонность: объекты × месяцы">
          <Wrapper>
            <HeatCells rows={HEAT_ROWS} columns={MONTHS} onDark={onDark} />
          </Wrapper>
          <p className="mt-3 text-xs leading-normal text-ink-400">
            Видно, где комплекс простаивает (июль–август) и где перегружен (март, октябрь).
            Основа отчёта «эффективность использования объектов».
          </p>
        </DemoBlock>

        <DemoBlock title="Столбцы" note="Распределение по месяцам">
          <Wrapper>
            <DemoLabel className={onDark ? 'text-obsidian-300' : undefined}>
              Мероприятий по месяцам
            </DemoLabel>
            <MiniBars
              data={TREND_EVENTS}
              labels={MONTHS}
              highlightIndex={2}
              height={64}
              onDark={onDark}
            />
            <div className={`mt-4 border-t pt-3 ${onDark ? 'border-white/[0.08]' : 'border-hairline-soft'}`}>
              <DemoLabel className={onDark ? 'text-obsidian-300' : undefined}>
                Выручка, млн ₸
              </DemoLabel>
              <MiniBars
                data={TREND_REVENUE}
                labels={MONTHS}
                highlightIndex={9}
                height={48}
                tone="confirmed"
                onDark={onDark}
              />
            </div>
          </Wrapper>
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
                  <span className="text-2xs font-semibold uppercase tracking-label text-obsidian-300">
                    Сводка по комплексу
                  </span>
                </div>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="text-7xl font-semibold leading-none tabular-nums text-obsidian-50">
                    <CountUp value={14} />
                  </span>
                  <span className="text-lg text-obsidian-200">мероприятий</span>
                </p>
                <p className="mt-2 text-base text-obsidian-200">
                  <span className="font-semibold text-beam-300">
                    <CountUp value={252100000} format={(v) => formatMoney(v)} />
                  </span>{' '}
                  по договорам · 2 конфликта брони требуют решения
                </p>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  <Button variant="primary-dark" size="sm" iconLeft="alert-triangle">
                    Разрешить конфликты
                  </Button>
                  <Button variant="secondary-dark" size="sm" iconLeft="download">
                    Отчёт для руководства
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <RingGauge value={68} onDark label="Загрузка" sublabel="комплекс" size={104} />
                <div className="w-52 space-y-3">
                  {HALL_LOAD.slice(0, 3).map((item) => (
                    <MeterBar
                      key={item.hall}
                      label={item.hall}
                      value={item.load}
                      valueLabel={`${item.load}%`}
                      threshold={item.plan}
                      onDark
                      size="sm"
                      tone={item.load >= item.plan ? 'confirmed' : 'beam'}
                    />
                  ))}
                </div>
                <div className="w-44">
                  <p className="mb-1.5 text-2xs font-semibold uppercase tracking-label text-obsidian-300">
                    Выручка, 12 мес.
                  </p>
                  <Sparkline
                    data={TREND_REVENUE}
                    width={176}
                    height={52}
                    onDark
                    strokeWidth={1.75}
                  />
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
            ['Sparkline', 'Количество мероприятий, сумма договоров, задолженность — тренд за период'],
            ['MeterBar', 'Загрузка помещений против плана; доля оплаченного в договоре'],
            ['OccupancyStrip', 'Календарь занятости: свободные/занятые даты, монтаж, пересечения'],
            ['RingGauge', 'Загрузка объекта, доля согласованных договоров — один показатель крупно'],
            ['HeatCells', 'Эффективность использования объектов: сезонность по месяцам'],
            ['MiniBars', 'Количество мероприятий по объектам и арендаторам'],
          ]}
        />
      </DemoBlock>
    </Section>
  )
}

export default InstrumentsSection
