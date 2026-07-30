import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { Icon } from './Icon'
import { IconButton } from './Button'

/**
 * ТОСТЫ. Отдельный от статусов семантический слой:
 * «система сообщает о результате действия» ≠ «объект находится в состоянии».
 * Кромка слева — та же подписная деталь, что у карточек и строк реестра.
 */
const KINDS = {
  success: {
    icon: 'check-circle',
    rail: 'bg-success-600',
    glow: 'rgba(4, 120, 87, 0.55)',
    iconColor: 'text-success-600',
    title: 'Готово',
  },
  error: {
    icon: 'x-circle',
    rail: 'bg-danger-600',
    glow: 'rgba(220, 38, 38, 0.55)',
    iconColor: 'text-danger-600',
    title: 'Ошибка',
  },
  warning: {
    icon: 'alert-triangle',
    rail: 'bg-signal-600',
    glow: 'rgba(217, 119, 6, 0.55)',
    iconColor: 'text-signal-600',
    title: 'Внимание',
  },
  info: {
    icon: 'info',
    rail: 'bg-beam-600',
    glow: 'rgba(53, 214, 240, 0.55)',
    iconColor: 'text-beam-700',
    title: 'Информация',
  },
}

const ToastContext = createContext(null)

export function ToastProvider({ children, duration = 5000 }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (kind, payload) => {
      counter.current += 1
      const id = counter.current
      const toast =
        typeof payload === 'string' ? { title: payload } : { ...payload }
      const ttl = toast.duration === undefined ? duration : toast.duration

      setToasts((current) => [...current, { ...toast, kind, id }])

      if (ttl) {
        setTimeout(() => dismiss(id), ttl)
      }
      return id
    },
    [dismiss, duration],
  )

  const api = useMemo(
    () => ({
      toast: push,
      success: (payload) => push('success', payload),
      error: (payload) => push('error', payload),
      warning: (payload) => push('warning', payload),
      info: (payload) => push('info', payload),
      dismiss,
      dismissAll: () => setToasts([]),
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast должен вызываться внутри <ToastProvider>')
  return context
}

function ToastViewport({ toasts, onDismiss }) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-toast flex w-[22.5rem] max-w-[calc(100vw-2rem)] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>,
    document.body,
  )
}

export function Toast({ kind = 'info', title, description, action, onDismiss, className }) {
  const meta = KINDS[kind] ?? KINDS.info
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto relative animate-slide-in-up overflow-hidden rounded-md border border-hairline bg-surface-raised pl-rail shadow-lg',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('absolute inset-y-0 left-0 w-rail rounded-l-[5px]', meta.rail)}
        style={{ boxShadow: `0 0 10px 0 ${meta.glow}` }}
      />
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <Icon name={meta.icon} size={15} strokeWidth={1.8} className={cn('mt-px', meta.iconColor)} />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold leading-snug text-ink-900">
            {title ?? meta.title}
          </p>
          {description ? (
            <p className="mt-0.5 text-xs leading-normal text-ink-500">{description}</p>
          ) : null}
          {action ? <div className="mt-2 flex items-center gap-2">{action}</div> : null}
        </div>
        <IconButton icon="x" label="Закрыть уведомление" size="sm" onClick={onDismiss} className="-mr-1 -mt-1" />
      </div>
    </div>
  )
}

export default Toast
