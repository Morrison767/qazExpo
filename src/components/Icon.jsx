import { cn } from '@/lib/cn'

/**
 * Иконки системы. Единая сетка 16×16, обводка 1.6, скруглённые концы —
 * визуально согласуются с 13px-текстом и не «шумят» в плотных таблицах.
 * Заливка используется только там, где форма важнее контура
 * (точки статусов, треугольники сортировки).
 */
const SVG_DEFAULTS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const DOT = (cx, cy, r = 0.9) => (
  <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />
)

const ICONS = {
  /* ── Навигация системы ───────────────────────────────── */
  dashboard: (
    <>
      <rect x="2.4" y="2.4" width="5" height="6.2" rx="0.9" />
      <rect x="8.6" y="2.4" width="5" height="3.6" rx="0.9" />
      <rect x="2.4" y="9.8" width="5" height="3.8" rx="0.9" />
      <rect x="8.6" y="7.2" width="5" height="6.4" rx="0.9" />
    </>
  ),
  calendar: (
    <>
      <rect x="2.3" y="3.6" width="11.4" height="10.1" rx="1.2" />
      <path d="M2.3 6.6h11.4M5.4 2.2v2.8M10.6 2.2v2.8" />
    </>
  ),
  'calendar-x': (
    <>
      <rect x="2.3" y="3.6" width="11.4" height="10.1" rx="1.2" />
      <path d="M2.3 6.6h11.4M5.4 2.2v2.8M10.6 2.2v2.8" />
      <path d="M6.4 9.3l3.2 3.2M9.6 9.3l-3.2 3.2" />
    </>
  ),
  presentation: (
    <>
      <rect x="2" y="2.6" width="12" height="7.8" rx="1.1" />
      <path d="M8 10.4v2.1M5.4 13.6l2.6-1.1 2.6 1.1" />
    </>
  ),
  contract: (
    <>
      <path d="M4.2 2.2h4.6l3 3v8.6H4.2z" />
      <path d="M8.7 2.2v3.1h3.1M6.2 8.6h3.6M6.2 11h2.6" />
    </>
  ),
  building: (
    <>
      <path d="M3.2 13.8V3.4a1 1 0 0 1 1-1h5.4a1 1 0 0 1 1 1v10.4" />
      <path d="M10.6 6.8h2a1 1 0 0 1 1 1v6" />
      <path d="M2 13.8h12" />
      <path d="M5.6 5.4h1M8.2 5.4h1M5.6 8h1M8.2 8h1M5.6 10.6h1M8.2 10.6h1" />
    </>
  ),
  'hard-hat': (
    <>
      <path d="M2.4 11.6h11.2" />
      <path d="M4.2 11.6V8.4a3.8 3.8 0 0 1 7.6 0v3.2" />
      <path d="M6.6 5.1V3.6a1 1 0 0 1 1-1h.8a1 1 0 0 1 1 1v1.5" />
    </>
  ),
  chart: (
    <>
      <path d="M2.4 13.4h11.2" />
      <path d="M4.8 13.4V9.2M8 13.4V5.4M11.2 13.4V7.4" />
    </>
  ),
  'user-circle': (
    <>
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="6.4" r="2" />
      <path d="M4.3 13a4.3 4.3 0 0 1 7.4 0" />
    </>
  ),
  list: (
    <>
      <path d="M5.6 4.2h8.2M5.6 8h8.2M5.6 11.8h8.2" />
      {DOT(2.6, 4.2)}
      {DOT(2.6, 8)}
      {DOT(2.6, 11.8)}
    </>
  ),
  sliders: (
    <>
      <path d="M2.4 4.6h2.7M8.5 4.6h5.1M2.4 11.4h5.1M10.9 11.4h2.7" />
      <circle cx="6.8" cy="4.6" r="1.7" />
      <circle cx="9.2" cy="11.4" r="1.7" />
    </>
  ),
  shield: (
    <>
      <path d="M8 2.1 12.9 4v3.9c0 3.1-2.1 5.2-4.9 6-2.8-.8-4.9-2.9-4.9-6V4z" />
      <path d="M5.9 7.9 7.4 9.4l2.7-2.8" />
    </>
  ),
  palette: (
    <>
      <path d="M8 2.2a5.8 5.8 0 0 0 0 11.6c.9 0 1.4-.6 1.4-1.3 0-.6-.4-1.1-.4-1.6 0-.6.5-1.1 1.1-1.1h1.2a2.5 2.5 0 0 0 2.5-2.5C13.8 4.5 11.2 2.2 8 2.2z" />
      {DOT(5.6, 6)}
      {DOT(8.4, 5.2)}
      {DOT(5, 9.2)}
    </>
  ),
  wallet: (
    <>
      <rect x="2" y="4" width="12" height="9" rx="1.4" />
      <path d="M2 7.2h12M10.4 10.2h1.7" />
    </>
  ),
  scale: (
    <>
      <path d="M8 2.6v10.8M4.6 13.4h6.8" />
      <path d="M8 4.4 3.4 5.6M8 4.4l4.6 1.2" />
      <path d="M1.6 9.2h3.6L3.4 5.6z" />
      <path d="M10.8 9.2h3.6l-1.8-3.6z" />
    </>
  ),
  user: (
    <>
      <circle cx="8" cy="5.2" r="2.6" />
      <path d="M3.4 13.6c0-2.5 2-4 4.6-4s4.6 1.5 4.6 4" />
    </>
  ),
  users: (
    <>
      <circle cx="6" cy="5.6" r="2.4" />
      <path d="M1.9 13.2c0-2.2 1.8-3.6 4.1-3.6s4.1 1.4 4.1 3.6" />
      <path d="M10.7 3.6a2.4 2.4 0 0 1 0 4" />
      <path d="M11.6 9.8c1.5.4 2.5 1.6 2.5 3.4" />
    </>
  ),

  /* ── Статусы (форма = смысл) ─────────────────────────── */
  'circle-dashed': <circle cx="8" cy="8" r="5.5" strokeDasharray="2.2 2.2" />,
  circle: <circle cx="8" cy="8" r="5.5" />,
  'circle-dot': (
    <>
      <circle cx="8" cy="8" r="5.5" />
      <circle cx="8" cy="8" r="2.3" fill="currentColor" stroke="none" />
    </>
  ),
  dot: <circle cx="8" cy="8" r="3.4" fill="currentColor" stroke="none" />,
  clock: (
    <>
      <circle cx="8" cy="8" r="5.7" />
      <path d="M8 4.9v3.4l2.4 1.4" />
    </>
  ),
  check: <path d="M3.4 8.4 6.4 11.4 12.6 4.8" />,
  'check-double': (
    <>
      <path d="M1.8 8.4 4.3 11 9.2 5.2" />
      <path d="M7.4 10.6 8.8 12 13.9 5.8" />
    </>
  ),
  'check-circle': (
    <>
      <circle cx="8" cy="8" r="5.7" />
      <path d="M5.4 8.2 7.2 10 10.8 6" />
    </>
  ),
  'alert-triangle': (
    <>
      <path d="M8 2.4 14.4 13.5H1.6z" />
      <path d="M8 6.4v3" />
      {DOT(8, 11.4, 0.85)}
    </>
  ),
  'alert-circle': (
    <>
      <circle cx="8" cy="8" r="5.8" />
      <path d="M8 4.9v3.6" />
      {DOT(8, 11, 0.85)}
    </>
  ),
  info: (
    <>
      <circle cx="8" cy="8" r="5.8" />
      <path d="M8 7.4v3.8" />
      {DOT(8, 5.1, 0.85)}
    </>
  ),
  'x-circle': (
    <>
      <circle cx="8" cy="8" r="5.7" />
      <path d="M6.1 6.1l3.8 3.8M9.9 6.1l-3.8 3.8" />
    </>
  ),
  ban: (
    <>
      <circle cx="8" cy="8" r="5.7" />
      <path d="M4 12 12 4" />
    </>
  ),

  /* ── Действия и управление ───────────────────────────── */
  x: <path d="M4 4l8 8M12 4l-8 8" />,
  plus: <path d="M8 3.4v9.2M3.4 8h9.2" />,
  minus: <path d="M3.4 8h9.2" />,
  search: (
    <>
      <circle cx="6.9" cy="6.9" r="4.4" />
      <path d="M10.2 10.2 14 14" />
    </>
  ),
  filter: <path d="M2.4 3.8h11.2L9.4 8.6v4.4l-2.8-1.5V8.6z" />,
  download: (
    <>
      <path d="M8 2.8v7.4" />
      <path d="M5 7.4 8 10.4l3-3" />
      <path d="M2.8 13.2h10.4" />
    </>
  ),
  upload: (
    <>
      <path d="M8 10.6V3.2" />
      <path d="M5 6.2 8 3.2l3 3" />
      <path d="M2.8 13.2h10.4" />
    </>
  ),
  pencil: (
    <>
      <path d="M11 2.6 13.4 5 5.6 12.8l-3 .6.6-3z" />
      <path d="M9.8 3.8 12.2 6.2" />
    </>
  ),
  trash: (
    <>
      <path d="M2.8 4.6h10.4" />
      <path d="M6 4.6V3.2h4v1.4" />
      <path d="M4.4 4.6l.7 8.6h5.8l.7-8.6" />
    </>
  ),
  eye: (
    <>
      <path d="M1.6 8S4 3.8 8 3.8 14.4 8 14.4 8 12 12.2 8 12.2 1.6 8 1.6 8z" />
      <circle cx="8" cy="8" r="2.1" />
    </>
  ),
  copy: (
    <>
      <rect x="5.4" y="5.4" width="8.2" height="8.2" rx="1.1" />
      <path d="M10.6 5.4V3.5a1.1 1.1 0 0 0-1.1-1.1H3.5a1.1 1.1 0 0 0-1.1 1.1v6a1.1 1.1 0 0 0 1.1 1.1h1.9" />
    </>
  ),
  paperclip: (
    <path d="M13 7.4 7.9 12.5a3 3 0 0 1-4.2-4.2l5.4-5.4a2 2 0 0 1 2.8 2.8l-5.4 5.4a1 1 0 0 1-1.4-1.4l4.7-4.7" />
  ),
  refresh: (
    <>
      <path d="M13.4 8a5.4 5.4 0 1 1-1.9-4.1" />
      <path d="M13.6 2.2v2.6h-2.6" />
    </>
  ),
  loader: <circle cx="8" cy="8" r="5.6" strokeDasharray="26 9" />,
  'log-out': (
    <>
      <path d="M6.4 13.4H3.6a1.2 1.2 0 0 1-1.2-1.2V3.8a1.2 1.2 0 0 1 1.2-1.2h2.8" />
      <path d="M10.2 5.4 12.8 8l-2.6 2.6" />
      <path d="M6.6 8h6.2" />
    </>
  ),
  lock: (
    <>
      <rect x="3.4" y="6.9" width="9.2" height="6.5" rx="1.1" />
      <path d="M5.6 6.9V5.3a2.4 2.4 0 0 1 4.8 0v1.6" />
    </>
  ),
  bell: (
    <>
      <path d="M8 2.2a3.6 3.6 0 0 0-3.6 3.6c0 3.4-1.4 4.4-1.4 4.4h10s-1.4-1-1.4-4.4A3.6 3.6 0 0 0 8 2.2z" />
      <path d="M6.4 12.4a1.7 1.7 0 0 0 3.2 0" />
    </>
  ),
  mail: (
    <>
      <rect x="1.8" y="3.6" width="12.4" height="8.8" rx="1.2" />
      <path d="m2.4 4.6 5.6 4.4 5.6-4.4" />
    </>
  ),
  phone: (
    <path d="M3 2.8h2.6l1.2 3-1.6 1.2a7 7 0 0 0 3.8 3.8l1.2-1.6 3 1.2v2.6a1 1 0 0 1-1.1 1A11.2 11.2 0 0 1 2 3.9a1 1 0 0 1 1-1.1z" />
  ),
  'map-pin': (
    <>
      <path d="M8 13.8s4.5-4.3 4.5-7.4a4.5 4.5 0 1 0-9 0C3.5 9.5 8 13.8 8 13.8z" />
      <circle cx="8" cy="6.3" r="1.8" />
    </>
  ),
  'external-link': (
    <>
      <path d="M9.2 2.8H13V6.6" />
      <path d="M13 2.8 7.4 8.4" />
      <path d="M11.6 9.4v2.8a1.2 1.2 0 0 1-1.2 1.2H4a1.2 1.2 0 0 1-1.2-1.2V5.8A1.2 1.2 0 0 1 4 4.6h2.8" />
    </>
  ),
  inbox: (
    <>
      <path d="M2 8.4 4 3.2h8l2 5.2v4a1.2 1.2 0 0 1-1.2 1.2H3.2A1.2 1.2 0 0 1 2 12.4z" />
      <path d="M2 8.4h3.2l1 2h3.6l1-2H14" />
    </>
  ),
  box: (
    <>
      <path d="M2.4 5.2 8 2.4l5.6 2.8v5.6L8 13.6l-5.6-2.8z" />
      <path d="M2.4 5.2 8 8l5.6-2.8M8 8v5.6" />
    </>
  ),
  layers: (
    <>
      <path d="M8 2.4 13.6 5.4 8 8.4 2.4 5.4z" />
      <path d="m2.4 8.6 5.6 3 5.6-3" />
      <path d="m2.4 11.4 5.6 3 5.6-3" />
    </>
  ),
  type: (
    <>
      <path d="M3 4.2V2.8h10v1.4" />
      <path d="M8 2.8v10.4M5.8 13.2h4.4" />
    </>
  ),
  ruler: (
    <>
      <rect x="1.6" y="5.6" width="12.8" height="4.8" rx="1" />
      <path d="M4.4 5.6v1.8M6.8 5.6v2.6M9.2 5.6v1.8M11.6 5.6v2.6" />
    </>
  ),
  table: (
    <>
      <rect x="2" y="3" width="12" height="10" rx="1.2" />
      <path d="M2 6.4h12M6.6 6.4V13" />
    </>
  ),
  'panel-left': (
    <>
      <rect x="2" y="2.8" width="12" height="10.4" rx="1.2" />
      <path d="M6.4 2.8v10.4" />
    </>
  ),

  /* ── Стрелки, шевроны, сортировка ────────────────────── */
  'chevron-down': <path d="M3.5 6 8 10.5 12.5 6" />,
  'chevron-up': <path d="M3.5 10 8 5.5 12.5 10" />,
  'chevron-right': <path d="M6 3.5 10.5 8 6 12.5" />,
  'chevron-left': <path d="M10 3.5 5.5 8 10 12.5" />,
  'chevrons-left': <path d="M7.6 3.8 3.4 8l4.2 4.2M12.6 3.8 8.4 8l4.2 4.2" />,
  'chevrons-right': <path d="M8.4 3.8 12.6 8l-4.2 4.2M3.4 3.8 7.6 8l-4.2 4.2" />,
  'arrow-up': (
    <>
      <path d="M8 12.6V3.6" />
      <path d="M4.4 7.2 8 3.6l3.6 3.6" />
    </>
  ),
  'arrow-down': (
    <>
      <path d="M8 3.4v9" />
      <path d="M4.4 8.8 8 12.4l3.6-3.6" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M3 8h10" />
      <path d="M9.4 4.4 13 8l-3.6 3.6" />
    </>
  ),
  sort: (
    <>
      <path d="M8 3.2 10.6 6.2H5.4z" fill="currentColor" stroke="none" />
      <path d="M8 12.8 5.4 9.8h5.2z" fill="currentColor" stroke="none" />
    </>
  ),
  'sort-asc': <path d="M8 3.4 11 7H5z" fill="currentColor" stroke="none" />,
  'sort-desc': <path d="M8 12.6 5 9h6z" fill="currentColor" stroke="none" />,
  'more-horizontal': (
    <>
      {DOT(3.4, 8, 1)}
      {DOT(8, 8, 1)}
      {DOT(12.6, 8, 1)}
    </>
  ),
  'more-vertical': (
    <>
      {DOT(8, 3.4, 1)}
      {DOT(8, 8, 1)}
      {DOT(8, 12.6, 1)}
    </>
  ),
  grip: (
    <>
      {DOT(6, 3.6, 0.95)}
      {DOT(10, 3.6, 0.95)}
      {DOT(6, 8, 0.95)}
      {DOT(10, 8, 0.95)}
      {DOT(6, 12.4, 0.95)}
      {DOT(10, 12.4, 0.95)}
    </>
  ),
}

export const ICON_NAMES = Object.keys(ICONS)

export function Icon({ name, size = 16, strokeWidth = 1.6, className, title, ...rest }) {
  const glyph = ICONS[name]
  if (!glyph) {
    if (import.meta.env?.DEV) console.warn(`[Icon] неизвестная иконка: "${name}"`)
    return null
  }
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      className={cn('shrink-0', className)}
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      {...SVG_DEFAULTS}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {glyph}
    </svg>
  )
}

export default Icon
