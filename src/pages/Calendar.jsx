import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { PageHeader } from '@/components/Topbar'
import { Button, IconButton } from '@/components/Button'
import { Tabs } from '@/components/Tabs'
import { Field, Select, Switch } from '@/components/Field'
import { StatusBadge } from '@/components/Status'
import { Badge } from '@/components/Badge'
import { Card, CardBody, CardHeader, MetaGrid, MetaItem } from '@/components/Card'
import { Modal, SidePanel } from '@/components/Modal'
import { Icon } from '@/components/Icon'
import { useToast } from '@/components/Toast'
import { Timeline, TimelineLegend } from '@/components/Timeline'
import { ConflictNotice } from '@/components/ConflictNotice'
import { EventCreatePanel } from '@/components/EventCreatePanel'

import { useEvents } from '@/app/EventsContext'
import { cn } from '@/lib/cn'
import { formatMoney, formatNumber, plural } from '@/lib/format'
import {
  PHASES,
  SCALES,
  SCALE_LIST,
  buildColumnGroups,
  buildColumns,
  findConflicts,
  formatDuration,
  formatRangeShort,
  formatWindowLabel,
  moveEvent,
  occupiedRange,
  parseTime,
  phaseSegments,
  phaseStyle,
  pxToDuration,
  scaleWindow,
  shiftAnchor,
  snapTime,
  statusBase,
} from '@/lib/timeline'
import { STATUSES } from '@/design/statuses'
import { DEMO_TODAY, OBJECTS, objectByKey } from '@/demo/events'
import { HALLS, hallById } from '@/demo/halls'

const FILTER_STATUSES = ['draft', 'review', 'confirmed', 'conflict', 'done', 'void']
const DEFAULT_STATUSES = ['draft', 'review', 'confirmed', 'conflict', 'done']
const TODAY = parseTime(DEMO_TODAY)

/* ─────────────────────────────────────────────────────────────
   Всплывающая информация при наведении на полосу
   ───────────────────────────────────────────────────────────── */
