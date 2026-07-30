import { createContext, useContext } from 'react'
import { cn } from '@/lib/cn'
import { HallPlate } from './HallPlate'
import { StatusRail, StatusBadge } from './Status'
import { Icon } from './Icon'
import { CountUp, BeamSweep } from './Motion'

/**
 * КАРТОЧКА — базовый контейнер для мероприятия, договора, арендатора,
 * подрядчика и помещения.
 *
 * Подписная структура (повторяется во всей системе):
 *   [светящаяся кромка 3px] [табличка-идентификатор] Заголовок
 *                            подзаголовок · метаданные
 *                            ─────────────────────────
 *                            сетка полей с CAPS-метками
 *
 * Глубина — три слоя: микроградиент поверхности, фаска-блик 1px сверху
 * и мягкая ambient-тень (shadow-card). Плоских прямоугольников в системе нет.
 *
 * tone: light (рабочая поверхность) | dark (корпус прибора — сводки, hero-блоки)
 */
const CardToneContext = createContext('light')

export function useCardTone() {
  return useContext(CardToneContext)
}

export function Card({
  status,
  interactive = false,
  tone = 'light',
  sweep = false,
  as: Component = 'div',
  className,
  children,
  ...rest
}) {
  const isDark = tone === 'dark'

  return (
    <CardToneContext.Provider value={tone}>
      <Component
        className={cn(
          'relative overflow-hidden rounded-md border',
          isDark
            ? 'border-obsidian-600/70 bg-surface-obsidian shadow-card-dark'
            : 'border-hairline bg-surface-raised shadow-card',
          status && 'pl-rail',
          interactive &&
            cn(
              'focus-ring cursor-pointer text-left transition-all duration-base ease-decelerate',
              isDark
                ? 'hover:border-beam-400/40 hover:shadow-beam-sm'
                : 'hover:-translate-y-px hover:border-hairline-strong hover:shadow-card-hover',
            ),
          className,
        )}
        {...rest}
      >
        {status ? <StatusRail status={status} /> : null}
        {sweep ? <BeamSweep /> : null}
        {children}
      </Component>
    </CardToneContext.Provider>
  )
}

