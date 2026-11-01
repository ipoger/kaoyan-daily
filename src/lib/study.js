import { addDays, dateKey } from './date.js'
import { isMastered } from './review.js'
import { isSourced } from './source.js'

export const SESSION_LABELS = {
  due: '到期复习',
  random: '随机复习',
  wrong: '错题重练',
  subject: '科目专项',
  topic: '知识点专项',
}

export function sessionLabel(kind) {
  return SESSION_LABELS[kind] || '练习'
}

export function scopeLabel(scopeDays) {
  if (scopeDays === 'all') return '全部之前'
  return `最近 ${scopeDays} 天`
}

/**
 * 找出“今天之前”做过的题。
 * 以 state.days 的作答记录为准；如果旧数据没有 days 明细，
 * 再退回 progress 的 lastAt 日期。
 */
export function previousQuestionIds(state, today, scopeDays = 7) {
  const cutoff = scopeDays === 'all' ? null : addDays(today, -Number(scopeDays))
  const ids = new Set()

  for (const [key, day] of Object.entries(state.days || {})) {
    if (key >= today) continue
    if (cutoff && key < cutoff) continue
    for (const id of Object.keys(day.answers || {})) ids.add(id)
  }

  if (!ids.size) {
    for (const [id, progress] of Object.entries(state.progress || {})) {
      const lastDay = progress.lastDay || (progress.lastAt ? dateKey(new Date(progress.lastAt)) : '')
      if (!lastDay || lastDay >= today) continue
      if (cutoff && lastDay < cutoff) continue
      ids.add(id)
    }
  }

  return ids
}

export function buildReviewPool({ state, questionsById, today, scopeDays, preferWrong = false }) {
  const ids = previousQuestionIds(state, today, scopeDays)
  const questions = [...ids].map((id) => questionsById.get(id)).filter(Boolean)
  const wrongCount = questions.filter((question) => {
    const progress = state.progress?.[question.id]
    return progress?.everWrong && !isMastered(progress)
  }).length
  return { questions, wrongCount, ids: questions.map((question) => question.id) }
}

/**
 * 加权不放回抽样。优先错题时，错题的权重为 3，其余为 1。
 * rng 可注入，方便测试。
 */
export function sampleReview(
  questions,
  count,
  { progress = {}, preferWrong = false, preferSourced = false, rng = Math.random } = {},
) {
  const pool = questions.map((question) => {
    const wrongWeight = preferWrong && progress[question.id]?.everWrong && !isMastered(progress[question.id]) ? 3 : 1
    const sourceWeight = preferSourced && isSourced(question.source) ? 2 : 1
    return { question, weight: wrongWeight * sourceWeight }
  })
  const picked = []
  const target = Math.max(0, Math.min(Number(count) || 0, pool.length))

  for (let index = 0; index < target; index += 1) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0)
    let cursor = rng() * totalWeight
    let chosen = pool.length - 1
    for (let i = 0; i < pool.length; i += 1) {
      cursor -= pool[i].weight
      if (cursor <= 0) {
        chosen = i
        break
      }
    }
    picked.push(pool[chosen].question)
    pool.splice(chosen, 1)
  }

  return picked
}

export function dueReviewQuestions(state, questionsById, today) {
  return Object.entries(state.progress || {})
    .filter(([id, progress]) => questionsById.has(id) && progress.due && progress.due <= today && !isMastered(progress))
    .sort((left, right) => {
      if (left[1].due !== right[1].due) return left[1].due < right[1].due ? -1 : 1
      return left[0] < right[0] ? -1 : 1
    })
    .map(([id]) => questionsById.get(id))
}

function topicStatus(firstAttempts, accuracy) {
  if (!firstAttempts) return { key: 'new', label: '未开始' }
  if (firstAttempts >= 2 && accuracy >= 0.8) return { key: 'solid', label: '稳固' }
  if (accuracy < 0.6) return { key: 'weak', label: '薄弱' }
  return { key: 'learning', label: '巩固中' }
}

export function topicOverview(state, questions, subject, today) {
  const groups = new Map()
  for (const question of questions.filter((item) => item.subject === subject)) {
    if (!groups.has(question.topic)) {
      groups.set(question.topic, {
        topic: question.topic,
        subject,
        questions: [],
        firstAttempts: 0,
        firstCorrect: 0,
        wrong: 0,
        due: 0,
      })
    }
    const group = groups.get(question.topic)
    group.questions.push(question)
    const progress = state.progress?.[question.id]
    if (progress?.firstCorrect !== undefined) {
      group.firstAttempts += 1
      if (progress.firstCorrect) group.firstCorrect += 1
    }
    if (progress?.everWrong && !isMastered(progress)) group.wrong += 1
    if (progress?.due && progress.due <= today && !isMastered(progress)) group.due += 1
  }

  return [...groups.values()].map((group) => {
    const accuracy = group.firstAttempts ? group.firstCorrect / group.firstAttempts : 0
    return { ...group, accuracy, status: topicStatus(group.firstAttempts, accuracy) }
  })
}

export function subjectOverview(state, questions, subject, today) {
  const subjectQuestions = questions.filter((question) => question.subject === subject)
  let attempted = 0
  let mastered = 0
  let firstAttempts = 0
  let firstCorrect = 0
  let due = 0

  for (const question of subjectQuestions) {
    const progress = state.progress?.[question.id]
    if (!progress) continue
    attempted += 1
    if (progress.firstCorrect !== undefined) {
      firstAttempts += 1
      if (progress.firstCorrect) firstCorrect += 1
    }
    if (isMastered(progress)) mastered += 1
    if (progress.due && progress.due <= today && !isMastered(progress)) due += 1
  }

  return {
    total: subjectQuestions.length,
    attempted,
    mastered,
    due,
    firstAttempts,
    firstCorrect,
    accuracy: firstAttempts ? firstCorrect / firstAttempts : 0,
    progress: subjectQuestions.length ? attempted / subjectQuestions.length : 0,
  }
}

export function recentSessions(state, limit = 6) {
  return (state.reviewLog || []).slice(0, limit)
}

export function reviewSummary(state) {
  const logs = state.reviewLog || []
  const total = logs.reduce((sum, log) => sum + (log.total || 0), 0)
  const correct = logs.reduce((sum, log) => sum + (log.correct || 0), 0)
  return {
    sessions: logs.length,
    answers: total,
    correct,
    accuracy: total ? correct / total : 0,
  }
}
