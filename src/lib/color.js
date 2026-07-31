/** Работа с цветом для инструментов и таймлайна. */

function normalize(hex) {
  const clean = hex.replace('#', '')
  return clean.length === 3
    ? clean
        .split('')
        .map((c) => c + c)
        .join('')
    : clean
}

export function hexToRgb(hex) {
  const full = normalize(hex)
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ]
}

export function hexToRgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
