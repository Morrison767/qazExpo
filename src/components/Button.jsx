import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from './Icon'

const VARIANTS = {
  primary:
    'bg-navy-600 text-white border-navy-700 hover:bg-navy-700 active:bg-navy-800 shadow-xs',
  secondary:
    'bg-white text-ink-800 border-hairline-strong hover:bg-ink-50 hover:border-ink-400 active:bg-ink-100 shadow-xs',
  danger:
    'bg-danger-600 text-white border-danger-700 hover:bg-danger-700 active:bg-danger-800 shadow-xs',
  ghost:
    'bg-transparent text-ink-600 border-transparent hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200',
  subtle:
    'bg-navy-50 text-navy-700 border-navy-100 hover:bg-navy-100 hover:border-navy-200 active:bg-navy-200',
  link: 'bg-transparent text-navy-600 border-transparent underline-offset-2 hover:underline hover:text-navy-700 px-0',
}

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
        'focus-ring inline-flex select-none items-center justify-center whitespace-nowrap border font-medium transition-colors duration-fast',
        'disabled:pointer-events-none disabled:opacity-45',
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
        'focus-ring inline-flex shrink-0 items-center justify-center border transition-colors duration-fast',
        'disabled:pointer-events-none disabled:opacity-45',
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
