import { borderRadius, boxShadow, sizes } from '@/design/tokens'
import { Section, DemoBlock, SpecTable, DemoLabel } from '../parts'

const SPACING_STEPS = [
  { token: '1', px: 4, use: 'Внутренний зазор иконка/текст' },
  { token: '1.5', px: 6, use: 'Зазор в бейджах' },
  { token: '2', px: 8, use: 'Между контролами в ряду' },
  { token: '3', px: 12, use: 'Между карточками, паддинг ячейки' },
  { token: '4', px: 16, use: 'Паддинг карточки, отступ секции' },
  { token: '5', px: 20, use: 'Паддинг страницы, модального окна' },
  { token: '6', px: 24, use: 'Между блоками экрана' },
  { token: '10', px: 40, use: 'Между разделами страницы' },
]

export function LayoutSection() {
  return (
    <Section
      id="layout"
      num="06"
      title="Сетка, радиусы, тени"
      description="Сетка 4px, сдержанные радиусы, минимальный подъём. Иерархия держится границами в 1px: так плотный реестр остаётся спокойным, а тень означает исключительно «слой поверх» — дропдаун, модальное окно, панель."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Шаг сетки · 4px">
          <div className="space-y-2">
            {SPACING_STEPS.map((step) => (
              <div key={step.token} className="flex items-center gap-3">
                <span className="w-8 shrink-0 font-mono text-2xs text-ink-500">{step.token}</span>
                <span className="w-10 shrink-0 font-mono text-2xs text-ink-400">{step.px}px</span>
                <span
                  className="h-2.5 shrink-0 rounded-xs bg-navy-200"
                  style={{ width: step.px * 2 }}
                />
                <span className="min-w-0 truncate text-xs text-ink-500">{step.use}</span>
              </div>
            ))}
          </div>
        </DemoBlock>

        <DemoBlock title="Радиусы">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {Object.entries(borderRadius)
              .filter(([key]) => !['none', 'full', '2xl'].includes(key))
              .map(([key, value]) => (
                <div key={key}>
                  <div
                    className="flex h-14 items-end justify-start border border-hairline-strong bg-ink-50 p-1.5"
                    style={{ borderRadius: value }}
                  >
                    <span className="font-mono text-2xs text-ink-400">{value}</span>
                  </div>
                  <p className="mt-1.5 font-mono text-2xs text-ink-700">
                    {key === 'DEFAULT' ? 'rounded' : `rounded-${key}`}
                  </p>
                </div>
              ))}
          </div>
          <p className="mt-3 text-xs leading-normal text-ink-400">
            4px — контролы, бейджи, таблички. 6px — карточки и таблицы. 8px — модальные окна и
            панели. Крупные скругления исключены: институциональный тон, а не потребительское
            приложение.
          </p>
        </DemoBlock>
      </div>

      <DemoBlock title="Тени" tone="canvas">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {['xs', 'sm', 'DEFAULT', 'md', 'lg', 'xl'].map((key) => (
            <div key={key}>
              <div
                className="flex h-20 items-end rounded-md border border-hairline bg-white p-2"
                style={{ boxShadow: boxShadow[key] }}
              >
                <span className="font-mono text-2xs text-ink-400">
                  {key === 'DEFAULT' ? 'shadow' : `shadow-${key}`}
                </span>
              </div>
              <p className="mt-1.5 text-2xs leading-snug text-ink-500">
                {
                  {
                    xs: 'Карточки, кнопки в покое',
                    sm: 'Наведение на карточку',
                    DEFAULT: 'Липкие панели',
                    md: 'Поповеры, подсказки',
                    lg: 'Дропдауны, тосты',
                    xl: 'Модальные окна',
                  }[key]
                }
              </p>
            </div>
          ))}
        </div>
      </DemoBlock>

      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Высоты каркаса и контролов">
          <SpecTable
            head={['Токен', 'Значение', 'Применение']}
            rows={[
              ['h-control-sm', '28px', 'Компактные кнопки, поля в панелях фильтров'],
              ['h-control', '32px', 'Базовая высота кнопок и полей'],
              ['h-control-lg', '38px', 'Акцентные действия, глобальный поиск'],
              ['h-topbar', '56px', 'Топбар и бренд-блок сайдбара'],
              ['h-row', '36px', 'Строка плотного реестра (по умолчанию)'],
              ['h-row-lg', '44px', 'Строка комфортного режима'],
              ['w-sidebar', `${sizes.sidebar} (248px)`, 'Сайдбар раскрыт'],
              ['w-sidebar-collapsed', '60px', 'Сайдбар свёрнут'],
            ]}
          />
        </DemoBlock>

        <DemoBlock title="Плотность реестра" note="36px — целевая строка">
          <DemoLabel>Компактный режим — 36px</DemoLabel>
          <div className="overflow-hidden rounded border border-hairline">
            {['КЦ-А1', 'КЦ-Б2', 'МВЦ-П1', 'МВЦ-П3'].map((hall) => (
              <div
                key={hall}
                className="flex h-row items-center gap-3 border-b border-hairline-soft px-3 text-sm last:border-b-0"
              >
                <span className="font-mono text-xs text-ink-900">{hall}</span>
                <span className="min-w-0 flex-1 truncate text-ink-700">Занято · монтаж</span>
                <span className="tabular-nums text-ink-500">14.03.2026</span>
              </div>
            ))}
          </div>

          <DemoLabel className="mt-4">Комфортный режим — 44px</DemoLabel>
          <div className="overflow-hidden rounded border border-hairline">
            {['КЦ-А1', 'КЦ-Б2'].map((hall) => (
              <div
                key={hall}
                className="flex h-row-lg items-center gap-3 border-b border-hairline-soft px-3.5 text-base last:border-b-0"
              >
                <span className="font-mono text-xs text-ink-900">{hall}</span>
                <span className="min-w-0 flex-1 truncate text-ink-700">Занято · монтаж</span>
                <span className="tabular-nums text-ink-500">14.03.2026</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-normal text-ink-400">
            Плотный режим — по умолчанию: 25 строк реестра видны без прокрутки на 1080p. Комфортный
            переключается пользователем и хранится в его настройках.
          </p>
        </DemoBlock>
      </div>
    </Section>
  )
}

export default LayoutSection
