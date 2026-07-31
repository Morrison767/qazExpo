import { cn } from '@/lib/cn'
import { useAutoId } from '@/lib/hooks'
import { beam, ink, navy, obsidian, status as statusColors } from '@/design/tokens'
import { getStatus } from '@/design/statuses'
import { useTheme } from '@/app/ThemeContext'

/**
 * ═══════════════════════════════════════════════════════════════
 *  ИНСТРУМЕНТЫ — визуализация данных как часть интерфейса
 * ═══════════════════════════════════════════════════════════════
 *
 * Система про загрузку помещений, деньги и сроки не должна подавать
 * эти величины только текстом. Спарклайн показывает тренд, шкала —
 * заполнение, полоса занятости — конфликты по дням, тепловая матрица —
 * сезонность объекта.
 *
 * Тон линий берётся из темы автоматически; `onDark` нужен только чтобы
 * форсировать вариант (например, инструмент на тёмной подложке в светлой теме).
 */

/** Тон инструмента: пара значений для светлой темы и для тёмной */
const TONES = {
  beam: { light: beam[700], dark: beam[400] },
  navy: { light: navy[600], dark: navy[300] },
  confirmed: { light: statusColors.confirmed.base, dark: statusColors.confirmed.onDark },
  review: { light: statusColors.review.base, dark: statusColors.review.onDark },
  conflict: { light: statusColors.conflict.base, dark: statusColors.conflict.onDark },
  paid: { light: statusColors.paid.base, dark: statusColors.paid.onDark },
  unpaid: { light: statusColors.unpaid.base, dark: statusColors.unpaid.onDark },
  neutral: { light: ink[400], dark: obsidian[300] },
}

function toneColor(tone, isDark) {
  const pair = TONES[tone] ?? TONES.beam
  return isDark ? pair.dark : pair.light
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Разрешает тон: явный проп сильнее темы */
function useToneColor(tone, onDark) {
  const { isDark } = useTheme()
  const dark = onDark ?? isDark
  return { color: toneColor(tone, dark), dark }
}

/* ─────────────────────────────────────────────────────────────
   СПАРКЛАЙН — тренд без осей: количество мероприятий, выручка,
   загрузка по месяцам. Читается за долю секунды рядом с числом.
   ───────────────────────────────────────────────────────────── */
export function Sparkline({
  data,
  width = 104,
  height = 30,
  tone = 'beam',
  onDark,
  showArea = true,
  showDot = true,
  strokeWidth = 1.5,
  className,
}) {
  const gradientId = useAutoId('spark')
  const { color, dark } = useToneColor(tone, onDark)

  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const pad = strokeWidth + 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - pad * 2) + pad
    const y = height - pad - ((value - min) / span) * (height - pad * 2)
    return [x, y]
  })

  const line = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')
  const area = `${line} L${points[points.length - 1][0].toFixed(1)} ${height} L${points[0][0].toFixed(1)} ${height} Z`
  const last = points[points.length - 1]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('shrink-0 overflow-visible', className)}
      aria-hidden="true"
    >
      {showArea ? (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={hexToRgba(color, dark ? 0.35 : 0.22)} />
              <stop offset="100%" stopColor={hexToRgba(color, 0)} />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradientId})`} />
        </>
      ) : null}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDot ? (
        <>
          <circle cx={last[0]} cy={last[1]} r={strokeWidth + 2.2} fill={hexToRgba(color, 0.22)} />
          <circle cx={last[0]} cy={last[1]} r={strokeWidth + 0.4} fill={color} />
        </>
      ) : null}
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   ШКАЛА ЗАПОЛНЕНИЯ — загрузка зала, исполнение плана, доля оплаты.
   Опциональная метка порога: план, вместимость, лимит.
   ───────────────────────────────────────────────────────────── */
export function MeterBar({
  value,
  max = 100,
  label,
  valueLabel,
  hint,
  tone = 'beam',
  onDark,
  threshold,
  thresholdLabel,
  size = 'md',
  animate = true,
  className,
}) {
  const { color, dark } = useToneColor(tone, onDark)
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  const heights = { sm: 'h-1', md: 'h-1.5', lg: 'h-2.5' }

  return (
    <div className={cn('min-w-0', className)}>
      {label || valueLabel ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="truncate text-2xs font-semibold uppercase tracking-label text-content-faint">
            {label}
          </span>
          {valueLabel ? (
            <span className="shrink-0 text-xs font-semibold tabular-nums text-content">
              {valueLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-surface-muted',
          heights[size] ?? heights.md,
        )}
      >
        <div
          className={cn('h-full origin-left rounded-full', animate && 'animate-grow-x')}
          style={{
            width: `${percent}%`,
            backgroundImage: `linear-gradient(90deg, ${hexToRgba(color, 0.72)} 0%, ${color} 100%)`,
            boxShadow: `0 0 8px 0 ${hexToRgba(color, dark ? 0.55 : 0.35)}`,
          }}
        />
        {threshold != null ? (
          <span
            aria-hidden="true"
            title={thresholdLabel}
            className="absolute inset-y-0 w-px bg-content-muted"
            style={{ left: `${Math.max(0, Math.min(100, (threshold / max) * 100))}%` }}
          />
        ) : null}
      </div>

      {hint ? <p className="mt-1 truncate text-2xs text-content-faint">{hint}</p> : null}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ПОЛОСА ЗАНЯТОСТИ — календарная лента по дням для одного зала.
   Каждая ячейка окрашена статусом; пересечения видны как разрыв ритма.
   ───────────────────────────────────────────────────────────── */
export function OccupancyStrip({ days, label, hint, size = 'md', className }) {
  const heights = { sm: 'h-4', md: 'h-6', lg: 'h-8' }

  return (
    <div className={cn('min-w-0', className)}>
      {label || hint ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="truncate font-mono text-xs font-semibold text-content">{label}</span>
          {hint ? (
            <span className="shrink-0 text-2xs tabular-nums text-content-faint">{hint}</span>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn('flex w-full gap-px overflow-hidden rounded-sm', heights[size] ?? heights.md)}
      >
        {days.map((day, index) => {
          const meta = day.status ? getStatus(day.status) : null
          const isConflict = meta?.key === 'conflict'
          return (
            <span
              key={index}
              title={`${day.label ?? index + 1}${meta ? ` · ${meta.label}` : ' · свободно'}`}
              className={cn(
                'min-w-0 flex-1 transition-[filter] duration-fast hover:brightness-110',
                !meta && 'bg-surface-muted',
                isConflict && 'hazard-stripes',
              )}
              style={
                meta
                  ? isConflict
                    ? { color: meta.colors.base }
                    : {
                        backgroundColor: meta.colors.base,
                        boxShadow: `inset 0 0 6px 0 ${meta.colors.glow}`,
                      }
                  : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   КОЛЬЦЕВАЯ ШКАЛА — один показатель крупно: загрузка объекта,
   исполнение плана, доля согласованных договоров.
   ───────────────────────────────────────────────────────────── */
export function RingGauge({
  value,
  max = 100,
  size = 96,
  stroke = 6,
  tone = 'beam',
  onDark,
  label,
  sublabel,
  valueLabel,
  animate = true,
  className,
}) {
  const { color, dark } = useToneColor(tone, onDark)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = Math.max(0, Math.min(1, value / max))
  const offset = circumference * (1 - ratio)

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-surface-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            stroke={color}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={animate ? 'animate-ring-draw' : undefined}
            style={{
              '--ring-circumference': `${circumference}`,
              '--ring-offset': `${offset}`,
              filter: `drop-shadow(0 0 5px ${hexToRgba(color, dark ? 0.6 : 0.4)})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tabular-nums leading-none text-content">
            {valueLabel ?? `${Math.round(ratio * 100)}%`}
          </span>
          {sublabel ? (
            <span className="mt-0.5 text-2xs uppercase tracking-label text-content-faint">
              {sublabel}
            </span>
          ) : null}
        </div>
      </div>
      {label ? (
        <span className="mt-2 text-center text-2xs font-semibold uppercase tracking-label text-content-subtle">
          {label}
        </span>
      ) : null}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ТЕПЛОВАЯ МАТРИЦА — сезонность: объекты × месяцы.
   Показывает, где комплекс простаивает, а где перегружен.
   ───────────────────────────────────────────────────────────── */
