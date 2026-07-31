import { cn } from '@/lib/cn'
import { formatDuration, formatRangeShort } from '@/lib/timeline'
import { hallById } from '@/demo/halls'
import { Icon } from './Icon'
import { HallPlate } from './HallPlate'

/**
 * РАЗБОР ПЕРЕСЕЧЕНИЯ — один блок для календаря, реестра и карточки.
 * Показывает не просто «конфликт», а какие именно фазы столкнулись и когда:
 * «Монтаж накладывается на демонтаж · 06.08 10:00 — 07.08 06:00».
 */
export function ConflictNotice({ conflict, className }) {
  const hall = hallById(conflict.hallId)
  const phases = conflict.phases ?? []

  return (
    <div
      className={cn(
        'rounded border border-status-conflict-border bg-status-conflict-soft p-2.5',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Icon name="alert-triangle" size={13} className="shrink-0 text-status-conflict-base" />
        <HallPlate tone="muted" size="sm">
          {hall?.code ?? '—'}
        </HallPlate>
        <span className="text-xs font-semibold tabular-nums text-status-conflict-text">
          {formatRangeShort(conflict.from, conflict.to)}
        </span>
        <span className="text-2xs text-status-conflict-text">
          · {formatDuration(conflict.to - conflict.from)} наложения
        </span>
      </div>

      <p className="mt-1.5 text-base leading-snug text-content">
        {conflict.a ? (
          <>
            <span className="font-medium">{conflict.a.name}</span>
            <span className="text-content-subtle"> ↔ </span>
            <span className="font-medium">{conflict.b.name}</span>
          </>
        ) : (
          <>
            Пересечение с <span className="font-medium">{conflict.event?.name}</span>
            <span className="text-content-subtle"> · {conflict.event?.tenant}</span>
          </>
        )}
      </p>

      {phases.length > 0 ? (
        <ul className="mt-1.5 space-y-0.5">
          {phases.slice(0, 3).map((phase, index) => (
            <li key={index} className="text-xs leading-snug text-status-conflict-text">
              {phase.phaseA} накладывается на {phase.phaseB.toLowerCase()} ·{' '}
              <span className="tabular-nums">{formatRangeShort(phase.from, phase.to)}</span>
            </li>
          ))}
          {phases.length > 3 ? (
            <li className="text-2xs text-status-conflict-text">
              и ещё {phases.length - 3} пар фаз
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  )
}

/**
 * Сводное предупреждение: почему подтверждение недоступно.
 * Появляется в форме создания, в карточке и в модальном окне переноса.
 */
export function ConflictBlockNotice({ conflicts, className, children }) {
  if (!conflicts?.length) return null
  const word =
    conflicts.length === 1 ? 'пересечение' : conflicts.length < 5 ? 'пересечения' : 'пересечений'

  return (
    <div
      className={cn(
        'rounded-md border border-status-conflict-border bg-status-conflict-soft p-3',
        className,
      )}
    >
      <p className="flex items-center gap-2 text-base font-semibold text-status-conflict-text">
        <Icon name="alert-triangle" size={15} />
        Помещение занято: {conflicts.length} {word}
      </p>
      <p className="mt-1 text-xs leading-normal text-status-conflict-text">
        {children ??
          'Подтвердить бронирование нельзя. Измените даты или помещение — либо отправьте заявку на согласование уполномоченному лицу.'}
      </p>
      <div className="mt-2.5 space-y-2">
        {conflicts.map((conflict, index) => (
          <ConflictNotice key={conflict.id ?? index} conflict={conflict} className="bg-surface" />
        ))}
      </div>
    </div>
  )
}

export default ConflictNotice
