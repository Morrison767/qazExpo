import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { PageHeader } from '@/components/Topbar'
import { Button, IconButton } from '@/components/Button'
import { Tabs } from '@/components/Tabs'
import { Select } from '@/components/Field'
import { StatTile } from '@/components/Card'
import { StatusBadge, StatusDot, StatusRail } from '@/components/Status'
import { HallPlate } from '@/components/HallPlate'
import { Badge } from '@/components/Badge'
import { DataTable } from '@/components/Table'
import { Sparkline, RingGauge } from '@/components/Instruments'
import { Skeleton } from '@/components/Motion'
import { Icon } from '@/components/Icon'
import { EmptyState } from '@/components/EmptyState'
import {
  ChartCard,
  ChartEmpty,
  ChartTooltip,
  LegendItem,
  axisProps,
  useChartTheme,
} from '@/components/Chart'
import { cn } from '@/lib/cn'
import { formatDate, formatDateRange, formatMoney, formatNumber, plural } from '@/lib/format'
import { getDashboardData, OBJECT_FILTER_OPTIONS, PERIODS, toMillions } from '@/demo/dashboard'
import { objectByKey } from '@/demo/events'
import { useEvents } from '@/app/EventsContext'

/* ─────────────────────────────────────────────────────────────
   Блок «Требуют внимания»: группа проблемных вопросов
   ───────────────────────────────────────────────────────────── */