export function HeatCells({
  rows,
  columns,
  tone = 'beam',
  onDark,
  cellSize = 18,
  gap = 2,
  className,
}) {
  const { color, dark } = useToneColor(tone, onDark)

  return (
    <div className={cn('min-w-0 overflow-x-auto', className)}>
      <table className="border-separate" style={{ borderSpacing: gap }}>
        {columns ? (
          <thead>
            <tr>
              <th />
              {columns.map((column) => (
                <th
                  key={column}
                  className="pb-0.5 text-center text-2xs font-semibold uppercase tracking-normal text-content-faint"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th
                scope="row"
                className="whitespace-nowrap pr-2 text-right font-mono text-2xs font-semibold text-content-muted"
              >
                {row.label}
              </th>
              {row.values.map((intensity, index) => {
                const alpha = dark ? 0.06 + intensity * 0.82 : 0.05 + intensity * 0.8
                return (
                  <td key={index} className="p-0">
                    <span
                      title={`${row.label} · ${columns?.[index] ?? index + 1} · ${Math.round(intensity * 100)}%`}
                      className="block rounded-xs transition-transform duration-fast hover:scale-125"
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: hexToRgba(color, alpha),
                        boxShadow:
                          intensity > 0.75
                            ? `0 0 8px 0 ${hexToRgba(color, dark ? 0.5 : 0.3)}`
                            : undefined,
                      }}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   СТОЛБЦЫ — распределение: мероприятия по объектам, суммы по месяцам.
   ───────────────────────────────────────────────────────────── */
export function MiniBars({
  data,
  height = 40,
  tone = 'beam',
  onDark,
  labels,
  highlightIndex,
  className,
}) {
  const { color, dark } = useToneColor(tone, onDark)
  const max = Math.max(...data.map((d) => (typeof d === 'number' ? d : d.value)), 1)

  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((entry, index) => {
          const value = typeof entry === 'number' ? entry : entry.value
          const isActive = highlightIndex === index
          return (
            <span
              key={index}
              title={`${labels?.[index] ?? index + 1}: ${value}`}
              className="min-w-0 flex-1 origin-bottom animate-grow-y rounded-t-xs transition-[filter] duration-fast hover:brightness-125"
              style={{
                height: `${Math.max(4, (value / max) * 100)}%`,
                animationDelay: `${index * 28}ms`,
                backgroundColor: isActive ? color : hexToRgba(color, dark ? 0.4 : 0.28),
                boxShadow: isActive ? `0 0 10px 0 ${hexToRgba(color, 0.5)}` : undefined,
              }}
            />
          )
        })}
      </div>
      {labels ? (
        <div className="mt-1 flex gap-1">
          {labels.map((label, index) => (
            <span
              key={index}
              className={cn(
                'min-w-0 flex-1 truncate text-center text-2xs tracking-normal',
                highlightIndex === index
                  ? 'font-semibold text-content'
                  : 'text-content-faint',
              )}
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
