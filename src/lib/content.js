import { builtinQuestions } from '../../content/index.js'
import { validateQuestion } from './schema.js'

/** 内置题 + 用户导入题；同 id 时自定义题覆盖内置题（导入时会先拦截冲突）。 */
export function buildQuestionPool(customQuestions = []) {
  const map = new Map()
  for (const question of builtinQuestions) map.set(question.id, question)
  for (const question of customQuestions) {
    if (!validateQuestion(question).length) map.set(question.id, question)
  }
  return [...map.values()]
}

export function indexQuestions(questions) {
  return new Map(questions.map((question) => [question.id, question]))
}
