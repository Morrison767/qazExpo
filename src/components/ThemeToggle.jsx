import { cn } from '@/lib/cn'
import { useTheme } from '@/app/ThemeContext'
import { Icon } from './Icon'

/**
 * Переключатель темы. Сегментированный вариант — для настроек,
 * иконочный — для топбара.
 */
export function ThemeToggle({ variant = 'icon', className }) {
  const { theme, isDark, setTheme, toggle, followSystem, useSystem } = useTheme()

  if (variant === 'segmented') {
    const options = [
      { key: 'light', label: 'Светлая', icon: 'sun' },
      { key: 'dark', label: 'Тёмная', icon: 'moon' },
      { key: 'system', label: 'Системная', icon: 'monitor' },
    ]
    const active = followSystem ? 'system' : theme

    return (
      <div
        className={cn(
          'inline-flex items-center gap-0.5 rounded-md border border-hairline bg-surface-muted p-0.5',
          className,
        )}
      >
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => (option.key === 'system' ? useSystem() : setTheme(option.key))}
            aria-pressed={active === option.key}
            className={cn(
              'focus-ring inline-flex h-7 items-center gap-1.5 rounded-[4px] px-2.5 text-base font-medium transition-all duration-fast',
              active === option.key
                ? 'bg-surface text-content shadow-button-quiet'
                : 'text-content-subtle hover:text-content',
            )}
          >
            <Icon name={option.icon} size={13} />
            {option.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      title={isDark ? 'Светлая тема' : 'Тёмная тема'}
      className={cn(
        'focus-ring-nav relative inline-flex h-control w-control shrink-0 items-center justify-center rounded border border-transparent text-nav-subtle transition-colors duration-fast hover:bg-nav-hover hover:text-nav-fg',
        className,
      )}
    >
      {/* Иконки меняются местами поворотом — переключение читается как жест */}
      <span className="relative flex h-4 w-4 items-center justify-center">
        <Icon
          name="sun"
          size={16}
          className={cn(
            'absolute transition-all duration-slow ease-spring',
            isDark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100',
          )}
        />
        <Icon
          name="moon"
          size={16}
          className={cn(
            'absolute transition-all duration-slow ease-spring',
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0',
          )}
        />
      </span>
    </button>
  )
}

export default ThemeToggle
