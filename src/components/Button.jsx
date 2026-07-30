import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from './Icon'

/**
 * КНОПКИ.
 * Залитые получают верхний блик (shadow-button) — кромка читается как
 * фрезерованная, а не как плоский прямоугольник. Фокус — луч, не серое кольцо.
 * На корпусе прибора работают варианты *-dark.
 */
const VARIANTS = {
  primary:
    'bg-navy-600 text-white border-navy-800 hover:bg-navy-500 active:bg-navy-700 shadow-button',
  secondary:
    'bg-surface-raised text-ink-800 border-hairline-strong hover:border-ink-400 hover:bg-white active:bg-ink-50 shadow-button-light',
  danger:
    'bg-danger-600 text-white border-danger-800 hover:bg-danger-500 active:bg-danger-700 shadow-button',
  ghost:
    'bg-transparent text-ink-600 border-transparent hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200',
  subtle:
    'bg-beam-50 text-beam-800 border-beam-200 hover:bg-beam-100 hover:border-beam-300 active:bg-beam-200',
  link: 'bg-transparent text-beam-700 border-transparent underline-offset-2 hover:underline hover:text-beam-800 px-0',
  /** Главный CTA сводных экранов: свет как призыв к действию */
  beam: 'bg-beam-700 text-white border-beam-800 hover:bg-beam-600 active:bg-beam-800 shadow-button hover:shadow-beam',
  /* ── На корпусе прибора ── */
  'primary-dark':
    'bg-beam-500 text-obsidian-950 border-beam-600 hover:bg-beam-400 active:bg-beam-600 shadow-button font-semibold',
  'secondary-dark':
    'bg-white/[0.06] text-obsidian-50 border-white/[0.12] hover:bg-white/[0.1] hover:border-white/20 active:bg-white/[0.14] shadow-button-dark',
  'ghost-dark':
    'bg-transparent text-obsidian-200 border-transparent hover:bg-white/[0.07] hover:text-white active:bg-white/[0.1]',
}

const DARK_VARIANTS = new Set(['primary-dark', 'secondary-dark', 'ghost-dark'])

const SIZES = {
  sm: 'h-control-sm gap-1.5 rounded-sm px-2.5 text-xs',
  md: 'h-control gap-1.5 rounded px-3 text-base',
  lg: 'h-control-lg gap-2 rounded-md px-4 text-md',
}

const ICON_SIZES = { sm: 13, md: 14, lg: 15 }

export const Button = forwardRef(function Button(
  {
    variant = 'secondary',
    size = 'md',
    iconLeft,
    iconRight,
    loading = false,
    block = false,
    disabled = false,
    type = 'button',
    as: Component = 'button',
    className,
    children,
    ...rest
  },
  ref,
) {
  const iconSize = ICON_SIZES[size] ?? 14
  const isDisabled = disabled || loading

  return (
    <Component
      ref={ref}
      type={Component === 'button' ? type : undefined}
      disabled={Component === 'button' ? isDisabled : undefined}
      aria-busy={loading || undefined}
      aria-disabled={Component !== 'button' && isDisabled ? true : undefined}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap border font-medium transition-all duration-fast ease-decelerate',
        'disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none',
        DARK_VARIANTS.has(variant) ? 'focus-ring-dark' : 'focus-ring',
        VARIANTS[variant] ?? VARIANTS.secondary,
        SIZES[size] ?? SIZES.md,
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Icon name="loader" size={iconSize} className="animate-spin" />
      ) : iconLeft ? (
        <Icon name={iconLeft} size={iconSize} />
      ) : null}
      {children}
      {iconRight && !loading ? <Icon name={iconRight} size={iconSize} /> : null}
    </Component>
  )
})

const ICON_BUTTON_SIZES = {
  sm: 'h-control-sm w-control-sm rounded-sm',
  md: 'h-control w-control rounded',
  lg: 'h-control-lg w-control-lg rounded-md',
}

export const IconButton = forwardRef(function IconButton(
  {
    icon,
    label,
    variant = 'ghost',
    size = 'md',
    loading = false,
    disabled = false,
    className,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 items-center justify-center border transition-all duration-fast ease-decelerate',
        'disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none',
        DARK_VARIANTS.has(variant) ? 'focus-ring-dark' : 'focus-ring',
        VARIANTS[variant] ?? VARIANTS.ghost,
        ICON_BUTTON_SIZES[size] ?? ICON_BUTTON_SIZES.md,
        className,
      )}
      {...rest}
    >
      <Icon
        name={loading ? 'loader' : icon}
        size={ICON_SIZES[size] ?? 14}
        className={loading ? 'animate-spin' : undefined}
      />
    </button>
  )
})

/** Группа кнопок с общими границами — для панелей действий над реестром */
export function ButtonGroup({ children, className }) {
  return (
    <div
      className={cn(
        'inline-flex items-center [&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:hover]:relative [&>*:focus-visible]:relative',
        className,
      )}
    >
      {children}
    </div>
  )
}

export default Button
