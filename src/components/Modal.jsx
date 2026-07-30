import { useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { useEscapeKey, useScrollLock } from '@/lib/hooks'
import { IconButton } from './Button'
import { HallPlate } from './HallPlate'
import { StatusBadge } from './Status'

const SIZES = {
  sm: 'max-w-[26rem]',
  md: 'max-w-[35rem]',
  lg: 'max-w-[47.5rem]',
  xl: 'max-w-[60rem]',
}

/**
 * Модальное окно — для коротких подтверждений и компактных форм.
 * Длинные формы и карточки объектов открываются в <SidePanel>:
 * оператор не теряет контекст реестра.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  plate,
  status,
  size = 'md',
  footer,
  closeOnOverlay = true,
  children,
  className,
}) {
  const handleClose = useCallback(() => onClose?.(), [onClose])
  useEscapeKey(handleClose, open)
  useScrollLock(open)

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div
        className="fixed inset-0 animate-fade-in bg-obsidian-950/50 backdrop-blur-[2px]"
        onClick={closeOnOverlay ? handleClose : undefined}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative my-auto w-full animate-scale-in overflow-hidden rounded-lg border border-hairline bg-surface-raised shadow-xl',
          SIZES[size] ?? SIZES.md,
          className,
        )}
      >
        <span aria-hidden="true" className="beam-edge-soft absolute inset-x-0 top-0" />
        <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-3.5">
          <div className="min-w-0">
            {plate || status ? (
              <div className="mb-1.5 flex items-center gap-2">
                {plate ? <HallPlate>{plate}</HallPlate> : null}
                {status ? <StatusBadge status={status} size="sm" /> : null}
              </div>
            ) : null}
            <h2 className="truncate text-xl font-semibold leading-snug text-ink-900">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-base text-ink-500">{subtitle}</p> : null}
          </div>
          <IconButton icon="x" label="Закрыть" size="sm" onClick={handleClose} className="-mr-1.5" />
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="flex items-center justify-end gap-2 rounded-b-lg border-t border-hairline bg-ink-25 px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

const PANEL_SIZES = {
  md: 'sm:max-w-panel-md',
  lg: 'sm:max-w-panel-lg',
  xl: 'sm:max-w-panel-xl',
}

/**
 * Слайд-панель — основной способ открыть карточку мероприятия, договора
 * или арендатора поверх реестра. Реестр остаётся видимым слева.
 */
export function SidePanel({
  open,
  onClose,
  title,
  subtitle,
  plate,
  status,
  size = 'lg',
  tabs,
  footer,
  children,
  className,
}) {
  const handleClose = useCallback(() => onClose?.(), [onClose])
  useEscapeKey(handleClose, open)
  useScrollLock(open)

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-overlay flex justify-end">
      <div
        className="absolute inset-0 animate-fade-in bg-obsidian-950/40 backdrop-blur-[2px]"
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative flex h-full w-full animate-slide-in-right flex-col bg-canvas shadow-panel',
          PANEL_SIZES[size] ?? PANEL_SIZES.lg,
          className,
        )}
      >
        {/* Шапка панели — корпус прибора: объект «поднят» из реестра */}
        <header className="on-obsidian relative shrink-0 overflow-hidden bg-surface-obsidian px-5 pb-3.5 pt-4">
          <span
            aria-hidden="true"
            className="dot-grid pointer-events-none absolute inset-0 opacity-50"
          />
          <span aria-hidden="true" className="bloom-beam pointer-events-none absolute inset-0" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {plate ? <HallPlate tone="beam">{plate}</HallPlate> : null}
                {status ? <StatusBadge status={status} size="sm" variant="dark" /> : null}
              </div>
              <h2 className="mt-1.5 truncate text-xl font-semibold leading-snug text-obsidian-50">
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-0.5 text-base text-obsidian-200">{subtitle}</p>
              ) : null}
            </div>
            <IconButton
              icon="x"
              label="Закрыть панель"
              size="sm"
              variant="ghost-dark"
              onClick={handleClose}
              className="-mr-1.5"
            />
          </div>
          {tabs ? <div className="relative -mb-3.5 mt-3">{tabs}</div> : null}
          <span aria-hidden="true" className="beam-edge absolute inset-x-0 bottom-0" />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-hairline bg-surface-raised px-5 py-3 shadow-bevel">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>,
    document.body,
  )
}

export default Modal
