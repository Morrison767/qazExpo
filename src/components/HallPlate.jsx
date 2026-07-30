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
  navy: 'bg-navy-800 text-white border-transparent shadow-plate',
  outline: 'bg-white text-navy-700 border-navy-200',
  muted: 'bg-ink-100 text-ink-600 border-transparent',
  signal: 'bg-signal-600 text-white border-transparent shadow-plate',
  inverse: 'bg-white/10 text-white border-white/20',
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
