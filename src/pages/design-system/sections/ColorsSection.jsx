import { colors, navy, signal, ink, obsidian, beam, danger, success } from '@/design/tokens'
import { Section, DemoBlock, Swatch, DemoLabel, SpecTable } from '../parts'
import { Badge } from '@/components/Badge'
import { HallPlate } from '@/components/HallPlate'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Icon } from '@/components/Icon'
import { useTheme } from '@/app/ThemeContext'
import { formatRatio } from '@/lib/contrast'

function Scale({ scale, prefix }) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
      {Object.entries(scale).map(([key, hex]) => (
        <Swatch key={key} name={`${prefix}-${key}`} hex={hex} onLight={false} size="sm" />
      ))}
    </div>
  )
}

/** Роль цвета в системе: крупный образец + назначение */
function RoleCard({ hex, name, title, description, usage, glow = false }) {
  return (
    <div className="rounded-md border border-hairline bg-surface-raised p-4 shadow-card">
      <div className="flex items-stretch gap-4">
        <div
          className="flex h-24 w-24 shrink-0 flex-col justify-end rounded-md border border-black/10 p-2.5"
          style={{ backgroundColor: hex, boxShadow: glow ? `0 0 24px -4px ${hex}` : undefined }}
        >
          <span className="inline-flex items-center rounded-sm border border-white/25 bg-black/25 px-1 font-mono text-[0.5625rem] font-semibold uppercase tracking-plate text-white">
            {hex}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xs font-semibold uppercase tracking-label text-content-faint">
            {title}
          </p>
          <p className="mt-0.5 font-mono text-base font-semibold text-content">{name}</p>
          <p className="mt-1.5 text-xs leading-normal text-content-muted">{description}</p>
          <p className="mt-2 text-2xs leading-snug text-content-faint">{usage}</p>
        </div>
      </div>
    </div>
  )
}

