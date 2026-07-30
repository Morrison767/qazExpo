import { useState } from 'react'
import { Modal, SidePanel } from '@/components/Modal'
import { Button } from '@/components/Button'
import { Tabs } from '@/components/Tabs'
import { Field, Input, Textarea, DateRangeField, Checkbox } from '@/components/Field'
import { MetaGrid, MetaItem, Card, CardHeader, CardBody } from '@/components/Card'
import { StatusBadge } from '@/components/Status'
import { Badge } from '@/components/Badge'
import { EVENTS } from '@/demo/data'
import { formatDate, formatDateRange, formatMoney, formatNumber } from '@/lib/format'
import { Section, DemoBlock, DemoLabel, SpecTable } from '../parts'

const event = EVENTS[1]

export function OverlaysSection() {
  const [modal, setModal] = useState(null)
  const [panel, setPanel] = useState(false)
  const [panelTab, setPanelTab] = useState('main')

  return (
    <Section
      id="overlays"
      num="11"
      title="Модальные окна и слайд-панели"
      description="Разделение строгое: модальное окно — короткое подтверждение или компактная форма; слайд-панель — карточка объекта поверх реестра, чтобы оператор не терял выборку и место в списке."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Модальные окна">
          <DemoLabel>Размеры и сценарии</DemoLabel>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setModal('confirm')}>
              Подтверждение (sm)
            </Button>
            <Button variant="secondary" onClick={() => setModal('form')}>
              Форма (md)
            </Button>
            <Button variant="danger" onClick={() => setModal('danger')}>
              Деструктивное
            </Button>
            <Button variant="secondary" onClick={() => setModal('conflict')}>
              Конфликт брони
            </Button>
          </div>
          <p className="mt-3 text-xs leading-normal text-ink-400">
            Закрытие — крестик, клик по подложке, Escape. Прокрутка страницы под окном блокируется.
          </p>
        </DemoBlock>

        <DemoBlock title="Слайд-панель">
          <DemoLabel>Карточка объекта поверх реестра</DemoLabel>
          <Button variant="primary" iconLeft="external-link" onClick={() => setPanel(true)}>
            Открыть карточку мероприятия
          </Button>
          <SpecTable
            head={['Ширина', 'Применение']}
            rows={[
              ['md · 480px', 'Форма корректировки, добавление подрядчика'],
              ['lg · 640px', 'Карточка мероприятия, договора, арендатора'],
              ['xl · 820px', 'Карточка с табами и вложенными таблицами'],
            ]}
          />
        </DemoBlock>
      </div>

      {/* ── Подтверждение ─────────────────────────────────── */}
      <Modal
        open={modal === 'confirm'}
        onClose={() => setModal(null)}
        size="sm"
        title="Отправить на согласование?"
        subtitle="Заявка перейдёт юридической службе и финансовому департаменту."
        plate={event.id}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Отмена
            </Button>
            <Button variant="primary" iconLeft="check" onClick={() => setModal(null)}>
              Отправить
            </Button>
          </>
        }
      >
        <MetaGrid columns={2}>
          <MetaItem label="Мероприятие" value={event.name} />
          <MetaItem label="Зал" value={event.hall} mono />
          <MetaItem label="Период" value={formatDateRange(event.eventFrom, event.eventTo)} />
          <MetaItem label="Сумма" value={formatMoney(event.amount)} tone="accent" />
        </MetaGrid>
        <div className="mt-4 border-t border-hairline-soft pt-3">
          <Checkbox label="Уведомить арендатора по электронной почте" defaultChecked />
        </div>
      </Modal>

      {/* ── Форма ─────────────────────────────────────────── */}
      <Modal
        open={modal === 'form'}
        onClose={() => setModal(null)}
        size="md"
        title="Корректировка мероприятия"
        subtitle="Изменения дат и состава подрядчиков проходят согласование."
        plate={event.id}
        status="review"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Отмена
            </Button>
            <Button variant="primary" onClick={() => setModal(null)}>
              Направить корректировку
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Что изменяется" required>
            <Input defaultValue="Период монтажа" />
          </Field>
          <Field label="Новый период" required>
            <DateRangeField
              fromProps={{ defaultValue: '2026-04-02' }}
              toProps={{ defaultValue: '2026-04-05' }}
            />
          </Field>
          <Field label="Обоснование" hint="Будет видно согласующим подразделениям" required>
            <Textarea rows={3} placeholder="Причина изменения…" />
          </Field>
        </div>
      </Modal>

      {/* ── Деструктивное ─────────────────────────────────── */}
      <Modal
        open={modal === 'danger'}
        onClose={() => setModal(null)}
        size="sm"
        title="Расторгнуть договор?"
        plate="№ 0151/26-АР"
        status="void"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Отмена
            </Button>
            <Button variant="danger" iconLeft="ban" onClick={() => setModal(null)}>
              Расторгнуть
            </Button>
          </>
        }
      >
        <p className="text-base leading-normal text-ink-700">
          Договор перейдёт в статус «Расторгнуто», связанное мероприятие будет снято с календаря, а
          бронь зала МВЦ-П1 освободится с 06.04.2026.
        </p>
        <div className="mt-4 rounded border border-status-conflict-border bg-status-conflict-soft p-3">
          <p className="text-xs leading-normal text-status-conflict-text">
            Действие необратимо. Требуется согласование юридической службы и уведомление
            арендатора.
          </p>
        </div>
      </Modal>

      {/* ── Конфликт брони ────────────────────────────────── */}
      <Modal
        open={modal === 'conflict'}
        onClose={() => setModal(null)}
        size="lg"
        title="Обнаружено пересечение бронирования"
        subtitle="Подтверждение невозможно без согласования уполномоченного лица."
        status="conflict"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Изменить даты
            </Button>
            <Button variant="secondary" onClick={() => setModal(null)}>
              Запросить согласование
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {[EVENTS[0], EVENTS[3]].map((item) => (
            <Card key={item.id} status={item.status}>
              <CardHeader
                plate={item.id}
                title={item.name}
                subtitle={item.tenant}
                status={item.status}
              />
              <CardBody>
                <MetaGrid columns={4}>
                  <MetaItem label="Зал" value={item.hall} mono />
                  <MetaItem label="Начало" value={formatDate(item.eventFrom)} mono />
                  <MetaItem label="Окончание" value={formatDate(item.eventTo)} mono />
                  <MetaItem label="Участники" value={formatNumber(item.guests)} />
                </MetaGrid>
              </CardBody>
            </Card>
          ))}
        </div>
      </Modal>

      {/* ── Слайд-панель ──────────────────────────────────── */}
      <SidePanel
        open={panel}
        onClose={() => setPanel(false)}
        size="lg"
        plate={event.id}
        status={event.status}
        title={event.name}
        subtitle={`${event.tenant} · ${event.object}`}
        tabs={
          <Tabs
            onDark
            value={panelTab}
            onChange={setPanelTab}
            items={[
              { key: 'main', label: 'Основное' },
              { key: 'contracts', label: 'Договоры', count: 1 },
              { key: 'contractors', label: 'Подрядчики', count: 3 },
              { key: 'history', label: 'История' },
            ]}
          />
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setPanel(false)}>
              Закрыть
            </Button>
            <Button variant="secondary" iconLeft="pencil">
              Редактировать
            </Button>
            <Button variant="primary" iconLeft="check">
              Подтвердить
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Card status={event.status}>
            <CardHeader plate={event.hall} title="Сроки и площадка" meta={event.type} />
            <CardBody>
              <MetaGrid columns={2}>
                <MetaItem
                  label="Монтаж"
                  value={formatDateRange(event.mountFrom, event.eventFrom)}
                  icon="hard-hat"
                />
                <MetaItem
                  label="Проведение"
                  value={formatDateRange(event.eventFrom, event.eventTo)}
                  icon="calendar"
                  tone="strong"
                />
                <MetaItem
                  label="Демонтаж"
                  value={formatDateRange(event.eventTo, event.dismountTo)}
                  icon="box"
                />
                <MetaItem label="Участники" value={formatNumber(event.guests)} icon="users" />
              </MetaGrid>
            </CardBody>
          </Card>

          <Card>
            <CardHeader plate="ФИН" plateTone="outline" title="Финансовые условия" />
            <CardBody>
              <MetaGrid columns={2}>
                <MetaItem label="Сумма договора" value={formatMoney(event.amount)} tone="accent" />
                <MetaItem
                  label="Статус оплаты"
                  value={<StatusBadge status={event.payment} size="sm" />}
                />
                <MetaItem label="Условия оплаты" value="70% предоплата, 30% по акту" />
                <MetaItem label="Ответственный" value={event.manager} />
              </MetaGrid>
            </CardBody>
          </Card>

          <Card>
            <CardHeader plate="ТЕХ" plateTone="outline" title="Потребности" />
            <CardBody>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="navy" icon="shield">
                  Охрана
                </Badge>
                <Badge tone="navy" icon="hard-hat">
                  Монтаж стендов
                </Badge>
                <Badge tone="navy">Клининг</Badge>
                <Badge tone="outline">Кейтеринг не требуется</Badge>
              </div>
            </CardBody>
          </Card>
        </div>
      </SidePanel>
    </Section>
  )
}

export default OverlaysSection
