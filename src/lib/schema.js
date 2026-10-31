import { SUBJECTS, isChoice, OPTION_LETTERS } from './subjects.js'

const ID_RE = /^[a-z0-9][a-z0-9-]{2,63}$/

/**
 * 浏览器导入与命令行校验共用这一份规则。
 * 返回中文错误数组，空数组表示通过。
 */
export function validateQuestion(question, context = {}) {
  const errors = []
  const where = context.index === undefined ? '' : `第 ${context.index + 1} 题：`
  const fail = (message) => errors.push(`${where}${message}`)

  if (!question || typeof question !== 'object' || Array.isArray(question)) {
    return [`${where}题目必须是一个对象。`]
  }

  if (!ID_RE.test(String(question.id || ''))) {
    fail('id 需为 3–64 位小写字母、数字或短横线，例如 math-001。')
  }
  if (!SUBJECTS[question.subject]) {
    fail(`subject 必须是 ${Object.keys(SUBJECTS).join(' / ')} 之一。`)
  }
  if (!String(question.topic || '').trim()) fail('缺少 topic（知识点）。')
  if (!String(question.prompt || '').trim()) fail('缺少 prompt（题干）。')
  if (!String(question.explanation || '').trim()) fail('缺少 explanation（解析）。')
  if (question.difficulty !== undefined && ![1, 2, 3].includes(question.difficulty)) {
    fail('difficulty 只能是 1、2、3。')
  }

  if (!['choice', 'fill'].includes(question.type)) {
    fail('type 只能是 choice 或 fill。')
  } else if (isChoice(question)) {
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      fail('选择题必须有 4 个 options。')
    } else if (question.options.some((option) => !String(option || '').trim())) {
      fail('选项不能为空。')
    }
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) {
      fail('选择题 answer 必须是 0–3 的整数（对应 A–D）。')
    }
  } else {
    if (!String(question.answer ?? '').trim()) fail('填空题缺少 answer。')
    if (question.accept !== undefined) {
      if (!Array.isArray(question.accept) || question.accept.some((item) => !String(item).trim())) {
        fail('accept 必须是非空字符串数组。')
      } else if (!question.accept.map(String).includes(String(question.answer))) {
        fail('accept 必须包含 answer 本身。')
      }
    }
  }

  if (question.subject === 'english') {
    if (!String(question.passage || '').trim()) fail('英语题需要 passage（原句）。')
    if (!String(question.translation || '').trim()) fail('英语题需要 translation（参考译文）。')
    if (question.vocab !== undefined && !Array.isArray(question.vocab)) {
      fail('vocab 必须是数组。')
    }
  }

  return errors
}

export function validateQuestions(questions, { existingIds = new Set() } = {}) {
  if (!Array.isArray(questions)) return ['题库必须是一个数组。']
  const errors = []
  const seen = new Set(existingIds)
  questions.forEach((question, index) => {
    errors.push(...validateQuestion(question, { index }))
    const id = String(question?.id || '')
    if (id && seen.has(id)) errors.push(`第 ${index + 1} 题：id「${id}」重复。`)
    if (id) seen.add(id)
  })
  return errors
}

export function choiceLabel(index) {
  return OPTION_LETTERS[index] || '?'
}
