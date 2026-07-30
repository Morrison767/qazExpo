/**
 * SVG-фильтры симуляции цветовой слепоты.
 * Используются на странице дизайн-системы, чтобы проверять палитру статусов
 * в тех же условиях, в которых её увидят ~8% мужчин-пользователей.
 *
 * Матрицы — стандартные аппроксимации Machado/Brettel.
 */
export const CVD_MODES = [
  { key: 'normal', label: 'Обычное зрение', filter: null },
  { key: 'protanopia', label: 'Протанопия', filter: 'url(#cvd-protanopia)' },
  { key: 'deuteranopia', label: 'Дейтеранопия', filter: 'url(#cvd-deuteranopia)' },
  { key: 'tritanopia', label: 'Тританопия', filter: 'url(#cvd-tritanopia)' },
  { key: 'grayscale', label: 'Ч/б печать', filter: 'url(#cvd-grayscale)' },
]

export function CvdFilters() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0 overflow-hidden">
      <defs>
        <filter id="cvd-protanopia" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0     0 0
                    0.558 0.442 0     0 0
                    0     0.242 0.758 0 0
                    0     0     0     1 0"
          />
        </filter>
        <filter id="cvd-deuteranopia" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0    0 0
                    0.7   0.3   0    0 0
                    0     0.3   0.7  0 0
                    0     0     0    1 0"
          />
        </filter>
        <filter id="cvd-tritanopia" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.95 0.05  0     0 0
                    0    0.433 0.567 0 0
                    0    0.475 0.525 0 0
                    0    0     0     1 0"
          />
        </filter>
        <filter id="cvd-grayscale" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0     0     0     1 0"
          />
        </filter>
      </defs>
    </svg>
  )
}

export default CvdFilters
