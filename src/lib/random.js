export function hashString(input) {
  let hash = 2166136261
  const text = String(input)
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function mulberry32(seed) {
  let a = seed >>> 0
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 同一个 seed 永远得到同一个顺序，保证同一天刷新页面题目不跳。 */
export function shuffleSeeded(items, seed) {
  const result = [...items]
  const random = mulberry32(typeof seed === 'number' ? seed : hashString(seed))
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function pickSeeded(items, count, seed) {
  return shuffleSeeded(items, seed).slice(0, Math.max(0, count))
}
