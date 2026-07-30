import { cloneElement, forwardRef, isValidElement, useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { useAutoId } from '@/lib/hooks'
import { Icon } from './Icon'

/* ─────────────────────────────────────────────────────────────
   Обёртка поля: метка, хинт, ошибка, признак обязательности.
   Микро-метка в CAPS с трекингом — тот же приём, что в табличках
   и заголовках таблиц: единый «указательный» язык интерфейса.
   ───────────────────────────────────────────────────────────── */
export function Field({
  label,
  hint,
  error,
  required = false,
  optional = false,
  htmlFor,
  labelSuffix,
  className,
  children,
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <div className="flex items-baseline justify-between gap-2">
          <label
            htmlFor={htmlFor}
            className="text-2xs font-semibold uppercase tracking-label text-ink-500"
          >
            {label}
            {required ? <span className="ml-1 text-danger-600">*</span> : null}
            {optional ? <span className="ml-1 font-normal text-ink-400">не обяз.</span> : null}
          </label>
          {labelSuffix}
        </div>
      ) : null}
      {children}
      {error ? (
        <p className="flex items-start gap-1 text-xs text-danger-700">
          <Icon name="alert-circle" size={12} className="mt-px" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Базовые классы контролов — единая геометрия для input/select/textarea
   ───────────────────────────────────────────────────────────── */
const CONTROL_BASE =
  'w-full appearance-none border bg-white text-ink-900 transition-all duration-fast placeholder:text-ink-400 ' +
  'hover:border-ink-400 focus:border-beam-500 focus:outline-none focus:ring-2 focus:ring-beam-400/25 focus:shadow-beam-sm ' +
  'disabled:cursor-not-allowed disabled:border-hairline disabled:bg-ink-50 disabled:text-ink-400 disabled:shadow-none ' +
  'read-only:bg-ink-25 read-only:text-ink-600'

const CONTROL_SIZES = {
  sm: 'h-control-sm rounded-sm px-2 text-xs',
  md: 'h-control rounded px-2.5 text-base',
  lg: 'h-control-lg rounded-md px-3 text-md',
}

const TEXTAREA_SIZES = {
  sm: 'rounded-sm px-2 py-1.5 text-xs',
  md: 'rounded px-2.5 py-2 text-base',
  lg: 'rounded-md px-3 py-2.5 text-md',
}

function controlClasses(size, invalid, extra) {
  return cn(
    CONTROL_BASE,
    CONTROL_SIZES[size] ?? CONTROL_SIZES.md,
    invalid
      ? 'border-danger-400 hover:border-danger-500 focus:border-danger-500 focus:ring-danger-100'
      : 'border-hairline-strong',
    extra,
  )
}

/* ── Input с необязательными адорнментами ─────────────────── */
export const Input = forwardRef(function Input(
  { size = 'md', invalid = false, iconLeft, suffix, mono = false, className, ...rest },
  ref,
) {
  const hasLeft = Boolean(iconLeft)
  const hasRight = Boolean(suffix)

  const input = (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={controlClasses(
        size,
        invalid,
        cn(
          mono && 'font-mono tracking-tight',
          hasLeft && (size === 'sm' ? 'pl-7' : 'pl-8'),
          hasRight && 'pr-9',
          className,
        ),
      )}
      {...rest}
    />
  )

  if (!hasLeft && !hasRight) return input

  return (
    <div className="relative flex items-center">
      {hasLeft ? (
        <Icon
          name={iconLeft}
          size={size === 'sm' ? 13 : 14}
          className={cn(
            'pointer-events-none absolute text-ink-400',
            size === 'sm' ? 'left-2' : 'left-2.5',
          )}
        />
      ) : null}
      {input}
      {hasRight ? (
        <span className="pointer-events-none absolute right-2.5 text-xs text-ink-400">
          {suffix}
        </span>
      ) : null}
    </div>
  )
})

/* ── Поиск ─────────────────────────────────────────────────── */
export const SearchInput = forwardRef(function SearchInput(
  { size = 'md', onClear, value, hint, className, ...rest },
  ref,
) {
  const showClear = Boolean(onClear && value)
  return (
    <div className={cn('relative flex items-center', className)}>
      <Icon
        name="search"
        size={14}
        className="pointer-events-none absolute left-2.5 text-ink-400"
      />
      <input
        ref={ref}
        type="search"
        value={value}
        className={controlClasses(size, false, cn('pl-8', showClear || hint ? 'pr-16' : 'pr-2.5'))}
        {...rest}
      />
      {showClear ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Очистить поиск"
          className="focus-ring absolute right-2 flex h-4 w-4 items-center justify-center rounded-sm text-ink-400 hover:bg-ink-100 hover:text-ink-700"
        >
          <Icon name="x" size={11} />
        </button>
      ) : hint ? (
        <kbd className="pointer-events-none absolute right-2 rounded-sm border border-hairline bg-ink-50 px-1 py-px font-mono text-2xs text-ink-400">
          {hint}
        </kbd>
      ) : null}
    </div>
  )
})

/* ── Textarea ──────────────────────────────────────────────── */
export const Textarea = forwardRef(function Textarea(
  { size = 'md', invalid = false, rows = 3, className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL_BASE,
        TEXTAREA_SIZES[size] ?? TEXTAREA_SIZES.md,
        'min-h-16 resize-y leading-snug',
        invalid
          ? 'border-danger-400 hover:border-danger-500 focus:border-danger-500 focus:ring-danger-100'
          : 'border-hairline-strong',
        className,
      )}
      {...rest}
    />
  )
})

