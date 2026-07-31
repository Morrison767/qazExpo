import { cn } from '@/lib/cn'
import { useTheme } from '@/app/ThemeContext'
import { status as statusColors } from '@/design/tokens'
import { Icon } from './Icon'

/**
 * ОБВЯЗКА ГРАФИКОВ (recharts).
 *
 * Recharts принимает цвета строками, поэтому CSS-переменные ему не подходят —
 * значения берутся из этого хука по активной теме. Базовые цвета статусов
 * одинаковы в обеих темах: сектор «Не оплачено» на пончике и бейдж
 * «Не оплачено» в реестре должны быть одного оттенка.
 */
const LIGHT = {
  grid: '#DFE3EA',
  axis: '#C7CDD8',
  tick: '#5A6474',
  accent: '#0B7C93',
  accentSoft: 'rgba(11, 124, 147, 0.16)',
  muted: '#C7CDD8',
  mutedSoft: '#EDEFF3',
  cursor: 'rgba(11, 124, 147, 0.07)',
}

const DARK = {
  grid: '#223041',
  axis: '#33455A',
  tick: '#94A7B8',
  accent: '#35D6F0',
  accentSoft: 'rgba(53, 214, 240, 0.22)',
  muted: '#3F5468',
  mutedSoft: '#1B2634',
  cursor: 'rgba(53, 214, 240, 0.08)',
}

export function useChartTheme() {
  const { isDark } = useTheme()
  const base = isDark ? DARK : LIGHT
  return {
    ...base,
    isDark,
    status: Object.fromEntries(
      Object.entries(statusColors).map(([key, value]) => [key, value.base]),
    ),
  }
}

/** Общие пропсы осей — чтобы все графики системы выглядели одинаково */
export function axisProps(theme) {
  return {
    stroke: theme.axis,
    tick: { fill: theme.tick, fontSize: 10 },
    tickLine: false,
    axisLine: false,
  }
}

/**
 * Тултип на семантических классах — переключается вместе с темой
 * без дублирования палитры в JS.
 */
export function ChartTooltip({ active, payload, label, unit = '', formatter, title }) {
  if (!active || !payload?.length) return null

  return (
    <div className="min-w-[9rem] rounded-md border border-hairline bg-surface px-2.5 py-2 shadow-lg">
      {label != null || title ? (
        <p className="mb-1.5 text-2xs font-semibold uppercase tracking-label text-content-faint">
          {title ?? label}
        </p>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color ?? entry.payload?.fill }}
              />
              <span className="truncate text-xs text-content-muted">
                {entry.name ?? entry.dataKey}
              </span>
            </span>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-content">
              {formatter ? formatter(entry.value, entry) : `${entry.value}${unit}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Карточка-контейнер графика: заголовок, подпись, действия, легенда.
 * Держит одинаковый ритм у всех блоков дашборда.
 */
export function ChartCard({
  title,
  note,
  actions,
  legend,
  footer,
  height,
  className,
  bodyClassName,
  children,
}) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-md border border-hairline bg-surface-raised',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 px-4 pb-2 pt-3.5">
        <div className="min-w-0">
          <h3 className="truncate text-md font-semibold leading-snug text-content">{title}</h3>
          {note ? <p className="mt-0.5 truncate text-xs text-content-faint">{note}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
      </div>

      <div className={cn('min-w-0 px-2', bodyClassName)} style={height ? { height } : undefined}>
        {children}
      </div>

      {legend ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 pb-3 pt-1">{legend}</div>
      ) : null}

      {footer ? (
        <div className="mt-auto border-t border-hairline-soft bg-surface-sunken px-4 py-2">
          {footer}
        </div>
      ) : null}
    </div>
  )
}

/** Элемент легенды: точка + подпись + значение */
export function LegendItem({ color, label, value, hint, onClick }) {
  const Component = onClick ? 'button' : 'div'
  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex min-w-0 items-center gap-1.5 text-left',
        onClick && 'focus-ring rounded-sm transition-opacity duration-fast hover:opacity-75',
      )}
    >
      <span
        aria-hidden="true"
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 6px 0 ${color}66` }}
      />
      <span className="truncate text-xs text-content-muted">{label}</span>
      {value != null ? (
        <span className="shrink-0 text-xs font-semibold tabular-nums text-content">{value}</span>
      ) : null}
      {hint ? <span className="shrink-0 text-2xs text-content-faint">{hint}</span> : null}
    </Component>
  )
}

/** Подпись «нет данных» внутри области графика */
export function ChartEmpty({ text = 'Нет данных за выбранный период' }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <Icon name="chart" size={20} className="text-content-faint" />
      <p className="text-xs text-content-faint">{text}</p>
    </div>
  )
}
