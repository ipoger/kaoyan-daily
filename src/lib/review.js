import { addDays } from './date.js'

/** 连续答对第 n 次后，下次复习的间隔（天）。 */
export const REVIEW_STEPS = [3, 7, 15, 30, 60]
export const MASTER_STREAK = 3

export function emptyProgress(question, dayKey) {
  return {
    subject: question?.subject,
    topic: question?.topic,
    attempts: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    interval: 0,
    due: dayKey,
    lapses: 0,
    mastered: false,
    firstCorrect: undefined,
    firstAt: undefined,
    lastAt: undefined,
    lastResult: undefined,
  }
}

/**
 * 答错：明天再来；答对：按 3 / 7 / 15 / 30 / 60 天逐步拉长。
 * 连续答对 3 次视为掌握，不再进入每日复习队列。
 */
export function nextReview(previous, correct, dayKey, question) {
  const progress = { ...emptyProgress(question, dayKey), ...(previous || {}) }
  progress.attempts += 1
  progress.lastAt = new Date().toISOString()
  progress.lastResult = correct ? 'correct' : 'wrong'

  if (progress.firstCorrect === undefined) {
    progress.firstCorrect = correct
    progress.firstAt = dayKey
  }

  if (correct) {
    progress.correct += 1
    progress.streak = (progress.streak || 0) + 1
    const step = REVIEW_STEPS[Math.min(progress.streak - 1, REVIEW_STEPS.length - 1)]
    progress.interval = step
    progress.due = addDays(dayKey, step)
    progress.mastered = progress.streak >= MASTER_STREAK
  } else {
    progress.wrong += 1
    progress.everWrong = true
    progress.streak = 0
    progress.interval = 1
    progress.due = addDays(dayKey, 1)
    progress.lapses = (progress.lapses || 0) + 1
    progress.mastered = false
  }

  return progress
}

export function isMastered(progress) {
  return Boolean(progress?.mastered) || (progress?.streak || 0) >= MASTER_STREAK
}

export function isDue(progress, dayKey) {
  return Boolean(progress?.due) && progress.due <= dayKey && !isMastered(progress)
}

export function dueLabel(progress, dayKey) {
  if (!progress?.due) return ''
  if (progress.due <= dayKey) return '今天复习'
  return `${progress.due} 复习`
}
