import { cn } from '@/lib/cn'
import { Icon } from './Icon'

/**
 * Нейтральный бейдж — для НЕстатусных признаков: тип мероприятия,
 * формат, объект проведения, вид работ подрядчика.
 * Статусы всегда через <StatusBadge> — палитра статусов не переиспользуется.
 */
const TONES = {
  neutral: 'bg-surface-muted text-content-muted border-transparent',
  outline: 'bg-surface text-content-subtle border-hairline-strong',
  navy: 'bg-accent-soft text-accent-strong border-accent-line',
  signal: 'bg-signal-50 text-signal-800 border-signal-200',
}

const SIZES = {
  sm: 'h-[18px] gap-1 rounded-sm px-1.5 text-2xs',
  md: 'h-5.5 gap-1.5 rounded px-2 text-xs',
}

export function Badge({ tone = 'neutral', size = 'md', icon, className, children, ...rest }) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center border font-medium leading-none',
        TONES[tone] ?? TONES.neutral,
        SIZES[size] ?? SIZES.md,
        className,
      )}
      {...rest}
    >
      {icon ? <Icon name={icon} size={size === 'sm' ? 10 : 12} /> : null}
      <span className="truncate">{children}</span>
    </span>
  )
}

/** Счётчик — для табов, навигации и уведомлений */
export function Counter({ value, tone = 'neutral', className }) {
  const tones = {
    neutral: 'bg-surface-muted text-content-subtle',
    navy: 'bg-accent-soft text-accent-strong',
    beam: 'bg-accent-soft text-accent-strong',
    danger: 'bg-danger-600 text-white',
    signal: 'bg-signal-600 text-white',
  }
  return (
    <span
      className={cn(
        'inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-2xs font-semibold tabular-nums leading-none tracking-normal',
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {value}
    </span>
  )
}

export default Badge