function AttentionGroup({ icon, tone, title, items, renderItem, onOpen, emptyText }) {
  const chips = {
    conflict: 'bg-status-conflict-soft text-status-conflict-text border-status-conflict-border',
    unpaid: 'bg-status-unpaid-soft text-status-unpaid-text border-status-unpaid-border',
    review: 'bg-status-review-soft text-status-review-text border-status-review-border',
    draft: 'bg-status-draft-soft text-status-draft-text border-status-draft-border',
  }

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex items-center gap-2 pb-2.5">
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded border',
            chips[tone] ?? chips.draft,
          )}
        >
          <Icon name={icon} size={13} />
        </span>
        <span className="min-w-0 flex-1 truncate text-2xs font-semibold uppercase tracking-label text-content-subtle">
          {title}
        </span>
        <span className="shrink-0 text-md font-semibold tabular-nums text-content">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="rounded border border-dashed border-hairline px-2.5 py-3 text-center text-xs text-content-faint">
          {emptyText}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.slice(0, 3).map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onOpen(item)}
                className="focus-ring group relative w-full overflow-hidden rounded border border-hairline bg-surface pl-rail text-left transition-all duration-fast hover:border-hairline-strong hover:shadow-sm"
              >
                <StatusRail status={tone === 'review' ? 'review' : tone} glow={false} />
                <div className="px-2.5 py-2">{renderItem(item)}</div>
              </button>
            </li>
          ))}
          {items.length > 3 ? (
            <li>
              <button
                type="button"
                onClick={() => onOpen(items[0])}
                className="focus-ring w-full rounded px-2.5 py-1 text-left text-xs font-medium text-accent-fg hover:underline"
              >
                Ещё {items.length - 3} {plural(items.length - 3, ['запись', 'записи', 'записей'])} →
              </button>
            </li>
          ) : null}
        </ul>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Дашборд руководителя
   ───────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate()
  const chart = useChartTheme()
  const attentionRef = useRef(null)

  const [periodKey, setPeriodKey] = useState('month')
  const [objectKey, setObjectKey] = useState('all')
  const [loading, setLoading] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(() => new Date())

  /* Агрегаты считаются из общего store: статус, изменённый в карточке
     мероприятия, сразу меняет KPI и блок «Требуют внимания» */
  const { events } = useEvents()
  const data = useMemo(
    () => getDashboardData(periodKey, objectKey, events),
    [periodKey, objectKey, events],
  )

  /* Короткая пауза при смене фильтров — переключение читается как загрузка данных */
  function withLoading(action) {
    setLoading(true)
    action()
    window.setTimeout(() => setLoading(false), 420)
  }

  function refresh() {
    withLoading(() => setUpdatedAt(new Date()))
  }

  const financeTotal = data.finance.reduce((acc, item) => acc + item.value, 0)
  const periodLabel = `${formatDate(new Date(data.window.from))} — ${formatDate(new Date(data.window.to))}`
  const updatedLabel = updatedAt.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const dynamicsSeries = data.dynamics.map((d) => d.current)
  const contractsSeries = data.dynamics.map((d) => Math.max(1, d.current * 7 + 4))

  return (
    <div className="pb-10">
      <PageHeader
        icon="dashboard"
        title="Дашборд руководителя"
        subtitle={`Сводка по объектам Общества · ${periodLabel} · данные на ${updatedLabel}`}
        actions={
          <>
            <Tabs
              variant="segmented"
              size="sm"
              value={periodKey}
              onChange={(next) => withLoading(() => setPeriodKey(next))}
              items={PERIODS.map((p) => ({ key: p.key, label: p.label }))}
            />
            <Select
              size="md"
              value={objectKey}
              onChange={(event) => withLoading(() => setObjectKey(event.target.value))}
              options={OBJECT_FILTER_OPTIONS}
              className="w-48"
            />
            <IconButton icon="refresh" label="Обновить данные" onClick={refresh} loading={loading} />
            <Button variant="secondary" iconLeft="download">
              Excel
            </Button>
            <Button variant="primary" iconLeft="contract">
              Отчёт для руководства
            </Button>
          </>
        }
      />

      <div className="space-y-4 p-5">
        {/* ═══ Полоса «требуют внимания» ═══════════════════════ */}
        {data.attention.total > 0 ? (
          <button
            type="button"
            onClick={() =>
              attentionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className="focus-ring group relative flex w-full items-center gap-3 overflow-hidden rounded-md border border-status-conflict-border bg-status-conflict-soft pl-rail text-left transition-all duration-fast hover:shadow-sm"
          >
            <StatusRail status="conflict" />
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2.5">
              <span className="flex items-center gap-2 text-base font-semibold text-status-conflict-text">
                <Icon name="alert-triangle" size={15} />
                {data.attention.total}{' '}
                {plural(data.attention.total, ['вопрос', 'вопроса', 'вопросов'])} требуют внимания
              </span>
              <span className="text-xs text-status-conflict-text/90">
                конфликтов брони {data.attention.conflicts.length} · просроченных платежей{' '}
                {data.attention.overdue.length} · договоров с истекающим сроком{' '}
                {data.attention.expiring.length} · без согласования{' '}
                {data.attention.approvals.length}
              </span>
            </div>
            <span className="flex shrink-0 items-center gap-1 pr-3 text-xs font-medium text-status-conflict-text">
              Перейти
              <Icon
                name="arrow-right"
                size={13}
                className="transition-transform duration-fast group-hover:translate-x-0.5"
              />
            </span>
          </button>
        ) : null}

        {/* ═══ KPI ════════════════════════════════════════════ */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatTile
            label="Мероприятий в периоде"
            icon="presentation"
            chip="accent"
            countTo={data.kpi.events.value}
            delta={data.kpi.events.delta != null ? `${data.kpi.events.delta > 0 ? '+' : ''}${data.kpi.events.delta}%` : undefined}
            deltaTone={data.kpi.events.delta >= 0 ? 'up' : 'down'}
            hint={`подтверждено ${data.kpi.events.confirmed}`}
            instrument={
              dynamicsSeries.length > 1 ? <Sparkline data={dynamicsSeries} width={64} height={26} /> : null
            }
            onClick={() => navigate('/events')}
          />

          <StatTile
            label="Загрузка помещений"
            icon="chart"
            chip="paid"
            countTo={data.kpi.load.value}
            unit="%"
            delta={
              data.kpi.load.delta != null
                ? `${data.kpi.load.delta > 0 ? '+' : ''}${data.kpi.load.delta} п.п.`
                : undefined
            }
            deltaTone={data.kpi.load.delta >= 0 ? 'up' : 'down'}
            hint={objectKey === 'all' ? 'средняя по объектам' : objectByKey(objectKey)?.short}
            instrument={<RingGauge value={data.kpi.load.value} size={48} stroke={4} />}
            onClick={() => navigate('/calendar')}
          />

          <StatTile
            label="Сумма договоров"
            icon="wallet"
            chip="confirmed"
            countTo={Number(toMillions(data.kpi.contracts.value).replace(',', '.'))}
            countFormat={(v) => v.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            unit="млн ₸"
            delta={
              data.kpi.contracts.delta != null
                ? `${data.kpi.contracts.delta > 0 ? '+' : ''}${data.kpi.contracts.delta}%`
                : undefined
            }
            deltaTone={data.kpi.contracts.delta >= 0 ? 'up' : 'down'}
            hint={data.period.prevLabel ? `к ${data.period.prevLabel}` : undefined}
            instrument={<Sparkline data={contractsSeries} tone="confirmed" width={64} height={26} />}
            onClick={() => navigate('/contracts')}
          />

          <StatTile
            label="Задолженность"
            icon="alert-circle"
            chip="unpaid"
            status={data.kpi.debt.value > 0 ? 'unpaid' : undefined}
            countTo={Number(toMillions(data.kpi.debt.value).replace(',', '.'))}
            countFormat={(v) => v.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            unit="млн ₸"
            hint={
              data.kpi.debt.overdueCount > 0
                ? `${data.kpi.debt.overdueCount} ${plural(data.kpi.debt.overdueCount, ['договор просрочен', 'договора просрочено', 'договоров просрочено'])}`
                : 'просрочек нет'
            }
            onClick={() => navigate('/contracts')}
          />

          <StatTile
            label="Без согласования"
            icon="clock"
            chip="review"
            status={data.kpi.approvals.value > 0 ? 'review' : undefined}
            countTo={data.kpi.approvals.value}
            hint="ожидают решения подразделений"
            onClick={() => navigate('/events')}
          />

          <StatTile
            label="Конфликты брони"
            icon="alert-triangle"
            chip="conflict"
            status={data.kpi.conflicts.value > 0 ? 'conflict' : undefined}
            countTo={data.kpi.conflicts.value}
            hint={
              data.kpi.conflicts.value > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <StatusDot status="conflict" size={6} pulse />
                  требуют решения
                </span>
              ) : (
                'пересечений нет'
              )
            }
            onClick={() =>
              attentionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          />
        </div>

        {/* ═══ Загрузка по объектам + Динамика ════════════════ */}
        <div className="grid gap-4 xl:grid-cols-12">
          <ChartCard
            className="xl:col-span-4"
            title="Загрузка по объектам"
            note={`${data.period.label.toLowerCase()} · факт против плана, %`}
            height={214}
            legend={
              <>
                <LegendItem color={chart.accent} label="Факт" />
                <LegendItem color={chart.muted} label="План" />
              </>
            }
          >
            {loading ? (
              <div className="flex h-full items-center px-2">
                <Skeleton variant="block" className="h-[85%] w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.objectLoad}
                  layout="vertical"
                  margin={{ top: 6, right: 20, bottom: 0, left: 4 }}
                  barGap={2}
                >
                  <CartesianGrid horizontal={false} stroke={chart.grid} strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} unit="%" {...axisProps(chart)} />
                  <YAxis
                    type="category"
                    dataKey="short"
                    width={62}
                    {...axisProps(chart)}
                    tick={{ fill: chart.tick, fontSize: 11, fontWeight: 600 }}
                  />
                  <Tooltip
                    cursor={{ fill: chart.cursor }}
                    content={<ChartTooltip unit="%" />}
                  />
                  <Bar
                    dataKey="load"
                    name="Факт"
                    fill={chart.accent}
                    radius={[0, 3, 3, 0]}
                    barSize={11}
                  />
                  <Bar
                    dataKey="plan"
                    name="План"
                    fill={chart.mutedSoft}
                    stroke={chart.muted}
                    radius={[0, 3, 3, 0]}
                    barSize={11}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            className="xl:col-span-8"
            title="Динамика мероприятий"
            note={`${data.period.label.toLowerCase()} · количество мероприятий`}
            height={214}
            actions={
              <Badge tone="outline" icon="activity">
                всего {data.kpi.events.value}
              </Badge>
            }
            legend={
              <>
                <LegendItem color={chart.accent} label="Текущий период" />
                <LegendItem color={chart.muted} label={data.period.prevLabel} />
              </>
            }
          >
            {loading ? (
              <div className="flex h-full items-center px-2">
                <Skeleton variant="block" className="h-[85%] w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.dynamics} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                  <CartesianGrid vertical={false} stroke={chart.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="label" {...axisProps(chart)} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} {...axisProps(chart)} />
                  <Tooltip cursor={{ fill: chart.cursor }} content={<ChartTooltip />} />
                  <Bar
                    dataKey="current"
                    name="Текущий период"
                    fill={chart.accent}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={26}
                  />
                  <Line
                    dataKey="previous"
                    name={data.period.prevLabel}
                    type="monotone"
                    stroke={chart.muted}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    dot={{ r: 2, fill: chart.muted, strokeWidth: 0 }}
                    activeDot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* ═══ Финансы + Ближайшие мероприятия ════════════════ */}
        <div className="grid gap-4 xl:grid-cols-12">
          <ChartCard
            className="xl:col-span-4"
            title="Оплата договоров"
            note="доли от суммы в периоде"
            height={200}
            legend={
              <div className="w-full space-y-1.5">
                {data.finance.map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-2">
                    <LegendItem
                      color={chart.status[item.key]}
                      label={item.label}
                      hint={`${item.count} ${plural(item.count, ['договор', 'договора', 'договоров'])}`}
                    />
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-content">
                      {toMillions(item.value)} млн ₸
                    </span>
                  </div>
                ))}
              </div>
            }
            footer={
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xs font-semibold uppercase tracking-label text-content-faint">
                  Всего в периоде
                </span>
                <span className="text-base font-semibold tabular-nums text-content">
                  {formatMoney(financeTotal)}
                </span>
              </div>
            }
          >
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton variant="circle" className="h-32 w-32" />
              </div>
            ) : data.finance.length === 0 ? (
              <ChartEmpty text="Договоров в периоде нет" />
            ) : (
              <div className="relative h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.finance}
                      dataKey="value"
                      nameKey="label"
                      innerRadius="62%"
                      outerRadius="88%"
                      paddingAngle={2}
                      stroke="none"
                    >
                      {data.finance.map((item) => (
                        <Cell key={item.key} fill={chart.status[item.key]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={
                        <ChartTooltip
                          title="Оплата договоров"
                          formatter={(value) => `${toMillions(value)} млн ₸`}
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold tabular-nums leading-none text-content">
                    {toMillions(financeTotal)}
                  </span>
                  <span className="mt-0.5 text-2xs uppercase tracking-label text-content-faint">
                    млн ₸
                  </span>
                </div>
              </div>
            )}
          </ChartCard>

          <div className="min-w-0 xl:col-span-8">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-md font-semibold text-content">Ближайшие мероприятия</h3>
                <p className="mt-0.5 text-xs text-content-faint">
                  Ближайшие {data.upcoming.length} по дате начала · строка открывает карточку
                </p>
              </div>
              <Button
                variant="link"
                size="sm"
                iconRight="arrow-right"
                onClick={() => navigate('/events')}
              >
                Весь реестр
              </Button>
            </div>

            <DataTable
              rows={data.upcoming}
              rowKey={(row) => row.id}
              statusKey={(row) => row.status}
              onRowClick={(row) => navigate(`/events/${row.id}`)}
              loading={loading}
              loadingRows={5}
              emptyState={
                <EmptyState
                  size="sm"
                  tone="search"
                  title="В периоде мероприятий нет"
                  description="Выберите более длинный период или другой объект."
                  grid={false}
                />
              }
              columns={[
                {
                  key: 'id',
                  header: 'Заявка',
                  width: 92,
                  nowrap: true,
                  render: (row) => <HallPlate tone="muted">{row.id}</HallPlate>,
                },
                {
                  key: 'name',
                  header: 'Мероприятие',
                  render: (row) => (
                    <div className="min-w-0">
                      <p className="truncate font-medium text-content">{row.name}</p>
                      <p className="truncate text-xs text-content-faint">{row.tenant}</p>
                    </div>
                  ),
                },
                {
                  key: 'hall',
                  header: 'Объект / зал',
                  width: 150,
                  render: (row) => (
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-content">{row.hall}</p>
                      <p className="truncate text-2xs text-content-faint">
                        {objectByKey(row.objectKey)?.short}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'eventFrom',
                  header: 'Проведение',
                  width: 138,
                  nowrap: true,
                  render: (row) => formatDateRange(row.eventFrom, row.eventTo),
                },
                {
                  key: 'status',
                  header: 'Статус',
                  width: 148,
                  render: (row) => <StatusBadge status={row.status} size="sm" />,
                },
                {
                  key: 'payment',
                  header: 'Оплата',
                  width: 136,
                  render: (row) => <StatusBadge status={row.payment} size="sm" />,
                },
                {
                  key: 'manager',
                  header: 'Ответственный',
                  width: 116,
                  nowrap: true,
                },
              ]}
            />
          </div>
        </div>

        {/* ═══ Требуют внимания ══════════════════════════════ */}
        <section
          ref={attentionRef}
          className="scroll-mt-4 overflow-hidden rounded-md border border-hairline bg-surface-raised"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline-soft px-4 py-3">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 text-md font-semibold text-content">
                <Icon name="alert-triangle" size={15} className="text-status-conflict-base" />
                Требуют внимания
              </h3>
              <p className="mt-0.5 text-xs text-content-faint">
                Проблемные вопросы по всем объектам — вне зависимости от выбранного периода
              </p>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-content-subtle">
              всего {data.attention.total}
            </span>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <AttentionGroup
              icon="alert-triangle"
              tone="conflict"
              title="Конфликты брони"
              items={data.attention.conflicts}
              onOpen={() => navigate('/calendar')}
              emptyText="Пересечений нет"
              renderItem={(item) => (
                <>
                  <div className="flex items-center gap-1.5">
                    <HallPlate tone="muted" size="sm">
                      {item.id}
                    </HallPlate>
                    <span className="truncate font-mono text-2xs text-content-subtle">
                      {item.hall}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-base font-medium text-content">{item.name}</p>
                  <p className="mt-0.5 text-xs leading-snug text-status-conflict-text">
                    {item.conflictNote}
                  </p>
                </>
              )}
            />

            <AttentionGroup
              icon="alert-circle"
              tone="unpaid"
              title="Просроченная оплата"
              items={data.attention.overdue}
              onOpen={() => navigate('/contracts')}
              emptyText="Просрочек нет"
              renderItem={(item) => (
                <>
                  <div className="flex items-center gap-1.5">
                    <HallPlate tone="muted" size="sm">
                      № {item.contract.number}
                    </HallPlate>
                    <span className="truncate text-2xs text-status-unpaid-text">
                      просрочка {item.overdueDays}{' '}
                      {plural(item.overdueDays, ['день', 'дня', 'дней'])}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-base font-medium text-content">{item.tenant}</p>
                  <p className="mt-0.5 text-xs tabular-nums text-content-subtle">
                    {formatMoney(item.amount)} · {item.name}
                  </p>
                </>
              )}
            />

            <AttentionGroup
              icon="clock"
              tone="review"
              title="Договоры на исходе"
              items={data.attention.expiring}
              onOpen={() => navigate('/contracts')}
              emptyText="Сроки в норме"
              renderItem={(item) => (
                <>
                  <div className="flex items-center gap-1.5">
                    <HallPlate tone="muted" size="sm">
                      № {item.contract.number}
                    </HallPlate>
                    <span className="truncate text-2xs text-status-review-text">
                      {item.daysLeft} {plural(item.daysLeft, ['день', 'дня', 'дней'])} до окончания
                    </span>
                  </div>
                  <p className="mt-1 truncate text-base font-medium text-content">{item.tenant}</p>
                  <p className="mt-0.5 text-xs tabular-nums text-content-subtle">
                    действует до {formatDate(item.contract.validTo)}
                  </p>
                </>
              )}
            />

            <AttentionGroup
              icon="check-double"
              tone="draft"
              title="Без согласования"
              items={data.attention.approvals}
              onOpen={() => navigate('/events')}
              emptyText="Все согласования закрыты"
              renderItem={(item) => (
                <>
                  <div className="flex items-center gap-1.5">
                    <HallPlate tone="muted" size="sm">
                      {item.id}
                    </HallPlate>
                    <span className="truncate text-2xs text-content-faint">
                      {formatDate(item.eventFrom)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-base font-medium text-content">{item.name}</p>
                  <p className="mt-0.5 truncate text-xs text-content-subtle">
                    ожидает: {item.approval.join(', ')}
                  </p>
                </>
              )}
            />
          </div>
        </section>

        {/* ═══ Сводка по объектам ════════════════════════════ */}
        <div className="grid gap-3 sm:grid-cols-3">
          {data.objectLoad.map((object) => {
            const events = data.upcoming.filter((e) => e.objectKey === object.key).length
            return (
              <button
                key={object.key}
                type="button"
                onClick={() => withLoading(() => setObjectKey(object.key))}
                className="focus-ring group flex items-center gap-3 rounded-md border border-hairline bg-surface-raised px-3.5 py-3 text-left transition-all duration-fast hover:border-hairline-strong hover:shadow-card-hover"
              >
                <RingGauge
                  value={object.load}
                  size={52}
                  stroke={4}
                  tone={object.load >= object.plan ? 'confirmed' : 'beam'}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-content">{object.name}</p>
                  <p className="mt-0.5 truncate text-xs text-content-faint">
                    план {object.plan}% · {formatNumber(events)}{' '}
                    {plural(events, ['мероприятие', 'мероприятия', 'мероприятий'])}
                  </p>
                </div>
                <Icon
                  name="chevron-right"
                  size={14}
                  className="shrink-0 text-content-faint transition-transform duration-fast group-hover:translate-x-0.5"
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
