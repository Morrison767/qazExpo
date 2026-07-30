import { Toast, useToast } from '@/components/Toast'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/Button'
import { Section, DemoBlock, DemoLabel, SpecTable } from '../parts'

export function FeedbackSection() {
  const toast = useToast()

  return (
    <Section
      id="feedback"
      num="11"
      title="Уведомления и пустые состояния"
      description="Тосты — отдельный от статусов семантический слой: система сообщает о результате действия. Пустое состояние всегда объясняет причину и предлагает следующий шаг, а не просто констатирует «нет данных»."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Тосты" note="Кромка слева — та же деталь, что у карточек">
          <DemoLabel>Живые уведомления — нажмите</DemoLabel>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                toast.success({
                  title: 'Мероприятие подтверждено',
                  description: 'EV-0142 · Astana Finance Days 2026. Зал КЦ-А1 забронирован.',
                })
              }
            >
              Успех
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                toast.error({
                  title: 'Конфликт бронирования',
                  description: 'Зал КЦ-Б2 занят 15.03.2026 с 10:00. Требуется согласование.',
                })
              }
            >
              Ошибка
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                toast.warning({
                  title: 'Оплата не поступила',
                  description: 'Договор № 0151/26-АР · 126 000 000 ₸. Срок истёк 3 дня назад.',
                })
              }
            >
              Предупреждение
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                toast.info({
                  title: 'Поступила корректировка',
                  description: 'Iteca Kazakhstan изменила период монтажа на 02–05.04.2026.',
                })
              }
            >
              Инфо
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                toast.info({
                  title: 'Требуется выдача пропусков',
                  description: '24 работника и 4 транспортных средства ожидают допуска.',
                  duration: null,
                  action: (
                    <>
                      <Button variant="primary" size="sm">
                        Оформить
                      </Button>
                      <Button variant="ghost" size="sm">
                        Позже
                      </Button>
                    </>
                  ),
                })
              }
            >
              С действием (без автозакрытия)
            </Button>
          </div>

          <DemoLabel className="mt-5">Статичные примеры для проверки вёрстки</DemoLabel>
          <div className="space-y-2">
            <Toast
              kind="success"
              title="Договор согласован"
              description="№ 0142/25-АР · юридическая служба, 12.02.2026"
            />
            <Toast
              kind="warning"
              title="Приближается дата монтажа"
              description="EV-0143 · монтаж начинается через 2 дня"
            />
            <Toast kind="error" title="Не удалось сохранить корректировку" />
          </div>
        </DemoBlock>

        <DemoBlock title="Семантика уведомлений">
          <SpecTable
            head={['Тип', 'Событие ТЗ (раздел 5.7)']}
            rows={[
              ['success', 'Мероприятие подтверждено, договор согласован, акт оформлен'],
              ['error', 'Конфликт бронирования, отказ в допуске, сбой сохранения'],
              ['warning', 'Отсутствие оплаты, приближение монтажа/демонтажа, истечение договора'],
              ['info', 'Новая заявка, корректировка от арендатора, изменение даты'],
            ]}
          />
          <p className="mt-3 text-xs leading-normal text-ink-400">
            Тост живёт 5 секунд. Уведомление, требующее решения (выдача пропусков, согласование
            договора), автозакрытие не получает и дублируется в центре уведомлений и на e-mail.
          </p>
          <DemoLabel className="mt-5">Управление</DemoLabel>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => toast.dismissAll()}>
              Закрыть все
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                toast.success('Выгрузка в Excel завершена')
                toast.info('Отчёт для службы безопасности сформирован')
                toast.warning('2 договора без счёта')
              }}
            >
              Показать стек
            </Button>
          </div>
        </DemoBlock>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <DemoBlock title="Нет данных">
          <EmptyState
            size="sm"
            title="Мероприятий пока нет"
            description="Создайте первое мероприятие или импортируйте реестр."
            action={
              <Button variant="primary" size="sm" iconLeft="plus">
                Создать
              </Button>
            }
          />
        </DemoBlock>

        <DemoBlock title="Ничего не найдено">
          <EmptyState
            size="sm"
            tone="search"
            title="Ничего не найдено"
            description="Проверьте запрос или сбросьте фильтры."
            action={
              <Button variant="secondary" size="sm" iconLeft="refresh">
                Сбросить
              </Button>
            }
          />
        </DemoBlock>

        <DemoBlock title="Нет доступа">
          <EmptyState
            size="sm"
            tone="locked"
            title="Раздел недоступен"
            description="Финансовые сведения доступны финансовому департаменту и руководству."
          />
        </DemoBlock>

        <DemoBlock title="Ошибка">
          <EmptyState
            size="sm"
            tone="error"
            title="Не удалось загрузить данные"
            description="Сервис 1С не отвечает. Попробуйте обновить."
            action={
              <Button variant="secondary" size="sm" iconLeft="refresh">
                Обновить
              </Button>
            }
          />
        </DemoBlock>
      </div>

      <DemoBlock title="Пустое состояние на всю область" tone="canvas">
        <EmptyState
          size="lg"
          bordered
          icon="calendar-x"
          title="На выбранный период мероприятий нет"
          description="В марте 2026 по объекту «Alem.AI» бронирований не найдено. Измените период, объект или создайте мероприятие."
          action={
            <Button variant="primary" iconLeft="plus">
              Новое мероприятие
            </Button>
          }
          secondaryAction={
            <Button variant="secondary" iconLeft="calendar">
              Смотреть весь год
            </Button>
          }
        />
      </DemoBlock>
    </Section>
  )
}

export default FeedbackSection