/* ── Select ────────────────────────────────────────────────── */
export const Select = forwardRef(function Select(
  { size = 'md', invalid = false, options, placeholder, children, className, ...rest },
  ref,
) {
  return (
    <div className="relative flex items-center">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={controlClasses(
          size,
          invalid,
          cn('cursor-pointer pr-8 [&:invalid]:text-ink-400', className),
        )}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options
          ? options.map((option) =>
              typeof option === 'string' ? (
                <option key={option} value={option}>
                  {option}
                </option>
              ) : (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ),
            )
          : children}
      </select>
      <Icon
        name="chevron-down"
        size={13}
        className="pointer-events-none absolute right-2.5 text-ink-400"
      />
    </div>
  )
})

/* ── Дата / дата-время ─────────────────────────────────────── */
export const DateField = forwardRef(function DateField(
  { size = 'md', invalid = false, withTime = false, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={withTime ? 'datetime-local' : 'date'}
      aria-invalid={invalid || undefined}
      className={controlClasses(size, invalid, cn('font-mono tabular-nums', className))}
      {...rest}
    />
  )
})

/**
 * Период «с — по». Базовый паттерн системы: монтаж, проведение, демонтаж,
 * срок действия договора — везде вводятся парой.
 */
export function DateRangeField({
  size = 'md',
  withTime = false,
  fromProps = {},
  toProps = {},
  invalid = false,
  className,
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DateField size={size} withTime={withTime} invalid={invalid} {...fromProps} />
      <span className="shrink-0 text-ink-400">—</span>
      <DateField size={size} withTime={withTime} invalid={invalid} {...toProps} />
    </div>
  )
}

