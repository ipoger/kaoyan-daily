export const SOURCE_TYPES = ['真题', '模拟题', '教材', '原创', '其他']
export const SOURCED_TYPES = ['真题', '模拟题', '教材']

/**
 * 题源支持两种写法：
 * 1. 旧版字符串：'原创'；
 * 2. 结构化对象：{ type: '真题', name: '2024 数学一', detail: '第 3 题' }。
 * 非“原创”的字符串无法判断类型，归为“其他”，不会伪装成真题。
 */
export function sourceInfo(source) {
  if (!source) return { type: '原创', name: '原创题', detail: '' }

  if (typeof source === 'string') {
    const name = source.trim() || '原创题'
    if (name === '原创' || name.includes('原创')) {
      return { type: '原创', name, detail: '' }
    }
    return { type: '其他', name, detail: '' }
  }

  if (typeof source === 'object') {
    const type = SOURCE_TYPES.includes(source.type) ? source.type : '其他'
    return {
      type,
      name: String(source.name || '').trim(),
      detail: String(source.detail || '').trim(),
    }
  }

  return { type: '其他', name: '', detail: '' }
}

export function sourceLabel(source) {
  const info = sourceInfo(source)
  const parts = [info.type]
  if (info.name && info.name !== info.type) parts.push(info.name)
  if (info.detail) parts.push(info.detail)
  return parts.join(' · ')
}

export function sourceShort(source) {
  return sourceInfo(source).type
}

export function isSourced(source) {
  return SOURCED_TYPES.includes(sourceInfo(source).type)
}

export function sourceRank(source) {
  const type = sourceInfo(source).type
  if (type === '真题') return 3
  if (type === '模拟题') return 2
  if (type === '教材') return 1
  return 0
}

export function sourceBreakdown(questions = []) {
  const rows = new Map(SOURCE_TYPES.map((type) => [type, 0]))
  for (const question of questions) {
    const type = sourceInfo(question.source).type
    rows.set(type, (rows.get(type) || 0) + 1)
  }
  return [...rows.entries()]
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({ type, count }))
}
