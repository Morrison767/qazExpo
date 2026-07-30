import {
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  spacing,
  sizes,
  borderRadius,
  boxShadow,
  zIndex,
  motion,
} from './src/design/tokens.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors,
      fontFamily,
      fontSize,
      fontWeight,
      spacing: { ...spacing, ...sizes },
      width: sizes,
      height: sizes,
      // Числовая шкала отступов в min/max-размерах: min-w-4, min-h-16 и т.п.
      minWidth: ({ theme }) => ({ ...theme('spacing'), ...sizes }),
      minHeight: ({ theme }) => ({ ...theme('spacing'), ...sizes }),
      maxWidth: ({ theme }) => ({ ...theme('spacing'), ...sizes }),
      borderRadius,
      boxShadow,
      zIndex,
      borderColor: {
        DEFAULT: colors.hairline.DEFAULT,
      },
      ringColor: {
        DEFAULT: colors.beam[400],
      },
      letterSpacing: {
        plate: '0.08em',
        label: '0.12em',
      },
      transitionDuration: {
        instant: motion.duration.instant,
        fast: motion.duration.fast,
        DEFAULT: motion.duration.base,
        base: motion.duration.base,
        slow: motion.duration.slow,
        slower: motion.duration.slower,
      },
      transitionTimingFunction: {
        decelerate: motion.easing.decelerate,
        spring: motion.easing.spring,
        accelerate: motion.easing.accelerate,
        out: motion.easing.decelerate,
      },
      backgroundImage: {
        /* Фрезерованная светлая поверхность */
        'surface-raised': 'linear-gradient(180deg, #FFFFFF 0%, #FBFCFD 100%)',
        /* Корпус прибора */
        'surface-obsidian': 'linear-gradient(180deg, #0E1620 0%, #080D14 100%)',
        'surface-obsidian-soft': 'linear-gradient(180deg, #16202C 0%, #0B1219 100%)',
        /* Луч света вдоль кромки корпуса */
        'beam-line':
          'linear-gradient(90deg, transparent 0%, rgba(53,214,240,0.65) 22%, rgba(53,214,240,0.9) 50%, rgba(53,214,240,0.65) 78%, transparent 100%)',
        'beam-line-soft':
          'linear-gradient(90deg, transparent 0%, rgba(53,214,240,0.35) 30%, rgba(53,214,240,0.5) 50%, rgba(53,214,240,0.35) 70%, transparent 100%)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'translateY(-4px) scale(0.985)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(28px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        /* Каскадное проявление строк и карточек */
        'reveal-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        /* Мерцание скелетона */
        shimmer: {
          '0%': { backgroundPosition: '-160% 0' },
          '100%': { backgroundPosition: '260% 0' },
        },
        /* Проход света по кромке — однократно при появлении блока */
        'beam-sweep': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '35%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        /* Дыхание индикатора: только для «требует внимания» */
        'pulse-beam': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 6px 0 rgba(53,214,240,0.45)' },
          '50%': { opacity: '0.55', boxShadow: '0 0 12px 0 rgba(53,214,240,0.15)' },
        },
        /* Отрисовка кольцевой шкалы */
        'ring-draw': {
          from: { strokeDashoffset: 'var(--ring-circumference)' },
          to: { strokeDashoffset: 'var(--ring-offset)' },
        },
        'grow-y': {
          from: { transform: 'scaleY(0)' },
          to: { transform: 'scaleY(1)' },
        },
        'grow-x': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'fade-in': `fade-in ${motion.duration.base} ${motion.easing.decelerate}`,
        'scale-in': `scale-in 200ms ${motion.easing.spring}`,
        'slide-in-right': `slide-in-right 320ms ${motion.easing.spring}`,
        'slide-in-up': `slide-in-up 240ms ${motion.easing.spring}`,
        'reveal-up': `reveal-up 340ms ${motion.easing.decelerate} both`,
        shimmer: 'shimmer 1.6s linear infinite',
        'beam-sweep': `beam-sweep 1.5s ${motion.easing.decelerate} 200ms both`,
        'pulse-beam': 'pulse-beam 2.4s ease-in-out infinite',
        'ring-draw': `ring-draw 900ms ${motion.easing.decelerate} both`,
        'grow-y': `grow-y 520ms ${motion.easing.decelerate} both`,
        'grow-x': `grow-x 620ms ${motion.easing.decelerate} both`,
      },
    },
  },
  plugins: [],
}
