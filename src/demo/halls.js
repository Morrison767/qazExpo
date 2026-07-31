/**
 * СПРАВОЧНИК ПОМЕЩЕНИЙ — строки таймлайна календаря.
 * Порядок внутри объекта = порядок строк на экране.
 */
export const HALLS = [
  /* Конгресс-центр */
  { id: 'kc-a1', objectKey: 'kc', code: 'КЦ-А1', name: 'Пленарный зал', capacity: 3000 },
  { id: 'kc-b2', objectKey: 'kc', code: 'КЦ-Б2', name: 'Конференц-зал B2', capacity: 420 },
  { id: 'kc-v1', objectKey: 'kc', code: 'КЦ-В1', name: 'Малый зал', capacity: 180 },
  { id: 'kc-f', objectKey: 'kc', code: 'КЦ-Ф', name: 'Фойе и выставочная зона', capacity: 800 },

  /* Международный выставочный центр */
  { id: 'mvc-p1', objectKey: 'mvc', code: 'МВЦ-П1', name: 'Павильон 1', capacity: 5200 },
  { id: 'mvc-p2', objectKey: 'mvc', code: 'МВЦ-П2', name: 'Павильон 2', capacity: 3400 },
  { id: 'mvc-p3', objectKey: 'mvc', code: 'МВЦ-П3', name: 'Павильон 3', capacity: 2800 },
  { id: 'mvc-op', objectKey: 'mvc', code: 'МВЦ-ОП', name: 'Открытая площадка', capacity: 6000 },

  /* Alem.AI */
  { id: 'alem-l', objectKey: 'alem', code: 'ALEM-Л', name: 'Лекторий', capacity: 180 },
  { id: 'alem-k', objectKey: 'alem', code: 'ALEM-К', name: 'Коворкинг', capacity: 120 },
  { id: 'alem-d', objectKey: 'alem', code: 'ALEM-Д', name: 'Демо-зона', capacity: 90 },
]

export function hallById(id) {
  return HALLS.find((h) => h.id === id)
}

export function hallsByObject(objectKey) {
  return HALLS.filter((h) => h.objectKey === objectKey)
}

/** Код зала → идентификатор: реестр мероприятий хранит человекочитаемый код */
export const HALL_ID_BY_CODE = HALLS.reduce((acc, hall) => {
  acc[hall.code] = hall.id
  return acc
}, {})
