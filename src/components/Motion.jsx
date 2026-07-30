import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { motion } from '@/design/tokens'
import { formatNumber } from '@/lib/format'

/** Системная настройка «уменьшить движение» отключает всю анимацию */
function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * ДОСЧЁТ ЧИСЛА.
 * Величина не просто появляется — она набирается. Для сводных показателей
 * это даёт физическое ощущение масштаба: 126 млн ₸ «весит» больше, чем 3,4 млн.
 */
export function CountUp({
  value,
  duration = 900,
  decimals = 0,
  format,
  className,
  as: Component = 'span',
}) {
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? value : 0))
  const frameRef = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(value)
      return undefined
    }

    const start = performance.now()
    const from = 0

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration)
      // Совпадает с кривой decelerate: быстрый выход, мягкое торможение
      const eased = 1 - (1 - progress) ** 3
      setDisplay(from + (value - from) * eased)
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value, duration])

  const rounded = decimals > 0 ? Number(display.toFixed(decimals)) : Math.round(display)
  const text = format
    ? format(rounded)
    : decimals > 0
      ? rounded.toLocaleString('ru-RU', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : formatNumber(rounded)

  return <Component className={cn('tabular-nums', className)}>{text}</Component>
}

/**
 * КАСКАДНОЕ ПОЯВЛЕНИЕ.
 * Строки реестра и карточки проявляются с шагом 14ms — взгляд получает
 * порядок чтения сверху вниз вместо одномоментной вспышки всего экрана.
 */
export function Reveal({
  index = 0,
  stagger = motion.stagger,
  className,
  as: Component = 'div',
  children,
  ...rest
}) {
  return (
    <Component
      className={cn('animate-reveal-up', className)}
      style={{ animationDelay: `${index * stagger}ms` }}
      {...rest}
    >
      {children}
    </Component>
  )
}

/** Оборачивает список: каждый ребёнок получает свою задержку */
export function RevealList({ children, stagger = motion.stagger, className }) {
  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <Reveal key={child?.key ?? index} index={index} stagger={stagger}>
              {child}
            </Reveal>
          ))
        : children}
    </div>
  )
}

/**
 * СКЕЛЕТОН.
 * Мерцание сообщает «процесс идёт». Форма скелетона повторяет форму
 * будущего содержимого, поэтому переход не вызывает скачка вёрстки.
 */
export function Skeleton({ variant = 'line', width, height, onDark = false, className }) {
  const shapes = {
    line: 'h-3 rounded-sm',
    title: 'h-4 rounded-sm',
    display: 'h-9 rounded',
    block: 'h-16 rounded-md',
    circle: 'rounded-full',
    plate: 'h-[18px] w-16 rounded-sm',
    badge: 'h-5.5 w-24 rounded',
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block',
        onDark ? 'shimmer-dark' : 'shimmer',
        shapes[variant] ?? shapes.line,
        className,
      )}
      style={{ width, height }}
    />
  )
}

/** Скелетон строки реестра — под геометрию DataTable */
export function SkeletonRow({ columns = 6, onDark = false }) {
  return (
    <div className="flex h-row items-center gap-3 border-b border-hairline-soft px-3 last:border-b-0">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton
          key={index}
          onDark={onDark}
          className={index === 1 ? 'flex-1' : undefined}
          width={index === 1 ? undefined : index === 0 ? 56 : 72}
        />
      ))}
    </div>
  )
}

/**
 * ПРОХОД СВЕТА.
 * Однократный блик по верхней кромке блока при появлении — отмечает
 * «блок загрузился». Применяется к сводным полосам, не к каждой карточке.
 */
export function BeamSweep({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden', className)}
    >
      <span className="bg-beam-line animate-beam-sweep block h-px w-full" />
    </span>
  )
}

export default CountUp