export function ColorsSection() {
  const { theme, isDark } = useTheme()

  return (
    <Section
      id="colors"
      num="01"
      title="Цвет и темы"
      description="Цвет живёт в двух слоях. Семантические токены (surface, content, nav, accent, status) переключаются вместе с темой — компоненты используют только их. Сырые шкалы остаются статичными и нужны там, где оттенок обязан быть одинаковым в обеих темах: графики, палитра, деструктивные действия."
    >
      {/* ── Переключатель тем ─────────────────────────────── */}
      <DemoBlock
        title="Две темы, один набор классов"
        note={`активна: ${isDark ? 'тёмная' : 'светлая'}`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <ThemeToggle variant="segmented" />
          <p className="min-w-0 flex-1 text-xs leading-normal text-content-muted">
            Тема ставится атрибутом <span className="font-mono">data-theme</span> на{' '}
            <span className="font-mono">&lt;html&gt;</span> и переключает набор CSS-переменных.
            Выбор запоминается в браузере; до первого выбора система следует настройке ОС. Скрипт
            в <span className="font-mono">index.html</span> применяет тему до первой отрисовки —
            светлая не мигает при загрузке в тёмной теме.
          </p>
        </div>

        <div className="mt-4 grid gap-3 border-t border-hairline-soft pt-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { token: 'canvas', label: 'Фон приложения', cls: 'bg-canvas' },
            { token: 'surface', label: 'Карточки, таблицы', cls: 'bg-surface' },
            { token: 'nav', label: 'Сайдбар, топбар', cls: 'bg-surface-nav' },
            { token: 'accent-soft', label: 'Активное состояние', cls: 'bg-accent-soft' },
          ].map((item) => (
            <div key={item.token} className="rounded border border-hairline p-2.5">
              <div className={`h-12 rounded-sm border border-hairline ${item.cls}`} />
              <p className="mt-2 font-mono text-2xs font-semibold text-content">{item.token}</p>
              <p className="text-2xs text-content-faint">{item.label}</p>
            </div>
          ))}
        </div>
      </DemoBlock>

      {/* ── Три роли ──────────────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-3">
        <RoleCard
          hex={isDark ? obsidian[900] : '#FFFFFF'}
          name={isDark ? 'obsidian-900' : 'surface / nav'}
          title="Каркас"
          description="Сайдбар, топбар, шапки слайд-панелей. В светлой теме — белый с холодной точечной фактурой, в тёмной — обсидиановый корпус прибора."
          usage="Рабочие данные всегда на surface: долгие сессии с реестрами не страдают ни в одной теме."
        />
        <RoleCard
          hex={navy[600]}
          name="navy-600"
          title="Структура"
          description="Глубокий синий навигационных табло. Достаточно тёмный для белого текста (10.2:1), достаточно сдержанный, чтобы не спорить с палитрой статусов."
          usage="Primary-кнопки и таблички идентификаторов. В тёмной теме осветляется до navy-500."
        />
        <RoleCard
          glow
          hex={isDark ? beam[400] : beam[700]}
          name={isDark ? 'beam-400' : 'beam-700'}
          title="Свет"
          description="Светящийся индикатор: активный пункт навигации, фокус, графики, контрольные точки. Используется КАК СВЕТ — линии 1–2px, точки, свечение."
          usage="Заливок этим цветом нет. На белом работает beam-700 (AA), на корпусе — beam-400."
        />
      </div>

      <DemoBlock title="Каркас · obsidian" note="Значения тёмной темы">
        <Scale scale={obsidian} prefix="obsidian" />
      </DemoBlock>

      <DemoBlock title="Свет · beam" note="400 — на корпусе, 700 — на белом (AA)">
        <Scale scale={beam} prefix="beam" />
        <div className="mt-4 grid gap-3 border-t border-hairline-soft pt-3 sm:grid-cols-2">
          <div className="rounded border border-hairline bg-surface p-3">
            <p className="text-base text-content-muted">
              Акцентный текст в светлой теме:{' '}
              <span className="font-semibold text-accent-fg">beam-700</span>
            </p>
            <p className="mt-1 font-mono text-2xs text-content-faint">
              {formatRatio(beam[700], '#FFFFFF')} · AA
            </p>
          </div>
          <div className="rounded border border-nav-line bg-surface-nav p-3">
            <p className="text-base text-nav-muted">
              Акцентный текст в тёмной теме:{' '}
              <span className="font-semibold text-accent-strong">beam-300</span>
            </p>
            <p className="mt-1 font-mono text-2xs text-nav-faint">
              {formatRatio(beam[300], obsidian[900])} · AAA
            </p>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock title="Структура · navy" note="600 — базовый тон">
        <Scale scale={navy} prefix="navy" />
      </DemoBlock>

      <DemoBlock title="Сигнальный акцент · signal" note="Точечно: «требует внимания», демо-метка">
        <Scale scale={signal} prefix="signal" />
      </DemoBlock>

      <DemoBlock title="Нейтральная шкала · ink" note="Основа семантических токенов светлой темы">
        <Scale scale={ink} prefix="ink" />
      </DemoBlock>

      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Поверхности и границы">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Swatch name="canvas" hex={colors.canvas} label="Фон приложения" />
            <Swatch name="surface" hex="#FFFFFF" label="Карточки, таблицы" onLight={false} />
            <Swatch
              name="hairline"
              hex={colors.hairline.DEFAULT}
              label="Границы 1px"
              onLight={false}
            />
            <Swatch
              name="hairline-strong"
              hex={colors.hairline.strong}
              label="Контуры контролов"
              onLight={false}
            />
          </div>
          <p className="mt-3 text-xs leading-normal text-content-faint">
            Значения светлой темы. В тёмной те же токены получают другие значения — иерархия
            строится границами и фасками, не заливками. Как эти три слоя собираются в глубину — в
            разделе 04.
          </p>
        </DemoBlock>

        <DemoBlock title="Служебные шкалы">
          <DemoLabel>danger — деструктивные действия</DemoLabel>
          <div className="grid grid-cols-5 gap-2">
            {['400', '500', '600', '700', '800'].map((key) => (
              <Swatch
                key={key}
                name={`danger-${key}`}
                hex={danger[key]}
                onLight={false}
                size="sm"
              />
            ))}
          </div>
          <DemoLabel className="mt-4">success — положительная обратная связь</DemoLabel>
          <div className="grid grid-cols-5 gap-2">
            {['400', '500', '600', '700', '800'].map((key) => (
              <Swatch
                key={key}
                name={`success-${key}`}
                hex={success[key]}
                onLight={false}
                size="sm"
              />
            ))}
          </div>
        </DemoBlock>
      </div>

      <DemoBlock title="Что цветом не кодируется">
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">Форум</Badge>
          <Badge tone="neutral">Выставка</Badge>
          <Badge tone="outline" icon="building">
            Конгресс-центр
          </Badge>
          <Badge tone="navy" icon="presentation">
            Гибридное
          </Badge>
          <Badge tone="signal" icon="hard-hat">
            Монтаж стендов
          </Badge>
          <HallPlate tone="muted">EV-0143</HallPlate>
        </div>
        <p className="mt-3 max-w-3xl text-xs leading-normal text-content-faint">
          Типы мероприятий, объекты, форматы и виды работ — нейтральные бейджи. Палитра статусов
          зарезервирована под состояния объектов, а свет (accent) — под активность и фокус. Если
          раскрасить ими справочные признаки, статус перестанет считываться за секунду.
        </p>
      </DemoBlock>

      <DemoBlock title="Реестр семантических токенов">
        <SpecTable
          head={['Токен', 'Светлая', 'Тёмная', 'Применение']}
          rows={[
            ['canvas', '#F1F3F6', '#060B12', 'Фон приложения'],
            ['surface', '#FFFFFF', '#0E1620', 'Карточки, таблицы, панели'],
            ['surface-sunken', '#F5F6F8', '#131D29', 'Шапки таблиц, футеры'],
            ['nav', '#FFFFFF', '#080D14', 'Сайдбар, топбар, шапка слайд-панели'],
            ['content', '#101B2D', '#E8EEF4', 'Основной текст'],
            ['content-subtle', '#6B7688', '#94A7B8', 'Вторичный текст, CAPS-метки'],
            ['content-faint', '#98A1B2', '#6D8296', 'Иконки в покое, плейсхолдеры'],
            ['hairline', '#DFE3EA', '#223041', 'Границы карточек и таблиц'],
            ['accent', '#0B7C93', '#35D6F0', 'Свет: линии, индикаторы, фокус'],
            ['accent-soft', '#E8FBFF', '#0D2A33', 'Подложка активного состояния'],
            ['primary', '#1B3A6B', '#2F5490', 'Primary-кнопки'],
          ]}
        />
        <div className="mt-3 flex items-start gap-2 rounded border border-accent-line bg-accent-soft p-2.5">
          <Icon name="info" size={13} className="mt-px shrink-0 text-accent-fg" />
          <p className="text-xs leading-normal text-accent-strong">
            Правило: hex в компонентах не пишется. Только семантические классы либо импорт из{' '}
            <span className="font-mono">src/design/tokens.js</span>. Текущая тема —{' '}
            <span className="font-mono">{theme}</span>.
          </p>
        </div>
      </DemoBlock>
    </Section>
  )
}

export default ColorsSection
