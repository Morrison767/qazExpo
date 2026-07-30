import { colors, navy, signal, ink, danger, success } from '@/design/tokens'
import { Section, DemoBlock, Swatch, DemoLabel, SpecTable } from '../parts'
import { Badge } from '@/components/Badge'
import { HallPlate } from '@/components/HallPlate'

function Scale({ scale, prefix }) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
      {Object.entries(scale).map(([key, hex]) => (
        <Swatch key={key} name={`${prefix}-${key}`} hex={hex} onLight={false} size="sm" />
      ))}
    </div>
  )
}

export function ColorsSection() {
  return (
    <Section
      id="colors"
      num="01"
      title="Цвет"
      description="Один акцент + один сигнальный оттенок + холодная нейтральная шкала. Тёплые и бежевые тона исключены: интерфейс должен читаться как инженерное табло комплекса, а не как презентация."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Акцент · Ink Navy" note="navy-600 — primary, ссылки, активная навигация">
          <div className="flex items-stretch gap-4">
            <div
              className="flex h-24 w-24 shrink-0 flex-col justify-end rounded-md p-2.5"
              style={{ backgroundColor: navy[600] }}
            >
              <HallPlate tone="inverse" size="sm">
                #1B3A6B
              </HallPlate>
            </div>
            <div className="min-w-0 flex-1 text-base leading-normal text-ink-600">
              <p>
                Глубокий синий навигационных табло и директорийных стендов. Достаточно тёмный, чтобы
                нести белый текст (
                <span className="font-mono text-xs text-ink-800">10.2:1</span>), и достаточно
                сдержанный, чтобы не спорить с палитрой статусов в плотной таблице.
              </p>
              <p className="mt-2 text-xs text-ink-400">
                Применение: primary-кнопки, активный пункт сайдбара, фокус-кольцо, таблички
                идентификаторов, выделение строки.
              </p>
            </div>
          </div>
        </DemoBlock>

        <DemoBlock
          title="Сигнальный акцент · Signal Amber"
          note="signal-600 — точечно, «требует внимания»"
        >
          <div className="flex items-stretch gap-4">
            <div
              className="flex h-24 w-24 shrink-0 flex-col justify-end rounded-md p-2.5"
              style={{ backgroundColor: signal[600] }}
            >
              <HallPlate tone="inverse" size="sm">
                #D97706
              </HallPlate>
            </div>
            <div className="min-w-0 flex-1 text-base leading-normal text-ink-600">
              <p>
                Цвет маршрутных линий и указателей на схемах комплекса. Используется дозированно —
                иначе перестаёт быть сигналом.
              </p>
              <p className="mt-2 text-xs text-ink-400">
                Применение: метка демо-режима, активный пункт в тёмном сайдбаре, предупреждающие
                тосты, «на согласовании» в статусной палитре.
              </p>
            </div>
          </div>
        </DemoBlock>
      </div>

      <DemoBlock title="Шкала акцента · navy" note="600 — базовый тон">
        <Scale scale={navy} prefix="navy" />
      </DemoBlock>

      <DemoBlock title="Сигнальная шкала · signal">
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
            <Swatch name="hairline" hex={colors.hairline.DEFAULT} label="Границы 1px" onLight={false} />
            <Swatch
              name="hairline-strong"
              hex={colors.hairline.strong}
              label="Контуры контролов"
              onLight={false}
            />
          </div>
          <p className="mt-3 text-xs leading-normal text-ink-400">
            Иерархия строится границами, а не тенями: плоский корпоративный слой лучше переносит
            плотные реестры и длинные рабочие сессии.
          </p>
        </DemoBlock>

        <DemoBlock title="Служебные шкалы">
          <DemoLabel>danger — деструктивные действия</DemoLabel>
          <div className="grid grid-cols-5 gap-2">
            {['400', '500', '600', '700', '800'].map((key) => (
              <Swatch key={key} name={`danger-${key}`} hex={danger[key]} onLight={false} size="sm" />
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
          зарезервирована исключительно под состояния объектов: если раскрасить ею справочные
          признаки, статус перестанет считываться за секунду.
        </p>
      </DemoBlock>

      <DemoBlock title="Реестр цветовых токенов">
        <SpecTable
          head={['Токен', 'Значение', 'Применение']}
          rows={[
            ['navy-600', navy[600], 'Основной акцент: primary, активная навигация, фокус'],
            ['signal-600', signal[600], 'Сигнальный акцент: внимание, демо-метка, предупреждения'],
            ['ink-900', ink[900], 'Основной текст'],
            ['ink-500', ink[500], 'Вторичный текст, подписи'],
            ['ink-400', ink[400], 'Микро-метки, плейсхолдеры, иконки в покое'],
            ['ink-200 / hairline', ink[200], 'Границы таблиц и карточек'],
            ['ink-300 / hairline-strong', ink[300], 'Контуры полей ввода и кнопок'],
            ['ink-50 / canvas', ink[50], 'Фон приложения, заголовки таблиц'],
          ]}
        />
      </DemoBlock>
    </Section>
  )
}

export default ColorsSection