/* ── Чекбокс ───────────────────────────────────────────────── */
export const Checkbox = forwardRef(function Checkbox(
  { label, description, indeterminate = false, className, id, ...rest },
  ref,
) {
  const autoId = useAutoId('cb')
  const inputId = id ?? autoId
  const innerRef = useRef(null)

  useEffect(() => {
    const node = innerRef.current
    if (node) node.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <div className={cn('flex items-start gap-2', className)}>
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          ref={(node) => {
            innerRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          id={inputId}
          type="checkbox"
          className={cn(
            'peer h-4 w-4 cursor-pointer appearance-none rounded-xs border border-hairline-strong bg-white transition-all duration-fast',
            'hover:border-beam-500',
            'checked:border-beam-700 checked:bg-beam-700 checked:shadow-beam-sm indeterminate:border-beam-700 indeterminate:bg-beam-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beam-400/70 focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:border-hairline disabled:bg-ink-100 disabled:shadow-none',
          )}
          {...rest}
        />
        <Icon
          name={indeterminate ? 'minus' : 'check'}
          size={11}
          strokeWidth={2.4}
          className="pointer-events-none absolute hidden text-white peer-checked:block peer-indeterminate:block"
        />
      </span>
      {label || description ? (
        <label htmlFor={inputId} className="cursor-pointer select-none leading-tight">
          <span className="block text-base text-ink-800">{label}</span>
          {description ? (
            <span className="mt-0.5 block text-xs text-ink-400">{description}</span>
          ) : null}
        </label>
      ) : null}
    </div>
  )
})

/* ── Радио ─────────────────────────────────────────────────── */
export const Radio = forwardRef(function Radio(
  { label, description, className, id, ...rest },
  ref,
) {
  const autoId = useAutoId('rd')
  const inputId = id ?? autoId
  return (
    <div className={cn('flex items-start gap-2', className)}>
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className={cn(
            'peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-hairline-strong bg-white transition-all duration-fast',
            'hover:border-beam-500 checked:border-beam-700 checked:bg-beam-700 checked:shadow-beam-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beam-400/70 focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:border-hairline disabled:bg-ink-100 disabled:shadow-none',
          )}
          {...rest}
        />
        <span className="pointer-events-none absolute hidden h-1.5 w-1.5 rounded-full bg-white peer-checked:block" />
      </span>
      {label || description ? (
        <label htmlFor={inputId} className="cursor-pointer select-none leading-tight">
          <span className="block text-base text-ink-800">{label}</span>
          {description ? (
            <span className="mt-0.5 block text-xs text-ink-400">{description}</span>
          ) : null}
        </label>
      ) : null}
    </div>
  )
})

/** Группа радио с общим name */
export function RadioGroup({ name, value, onChange, options, direction = 'column', className }) {
  return (
    <div
      role="radiogroup"
      className={cn(
        'flex gap-x-5 gap-y-2.5',
        direction === 'row' ? 'flex-row flex-wrap' : 'flex-col',
        className,
      )}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          label={option.label}
          description={option.description}
          disabled={option.disabled}
          checked={value === option.value}
          onChange={() => onChange?.(option.value)}
        />
      ))}
    </div>
  )
}

/** Переключатель — для настроек и фильтров «вкл/выкл» */
export const Switch = forwardRef(function Switch({ label, className, id, ...rest }, ref) {
  const autoId = useAutoId('sw')
  const inputId = id ?? autoId
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <label
        htmlFor={inputId}
        className="relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer items-center"
      >
        <input ref={ref} id={inputId} type="checkbox" className="peer sr-only" {...rest} />
        <span className="absolute inset-0 rounded-full bg-ink-300 transition-all duration-base ease-spring peer-checked:bg-beam-700 peer-checked:shadow-beam-sm peer-disabled:bg-ink-200 peer-focus-visible:ring-2 peer-focus-visible:ring-beam-400/70 peer-focus-visible:ring-offset-1" />
        <span className="absolute left-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-base ease-spring peer-checked:translate-x-3.5" />
      </label>
      {label ? (
        <label htmlFor={inputId} className="cursor-pointer select-none text-base text-ink-800">
          {label}
        </label>
      ) : null}
    </div>
  )
})

/** Автопривязка id: <FieldWithControl label="..."><Input/></FieldWithControl> */
export function FieldWithControl({ children, ...fieldProps }) {
  const id = useAutoId('fld')
  const control = isValidElement(children) ? cloneElement(children, { id }) : children
  return (
    <Field htmlFor={id} {...fieldProps}>
      {control}
    </Field>
  )
}
