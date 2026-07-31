import { useMemo } from 'react'
import { cn } from '@/lib/cn'
import { hexToRgba } from '@/lib/color'
import {
  occupiedRange,
  phaseSegments,
  phaseStyle,
  statusBase,
  timeToX,
  totalWidth as sumWidth,
} from '@/lib/timeline'
import { status as statusTokens } from '@/design/tokens'
import { Icon } from './Icon'

/**
 * ═══════════════════════════════════════════════════════════════
 *  ТАЙМЛАЙН ЗАНЯТОСТИ ПОМЕЩЕНИЙ
 * ═══════════════════════════════════════════════════════════════
 *
 * Слева закреплённый список залов, сгруппированных по объектам,
 * справа прокручиваемая шкала времени. Полоса мероприятия склеена
 * из сегментов фаз: цвет = статус, паттерн = фаза.
 *
 * Пересечения рисуются ОТДЕЛЬНЫМ слоем поверх полос — красная
 * штриховка со свечением ровно на область наложения. Это самый
 * заметный элемент экрана, как и требует п. 5.2 ТЗ.
 */
const LEFT_WIDTH = 248
const ROW_HEIGHT = 46
const GROUP_HEIGHT = 32
const BAR_INSET = 7

const CONFLICT = statusTokens.conflict.base