export function CardHeader({
  plate,
  plateTone,
  title,
  subtitle,
  status,
  statusLabel,
  actions,
  meta,
  className,
  children,
}) {
  const isDark = useCardTone() === 'dark'

  return (
    <div className={cn('flex flex-col gap-2 px-4 pb-3 pt-3.5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {plate ? (
              <HallPlate tone={plateTone ?? (isDark ? 'inverse' : 'navy')}>{plate}</HallPlate>
            ) : null}
            {status ? (
              <StatusBadge
                status={status}
                label={statusLabel}
                size="sm"
                variant={isDark ? 'dark' : 'soft'}
              />
            ) : null}
            {meta ? (
              <span className={cn('text-xs', isDark ? 'text-obsidian-300' : 'text-ink-400')}>
                {meta}
              </span>
            ) : null}
          </div>
          {title ? (
            <h3
              className={cn(
                'mt-1.5 truncate text-lg font-semibold leading-snug',
                isDark ? 'text-obsidian-50' : 'text-ink-900',
              )}
            >
              {title}
            </h3>
          ) : null}
          {subtitle ? (
            <p
              className={cn(
                'mt-0.5 truncate text-base',
                isDark ? 'text-obsidian-200' : 'text-ink-500',
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
      </div>
      {children}
    </div>
  )
}

export function CardBody({ className, divided = true, children }) {
  const isDark = useCardTone() === 'dark'
  return (
    <div
      className={cn(
        'px-4 py-3',
        divided && (isDark ? 'border-t border-white/[0.07]' : 'border-t border-hairline-soft'),
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardFooter({ className, children }) {
  const isDark = useCardTone() === 'dark'
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5',
        isDark ? 'border-white/[0.07] bg-white/[0.02]' : 'border-hairline-soft bg-ink-25',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Сетка полей карточки: CAPS-метка сверху, значение снизу */
export function MetaGrid({ columns = 2, className, children }) {
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }
  return (
    <dl className={cn('grid gap-x-4 gap-y-3', cols[columns] ?? cols[2], className)}>{children}</dl>
  )
}

export function MetaItem({ label, value, mono = false, icon, tone = 'default', className }) {
  const isDark = useCardTone() === 'dark'

  const tones = isDark
    ? {
        default: 'text-obsidian-50',
        muted: 'text-obsidian-200',
        strong: 'text-obsidian-50 font-semibold',
        accent: 'text-beam-300 font-semibold',
      }
    : {
        default: 'text-ink-900',
        muted: 'text-ink-500',
        strong: 'text-ink-900 font-semibold',
        accent: 'text-beam-700 font-semibold',
      }

  return (
    <div className={cn('min-w-0', className)}>
      <dt
        className={cn(
          'mb-0.5 truncate text-2xs font-semibold uppercase tracking-label',
          isDark ? 'text-obsidian-300' : 'text-ink-400',
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          'flex items-center gap-1.5 truncate text-base tabular-nums',
          mono && 'font-mono',
          tones[tone] ?? tones.default,
        )}
      >
        {icon ? (
          <Icon
            name={icon}
            size={13}
            className={isDark ? 'text-obsidian-400' : 'text-ink-400'}
          />
        ) : null}
        <span className="truncate">{value ?? '—'}</span>
      </dd>
    </div>
  )
}

/**
 * ПРИБОРНАЯ ПЛИТКА — показатель сводки.
 *
 * Ключ к «hi-fi»: контраст кеглей 1:5 между CAPS-меткой (10px) и числом
 * (44px, tabular, отрицательный трекинг), досчёт величины при появлении
 * и слот под инструмент — спарклайн, шкалу или кольцо.
 */
export function StatTile({
  label,
  value,
  countTo,
  countFormat,
  unit,
  delta,
  deltaTone = 'neutral',
  icon,
  hint,
  instrument,
  tone = 'light',
  status,
  className,
}) {
  const isDark = tone === 'dark'

  const deltaTones = isDark
    ? {
        up: 'text-status-confirmed-onDark border-white/10 bg-white/[0.06]',
        down: 'text-status-unpaid-onDark border-white/10 bg-white/[0.06]',
        neutral: 'text-obsidian-200 border-white/10 bg-white/[0.06]',
      }
    : {
        up: 'text-status-confirmed-text bg-status-confirmed-soft border-status-confirmed-border',
        down: 'text-status-unpaid-text bg-status-unpaid-soft border-status-unpaid-border',
        neutral: 'text-ink-600 bg-ink-100 border-hairline',
      }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md border p-3.5',
        isDark
          ? 'border-obsidian-600/70 bg-surface-obsidian shadow-card-dark'
          : 'border-hairline bg-surface-raised shadow-card',
        status && 'pl-rail',
        className,
      )}
    >
      {status ? <StatusRail status={status} /> : null}

      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'text-2xs font-semibold uppercase tracking-label',
            isDark ? 'text-obsidian-300' : 'text-ink-400',
          )}
        >
          {label}
        </span>
        {icon ? (
          <Icon
            name={icon}
            size={14}
            className={isDark ? 'text-obsidian-400' : 'text-ink-300'}
          />
        ) : null}
      </div>

      <div className="mt-2.5 flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              'text-5xl font-semibold tabular-nums leading-none',
              isDark ? 'text-obsidian-50' : 'text-ink-900',
            )}
          >
            {countTo != null ? <CountUp value={countTo} format={countFormat} /> : value}
          </span>
          {unit ? (
            <span
              className={cn(
                'text-base font-medium',
                isDark ? 'text-obsidian-200' : 'text-ink-500',
              )}
            >
              {unit}
            </span>
          ) : null}
        </div>
        {instrument ? <div className="shrink-0 pb-1">{instrument}</div> : null}
      </div>

      {delta || hint ? (
        <div className="mt-2.5 flex items-center gap-2">
          {delta ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-2xs font-semibold tabular-nums',
                deltaTones[deltaTone] ?? deltaTones.neutral,
              )}
            >
              <Icon
                name={deltaTone === 'down' ? 'arrow-down' : 'arrow-up'}
                size={9}
                strokeWidth={2.2}
              />
              {delta}
            </span>
          ) : null}
          {hint ? (
            <span
              className={cn(
                'truncate text-xs',
                isDark ? 'text-obsidian-300' : 'text-ink-400',
              )}
            >
              {hint}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/**
 * HERO-ПОЛОСА — тёмная сводная панель во всю ширину.
 * Корпус прибора: точечная сетка, радиальное свечение из угла,
 * светящаяся кромка сверху и проход света при появлении.
 */
export function HeroPanel({ children, className, sweep = true, grid = true, bloom = true }) {
  return (
    <div
      className={cn(
        'on-obsidian relative overflow-hidden border-y border-obsidian-600/60 bg-surface-obsidian',
        className,
      )}
    >
      {grid ? (
        <span aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 opacity-70" />
      ) : null}
      {bloom ? (
        <span aria-hidden="true" className="bloom-beam pointer-events-none absolute inset-0" />
      ) : null}
      <span aria-hidden="true" className="beam-edge-soft absolute inset-x-0 top-0" />
      {sweep ? <BeamSweep /> : null}
      <div className="relative">{children}</div>
    </div>
  )
}

export default Card
