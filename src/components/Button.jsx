import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from './Icon'

/**
 * КНОПКИ.
 * Залитые получают верхний блик (shadow-button) — кромка читается как
 * фрезерованная. Фокус — луч, не серое кольцо. Все варианты работают
 * в обеих темах: цвета приходят из семантических токенов.
 *
 * Варианты *-nav — для кнопок внутри каркаса (топбар, шапка панели).
 */
const VARIANTS = {
  primary:
    'bg-primary text-primary-fg border-primary-line hover:bg-primary-hover active:bg-primary-active shadow-button',
  secondary:
    'bg-surface-raised text-content border-hairline-strong hover:border-content-faint active:bg-surface-muted shadow-button-quiet',
  danger:
    'bg-danger-600 text-white border-danger-800 hover:bg-danger-500 active:bg-danger-700 shadow-button',
  ghost:
    'bg-transparent text-content-muted border-transparent hover:bg-surface-muted hover:text-content active:bg-surface-sunken',
  subtle:
    'bg-accent-soft text-accent-strong border-accent-line hover:brightness-[0.97] active:brightness-95',
  link: 'bg-transparent text-accent-fg border-transparent underline-offset-2 hover:underline hover:text-accent-strong px-0',
  /** Главный CTA сводных экранов: свет как призыв к действию */
  beam: 'bg-accent text-content-inverse border-transparent hover:shadow-beam active:brightness-95 shadow-button',
  /* ── Внутри каркаса ── */
  'primary-nav':
    'bg-accent text-content-inverse border-transparent font-semibold hover:shadow-beam active:brightness-95 shadow-button',
  'secondary-nav':
    'bg-nav-hover text-nav-fg border-nav-line hover:border-hairline-strong active:brightness-95 shadow-button-quiet',
  'ghost-nav':
    'bg-transparent text-nav-subtle border-transparent hover:bg-nav-hover hover:text-nav-fg',
}

const NAV_VARIANTS = new Set(['primary-nav', 'secondary-nav', 'ghost-nav'])

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
        NAV_VARIANTS.has(variant) ? 'focus-ring-nav' : 'focus-ring',
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
        NAV_VARIANTS.has(variant) ? 'focus-ring-nav' : 'focus-ring',
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
