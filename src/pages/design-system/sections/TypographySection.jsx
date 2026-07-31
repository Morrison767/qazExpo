import { Section, DemoBlock, SpecTable, DemoLabel } from '../parts'
import { HallPlate } from '@/components/HallPlate'

const SCALE = [
  { cls: 'text-3xl font-semibold', name: 'text-3xl / 600', spec: '28 / 36', use: 'KPI-число дашборда' },
  { cls: 'text-2xl font-semibold', name: 'text-2xl / 600', spec: '22 / 30', use: 'Заголовок страницы' },
  { cls: 'text-xl font-semibold', name: 'text-xl / 600', spec: '18 / 26', use: 'Заголовок панели, модального окна' },
  { cls: 'text-lg font-semibold', name: 'text-lg / 600', spec: '16 / 24', use: 'Заголовок карточки объекта' },
  { cls: 'text-md', name: 'text-md / 400', spec: '14 / 21', use: 'Тело карточки, описания' },
  { cls: 'text-base', name: 'text-base / 400', spec: '13 / 20', use: 'ОСНОВНОЙ размер интерфейса' },
  { cls: 'text-sm', name: 'text-sm / 400', spec: '12 / 18', use: 'Плотные таблицы' },
  { cls: 'text-xs', name: 'text-xs / 400', spec: '11 / 16', use: 'Подписи, хинты, счётчики' },
  {
    cls: 'text-2xs font-semibold uppercase tracking-label',
    name: 'text-2xs / 600 CAPS',
    spec: '10 / 14 · +0.12em',
    use: 'Микро-метки: заголовки колонок, метки полей, группы навигации',
  },
]

export function TypographySection() {
  return (
    <Section
      id="typography"
      num="02"
      title="Типографика"
      description="IBM Plex Sans — единственный интерфейсный шрифт: кириллица-native, инженерный характер, надёжная читаемость на 13px. IBM Plex Mono — только машинные идентификаторы. Базовый кегль 13px выбран ради плотности: реестр должен показывать 25 строк без прокрутки."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="IBM Plex Sans" note="Интерфейс, 400 / 500 / 600 / 700">
          <p className="text-3xl leading-tight text-content">
            Мероприятия на объектах Общества
          </p>
          <p className="mt-2 text-md leading-normal text-content-muted">
            Съешь же ещё этих мягких французских булок да выпей чаю. Қазақ әліпбиі: Әә Ғғ Ққ Ңң Өө
            Ұұ Үү Һһ Іі. The quick brown fox jumps over the lazy dog.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 border-t border-hairline-soft pt-3">
            {[
              { w: 'font-normal', l: '400 Regular' },
              { w: 'font-medium', l: '500 Medium' },
              { w: 'font-semibold', l: '600 SemiBold' },
              { w: 'font-bold', l: '700 Bold' },
            ].map((item) => (
              <div key={item.l}>
                <p className={`text-lg text-content ${item.w}`}>Договор аренды</p>
                <p className="mt-0.5 text-2xs uppercase tracking-label text-content-faint">{item.l}</p>
              </div>
            ))}
          </div>
        </DemoBlock>

        <DemoBlock title="IBM Plex Mono" note="Идентификаторы, коды залов, суммы в табличках">
          <div className="flex flex-wrap items-center gap-2">
            <HallPlate>КЦ-А1</HallPlate>
            <HallPlate>МВЦ-П1</HallPlate>
            <HallPlate tone="outline">№ 0142/25-АР</HallPlate>
            <HallPlate tone="muted">EV-0143</HallPlate>
            <HallPlate tone="signal">БИН 180440012345</HallPlate>
          </div>
          <p className="mt-4 font-mono text-md text-content">
            0123456789 · 48 500 000 ₸ · 14.03.2026 · 09:30–18:00
          </p>
          <p className="mt-3 border-t border-hairline-soft pt-3 text-xs leading-normal text-content-faint">
            Моно применяется только к машинным данным. Названия мероприятий, арендаторов и
            комментарии — всегда Plex Sans.
          </p>
        </DemoBlock>
      </div>

      <DemoBlock title="Табличные цифры" note="font-variant-numeric: tabular-nums — включено глобально">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <DemoLabel>Табличные (система)</DemoLabel>
            <div className="space-y-0.5 text-right font-medium tabular-nums text-content">
              <p>48 500 000 ₸</p>
              <p>126 000 000 ₸</p>
              <p>3 400 000 ₸</p>
              <p>8 900 000 ₸</p>
            </div>
          </div>
          <div>
            <DemoLabel>Пропорциональные (не использовать)</DemoLabel>
            <div
              className="space-y-0.5 text-right font-medium text-content-faint"
              style={{ fontVariantNumeric: 'proportional-nums' }}
            >
              <p>48 500 000 ₸</p>
              <p>126 000 000 ₸</p>
              <p>3 400 000 ₸</p>
              <p>8 900 000 ₸</p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs leading-normal text-content-faint">
          Разряды выстраиваются в колонку — суммы договоров и задолженности сравниваются взглядом,
          без чтения каждой цифры. Требование к реестрам и финансовым отчётам.
        </p>
      </DemoBlock>

      <DemoBlock title="Шкала кеглей">
        <div className="space-y-3">
          {SCALE.map((item) => (
            <div
              key={item.name}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-hairline-soft pb-2.5 last:border-b-0 last:pb-0"
            >
              <p className={`min-w-0 flex-1 text-content ${item.cls}`}>
                Astana Finance Days 2026
              </p>
              <p className="w-32 shrink-0 font-mono text-2xs text-content-subtle">{item.name}</p>
              <p className="w-24 shrink-0 font-mono text-2xs text-content-faint">{item.spec}</p>
              <p className="w-56 shrink-0 text-xs text-content-faint">{item.use}</p>
            </div>
          ))}
        </div>
      </DemoBlock>

      <DemoBlock title="Правила набора">
        <SpecTable
          head={['Правило', 'Как применяем']}
          rows={[
            ['Один шрифт', 'Plex Sans для всего интерфейса; Mono — только идентификаторы и коды'],
            ['CAPS + трекинг', 'Только микро-метки 10px: заголовки колонок, метки полей, группы навигации'],
            ['Заголовки', 'Максимум 600 (semibold); 700 — только в бейджах и табличках'],
            ['Числа', 'Всегда tabular-nums; суммы и количества выравниваются вправо'],
            ['Длина строки', 'Описания и комментарии — не шире 3xl (~48rem)'],
            ['Курсив', 'Не используется — плохо читается в кириллице на малых кеглях'],
          ]}
        />
      </DemoBlock>
    </Section>
  )
}

export default TypographySection