function EventTooltip({ event, rect }) {
  if (!event || !rect) return null

  const range = occupiedRange(event)
  const width = 288
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
  const openUp = rect.bottom + 210 > window.innerHeight
  const top = openUp ? rect.top - 8 : rect.bottom + 8

  return (
    <div
      className="pointer-events-none fixed z-toast animate-fade-in rounded-md border border-hairline bg-surface p-3 shadow-lg"
      style={{ left, top, width, transform: openUp ? 'translateY(-100%)' : undefined }}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-sm bg-surface-muted px-1.5 font-mono text-2xs font-semibold text-content-subtle">
          {event.id}
        </span>
        <StatusBadge status={event.status} size="sm" />
      </div>
      <p className="mt-1.5 text-base font-semibold leading-snug text-content">{event.name}</p>
      <p className="text-xs text-content-subtle">
        {event.type} · {event.tenant}
      </p>

      <dl className="mt-2 space-y-1 border-t border-hairline-soft pt-2">
        <div className="flex justify-between gap-2">
          <dt className="text-2xs uppercase tracking-label text-content-faint">Помещение</dt>
          <dd className="font-mono text-xs text-content">{event.hall}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-2xs uppercase tracking-label text-content-faint">Ответственный</dt>
          <dd className="text-xs text-content">{event.manager}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-2xs uppercase tracking-label text-content-faint">Занятость зала</dt>
          <dd className="text-xs tabular-nums text-content">
            {range ? formatRangeShort(range.from, range.to) : '—'}
          </dd>
        </div>
      </dl>

      <ul className="mt-2 space-y-0.5 border-t border-hairline-soft pt-2">
        {phaseSegments(event).map((segment) => (
          <li key={segment.key} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2.5 w-4 shrink-0 rounded-xs border border-hairline"
                style={phaseStyle(segment.key, statusBase(event.status))}
              />
              <span className="text-xs text-content-muted">{segment.label}</span>
            </span>
            <span className="text-2xs tabular-nums text-content-subtle">
              {formatRangeShort(segment.from, segment.to)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Экран «Календарь занятости помещений»
   ───────────────────────────────────────────────────────────── */
export default function Calendar() {
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { events, conflicts: allConflicts, conflictIds, applySchedule } = useEvents()

  const [scaleKey, setScaleKey] = useState('month')
  const [anchor, setAnchor] = useState(TODAY)

  const [objectFilter, setObjectFilter] = useState('all')
  const [hallFilter, setHallFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUSES)
  const [tenantFilter, setTenantFilter] = useState('all')
  const [managerFilter, setManagerFilter] = useState('all')
  const [hideFree, setHideFree] = useState(false)

  const [selectedId, setSelectedId] = useState(null)
  const [hover, setHover] = useState(null)
  const [creating, setCreating] = useState(false)
  const [createHallId, setCreateHallId] = useState(null)
  const [draftPreview, setDraftPreview] = useState(null)
  const [drag, setDrag] = useState(null)
  const [pendingMove, setPendingMove] = useState(null)

  const selected = useMemo(
    () => events.find((event) => event.id === selectedId) ?? null,
    [events, selectedId],
  )

  /* Переход из карточки: /calendar?event=EV-0142&date=2026-08-03 */
  useEffect(() => {
    const eventId = searchParams.get('event')
    const date = searchParams.get('date')
    if (date) setAnchor(parseTime(date))
    if (eventId) setSelectedId(eventId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scale = SCALES[scaleKey]
  const window0 = useMemo(() => scaleWindow(scaleKey, anchor), [scaleKey, anchor])
  const columns = useMemo(
    () => buildColumns(scaleKey, window0.from, window0.to, TODAY),
    [scaleKey, window0.from, window0.to],
  )
  const columnGroups = useMemo(() => buildColumnGroups(columns), [columns])

  const tenants = useMemo(
    () => Array.from(new Set(events.map((e) => e.tenant))).sort(),
    [events],
  )
  const managers = useMemo(
    () => Array.from(new Set(events.map((e) => e.manager))).sort(),
    [events],
  )

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        if (objectFilter !== 'all' && event.objectKey !== objectFilter) return false
        if (hallFilter !== 'all' && event.hallId !== hallFilter) return false
        if (!statusFilter.includes(event.status)) return false
        if (tenantFilter !== 'all' && event.tenant !== tenantFilter) return false
        if (managerFilter !== 'all' && event.manager !== managerFilter) return false
        return true
      }),
    [events, objectFilter, hallFilter, statusFilter, tenantFilter, managerFilter],
  )

  const visibleHalls = useMemo(() => {
    let halls = HALLS
    if (objectFilter !== 'all') halls = halls.filter((h) => h.objectKey === objectFilter)
    if (hallFilter !== 'all') halls = halls.filter((h) => h.id === hallFilter)
    if (hideFree) {
      const busy = new Set(
        filteredEvents
          .filter((event) => {
            const range = occupiedRange(event)
            return range && range.to > window0.from && range.from < window0.to
          })
          .map((event) => event.hallId),
      )
      halls = halls.filter((h) => busy.has(h.id))
    }
    return halls
  }, [objectFilter, hallFilter, hideFree, filteredEvents, window0.from, window0.to])

  const groups = useMemo(
    () =>
      OBJECTS.map((object) => ({
        object,
        halls: visibleHalls.filter((h) => h.objectKey === object.key),
      })).filter((group) => group.halls.length > 0),
    [visibleHalls],
  )

  const visibleHallIds = useMemo(() => new Set(visibleHalls.map((h) => h.id)), [visibleHalls])
  const visibleConflicts = useMemo(
    () => allConflicts.filter((conflict) => visibleHallIds.has(conflict.hallId)),
    [allConflicts, visibleHallIds],
  )

  /* ── Призрачная полоса: перетаскивание или черновик формы ── */
  const dragPreview = useMemo(
    () => (drag ? moveEvent(drag.event, drag.deltaMs, drag.hallId) : null),
    [drag],
  )
  const dragConflicts = useMemo(
    () => (dragPreview ? findConflicts(dragPreview, events, { ignoreId: drag.event.id }) : []),
    [dragPreview, events, drag],
  )

  const ghost = useMemo(() => {
    const source = dragPreview ?? draftPreview?.candidate
    if (!source) return null
    const range = occupiedRange(source)
    if (!range) return null
    const conflicts = dragPreview ? dragConflicts : (draftPreview?.conflicts ?? [])
    return {
      hallId: source.hallId,
      from: range.from,
      to: range.to,
      status: dragPreview ? source.status : 'review',
      conflicting: conflicts.length > 0,
      label: source.name,
    }
  }, [dragPreview, draftPreview, dragConflicts])

  /* ── Применение переноса через store ── */
  const commitMove = useCallback(
    (moved, status) => {
      const result = applySchedule(
        moved.id,
        { hallId: moved.hallId, phases: moved.phases },
        { status },
      )
      const range = occupiedRange(moved)

      if (!result.ok) {
        toast.error({
          title: 'Подтвердить перенос нельзя',
          description: 'Помещение занято в новые даты с учётом монтажа и демонтажа.',
        })
        return false
      }

      if (status === 'review') {
        toast.warning({
          title: 'Перенос отправлен на согласование',
          description: `${moved.name} · ${hallById(moved.hallId)?.code} · ${formatRangeShort(range.from, range.to)}`,
        })
      } else {
        toast.success({
          title: 'Мероприятие перенесено',
          description: `${moved.name} · ${hallById(moved.hallId)?.code} · ${formatRangeShort(range.from, range.to)}`,
        })
      }
      return true
    },
    [applySchedule, toast],
  )

  /* ── Перетаскивание ── */
  const startDrag = useCallback((event, pointerEvent) => {
    if (pointerEvent.button !== 0) return
    pointerEvent.preventDefault()
    setHover(null)
    setDrag({
      event,
      startX: pointerEvent.clientX,
      hallId: event.hallId,
      deltaMs: 0,
      moved: false,
    })
  }, [])

  useEffect(() => {
    if (!drag) return undefined

    function onMove(pointerEvent) {
      const dx = pointerEvent.clientX - drag.startX
      const raw = pxToDuration(dx, columns)
      const range = occupiedRange(drag.event)
      const snapped = snapTime(range.from + raw, scale.snap) - range.from

      const target = document
        .elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)
        ?.closest('[data-hall-id]')
      const hallId = target?.dataset.hallId ?? drag.hallId

      setDrag((prev) =>
        prev ? { ...prev, deltaMs: snapped, hallId, moved: prev.moved || Math.abs(dx) > 3 } : prev,
      )
    }

    function onUp() {
      setDrag((prev) => {
        if (!prev) return null
        const changed = prev.moved && (prev.deltaMs !== 0 || prev.hallId !== prev.event.hallId)
        if (!changed) return null

        const moved = moveEvent(prev.event, prev.deltaMs, prev.hallId)
        const conflicts = findConflicts(moved, events, { ignoreId: prev.event.id })

        if (conflicts.length > 0) {
          setPendingMove({ original: prev.event, moved, conflicts })
        } else {
          commitMove(moved, 'confirmed')
        }
        return null
      })
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [drag, columns, scale.snap, events, commitMove])

  /** Сдвиг с клавиатуры: Shift + ← / → */
  const nudge = useCallback(
    (event, direction) => {
      const moved = moveEvent(event, direction * scale.moveStep, event.hallId)
      const conflicts = findConflicts(moved, events, { ignoreId: event.id })
      if (conflicts.length > 0) {
        setPendingMove({ original: event, moved, conflicts })
      } else {
        commitMove(moved, event.status === 'conflict' ? 'review' : event.status)
      }
    },
    [events, scale.moveStep, commitMove],
  )

  function openCreate(hall) {
    setCreateHallId(hall?.id ?? null)
    setCreating(true)
  }

  function jumpToConflict(conflict) {
    setObjectFilter('all')
    setHallFilter('all')
    setTenantFilter('all')
    setManagerFilter('all')
    setStatusFilter(FILTER_STATUSES)
    setHideFree(false)
    setAnchor(conflict.from)
    setSelectedId(conflict.a?.id ?? conflict.event?.id ?? null)
  }

  const hallOptions = useMemo(() => {
    const halls = objectFilter === 'all' ? HALLS : HALLS.filter((h) => h.objectKey === objectFilter)
    return [
      { value: 'all', label: 'Все помещения' },
      ...halls.map((h) => ({ value: h.id, label: `${h.code} · ${h.name}` })),
    ]
  }, [objectFilter])

  const filtersActive =
    objectFilter !== 'all' ||
    hallFilter !== 'all' ||
    tenantFilter !== 'all' ||
    managerFilter !== 'all' ||
    hideFree ||
    statusFilter.length !== DEFAULT_STATUSES.length

  function resetFilters() {
    setObjectFilter('all')
    setHallFilter('all')
    setStatusFilter(DEFAULT_STATUSES)
    setTenantFilter('all')
    setManagerFilter('all')
    setHideFree(false)
  }

  const visibleEventCount = filteredEvents.filter((event) => {
    const range = occupiedRange(event)
    return range && range.to > window0.from && range.from < window0.to
  }).length

  return (
    <div className="pb-10">
      <PageHeader
        icon="calendar"
        title="Календарь занятости помещений"
        subtitle="Монтаж, подготовка, проведение, демонтаж и технические окна по каждому залу. Пересечения выделены штриховкой."
        actions={
          <>
            <Tabs
              variant="segmented"
              size="sm"
              value={scaleKey}
              onChange={setScaleKey}
              items={SCALE_LIST.map((item) => ({ key: item.key, label: item.label }))}
            />
            <div className="flex items-center gap-1">
              <IconButton
                icon="chevron-left"
                label="Предыдущий период"
                size="sm"
                onClick={() => setAnchor((prev) => shiftAnchor(scaleKey, prev, -1))}
              />
              <Button variant="secondary" size="sm" onClick={() => setAnchor(TODAY)}>
                Сегодня
              </Button>
              <IconButton
                icon="chevron-right"
                label="Следующий период"
                size="sm"
                onClick={() => setAnchor((prev) => shiftAnchor(scaleKey, prev, 1))}
              />
            </div>
            <Button variant="secondary" iconLeft="list" onClick={() => navigate('/events')}>
              Реестр
            </Button>
            <Button variant="primary" iconLeft="plus" onClick={() => openCreate()}>
              Создать мероприятие
            </Button>
          </>
        }
      />

      <div className="space-y-3 p-5">
        {allConflicts.length > 0 ? (
          <div className="overflow-hidden rounded-md border border-status-conflict-border bg-status-conflict-soft">
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <span className="flex items-center gap-2 text-base font-semibold text-status-conflict-text">
                <Icon name="alert-triangle" size={15} />
                Обнаружено {allConflicts.length}{' '}
                {plural(allConflicts.length, ['пересечение', 'пересечения', 'пересечений'])} по
                помещениям
              </span>
              <span className="text-xs text-status-conflict-text">
                Подтверждение бронирования по таким мероприятиям заблокировано
              </span>
            </div>
            <div className="grid gap-2 border-t border-status-conflict-border px-3 pb-3 pt-2 lg:grid-cols-2">
              {allConflicts.map((conflict) => (
                <div key={conflict.id} className="flex items-start gap-2">
                  <ConflictNotice conflict={conflict} className="min-w-0 flex-1 bg-surface" />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-0.5 shrink-0"
                    iconRight="arrow-right"
                    onClick={() => jumpToConflict(conflict)}
                  >
                    Показать
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ═══ Фильтры ═════════════════════════════════════ */}
        <div className="rounded-md border border-hairline bg-surface-raised p-3">
          <div className="grid gap-3 lg:grid-cols-4 xl:grid-cols-5">
            <Field label="Объект">
              <Select
                size="sm"
                value={objectFilter}
                onChange={(e) => {
                  setObjectFilter(e.target.value)
                  setHallFilter('all')
                }}
                options={[
                  { value: 'all', label: 'Все объекты' },
                  ...OBJECTS.map((o) => ({ value: o.key, label: o.name })),
                ]}
              />
            </Field>
            <Field label="Помещение">
              <Select
                size="sm"
                value={hallFilter}
                onChange={(e) => setHallFilter(e.target.value)}
                options={hallOptions}
              />
            </Field>
            <Field label="Арендатор">
              <Select
                size="sm"
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Все арендаторы' },
                  ...tenants.map((t) => ({ value: t, label: t })),
                ]}
              />
            </Field>
            <Field label="Ответственный">
              <Select
                size="sm"
                value={managerFilter}
                onChange={(e) => setManagerFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Все сотрудники' },
                  ...managers.map((m) => ({ value: m, label: m })),
                ]}
              />
            </Field>
            <Field label="Отображение">
              <div className="flex h-control items-center gap-4">
                <Switch
                  label="Только занятые"
                  checked={hideFree}
                  onChange={(e) => setHideFree(e.target.checked)}
                />
              </div>
            </Field>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-hairline-soft pt-3">
            <span className="text-2xs font-semibold uppercase tracking-label text-content-faint">
              Статус
            </span>
            {FILTER_STATUSES.map((key) => {
              const active = statusFilter.includes(key)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setStatusFilter((prev) =>
                      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
                    )
                  }
                  className={cn(
                    'focus-ring rounded transition-opacity duration-fast',
                    !active && 'opacity-35 saturate-50',
                  )}
                  aria-pressed={active}
                >
                  <StatusBadge status={key} size="sm" />
                </button>
              )
            })}

            <span className="ml-auto flex items-center gap-3">
              <span className="text-xs tabular-nums text-content-subtle">
                {formatWindowLabel(scaleKey, window0.from)} · в периоде {visibleEventCount}{' '}
                {plural(visibleEventCount, ['мероприятие', 'мероприятия', 'мероприятий'])}
              </span>
              {filtersActive ? (
                <Button variant="ghost" size="sm" iconLeft="refresh" onClick={resetFilters}>
                  Сбросить
                </Button>
              ) : null}
            </span>
          </div>
        </div>

        {/* ═══ Таймлайн ════════════════════════════════════ */}
        <Timeline
          columns={columns}
          columnGroups={columnGroups}
          scale={scale}
          groups={groups}
          events={filteredEvents}
          conflicts={visibleConflicts}
          conflictIds={conflictIds}
          ghost={ghost}
          todayTime={TODAY}
          selectedId={selectedId}
          onSelectEvent={(event) => setSelectedId(event.id)}
          onHoverEvent={(event, rect) => setHover(event ? { event, rect } : null)}
          onBarPointerDown={startDrag}
          onNudge={nudge}
          onEmptyClick={(hall) => openCreate(hall)}
        />

        <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-hairline bg-surface-raised px-3 py-2.5">
          <TimelineLegend
            phases={PHASES}
            statuses={['draft', 'review', 'confirmed', 'done'].map((key) => ({
              key,
              label: STATUSES[key].label,
              color: STATUSES[key].colors.base,
            }))}
          />
          <p className="shrink-0 text-2xs leading-snug text-content-faint">
            Полосу можно перетащить мышью между датами и залами.
            <br />
            С клавиатуры: Tab до полосы, затем Shift + ← / →
          </p>
        </div>
      </div>

      {hover && !drag ? <EventTooltip event={hover.event} rect={hover.rect} /> : null}

      {/* ═══ Создание ══════════════════════════════════════ */}
      <EventCreatePanel
        open={creating}
        initialHallId={createHallId}
        onClose={() => {
          setCreating(false)
          setDraftPreview(null)
        }}
        onDraftChange={setDraftPreview}
        onCreated={(id) => setSelectedId(id)}
      />

      {/* ═══ Быстрый просмотр ══════════════════════════════ */}
      <SidePanel
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        size="md"
        plate={selected?.id}
        status={selected?.status}
        title={selected?.name}
        subtitle={selected ? `${selected.type} · ${selected.tenant}` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedId(null)}>
              Закрыть
            </Button>
            <Button
              variant="primary"
              iconRight="arrow-right"
              onClick={() => navigate(`/events/${selected.id}`)}
            >
              Открыть карточку
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-3">
            {conflictIds.has(selected.id) ? (
              <div className="space-y-2">
                {allConflicts
                  .filter((c) => c.a?.id === selected.id || c.b?.id === selected.id)
                  .map((conflict) => (
                    <ConflictNotice key={conflict.id} conflict={conflict} />
                  ))}
              </div>
            ) : null}

            <Card>
              <CardHeader plate={selected.hall} title="Размещение и сроки" />
              <CardBody>
                <MetaGrid columns={2}>
                  <MetaItem
                    label="Объект"
                    value={objectByKey(selected.objectKey)?.name}
                    icon="building"
                  />
                  <MetaItem label="Помещение" value={selected.hall} mono />
                  <MetaItem label="Ответственный" value={selected.manager} icon="user" />
                  <MetaItem
                    label="Участников"
                    value={selected.guests ? formatNumber(selected.guests) : '—'}
                    icon="users"
                  />
                </MetaGrid>

                <ul className="mt-3 space-y-1.5 border-t border-hairline-soft pt-3">
                  {phaseSegments(selected).map((segment) => (
                    <li key={segment.key} className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="h-3 w-5 shrink-0 rounded-xs border border-hairline"
                          style={phaseStyle(segment.key, statusBase(selected.status))}
                        />
                        <span className="truncate text-base text-content">{segment.label}</span>
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-content-subtle">
                        {formatRangeShort(segment.from, segment.to)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader plate="ФИН" plateTone="outline" title="Договор и оплата" />
              <CardBody>
                <MetaGrid columns={2}>
                  <MetaItem label="Договор" value={selected.contract?.number ?? 'не привязан'} mono />
                  <MetaItem
                    label="Сумма"
                    value={selected.amount ? formatMoney(selected.amount) : '—'}
                    tone="accent"
                  />
                  <MetaItem
                    label="Оплата"
                    value={<StatusBadge status={selected.payment} size="sm" />}
                  />
                  <MetaItem
                    label="Согласование"
                    value={
                      selected.approval?.length ? (
                        <span className="text-status-review-text">
                          {selected.approval.join(', ')}
                        </span>
                      ) : (
                        'закрыто'
                      )
                    }
                  />
                </MetaGrid>
              </CardBody>
            </Card>

            <div className="flex flex-wrap gap-1.5">
              <Badge tone="outline" icon="calendar">
                {formatDuration(
                  (occupiedRange(selected)?.to ?? 0) - (occupiedRange(selected)?.from ?? 0),
                )}{' '}
                занятости
              </Badge>
              <Badge tone="outline" icon="presentation">
                {selected.type}
              </Badge>
            </div>
          </div>
        ) : null}
      </SidePanel>

      {/* ═══ Предупреждение после переноса ═════════════════ */}
      <Modal
        open={Boolean(pendingMove)}
        onClose={() => setPendingMove(null)}
        size="lg"
        status="conflict"
        plate={pendingMove?.original.id}
        title="Перенос создаёт пересечение"
        subtitle="Помещение уже занято в новые даты с учётом монтажа и демонтажа"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingMove(null)}>
              Отменить перенос
            </Button>
            <Button
              variant="secondary"
              iconLeft="clock"
              onClick={() => {
                commitMove(pendingMove.moved, 'review')
                setPendingMove(null)
              }}
            >
              Отправить на согласование
            </Button>
            <Button
              variant="primary"
              iconLeft="check"
              disabled
              title="Недоступно: есть пересечение по помещению"
            >
              Подтвердить бронирование
            </Button>
          </>
        }
      >
        {pendingMove ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded border border-hairline bg-surface-sunken p-2.5">
                <p className="text-2xs font-semibold uppercase tracking-label text-content-faint">
                  Было
                </p>
                <p className="mt-1 font-mono text-xs text-content">
                  {hallById(pendingMove.original.hallId)?.code}
                </p>
                <p className="mt-0.5 text-xs tabular-nums text-content-subtle">
                  {formatRangeShort(
                    occupiedRange(pendingMove.original).from,
                    occupiedRange(pendingMove.original).to,
                  )}
                </p>
              </div>
              <div className="rounded border border-status-conflict-border bg-status-conflict-soft p-2.5">
                <p className="text-2xs font-semibold uppercase tracking-label text-status-conflict-text">
                  Станет
                </p>
                <p className="mt-1 font-mono text-xs text-content">
                  {hallById(pendingMove.moved.hallId)?.code}
                </p>
                <p className="mt-0.5 text-xs tabular-nums text-status-conflict-text">
                  {formatRangeShort(
                    occupiedRange(pendingMove.moved).from,
                    occupiedRange(pendingMove.moved).to,
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {pendingMove.conflicts.map((conflict) => (
                <ConflictNotice key={conflict.id} conflict={conflict} />
              ))}
            </div>

            <p className="text-xs leading-normal text-content-subtle">
              Согласно п. 5.2 ТЗ подтвердить бронирование при пересечении нельзя. Доступна только
              отправка на согласование уполномоченному лицу — мероприятие получит статус «На
              согласовании».
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
