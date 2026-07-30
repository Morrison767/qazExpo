import { useState } from 'react'
import { Section, DemoBlock, DemoLabel, SpecTable } from '../parts'
import { Button, IconButton } from '@/components/Button'
import { Input } from '@/components/Field'
import { HallPlate } from '@/components/HallPlate'
import { StatusBadge, StatusRail, StatusDot } from '@/components/Status'
import { CountUp, Reveal, Skeleton, SkeletonRow, BeamSweep } from '@/components/Motion'
import { Card, CardHeader, CardBody, MetaGrid, MetaItem } from '@/components/Card'
import { motion } from '@/design/tokens'
import { formatMoney } from '@/lib/format'

export function DepthSection() {
  const [replayKey, setReplayKey] = useState(0)
  const [loading, setLoading] = useState(false)

  function replay() {
    setReplayKey((k) => k + 1)
  }

  function simulateLoad() {
    setLoading(true)
    setTimeout(() => setLoading(false), 1600)
  }

  return (
    <Section
      id="depth"
      num="04"
      title="Свет, глубина, движение"
      description="То, что отличает прибор от плоской админки. Глубина строится тремя слоями: граница 1px, фаска-блик сверху и мягкая ambient-тень. Акцентный свет живёт только в тонких линиях и индикаторах. Движение несёт смысл — порядок чтения, физику объекта, ощущение величины."
    >
      {/* ── Поверхности ───────────────────────────────────── */}
      <DemoBlock title="Поверхности" note="Плоских прямоугольников в системе нет" tone="canvas">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <DemoLabel>Рабочая поверхность</DemoLabel>
            <div className="rounded-md border border-hairline bg-surface-raised p-4 shadow-card">
              <p className="text-base font-semibold text-ink-900">surface-raised</p>
              <p className="mt-1 text-xs leading-normal text-ink-500">
                Микроградиент белый → #FBFCFD, фаска-блик 1px сверху, ambient-тень. Реестры,
                формы, карточки объектов.
              </p>
            </div>
          </div>

          <div>
            <DemoLabel>Корпус прибора</DemoLabel>
            <div className="on-obsidian relative overflow-hidden rounded-md border border-obsidian-600/70 bg-surface-obsidian p-4 shadow-card-dark">
              <span
                aria-hidden="true"
                className="dot-grid pointer-events-none absolute inset-0 opacity-70"
              />
              <span
                aria-hidden="true"
                className="bloom-beam pointer-events-none absolute inset-0"
              />
              <div className="relative">
                <p className="text-base font-semibold text-obsidian-50">surface-obsidian</p>
                <p className="mt-1 text-xs leading-normal text-obsidian-200">
                  Точечная сетка, радиальное свечение из угла, внутренний блик. Навигация,
                  сводки, шапки панелей.
                </p>
              </div>
            </div>
          </div>

          <div>
            <DemoLabel>Плоско — так больше не делаем</DemoLabel>
            <div className="rounded-md border border-hairline bg-white p-4">
              <p className="text-base font-semibold text-ink-900">flat</p>
              <p className="mt-1 text-xs leading-normal text-ink-500">
                Один тон, одна линия, нет блика и тени. Сравните кромки: разница читается даже
                на превью в 240px.
              </p>
            </div>
          </div>
        </div>
      </DemoBlock>

      {/* ── Свет ──────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Свет как линия" note="Заливок акцентом в системе нет">
          <DemoLabel>Кромка корпуса</DemoLabel>
          <div className="on-obsidian relative overflow-hidden rounded-md bg-surface-obsidian p-4">
            <span aria-hidden="true" className="dot-grid absolute inset-0 opacity-60" />
            <div className="relative flex items-center justify-between gap-3">
              <span className="text-base text-obsidian-100">Топбар / шапка панели</span>
              <HallPlate tone="beam">КЦ-А1</HallPlate>
            </div>
            <span aria-hidden="true" className="beam-edge absolute inset-x-0 bottom-0" />
          </div>

          <DemoLabel className="mt-4">Свечения</DemoLabel>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['shadow-beam-sm', 'Табличка, чекбокс, поле в фокусе'],
              ['shadow-beam', 'Кнопка-CTA при наведении'],
              ['shadow-beam-lg', 'Активный объект на корпусе'],
              ['shadow-beam-inset', 'Внутренняя обводка блока'],
            ].map(([cls, use]) => (
              <div key={cls}>
                <div
                  className={`flex h-12 items-center justify-center rounded-md border border-beam-200 bg-white ${cls}`}
                >
                  <span className="font-mono text-2xs text-beam-800">{cls}</span>
                </div>
                <p className="mt-1 text-2xs leading-snug text-ink-400">{use}</p>
              </div>
            ))}
          </div>

          <DemoLabel className="mt-4">Фокус — луч, а не серое кольцо</DemoLabel>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Tab сюда</Button>
            <Button variant="secondary">и сюда</Button>
            <Input placeholder="и в поле" className="w-40" />
            <span className="text-xs text-ink-400">нажмите Tab</span>
          </div>
        </DemoBlock>

        <DemoBlock title="Светящаяся кромка статуса" note="Подписная деталь во всех контекстах">
          <div className="space-y-2">
            {['confirmed', 'review', 'conflict', 'unpaid'].map((key) => (
              <div
                key={key}
                className="relative overflow-hidden rounded-md border border-hairline bg-surface-raised pl-rail shadow-card"
              >
                <StatusRail status={key} />
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <span className="truncate text-base text-ink-800">
                    Строка реестра со статусом
                  </span>
                  <StatusBadge status={key} size="sm" />
                </div>
              </div>
            ))}
          </div>

          <DemoLabel className="mt-4">На корпусе</DemoLabel>
          <div className="on-obsidian space-y-2 rounded-md bg-surface-obsidian p-3">
            {['confirmed', 'conflict'].map((key) => (
              <div
                key={key}
                className="relative overflow-hidden rounded border border-white/[0.08] bg-white/[0.04] pl-rail"
              >
                <StatusRail status={key} />
                <div className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="truncate text-base text-obsidian-100">Элемент сводки</span>
                  <StatusBadge status={key} size="sm" variant="dark" />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs leading-normal text-ink-400">
            «Конфликт» — единственный статус с диагональной штриховкой вместо ровного свечения:
            пересечение брони должно кричать даже в ч/б печати.
          </p>
        </DemoBlock>
      </div>

      {/* ── Движение ──────────────────────────────────────── */}
      <DemoBlock
        title="Движение"
        note="Каждая анимация отвечает на вопрос «что произошло»"
        tone="canvas"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button variant="beam" size="sm" iconLeft="refresh" onClick={replay}>
            Проиграть заново
          </Button>
          <Button variant="secondary" size="sm" iconLeft="loader" onClick={simulateLoad}>
            Показать загрузку
          </Button>
        </div>

        <div key={replayKey} className="grid gap-4 lg:grid-cols-3">
          {/* Досчёт */}
          <div className="rounded-md border border-hairline bg-surface-raised p-3.5 shadow-card">
            <DemoLabel>Досчёт величины</DemoLabel>
            <p className="text-6xl font-semibold leading-none tabular-nums text-ink-900">
              <CountUp value={252} />
            </p>
            <p className="mt-1.5 text-base text-ink-500">
              млн ₸ · сумма договоров
            </p>
            <div className="mt-3 border-t border-hairline-soft pt-2.5">
              <p className="text-2xl font-semibold tabular-nums text-beam-700">
                <CountUp value={48500000} format={(v) => formatMoney(v)} />
              </p>
              <p className="mt-0.5 text-xs text-ink-400">
                Величина набирается — 126 млн «весит» больше, чем 3,4 млн
              </p>
            </div>
          </div>

          {/* Каскад */}
          <div className="rounded-md border border-hairline bg-surface-raised p-3.5 shadow-card">
            <DemoLabel>Каскад · шаг {motion.stagger}ms</DemoLabel>
            <div className="space-y-1.5">
              {['EV-0142', 'EV-0143', 'EV-0144', 'EV-0145', 'EV-0139'].map((id, index) => (
                <Reveal key={id} index={index}>
                  <div className="flex items-center gap-2 rounded border border-hairline bg-white px-2 py-1.5">
                    <HallPlate tone="muted">{id}</HallPlate>
                    <span className="min-w-0 flex-1 truncate text-xs text-ink-600">
                      Строка реестра
                    </span>
                    <StatusDot status="confirmed" size={7} />
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="mt-2.5 text-xs leading-normal text-ink-400">
              Взгляд получает порядок чтения сверху вниз вместо одномоментной вспышки.
            </p>
          </div>

          {/* Скелетон и проход света */}
          <div className="relative overflow-hidden rounded-md border border-hairline bg-surface-raised p-3.5 shadow-card">
            <BeamSweep />
            <DemoLabel>Скелетон и проход света</DemoLabel>
            {loading ? (
              <div className="space-y-2">
                <Skeleton variant="display" className="w-2/3" />
                <Skeleton variant="line" className="w-full" />
                <Skeleton variant="line" className="w-4/5" />
                <div className="flex gap-2 pt-1">
                  <Skeleton variant="plate" />
                  <Skeleton variant="badge" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-4xl font-semibold leading-none tabular-nums text-ink-900">
                  <CountUp value={68} />
                  <span className="ml-1 text-base font-medium text-ink-500">%</span>
                </p>
                <p className="text-xs leading-normal text-ink-500">
                  Загрузка Конгресс-центра за март
                </p>
                <div className="flex gap-2 pt-1">
                  <HallPlate tone="outline">КЦ</HallPlate>
                  <StatusBadge status="confirmed" size="sm" />
                </div>
              </div>
            )}
            <div className="mt-3 border-t border-hairline-soft pt-2.5">
              <SkeletonRow columns={4} />
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-hairline bg-surface-raised p-3.5 shadow-card">
            <DemoLabel>Пружина — панели и тумблеры</DemoLabel>
            <div className="flex items-center gap-3">
              <div className="animate-slide-in-right rounded border border-beam-200 bg-beam-50 px-3 py-2 text-base text-beam-800">
                Слайд-панель выезжает с лёгким перелётом
              </div>
            </div>
            <p className="mt-2 text-xs leading-normal text-ink-400">
              Кривая <span className="font-mono">ease-spring</span> — у панели появляется масса.
              Линейный slide читается как «картинка сдвинулась».
            </p>
          </div>
          <div className="rounded-md border border-hairline bg-surface-raised p-3.5 shadow-card">
            <DemoLabel>Пульс — только «требует действия»</DemoLabel>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse-beam rounded-full bg-beam-500" />
                <span className="text-base text-ink-700">2 конфликта брони</span>
              </span>
              <IconButton icon="bell" label="Уведомления" variant="subtle" />
            </div>
            <p className="mt-2 text-xs leading-normal text-ink-400">
              Пульсация — дорогой приём. В системе он закреплён за состояниями, требующими
              решения человека, и нигде больше.
            </p>
          </div>
        </div>
      </DemoBlock>

      {/* ── Пример на объекте ─────────────────────────────── */}
      <DemoBlock title="Всё вместе" note="Карточка на корпусе и на рабочей поверхности" tone="canvas">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card status="confirmed" sweep>
            <CardHeader
              plate="EV-0142"
              title="Astana Finance Days 2026"
              subtitle="ТОО «Astana Expo Group»"
              status="confirmed"
              meta="Форум"
            />
            <CardBody>
              <MetaGrid columns={3}>
                <MetaItem label="Зал" value="КЦ-А1" mono />
                <MetaItem label="Участники" value="2 400" />
                <MetaItem label="Сумма" value="48,5 млн ₸" tone="accent" />
              </MetaGrid>
            </CardBody>
          </Card>

          <Card status="review" tone="dark" sweep>
            <CardHeader
              plate="EV-0143"
              title="KazBuild / Aquatherm Astana"
              subtitle="Iteca Kazakhstan"
              status="review"
              meta="Выставка"
            />
            <CardBody>
              <MetaGrid columns={3}>
                <MetaItem label="Зал" value="МВЦ-П1" mono />
                <MetaItem label="Участники" value="12 000" />
                <MetaItem label="Сумма" value="126 млн ₸" tone="accent" />
              </MetaGrid>
            </CardBody>
          </Card>
        </div>
      </DemoBlock>

      <DemoBlock title="Реестр токенов глубины и движения">
        <SpecTable
          head={['Токен', 'Значение', 'Применение']}
          rows={[
            ['shadow-card', 'граница + фаска + ambient', 'Все карточки и таблицы рабочей поверхности'],
            ['shadow-card-dark', 'тень + внутренний блик', 'Блоки на корпусе прибора'],
            ['shadow-bevel', 'inset 0 1px 0 rgba(255,255,255,.85)', 'Липкие панели, футеры, тулбары'],
            ['shadow-beam-sm / beam / beam-lg', 'свечение акцента', 'Фокус, активный объект, CTA'],
            ['bg-surface-raised', 'градиент #FFF → #FBFCFD', 'Рабочая поверхность'],
            ['bg-surface-obsidian', 'градиент #0E1620 → #080D14', 'Корпус прибора'],
            ['dot-grid / bloom-beam', 'фактура корпуса', 'Сайдбар, топбар, hero-полоса'],
            ['ease-decelerate', 'cubic-bezier(.16,1,.3,1)', 'Появление, каскад, рост шкал'],
            ['ease-spring', 'cubic-bezier(.34,1.4,.64,1)', 'Панели, поповеры, тумблеры'],
            ['animate-reveal-up', '340ms + шаг 14ms', 'Строки реестра, списки карточек'],
            ['animate-shimmer', '1.6s linear infinite', 'Скелетоны загрузки'],
            ['animate-pulse-beam', '2.4s ease-in-out', 'Только «требует действия»'],
          ]}
        />
        <p className="mt-3 max-w-3xl text-xs leading-normal text-ink-400">
          Вся анимация выключается системной настройкой{' '}
          <span className="font-mono">prefers-reduced-motion</span> — включая досчёт чисел и
          каскад строк.
        </p>
      </DemoBlock>
    </Section>
  )
}

export default DepthSection
