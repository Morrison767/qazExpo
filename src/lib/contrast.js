/** Расчёт контраста по WCAG 2.1 — используется на странице дизайн-системы. */

function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ]
}

function channelLuminance(value) {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex)
  return (
    0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
  )
}

/** Отношение контраста, например 7.42 */
export function contrastRatio(foreground, background) {
  const l1 = relativeLuminance(foreground)
  const l2 = relativeLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** 'AAA' | 'AA' | 'AA+' | '—' для обычного текста */
export function wcagLevel(foreground, background) {
  const ratio = contrastRatio(foreground, background)
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA · крупный'
  return 'ниже нормы'
}

export function formatRatio(foreground, background) {
  return `${contrastRatio(foreground, background).toFixed(2)}:1`
}
