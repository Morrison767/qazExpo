import { useState } from 'react'
import { STATUSES, STATUS_KEYS, STATUS_MAPPING } from '@/design/statuses'
import { StatusBadge, StatusDot, StatusStrip } from '@/components/Status'
import { Tabs } from '@/components/Tabs'
import { HallPlate } from '@/components/HallPlate'
import { CVD_MODES, CvdFilters } from '@/components/CvdFilters'
import { formatRatio } from '@/lib/contrast'
import { Section, DemoBlock, DemoLabel } from '../parts'

export function StatusSection() {
  const [cvd, setCvd] = useState('normal')
  const mode = CVD_MODES.find((m) => m.key === cvd) ?? CVD_MODES[0]

  return (
    <Section
      id="statuses"
      num="03"
      title="Статусы"
      description="Ядро системы. Восемь токенов покрывают состояния мероприятий, договоров, оплат и допусков. Правило безусловное: цвет никогда не единственный носитель смысла — каждый статус несёт собственную иконку-форму и текстовую метку, а «Конфликт» дополнительно получает диагональную штриховку."
    >
      <CvdFilters />

      <DemoBlock
        title="Палитра статусов"
        note="Бейдж = цвет + форма + текст. Контраст текста на подложке ≥ 6:1"
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STATUS_KEYS.map((key) => {
            const meta = STATUSES[key]
            return (
              <div
                key={key}
                className="relative overflow-hidden rounded-md border border-hairline bg-surface pl-rail"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-rail rounded-l-[5px]"
                  style={{ backgroundColor: meta.colors.base }}
                />
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={key} />
                    <HallPlate tone="muted" size="sm">
                      {key}
                    </HallPlate>
                  </div>
                  <p className="mt-2 text-xs leading-snug text-content-subtle">{meta.description}</p>
                  <div className="mt-2.5 flex items-center gap-2 border-t border-hairline-soft pt-2 font-mono text-2xs text-content-faint">
                    <span>{meta.colors.base}</span>
                    <span className="text-content-faint">·</span>
                    <span>{formatRatio(meta.colors.text, meta.colors.soft)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </DemoBlock>

      <DemoBlock
        title="Проверка на цветовую слепоту"
        note="~8% мужчин имеют нарушение цветовосприятия"
      >
        <Tabs
          variant="segmented"
          size="sm"
          items={CVD_MODES.map((m) => ({ key: m.key, label: m.label }))}
          value={cvd}
          onChange={setCvd}
          className="mb-4"
        />
        <div style={{ filter: mode.filter ?? undefined }}>
          <div className="flex flex-wrap gap-2">
            {STATUS_KEYS.map((key) => (
              <StatusBadge key={key} status={key} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUS_KEYS.map((key) => (
              <StatusBadge key={key} status={key} variant="solid" />
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {STATUS_KEYS.slice(0, 4).map((key) => (
              <StatusStrip key={key} status={key}>
                {STATUSES[key].label} · КЦ-А1
              </StatusStrip>
            ))}
          </div>
        </div>
        <p className="mt-4 max-w-3xl border-t border-hairline-soft pt-3 text-xs leading-normal text-content-faint">
          При дейтеранопии «Подтверждено» и «Оплачено» сближаются по тону, при тританопии — «Не
          оплачено» и «Конфликт». Именно поэтому подбор восьми «идеально различимых» оттенков не
          решает задачу, а иконка-форма и подпись — решают. В ч/б печати статусы читаются по глифу
          и штриховке.
        </p>
      </DemoBlock>

      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Варианты бейджа">
          <DemoLabel>soft — основной, для реестров и карточек</DemoLabel>
          <div className="flex flex-wrap gap-2">
            {STATUS_KEYS.map((key) => (
              <StatusBadge key={key} status={key} />
            ))}
          </div>

          <DemoLabel className="mt-4">solid — акцентный, для календаря и уведомлений</DemoLabel>
          <div className="flex flex-wrap gap-2">
            {STATUS_KEYS.map((key) => (
              <StatusBadge key={key} status={key} variant="solid" />
            ))}
          </div>

          <DemoLabel className="mt-4">outline — на цветных подложках</DemoLabel>
          <div className="flex flex-wrap gap-2">
            {STATUS_KEYS.map((key) => (
              <StatusBadge key={key} status={key} variant="outline" />
            ))}
          </div>

          <DemoLabel className="mt-4">Размеры sm / md / lg</DemoLabel>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="confirmed" size="sm" />
            <StatusBadge status="confirmed" size="md" />
            <StatusBadge status="confirmed" size="lg" />
            <span className="mx-1 h-4 w-px bg-hairline" />
            <StatusBadge status="review" size="md" withIcon={false} />
            <span className="text-xs text-content-faint">без иконки — только в плотных списках</span>
          </div>

          <DemoLabel className="mt-4">Точки — легенды календаря</DemoLabel>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {STATUS_KEYS.slice(0, 5).map((key) => (
              <StatusDot key={key} status={key} withLabel />
            ))}
          </div>
        </DemoBlock>

        <DemoBlock title="Отображение доменных статусов ТЗ на токены">
          <div className="space-y-4">
            {STATUS_MAPPING.map((group) => (
              <div key={group.domain}>
                <div className="mb-1.5 flex items-baseline gap-2">
                  <p className="text-base font-semibold text-content">{group.domain}</p>
                  <p className="text-xs text-content-faint">{group.field}</p>
                </div>
                <div className="space-y-1">
                  {group.values.map((value) => (
                    <div
                      key={value.label}
                      className="flex items-center justify-between gap-3 border-b border-hairline-soft py-1 last:border-b-0"
                    >
                      <span className="min-w-0 truncate text-sm text-content-muted">{value.label}</span>
                      <StatusBadge status={value.token} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-hairline pt-3 text-xs leading-normal text-content-faint">
            Один токен обслуживает несколько сущностей: «Статус договора» и «Статус оплаты» — разные
            колонки и никогда не соседствуют в одной ячейке, поэтому переиспользование цвета не
            создаёт двусмысленности и удерживает палитру в границах восьми значений.
          </p>
        </DemoBlock>
      </div>
    </Section>
  )
}

export default StatusSection
