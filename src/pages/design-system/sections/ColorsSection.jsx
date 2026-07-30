import { colors, navy, signal, ink, obsidian, beam, danger, success } from '@/design/tokens'
import { Section, DemoBlock, Swatch, DemoLabel, SpecTable } from '../parts'
import { Badge } from '@/components/Badge'
import { HallPlate } from '@/components/HallPlate'
import { formatRatio } from '@/lib/contrast'

function Scale({ scale, prefix, onDark = false }) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
      {Object.entries(scale).map(([key, hex]) => (
        <Swatch key={key} name={`${prefix}-${key}`} hex={hex} onLight={false} size="sm" />
      ))}
    </div>
  )
}

/** Роль цвета в системе: крупный образец + назначение */
function RoleCard({ hex, name, title, description, usage, dark = false }) {
  return (
    <div
      className={
        dark
          ? 'on-obsidian relative overflow-hidden rounded-md border border-obsidian-600/70 bg-surface-obsidian p-4 shadow-card-dark'
          : 'rounded-md border border-hairline bg-surface-raised p-4 shadow-card'
      }
    >
      {dark ? (
        <>
          <span aria-hidden="true" className="dot-grid absolute inset-0 opacity-60" />
          <span aria-hidden="true" className="bloom-beam absolute inset-0" />
        </>
      ) : null}
      <div className="relative flex items-stretch gap-4">
        <div
          className="flex h-24 w-24 shrink-0 flex-col justify-end rounded-md border border-black/10 p-2.5"
          style={{
            backgroundColor: hex,
            boxShadow: name === 'beam-400' ? `0 0 24px -4px ${hex}` : undefined,
          }}
        >
          <HallPlate tone="inverse" size="sm">
            {hex}
          </HallPlate>
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={
              dark
                ? 'text-2xs font-semibold uppercase tracking-label text-obsidian-300'
                : 'text-2xs font-semibold uppercase tracking-label text-ink-400'
            }
          >
            {title}
          </p>
          <p
            className={
              dark
                ? 'mt-0.5 font-mono text-base font-semibold text-obsidian-50'
                : 'mt-0.5 font-mono text-base font-semibold text-ink-900'
            }
          >
            {name}
          </p>
          <p
            className={
              dark
                ? 'mt-1.5 text-xs leading-normal text-obsidian-200'
                : 'mt-1.5 text-xs leading-normal text-ink-600'
            }
          >
            {description}
          </p>
          <p
            className={
              dark
                ? 'mt-2 text-2xs leading-snug text-obsidian-300'
                : 'mt-2 text-2xs leading-snug text-ink-400'
            }
          >
            {usage}
          </p>
        </div>
      </div>
    </div>
  )
}

export function ColorsSection() {
  return (
    <Section
      id="colors"
      num="01"
      title="Цвет"
      description="Три роли и ни одной лишней: тёмный корпус несёт навигацию и сводку, синий держит структуру и действия, бирюзовый работает как свет — только в линиях и индикаторах. Тёплые и бежевые тона исключены: интерфейс читается как приборная панель комплекса, а не как презентация."
    >
      <div className="grid gap-4 xl:grid-cols-3">
        <RoleCard
          dark
          hex={obsidian[900]}
          name="obsidian-900"
          title="Корпус"
          description="Почти чёрный с синим подтоном. Не «тёмная тема», а корпус прибора: сайдбар, топбар, сводные полосы, шапки слайд-панелей."
          usage="Рабочие данные остаются на светлой поверхности — долгие сессии с реестрами не страдают."
        />
        <RoleCard
          hex={navy[600]}
          name="navy-600"
          title="Структура"
          description="Глубокий синий навигационных табло. Достаточно тёмный для белого текста (10.2:1), достаточно сдержанный, чтобы не спорить с палитрой статусов."
          usage="Primary-кнопки, таблички идентификаторов, структурные акценты."
        />
        <RoleCard
          hex={beam[400]}
          name="beam-400"
          title="Свет"
          description="Светящийся индикатор: активный пункт навигации, фокус, графики, контрольные точки. Используется КАК СВЕТ — линии 1–2px, точки, свечение."
          usage="Заливок этим цветом в системе нет. На белом работает затемнённый beam-700."
        />
      </div>

      <DemoBlock title="Корпус · obsidian" note="900 — базовый тон корпуса">
        <Scale scale={obsidian} prefix="obsidian" />
      </DemoBlock>

      <DemoBlock title="Свет · beam" note="400 — на корпусе, 700 — на белом (AA)">
        <Scale scale={beam} prefix="beam" />
        <div className="mt-4 grid gap-3 border-t border-hairline-soft pt-3 sm:grid-cols-2">
          <div className="rounded border border-hairline bg-white p-3">
            <p className="text-base text-ink-700">
              Текст акцентом на белом:{' '}
              <span className="font-semibold text-beam-700">beam-700</span>
            </p>
            <p className="mt-1 font-mono text-2xs text-ink-400">
              {formatRatio(beam[700], '#FFFFFF')} · AA
            </p>
          </div>
          <div className="on-obsidian rounded border border-obsidian-600 bg-surface-obsidian p-3">
            <p className="text-base text-obsidian-100">
              Текст акцентом на корпусе:{' '}
              <span className="font-semibold text-beam-300">beam-300</span>
            </p>
            <p className="mt-1 font-mono text-2xs text-obsidian-300">
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

      <DemoBlock title="Нейтральная шкала · ink" note="Холодный серый с синим подтоном">
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
          <p className="mt-3 text-xs leading-normal text-ink-400">
            Иерархия строится границами и фасками, не заливками. Как эти три слоя собираются в
            глубину — в разделе 04.
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
        </div>
        <p className="mt-3 max-w-3xl text-xs leading-normal text-ink-400">
          Типы мероприятий, объекты, форматы и виды работ — нейтральные бейджи. Палитра статусов
          зарезервирована исключительно под состояния объектов, а свет (beam) — под активность и
          фокус. Если раскрасить ими справочные признаки, статус перестанет считываться за секунду.
        </p>
      </DemoBlock>

      <DemoBlock title="Реестр цветовых токенов">
        <SpecTable
          head={['Токен', 'Значение', 'Применение']}
          rows={[
            ['obsidian-900', obsidian[900], 'Корпус: сайдбар, топбар, сводки, шапки панелей'],
            ['obsidian-800', obsidian[800], 'Приподнятые элементы внутри корпуса'],
            ['obsidian-50 / 200 / 300', `${obsidian[50]} / ${obsidian[200]} / ${obsidian[300]}`, 'Текст на корпусе: основной / вторичный / третичный'],
            ['beam-400', beam[400], 'Свет на корпусе: активный пункт, фокус, графики'],
            ['beam-700', beam[700], 'Тот же свет на белом: ссылки, чекбоксы, сортировка'],
            ['navy-600', navy[600], 'Структура: primary-кнопки, таблички'],
            ['signal-600', signal[600], 'Сигнальный акцент: внимание, демо-метка'],
            ['ink-900', ink[900], 'Основной текст на светлой поверхности'],
            ['ink-500 / 400', `${ink[500]} / ${ink[400]}`, 'Вторичный текст / микро-метки'],
            ['ink-200 / 300', `${ink[200]} / ${ink[300]}`, 'Границы таблиц / контуры контролов'],
            ['ink-50', ink[50], 'Фон приложения, заголовки таблиц'],
          ]}
        />
      </DemoBlock>
    </Section>
  )
}

export default ColorsSection
