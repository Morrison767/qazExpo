import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/Topbar'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/Button'

/**
 * Заглушка раздела. Шаг 0 — только дизайн-система;
 * экраны (реестры, календарь, карточки) собираются на следующих шагах.
 */
export default function Placeholder({ icon, title, notFound = false }) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader icon={icon} title={title} subtitle={notFound ? undefined : 'Раздел системы'} />
      <div className="flex flex-1 items-center justify-center p-6">
        <EmptyState
          size="lg"
          tone={notFound ? 'search' : 'default'}
          icon={icon}
          title={notFound ? 'Такого раздела нет' : `«${title}» ещё не собран`}
          description={
            notFound
              ? 'Проверьте адрес или вернитесь к дизайн-системе.'
              : 'Шаг 0 закрывает дизайн-систему: токены и библиотеку компонентов. Экраны собираются на следующих шагах из готовых блоков.'
          }
          action={
            <Button variant="primary" iconLeft="palette" onClick={() => navigate('/design-system')}>
              Открыть дизайн-систему
            </Button>
          }
        />
      </div>
    </div>
  )
}
