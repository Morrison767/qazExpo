import { Button, IconButton, ButtonGroup } from '@/components/Button'
import { Section, DemoBlock, DemoLabel, DemoRow, SpecTable } from '../parts'

export function ButtonsSection() {
  return (
    <Section
      id="buttons"
      num="07"
      title="Кнопки"
      description="На экране всегда ровно одно primary-действие. Остальное — secondary и ghost. Danger отделён визуально и по расположению: подтверждение расторжения договора не должно стоять рядом с «Сохранить»."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Варианты">
          <DemoLabel>primary · secondary · danger · ghost</DemoLabel>
          <DemoRow>
            <Button variant="primary">Подтвердить бронирование</Button>
            <Button variant="secondary">Сохранить черновик</Button>
            <Button variant="danger">Расторгнуть</Button>
            <Button variant="ghost">Отмена</Button>
          </DemoRow>

          <DemoLabel className="mt-5">Дополнительные · subtle · link</DemoLabel>
          <DemoRow>
            <Button variant="subtle" iconLeft="filter">
              Фильтры
            </Button>
            <Button variant="link" iconRight="arrow-right">
              Перейти к договору
            </Button>
          </DemoRow>

          <DemoLabel className="mt-5">С иконками</DemoLabel>
          <DemoRow>
            <Button variant="primary" iconLeft="plus">
              Новое мероприятие
            </Button>
            <Button variant="secondary" iconLeft="download">
              Excel
            </Button>
            <Button variant="secondary" iconLeft="upload">
              Загрузить документ
            </Button>
            <Button variant="secondary" iconRight="chevron-down">
              Действия
            </Button>
          </DemoRow>
        </DemoBlock>

        <DemoBlock title="Размеры и состояния">
          <DemoLabel>sm 28px · md 32px · lg 38px</DemoLabel>
          <DemoRow>
            <Button variant="primary" size="sm">
              Согласовать
            </Button>
            <Button variant="primary" size="md">
              Согласовать
            </Button>
            <Button variant="primary" size="lg">
              Согласовать
            </Button>
          </DemoRow>

          <DemoLabel className="mt-5">Загрузка</DemoLabel>
          <DemoRow>
            <Button variant="primary" loading>
              Сохранение
            </Button>
            <Button variant="secondary" loading>
              Выгрузка PDF
            </Button>
          </DemoRow>

          <DemoLabel className="mt-5">Заблокировано</DemoLabel>
          <DemoRow>
            <Button variant="primary" disabled>
              Подтвердить
            </Button>
            <Button variant="secondary" disabled>
              Сохранить
            </Button>
            <Button variant="danger" disabled>
              Расторгнуть
            </Button>
            <Button variant="ghost" disabled>
              Отмена
            </Button>
          </DemoRow>

          <DemoLabel className="mt-5">На всю ширину — формы в панелях</DemoLabel>
          <div className="max-w-xs">
            <Button variant="primary" block iconLeft="check">
              Отправить на согласование
            </Button>
          </div>
        </DemoBlock>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DemoBlock title="Иконочные кнопки" note="Обязателен aria-label и tooltip">
          <DemoLabel>Размеры</DemoLabel>
          <DemoRow>
            <IconButton icon="pencil" label="Редактировать" size="sm" />
            <IconButton icon="pencil" label="Редактировать" size="md" />
            <IconButton icon="pencil" label="Редактировать" size="lg" />
          </DemoRow>

          <DemoLabel className="mt-5">Варианты</DemoLabel>
          <DemoRow>
            <IconButton icon="more-horizontal" label="Ещё" variant="ghost" />
            <IconButton icon="download" label="Скачать" variant="secondary" />
            <IconButton icon="trash" label="Удалить" variant="danger" />
            <IconButton icon="refresh" label="Обновить" variant="subtle" />
            <IconButton icon="paperclip" label="Вложение" variant="ghost" disabled />
          </DemoRow>

          <DemoLabel className="mt-5">Группа — переключение вида реестра</DemoLabel>
          <ButtonGroup>
            <Button variant="secondary" size="sm" iconLeft="table">
              Таблица
            </Button>
            <Button variant="secondary" size="sm" iconLeft="calendar">
              Календарь
            </Button>
            <Button variant="secondary" size="sm" iconLeft="layers">
              Канбан
            </Button>
          </ButtonGroup>
        </DemoBlock>

        <DemoBlock title="Правила применения">
          <SpecTable
            head={['Вариант', 'Когда']}
            rows={[
              ['primary', 'Одно главное действие экрана: создать, подтвердить, согласовать'],
              ['secondary', 'Частые вспомогательные действия: сохранить, выгрузить, добавить файл'],
              ['danger', 'Необратимое: расторгнуть договор, удалить, отклонить заявку'],
              ['ghost', 'Отмена, закрытие, действия в строке таблицы'],
              ['subtle', 'Фильтры и переключатели режимов над реестром'],
              ['link', 'Переход к связанному объекту внутри текста'],
            ]}
          />
          <p className="mt-3 text-xs leading-normal text-content-faint">
            Порядок в футере панелей: слева — деструктивное, справа — primary, между ними — отмена.
            Так подтверждающее действие всегда в одном месте, а деструктивное не оказывается под
            курсором случайно.
          </p>
        </DemoBlock>
      </div>
    </Section>
  )
}

export default ButtonsSection