export function Timeline({
  columns,
  columnGroups,
  scale,
  groups,
  events,
  conflicts = [],
  conflictIds,
  ghost = null,
  todayTime,
  selectedId,
  onSelectEvent,
  onHoverEvent,
  onBarPointerDown,
  onNudge,
  onEmptyClick,
  maxHeight = '60vh',
  className,
}) {
  const width = sumWidth(columns)

  const eventsByHall = useMemo(() => {
    const map = new Map()
    for (const event of events) {
      if (!event.hallId) continue
      if (!map.has(event.hallId)) map.set(event.hallId, [])
      map.get(event.hallId).push(event)
    }
    return map
  }, [events])

  const conflictsByHall = useMemo(() => {
    const map = new Map()
    for (const conflict of conflicts) {
      if (!map.has(conflict.hallId)) map.set(conflict.hallId, [])
      map.get(conflict.hallId).push(conflict)
    }
    return map
  }, [conflicts])

  const nowX = todayTime != null ? timeToX(todayTime, columns) : null
  const nowVisible =
    todayTime != null && columns.length > 0 && todayTime >= columns[0].from && todayTime < columns[columns.length - 1].to

  return (
    <div
      className={cn(
        'relative overflow-auto rounded-md border border-hairline bg-surface-raised',
        className,
      )}
      style={{ maxHeight }}
    >
      <div style={{ width: LEFT_WIDTH + width, minWidth: '100%' }}>
        {/* ── Шапка ─────────────────────────────────────── */}
        <div className="sticky top-0 z-30 flex">
          <div
            className="sticky left-0 z-40 flex shrink-0 flex-col justify-end border-b border-r border-hairline bg-surface-sunken px-3 pb-1.5 pt-2"
            style={{ width: LEFT_WIDTH }}
          >
            <span className="text-2xs font-semibold uppercase tracking-label text-content-faint">
              Помещение
            </span>
          </div>

          <div className="relative shrink-0 border-b border-hairline bg-surface-sunken" style={{ width }}>
            {/* Верхний ярус: месяцы / дата / год */}
            <div className="relative h-6">
              {columnGroups.map((group) => (
                <div
                  key={`${group.label}-${group.x}`}
                  className="absolute top-0 flex h-6 items-center border-l border-hairline px-2"
                  style={{ left: group.x, width: group.width }}
                >
                  <span className="truncate text-2xs font-semibold uppercase tracking-label text-content-subtle">
                    {group.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Нижний ярус: колонки */}
            <div className="relative h-7">
              {columns.map((column) => (
                <div
                  key={column.from}
                  className={cn(
                    'absolute top-0 flex h-7 flex-col items-center justify-center border-l border-hairline',
                    column.isWeekend && 'bg-surface-muted',
                    column.isNight && 'bg-surface-muted',
                    column.isToday && 'bg-accent-soft',
                  )}
                  style={{ left: column.x, width: column.width }}
                >
                  <span
                    className={cn(
                      'text-2xs font-semibold tabular-nums leading-none',
                      column.isToday ? 'text-accent-strong' : 'text-content-muted',
                    )}
                  >
                    {column.label}
                  </span>
                  {column.sublabel ? (
                    <span
                      className={cn(
                        'mt-0.5 text-[0.5625rem] uppercase leading-none',
                        column.isToday ? 'text-accent-fg' : 'text-content-faint',
                      )}
                    >
                      {column.sublabel}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Строки ────────────────────────────────────── */}
        {groups.map((group) => {
          const groupConflicts = group.halls.reduce(
            (acc, hall) => acc + (conflictsByHall.get(hall.id)?.length ?? 0),
            0,
          )

          return (
            <div key={group.object.key}>
              {/* Заголовок объекта */}
              <div className="flex border-b border-hairline bg-surface-sunken">
                <div
                  className="sticky left-0 z-20 flex shrink-0 items-center gap-2 bg-surface-sunken px-3"
                  style={{ width: LEFT_WIDTH, height: GROUP_HEIGHT }}
                >
                  <Icon name="building" size={13} className="shrink-0 text-content-faint" />
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-content">
                    {group.object.name}
                  </span>
                  {groupConflicts > 0 ? (
                    <span
                      className="shrink-0 rounded-full px-1.5 text-2xs font-semibold tabular-nums leading-4 text-white"
                      style={{ backgroundColor: CONFLICT }}
                      title={`Пересечений: ${groupConflicts}`}
                    >
                      {groupConflicts}
                    </span>
                  ) : (
                    <span className="shrink-0 text-2xs tabular-nums text-content-faint">
                      {group.halls.length}
                    </span>
                  )}
                </div>
                <div className="relative shrink-0" style={{ width, height: GROUP_HEIGHT }}>
                  {columns.map((column) => (
                    <span
                      key={column.from}
                      className={cn(
                        'absolute top-0 h-full border-l border-hairline-soft',
                        column.isWeekend && 'bg-surface-muted/60',
                      )}
                      style={{ left: column.x, width: column.width }}
                    />
                  ))}
                </div>
              </div>

              {/* Залы объекта */}
              {group.halls.map((hall) => {
                const hallEvents = eventsByHall.get(hall.id) ?? []
                const hallConflicts = conflictsByHall.get(hall.id) ?? []
                const hasConflict = hallConflicts.length > 0

                return (
                  <div key={hall.id} className="flex border-b border-hairline-soft last:border-b-0">
                    {/* Левая колонка: зал */}
                    <div
                      className={cn(
                        'sticky left-0 z-20 flex shrink-0 items-center gap-2 border-r border-hairline bg-surface px-3',
                        hasConflict && 'bg-status-conflict-soft',
                      )}
                      style={{ width: LEFT_WIDTH, height: ROW_HEIGHT }}
                    >
                      {hasConflict ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 left-0 w-rail"
                          style={{ backgroundColor: CONFLICT, boxShadow: `0 0 10px 0 ${hexToRgba(CONFLICT, 0.6)}` }}
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5">
                          <span className="truncate font-mono text-xs font-semibold text-content">
                            {hall.code}
                          </span>
                          {hasConflict ? (
                            <Icon
                              name="alert-triangle"
                              size={11}
                              className="shrink-0 text-status-conflict-base"
                            />
                          ) : null}
                        </p>
                        <p className="truncate text-2xs text-content-faint">{hall.name}</p>
                      </div>
                      <span className="shrink-0 text-2xs tabular-nums text-content-faint">
                        {hall.capacity}
                      </span>
                    </div>

                    {/* Дорожка времени */}
                    <div
                      data-hall-id={hall.id}
                      className="relative shrink-0"
                      style={{ width, height: ROW_HEIGHT }}
                      onClick={(clickEvent) => {
                        if (clickEvent.target === clickEvent.currentTarget) {
                          onEmptyClick?.(hall, clickEvent)
                        }
                      }}
                    >
                      {/* Сетка и выходные */}
                      {columns.map((column) => (
                        <span
                          key={column.from}
                          className={cn(
                            'pointer-events-none absolute top-0 h-full border-l border-hairline-soft',
                            column.isWeekend && 'bg-surface-muted/50',
                            column.isNight && 'bg-surface-muted/40',
                          )}
                          style={{ left: column.x, width: column.width }}
                        />
                      ))}

                      {/* Полосы мероприятий */}
                      {hallEvents.map((event) => (
                        <EventBar
                          key={event.id}
                          event={event}
                          columns={columns}
                          conflicting={conflictIds?.has(event.id)}
                          selected={selectedId === event.id}
                          onSelect={onSelectEvent}
                          onHover={onHoverEvent}
                          onPointerDown={onBarPointerDown}
                          onNudge={onNudge}
                        />
                      ))}

                      {/* Призрачная полоса: черновик или перетаскивание */}
                      {ghost && ghost.hallId === hall.id ? (
                        <GhostBar ghost={ghost} columns={columns} />
                      ) : null}

                      {/* Пересечения — самый верхний слой */}
                      {hallConflicts.map((conflict) => (
                        <ConflictBand
                          key={conflict.id}
                          conflict={conflict}
                          columns={columns}
                        />
                      ))}

                      {/* Линия «сейчас» */}
                      {nowVisible ? (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 z-10 w-px bg-accent"
                          style={{ left: nowX, boxShadow: '0 0 8px 0 var(--accent-glow)' }}
                        />
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}

        {groups.length === 0 ? (
          <div className="flex items-center justify-center px-4 py-10">
            <p className="text-xs text-content-faint">Под фильтр не попало ни одного помещения</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Полоса мероприятия
   ───────────────────────────────────────────────────────────── */
function EventBar({
  event,
  columns,
  conflicting,
  selected,
  onSelect,
  onHover,
  onPointerDown,
  onNudge,
}) {
  const range = occupiedRange(event)
  if (!range) return null

  const windowFrom = columns[0]?.from
  const windowTo = columns[columns.length - 1]?.to
  if (range.to <= windowFrom || range.from >= windowTo) return null

  const left = timeToX(range.from, columns)
  const right = timeToX(range.to, columns)
  const width = Math.max(6, right - left)
  const base = statusBase(event.status)
  const segments = phaseSegments(event)
  const showLabel = width > 64

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${event.name}, ${event.hall}`}
      className={cn(
        'group absolute cursor-grab overflow-hidden rounded-sm active:cursor-grabbing',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        selected && 'z-20',
      )}
      style={{
        left,
        width,
        top: BAR_INSET,
        height: ROW_HEIGHT - BAR_INSET * 2,
        border: `1px solid ${conflicting ? CONFLICT : hexToRgba(base, 0.85)}`,
        boxShadow: conflicting
          ? `0 0 0 1px ${CONFLICT}, 0 0 12px 0 ${hexToRgba(CONFLICT, 0.55)}`
          : selected
            ? `0 0 0 2px ${hexToRgba(base, 0.35)}`
            : undefined,
        zIndex: conflicting ? 15 : selected ? 12 : 5,
      }}
      onPointerDown={(pointerEvent) => onPointerDown?.(event, pointerEvent)}
      onClick={() => onSelect?.(event)}
      onKeyDown={(keyEvent) => {
        if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
          keyEvent.preventDefault()
          onSelect?.(event)
          return
        }
        /* Сдвиг с клавиатуры: доступность и удобный способ показать проверку */
        if (keyEvent.shiftKey && (keyEvent.key === 'ArrowLeft' || keyEvent.key === 'ArrowRight')) {
          keyEvent.preventDefault()
          onNudge?.(event, keyEvent.key === 'ArrowLeft' ? -1 : 1)
        }
      }}
      onMouseEnter={(mouseEvent) =>
        onHover?.(event, mouseEvent.currentTarget.getBoundingClientRect())
      }
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Сегменты фаз: паттерн различает фазу, цвет — статус */}
      {segments.map((segment) => {
        const segmentLeft = timeToX(segment.from, columns) - left
        const segmentWidth = Math.max(2, timeToX(segment.to, columns) - timeToX(segment.from, columns))
        return (
          <span
            key={segment.key}
            aria-hidden="true"
            className="absolute inset-y-0"
            style={{ left: segmentLeft, width: segmentWidth, ...phaseStyle(segment.key, base) }}
          />
        )
      })}

      {showLabel ? (
        <span
          className="relative z-10 flex h-full items-center gap-1 px-1.5"
          style={{ color: '#FFFFFF' }}
        >
          <span
            className="truncate text-2xs font-semibold leading-none"
            style={{ textShadow: `0 1px 2px ${hexToRgba('#000000', 0.55)}` }}
          >
            {event.name}
          </span>
        </span>
      ) : null}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Область пересечения — главный сигнал экрана
   ───────────────────────────────────────────────────────────── */
function ConflictBand({ conflict, columns }) {
  const windowFrom = columns[0]?.from
  const windowTo = columns[columns.length - 1]?.to
  if (conflict.to <= windowFrom || conflict.from >= windowTo) return null

  const left = timeToX(conflict.from, columns)
  const width = Math.max(4, timeToX(conflict.to, columns) - left)

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute z-30 rounded-sm"
      style={{
        left,
        width,
        top: 2,
        bottom: 2,
        backgroundImage: `repeating-linear-gradient(135deg, ${hexToRgba(CONFLICT, 0.95)} 0 4px, ${hexToRgba(CONFLICT, 0.35)} 4px 9px)`,
        boxShadow: `0 0 0 1.5px ${CONFLICT}, 0 0 16px 2px ${hexToRgba(CONFLICT, 0.6)}`,
      }}
    >
      {width > 26 ? (
        <span className="flex h-full items-center justify-center">
          <Icon name="alert-triangle" size={13} className="text-white drop-shadow" />
        </span>
      ) : null}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────
   Призрачная полоса: черновик в форме или перетаскивание
   ───────────────────────────────────────────────────────────── */
function GhostBar({ ghost, columns }) {
  const windowFrom = columns[0]?.from
  const windowTo = columns[columns.length - 1]?.to
  if (ghost.to <= windowFrom || ghost.from >= windowTo) return null

  const left = timeToX(ghost.from, columns)
  const width = Math.max(6, timeToX(ghost.to, columns) - left)
  const base = ghost.conflicting ? CONFLICT : statusBase(ghost.status ?? 'review')

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute z-40 rounded-sm"
      style={{
        left,
        width,
        top: 3,
        bottom: 3,
        border: `1.5px dashed ${base}`,
        backgroundColor: hexToRgba(base, ghost.conflicting ? 0.3 : 0.18),
        boxShadow: ghost.conflicting ? `0 0 14px 2px ${hexToRgba(CONFLICT, 0.55)}` : undefined,
      }}
    >
      <span className="flex h-full items-center gap-1 px-1.5">
        {ghost.conflicting ? (
          <Icon name="alert-triangle" size={11} style={{ color: CONFLICT }} />
        ) : null}
        {width > 74 ? (
          <span
            className="truncate text-2xs font-semibold"
            style={{ color: ghost.conflicting ? CONFLICT : 'var(--content)' }}
          >
            {ghost.label ?? 'Новое мероприятие'}
          </span>
        ) : null}
      </span>
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────
   Легенда: фазы (паттерны) и статусы (цвета)
   ───────────────────────────────────────────────────────────── */
export function TimelineLegend({ phases, statuses, className }) {
  const neutral = 'var(--content-subtle)'

  return (
    <div className={cn('flex flex-wrap items-center gap-x-5 gap-y-2', className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="text-2xs font-semibold uppercase tracking-label text-content-faint">
          Фазы
        </span>
        {phases.map((phase) => (
          <span key={phase.key} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-3.5 w-6 shrink-0 rounded-xs border border-hairline-strong"
              style={phaseStyle(phase.key, '#6B7688')}
            />
            <span className="text-xs text-content-muted">{phase.label}</span>
          </span>
        ))}
      </div>

      <span className="hidden h-4 w-px bg-hairline sm:block" aria-hidden="true" />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="text-2xs font-semibold uppercase tracking-label text-content-faint">
          Статусы
        </span>
        {statuses.map((status) => (
          <span key={status.key} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-3.5 w-6 shrink-0 rounded-xs"
              style={{ backgroundColor: status.color }}
            />
            <span className="text-xs text-content-muted">{status.label}</span>
          </span>
        ))}
      </div>

      <span className="hidden h-4 w-px bg-hairline sm:block" aria-hidden="true" />

      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="h-3.5 w-6 shrink-0 rounded-xs"
          style={{
            backgroundImage: `repeating-linear-gradient(135deg, ${hexToRgba(CONFLICT, 0.95)} 0 4px, ${hexToRgba(CONFLICT, 0.35)} 4px 9px)`,
            boxShadow: `0 0 0 1px ${CONFLICT}`,
          }}
        />
        <span className="text-xs font-medium text-status-conflict-text">Пересечение</span>
      </span>

      <span className="inline-flex items-center gap-1.5" style={{ color: neutral }}>
        <span aria-hidden="true" className="h-3.5 w-px shrink-0 bg-accent" />
        <span className="text-xs text-content-muted">Сейчас</span>
      </span>
    </div>
  )
}

export { LEFT_WIDTH, ROW_HEIGHT }
export default Timeline
