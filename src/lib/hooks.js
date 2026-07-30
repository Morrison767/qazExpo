import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/** Закрытие поповера/дропдауна по клику вне элемента */
export function useOutsideClick(handler, active = true) {
  const ref = useRef(null)
  useEffect(() => {
    if (!active) return
    function onPointerDown(event) {
      if (!ref.current) return
      if (ref.current.contains(event.target)) return
      handler(event)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [handler, active])
  return ref
}

/** Escape закрывает верхний слой */
export function useEscapeKey(handler, active = true) {
  useEffect(() => {
    if (!active) return
    function onKeyDown(event) {
      if (event.key === 'Escape') handler(event)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [handler, active])
}

/** Блокировка прокрутки body под модальным окном / панелью */
export function useScrollLock(active) {
  useLayoutEffect(() => {
    if (!active) return
    const previous = document.body.style.overflow
    const previousPadding = document.body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    return () => {
      document.body.style.overflow = previous
      document.body.style.paddingRight = previousPadding
    }
  }, [active])
}

/** Управляемое/неуправляемое состояние в одном хуке */
export function useControllableState(controlledValue, defaultValue, onChange) {
  const isControlled = controlledValue !== undefined
  const [internal, setInternal] = useState(defaultValue)
  const value = isControlled ? controlledValue : internal

  const setValue = useCallback(
    (next) => {
      if (!isControlled) setInternal(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )

  return [value, setValue]
}

let idCounter = 0
/** Стабильный id для связки label ↔ input (без зависимости от React 18 useId) */
export function useAutoId(prefix = 'qec') {
  const ref = useRef(null)
  if (ref.current === null) {
    idCounter += 1
    ref.current = `${prefix}-${idCounter}`
  }
  return ref.current
}
