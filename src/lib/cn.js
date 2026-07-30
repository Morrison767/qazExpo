/**
 * Склейка классов. Принимает строки, массивы и объекты { class: boolean }.
 * className из props всегда передавайте последним аргументом.
 */
export function cn(...args) {
  const out = []
  for (const arg of args) {
    if (!arg) continue
    if (typeof arg === 'string' || typeof arg === 'number') {
      out.push(String(arg))
    } else if (Array.isArray(arg)) {
      const inner = cn(...arg)
      if (inner) out.push(inner)
    } else if (typeof arg === 'object') {
      for (const key of Object.keys(arg)) {
        if (arg[key]) out.push(key)
      }
    }
  }
  return out.join(' ')
}
