import { cn } from '@/lib/cn'
import { HallPlate } from '@/components/HallPlate'
import { formatRatio, wcagLevel } from '@/lib/contrast'

/** Раздел дизайн-системы. Номер в моно-табличке — тот же язык, что у указателей. */
export function Section({ id, num, title, description, children }) {
  return (
    <section id={id} className="scroll-mt-4 border-b border-hairline pb-10 last:border-b-0">
      <header className="mb-5 flex items-start gap-3 pt-9">
        <HallPlate tone="outline" size="lg" className="mt-1">
          {num}
        </HallPlate>
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold leading-tight text-ink-900">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-3xl text-md leading-normal text-ink-500">{description}</p>
          ) : null}
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

/** Блок демонстрации: подпись сверху, содержимое в белой панели. */
export function DemoBlock({ title, note, children, className, bodyClassName, tone = 'default' }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border border-hairline bg-white shadow-xs',
        className,
      )}
    >
      {title || note ? (
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline-soft bg-ink-25 px-4 py-2">
          <h3 className="text-2xs font-semibold uppercase tracking-label text-ink-500">{title}</h3>
          {note ? <p className="text-xs text-ink-400">{note}</p> : null}
        </div>
      ) : null}
      <div
        className={cn(
          'p-4',
          tone === 'canvas' && 'bg-canvas',
          tone === 'grid' && 'floorplan-grid',
          bodyClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}

/** Ряд с подписями — для перечислений «токен → значение → применение». */
export function SpecTable({ head, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            {head.map((cell) => (
              <th
                key={cell}
                className="h-7 border-b border-hairline px-2 text-2xs font-semibold uppercase tracking-label text-ink-400 first:pl-0"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-hairline-soft last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={cn(
                    'h-8 px-2 align-middle text-sm text-ink-700 first:pl-0',
                    cellIndex === 0 && 'font-mono text-xs text-ink-900',
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Плитка цвета шкалы */
export function Swatch({ name, hex, label, onLight = true, size = 'md' }) {
  return (
    <div className="min-w-0">
      <div
        className={cn(
          'rounded border border-black/5',
          size === 'lg' ? 'h-16' : size === 'sm' ? 'h-8' : 'h-11',
        )}
        style={{ backgroundColor: hex }}
      />
      <div className="mt-1.5 min-w-0">
        <p className="truncate text-xs font-medium text-ink-800">{name}</p>
        <p className="font-mono text-2xs uppercase tracking-plate text-ink-400">{hex}</p>
        {label ? <p className="mt-0.5 truncate text-2xs text-ink-400">{label}</p> : null}
        {onLight ? (
          <p className="mt-0.5 font-mono text-2xs text-ink-300">
            {formatRatio(hex, '#FFFFFF')} · {wcagLevel(hex, '#FFFFFF')}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/** Подпись к примеру внутри демо-блока */
export function DemoLabel({ children, className }) {
  return (
    <p className={cn('mb-2 text-2xs font-semibold uppercase tracking-label text-ink-400', className)}>
      {children}
    </p>
  )
}

/** Сетка примеров с равномерными отступами */
export function DemoRow({ children, className, align = 'center' }) {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-3',
        align === 'center' ? 'items-center' : 'items-end',
        className,
      )}
    >
      {children}
    </div>
  )
}
