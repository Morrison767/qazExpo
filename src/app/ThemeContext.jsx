import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'qec-theme'
const ThemeContext = createContext(null)

function systemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function storedTheme() {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

/**
 * Тема хранится в localStorage; при первом входе берётся системная.
 * Атрибут data-theme на <html> переключает весь набор CSS-переменных —
 * компоненты об этом не знают и используют только семантические классы.
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => storedTheme() ?? systemTheme())
  const [followSystem, setFollowSystem] = useState(() => storedTheme() === null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  /* Пока пользователь не выбрал тему вручную — следим за системной */
  useEffect(() => {
    if (!followSystem || !window.matchMedia) return undefined
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event) => setThemeState(event.matches ? 'dark' : 'light')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [followSystem])

  const setTheme = useCallback((next) => {
    setThemeState(next)
    setFollowSystem(false)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* приватный режим — тема просто не запомнится */
    }
  }, [])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      followSystem,
      setTheme,
      toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      useSystem: () => {
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* игнорируем */
        }
        setFollowSystem(true)
        setThemeState(systemTheme())
      },
    }),
    [theme, followSystem, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  /* Инструменты и графики могут рендериться вне провайдера (сторибук, тесты) */
  if (!context) return { theme: 'light', isDark: false, setTheme: () => {}, toggle: () => {} }
  return context
}
