import { cn } from '@/lib/cn'
import { Icon } from './Icon'

/**
 * «ТАБЛИЧКА ЗАЛА» — подписной элемент системы.
 *
 * Моноширинный чип с идентификатором: код зала, номер договора, номер заявки.
 * Отсылка к физическим табличкам нумерации залов и павильонов комплекса.
 * Появляется в заголовке любой карточки, в строке реестра, в модальном окне,
 * в слайд-панели — и служит визуальным «якорем» объекта во всей системе.
 *
 * Правило: в табличке — только машинный идентификатор. Никаких названий.
 */
const TONES = {
  navy: 'bg-navy-800 text-white border-navy-900/60 shadow-plate',
  outline: 'bg-white text-navy-700 border-navy-200',
  muted: 'bg-ink-100 text-ink-600 border-transparent',
  signal: 'bg-signal-600 text-white border-signal-700/60 shadow-plate',
  inverse: 'bg-white/[0.08] text-obsidian-50 border-white/[0.14]',
  /** Подсвеченная табличка — бренд-блок, активный объект на корпусе */
  beam: 'bg-obsidian-800 text-beam-300 border-beam-400/35',
}

const SIZES = {
  sm: 'h-4 px-1 text-[0.5625rem] tracking-[0.06em] gap-0.5',
  md: 'h-[18px] px-1.5 text-2xs gap-1',
  lg: 'h-6 px-2 text-xs gap-1',
}

export function HallPlate({
  children,
  tone = 'navy',
  size = 'md',
  icon,
  as: Component = 'span',
  className,
  ...rest
}) {
  return (
    <Component
      className={cn(
        'inline-flex shrink-0 items-center rounded-sm border font-mono font-semibold uppercase tabular-nums',
        TONES[tone] ?? TONES.navy,
        SIZES[size] ?? SIZES.md,
        tone === 'beam' && 'shadow-beam-sm',
        className,
      )}
      {...rest}
    >
      {icon ? <Icon name={icon} size={size === 'lg' ? 12 : 10} /> : null}
      {children}
    </Component>
  )
}

export default HallPlate
