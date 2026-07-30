import { useState } from 'react'
import {
  Field,
  Input,
  SearchInput,
  Select,
  Textarea,
  DateField,
  DateRangeField,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
} from '@/components/Field'
import { Button } from '@/components/Button'
import { EVENT_FORMATS, EVENT_TYPES, HALLS } from '@/demo/data'
import { Section, DemoBlock, DemoLabel } from '../parts'

export function FormsSection() {
  const [search, setSearch] = useState('Astana')
  const [format, setFormat] = useState('hybrid')
  const [needs, setNeeds] = useState(['security', 'cleaning'])

  function toggleNeed(key) {
    setNeeds((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
    )
  }

  return (
    <Section
      id="forms"
      num="06"
      title="Поля ввода"
      description="Метка над полем в CAPS 10px — тот же «указательный» язык, что у заголовков колонок и табличек. Высота 32px, единая геометрия для input, select, date и textarea. Ошибка всегда текстом, а не только красной рамкой."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Текстовые поля">
          <div className="space-y-4">
            <Field label="Наименование мероприятия" required>
              <Input placeholder="Например: Astana Finance Days 2026" defaultValue="" />
            </Field>

            <Field label="Номер договора" hint="Формат: NNNN/ГГ-АР">
              <Input mono placeholder="0142/25-АР" iconLeft="contract" />
            </Field>

            <Field label="Сумма договора" hint="Без НДС">
              <Input type="number" placeholder="0" suffix="₸" className="text-right" />
            </Field>

            <Field
              label="Количество участников"
              error="Превышает вместимость выбранного зала (3 000 чел.)"
            >
              <Input type="number" defaultValue="4200" invalid />
            </Field>

            <Field label="Ответственный сотрудник" hint="Заполняется из Active Directory">
              <Input defaultValue="М. Ким · Отдел аренды" readOnly />
            </Field>

            <Field label="Договор в архиве">
              <Input defaultValue="Недоступно для редактирования" disabled />
            </Field>
          </div>
        </DemoBlock>

        <DemoBlock title="Списки, даты, длинный текст">
          <div className="space-y-4">
            <Field label="Тип мероприятия" required>
              <Select
                defaultValue=""
                placeholder="Выберите тип"
                options={EVENT_TYPES.map((type) => ({ value: type, label: type }))}
              />
            </Field>

            <Field label="Помещение / зал" required>
              <Select
                defaultValue="КЦ-А1"
                options={HALLS.map((hall) => ({
                  value: hall.code,
                  label: `${hall.code} · ${hall.name} (${hall.capacity} чел.)`,
                }))}
              />
            </Field>

            <Field label="Дата и время проведения" required>
              <DateField withTime defaultValue="2026-03-14T09:30" />
            </Field>

            <Field label="Период монтажа" hint="С — по, включая технические окна">
              <DateRangeField
                fromProps={{ defaultValue: '2026-03-12' }}
                toProps={{ defaultValue: '2026-03-13' }}
              />
            </Field>

            <Field label="Технические требования" hint="Оборудование, электропитание, нагрузки">
              <Textarea
                rows={4}
                placeholder="Сцена 12×8 м, светодиодный экран 6×3 м, подключение 3×32А…"
              />
            </Field>
          </div>
        </DemoBlock>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Выбор">
          <DemoLabel>Чекбоксы — потребности мероприятия</DemoLabel>
          <div className="space-y-2.5">
            {[
              { key: 'security', label: 'Охрана', description: 'Пропускной режим и посты' },
              { key: 'cleaning', label: 'Клининг' },
              { key: 'catering', label: 'Кейтеринг' },
              { key: 'tech', label: 'Техническое сопровождение' },
            ].map((item) => (
              <Checkbox
                key={item.key}
                label={item.label}
                description={item.description}
                checked={needs.includes(item.key)}
                onChange={() => toggleNeed(item.key)}
              />
            ))}
            <Checkbox label="Частичный выбор (indeterminate)" indeterminate />
            <Checkbox label="Заблокировано" disabled />
            <Checkbox label="Заблокировано и выбрано" disabled checked />
          </div>

          <DemoLabel className="mt-5">Радио — формат мероприятия</DemoLabel>
          <RadioGroup
            name="event-format"
            value={format}
            onChange={setFormat}
            options={EVENT_FORMATS}
          />

          <DemoLabel className="mt-5">В строку</DemoLabel>
          <RadioGroup
            name="density"
            value="compact"
            direction="row"
            options={[
              { value: 'compact', label: 'Плотно' },
              { value: 'comfortable', label: 'Комфортно' },
            ]}
          />

          <DemoLabel className="mt-5">Переключатели</DemoLabel>
          <div className="space-y-2.5">
            <Switch label="Уведомлять о приближении монтажа" defaultChecked />
            <Switch label="Показывать технические окна в календаре" />
            <Switch label="Недоступно" disabled />
          </div>
        </DemoBlock>

        <DemoBlock title="Поиск и панель фильтров">
          <DemoLabel>Поиск с очисткой и подсказкой</DemoLabel>
          <div className="space-y-3">
            <SearchInput
              placeholder="Поиск по реестру мероприятий…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onClear={() => setSearch('')}
            />
            <SearchInput placeholder="Глобальный поиск…" hint="⌘K" />
          </div>

          <DemoLabel className="mt-5">Панель фильтров реестра</DemoLabel>
          <div className="rounded-md border border-hairline bg-canvas p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Объект">
                <Select
                  size="sm"
                  defaultValue=""
                  placeholder="Все объекты"
                  options={[
                    { value: 'kc', label: 'Конгресс-центр' },
                    { value: 'mvc', label: 'Международный выставочный центр' },
                    { value: 'alem', label: 'Alem.AI' },
                  ]}
                />
              </Field>
              <Field label="Статус">
                <Select
                  size="sm"
                  defaultValue=""
                  placeholder="Любой статус"
                  options={[
                    { value: 'confirmed', label: 'Подтверждено' },
                    { value: 'review', label: 'На согласовании' },
                    { value: 'conflict', label: 'Конфликт' },
                  ]}
                />
              </Field>
              <Field label="Период" className="sm:col-span-2">
                <DateRangeField size="sm" />
              </Field>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2 border-t border-hairline-soft pt-3">
              <Button variant="ghost" size="sm">
                Сбросить
              </Button>
              <Button variant="primary" size="sm" iconLeft="filter">
                Применить
              </Button>
            </div>
          </div>

          <DemoLabel className="mt-5">Размеры контролов</DemoLabel>
          <div className="grid gap-2 sm:grid-cols-3">
            <Input size="sm" placeholder="sm · 28px" />
            <Input size="md" placeholder="md · 32px" />
            <Input size="lg" placeholder="lg · 38px" />
          </div>
        </DemoBlock>
      </div>
    </Section>
  )
}

export default FormsSection
