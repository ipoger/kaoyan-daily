/** 使用本地时间生成 YYYY-MM-DD，避免 toISOString() 的时区偏移。 */
export function dateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateKey(key) {
  const [y, m, d] = String(key).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0)
}

export function addDays(key, amount) {
  const date = parseDateKey(key)
  date.setDate(date.getDate() + amount)
  return dateKey(date)
}

/** b - a，以自然日计算。 */
export function daysBetween(a, b) {
  const ms = parseDateKey(b).getTime() - parseDateKey(a).getTime()
  return Math.round(ms / 86_400_000)
}

export function todayKey(now = new Date()) {
  return dateKey(now)
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export function formatDate(key, { withYear = false, withWeekday = true } = {}) {
  const date = parseDateKey(key)
  const base = withYear
    ? `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
    : `${date.getMonth() + 1} 月 ${date.getDate()} 日`
  return withWeekday ? `${base} · 周${WEEKDAYS[date.getDay()]}` : base
}

export function daysUntil(targetKey, fromKey = todayKey()) {
  return daysBetween(fromKey, targetKey)
}

export function lastNDays(n, endKey = todayKey()) {
  return Array.from({ length: n }, (_, i) => addDays(endKey, i - n + 1))
}

export function shortDate(key) {
  const date = parseDateKey(key)
  return `${date.getMonth() + 1}/${date.getDate()}`
}
