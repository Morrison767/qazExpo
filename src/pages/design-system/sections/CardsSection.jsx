import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  MetaGrid,
  MetaItem,
  StatTile,
} from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button, IconButton } from '@/components/Button'
import { StatusBadge } from '@/components/Status'
import { HallPlate } from '@/components/HallPlate'
import { Sparkline, RingGauge } from '@/components/Instruments'
import { formatDate, formatDateRange, formatMoney, formatNumber } from '@/lib/format'
import { CONTRACTS, EVENTS, TREND_DEBT, TREND_EVENTS, TREND_REVENUE } from '@/demo/data'
import { Section, DemoBlock } from '../parts'

const event = EVENTS[0]
const conflictEvent = EVENTS[3]
const contract = CONTRACTS[1]

export function CardsSection() {
  return (
    <Section
      id="cards"
      num="09"
      title="Карточки"
      description="Единая структура для мероприятия, договора, арендатора и подрядчика: сигнальная кромка слева, табличка-идентификатор, заголовок, сетка полей с CAPS-метками. Оператор узнаёт объект по одной и той же анатомии в любом разделе."
    >
      <DemoBlock title="Анатомия карточки" tone="canvas">
        <div className="grid gap-4 xl:grid-cols-2">
          {/* Мероприятие */}
          <Card status={event.status}>
            <CardHeader
              plate={event.id}
              title={event.name}
              subtitle={event.tenant}
              status={event.status}
              meta={event.type}
              actions={
                <>
                  <IconButton icon="pencil" label="Редактировать" size="sm" />
                  <IconButton icon="more-horizontal" label="Ещё" size="sm" />
                </>
              }
            />
            <CardBody>
              <MetaGrid columns={3}>
                <MetaItem label="Объект" value={event.object} />
                <MetaItem label="Зал" value={event.hall} mono />
                <MetaItem label="Участники" value={formatNumber(event.guests)} />
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
                <MetaItem label="Сумма договора" value={formatMoney(event.amount)} tone="accent" />
                <MetaItem label="Оплата" value={<StatusBadge status={event.payment} size="sm" />} />
                <MetaItem label="Ответственный" value={event.manager} />
              </MetaGrid>
            </CardBody>
            <CardFooter>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone="outline" icon="paperclip">
                  4 документа
                </Badge>
                <Badge tone="outline" icon="hard-hat">
                  3 подрядчика
                </Badge>
              </div>
              <Button variant="link" size="sm" iconRight="arrow-right">
                Открыть карточку
              </Button>
            </CardFooter>
          </Card>

          {/* Договор */}
          <Card status={contract.status}>
            <CardHeader
              plate={`№ ${contract.id}`}
              title={contract.event}
              subtitle={contract.tenant}
              status={contract.status}
              statusLabel="На согласовании"
              meta="Договор аренды"
              actions={<IconButton icon="download" label="Скачать" size="sm" />}
            />
            <CardBody>
              <MetaGrid columns={3}>
                <MetaItem label="Заключён" value={formatDate(contract.signedAt)} mono />
                <MetaItem label="Действует до" value={formatDate(contract.validTo)} mono />
                <MetaItem label="Ответственный" value={contract.responsible} />
                <MetaItem
                  label="Сумма"
                  value={formatMoney(contract.amount, contract.currency)}
                  tone="accent"
                />
                <MetaItem
                  label="Статус оплаты"
                  value={<StatusBadge status={contract.payment} size="sm" />}
                />
                <MetaItem label="Валюта" value="KZT · тенге" />
              </MetaGrid>
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-hairline-soft pt-3">
                <Badge tone={contract.hasInvoice ? 'navy' : 'outline'} icon="contract">
                  Счёт {contract.hasInvoice ? 'есть' : 'не выставлен'}
                </Badge>
                <Badge tone={contract.hasAct ? 'navy' : 'outline'} icon="check">
                  Акт {contract.hasAct ? 'подписан' : 'не оформлен'}
                </Badge>
                <Badge tone="outline" icon="layers">
                  Доп. соглашений: 1
                </Badge>
              </div>
            </CardBody>
            <CardFooter>
              <span className="text-xs text-content-faint">Изменён 12.02.2026 · Р. Жумабаев</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  Замечания
                </Button>
                <Button variant="primary" size="sm" iconLeft="check">
                  Согласовать
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </DemoBlock>

      <div className="grid gap-4 lg:grid-cols-3">
        <DemoBlock title="Конфликт бронирования" note="Штриховка на кромке">
          <Card status={conflictEvent.status}>
            <CardHeader
              plate={conflictEvent.id}
              title={conflictEvent.name}
              subtitle={conflictEvent.tenant}
              status={conflictEvent.status}
            />
            <CardBody>
              <p className="text-base leading-normal text-status-conflict-text">
                Пересечение с EV-0142 по залу КЦ-Б2: 15.03.2026, 10:00–14:00.
              </p>
              <MetaGrid columns={2} className="mt-3">
                <MetaItem label="Зал" value={conflictEvent.hall} mono />
                <MetaItem label="Дата" value={formatDate(conflictEvent.eventFrom)} mono />
              </MetaGrid>
            </CardBody>
            <CardFooter>
              <span className="text-xs text-content-faint">Требуется согласование</span>
              <Button variant="danger" size="sm" iconLeft="alert-triangle">
                Разрешить
              </Button>
            </CardFooter>
          </Card>
        </DemoBlock>

        <DemoBlock title="Арендатор" note="Компактный вариант">
          <Card>
            <CardHeader
              plate="TN-0031"
              plateTone="outline"
              title="ТОО «Astana Expo Group»"
              subtitle="БИН 180440012345"
              meta="Арендатор"
            />
            <CardBody>
              <MetaGrid columns={2}>
                <MetaItem label="Контактное лицо" value="А. Сагинтаева" />
                <MetaItem label="Телефон" value="+7 701 234 56 78" mono />
                <MetaItem label="Мероприятий" value="12" />
                <MetaItem label="Договоров" value="9" />
                <MetaItem label="Задолженность" value={formatMoney(0)} tone="muted" />
                <MetaItem label="С нами с" value="2019" mono />
              </MetaGrid>
            </CardBody>
          </Card>
        </DemoBlock>

        <DemoBlock title="Интерактивная карточка" note="hover — граница и подъём">
          <div className="space-y-3">
            {EVENTS.slice(4, 6).map((item) => (
              <Card key={item.id} status={item.status} interactive as="button" className="w-full text-left">
                <CardHeader
                  plate={item.id}
                  title={item.name}
                  subtitle={`${item.hall} · ${formatDateRange(item.eventFrom, item.eventTo)}`}
                  status={item.status}
                />
              </Card>
            ))}
            <p className="text-xs leading-normal text-content-faint">
              Карточка-кнопка открывает слайд-панель объекта, не уводя оператора из реестра.
            </p>
          </div>
        </DemoBlock>
      </div>

      <DemoBlock
        title="Приборные плитки дашборда"
        note="Контраст кеглей 1:5, досчёт величины, слот под инструмент"
        tone="canvas"
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Мероприятий в марте"
            countTo={14}
            delta="+3"
            deltaTone="up"
            hint="к февралю"
            icon="presentation"
            instrument={<Sparkline data={TREND_EVENTS} />}
          />
          <StatTile
            label="Загрузка помещений"
            countTo={68}
            unit="%"
            delta="+11%"
            deltaTone="up"
            hint="Конгресс-центр"
            icon="chart"
            instrument={<RingGauge value={68} size={52} stroke={5} />}
          />
          <StatTile
            label="Сумма договоров"
            countTo={252}
            unit="млн ₸"
            delta="+18,4%"
            deltaTone="up"
            hint="к плану квартала"
            icon="wallet"
            instrument={<Sparkline data={TREND_REVENUE} tone="confirmed" />}
          />
          <StatTile
            label="Дебиторская задолженность"
            countTo={126}
            unit="млн ₸"
            hint="1 договор просрочен"
            icon="alert-circle"
            status="unpaid"
            instrument={<Sparkline data={TREND_DEBT} tone="unpaid" />}
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile

            label="На корпусе прибора"
            countTo={42}
            hint="предстоящих мероприятий"
            icon="calendar"
            instrument={<Sparkline data={TREND_EVENTS} onDark />}
          />
          <StatTile

            label="Конфликты брони"
            countTo={2}
            status="conflict"
            hint="требуют решения"
            icon="alert-triangle"
          />
        </div>
      </DemoBlock>

      <DemoBlock title="Таблички-идентификаторы" note="Подписной элемент системы">
        <div className="flex flex-wrap items-center gap-2">
          <HallPlate size="sm">КЦ-А1</HallPlate>
          <HallPlate size="md">МВЦ-П1</HallPlate>
          <HallPlate size="lg">ALEM-Л</HallPlate>
          <HallPlate tone="outline">№ 0142/25-АР</HallPlate>
          <HallPlate tone="muted">EV-0143</HallPlate>
          <HallPlate tone="signal">Демо</HallPlate>
          <HallPlate icon="lock" tone="outline">
            Закрытое
          </HallPlate>
          <span className="rounded bg-nav px-2 py-1.5">
            <HallPlate tone="inverse">на тёмном</HallPlate>
          </span>
        </div>
        <p className="mt-3 max-w-3xl text-xs leading-normal text-content-faint">
          В табличке — только машинный идентификатор: код зала, номер договора, номер заявки, БИН.
          Названия и описания в табличку не попадают никогда — иначе она перестаёт работать как
          указатель.
        </p>
      </DemoBlock>
    </Section>
  )
}

export default CardsSection
