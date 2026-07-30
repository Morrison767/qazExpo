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
        DEFAULT: colors.navy[300],
      },
      letterSpacing: {
        plate: '0.08em',
        label: '0.12em',
      },
      transitionDuration: {
        fast: '120ms',
        DEFAULT: '160ms',
        slow: '240ms',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
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
          from: { transform: 'translateX(16px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-up': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 160ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slide-in-right 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-up': 'slide-in-up 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
