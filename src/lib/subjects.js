export const SUBJECTS = {
  math: {
    key: 'math',
    name: '数学',
    short: '数',
    en: 'MATH',
    hint: '数学一 · 高数 / 线代 / 概率',
    color: '#b23a2b',
  },
  english: {
    key: 'english',
    name: '英语',
    short: '英',
    en: 'ENGLISH',
    hint: '英语一 · 长难句与词汇',
    color: '#3e5f8a',
  },
  cs408: {
    key: 'cs408',
    name: '408',
    short: '计',
    en: 'CS 408',
    hint: '数据结构 / 组原 / 操作系统 / 网络',
    color: '#4f6b4a',
  },
  politics: {
    key: 'politics',
    name: '政治',
    short: '政',
    en: 'POLITICS',
    hint: '马原 / 史纲 / 思修 / 时政',
    color: '#8a6a2f',
  },
}

export const SUBJECT_ORDER = ['math', 'english', 'cs408', 'politics']
export const OPTION_LETTERS = ['A', 'B', 'C', 'D']

export function subjectOf(question) {
  return SUBJECTS[question?.subject] || SUBJECTS.math
}

export function isChoice(question) {
  return question?.type === 'choice'
}

export function answerText(question) {
  if (!question) return ''
  if (isChoice(question)) {
    return `${OPTION_LETTERS[question.answer]}. ${question.options[question.answer]}`
  }
  return String(question.answer)
}
