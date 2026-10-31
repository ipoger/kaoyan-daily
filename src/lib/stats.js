import { SUBJECT_ORDER, SUBJECTS } from './subjects.js'
import { isDayComplete } from './plan.js'
import { isMastered } from './review.js'
import { addDays, lastNDays } from './date.js'

export function computeStreak(state, today) {
  const days = state.days || {}
  let cursor = today
  if (!isDayComplete(days[cursor])) cursor = addDays(cursor, -1)
  let streak = 0
  while (isDayComplete(days[cursor])) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function longestStreak(state) {
  const completed = Object.entries(state.days || {})
    .filter(([, day]) => isDayComplete(day))
    .map(([key]) => key)
    .sort()
  let best = 0
  let run = 0
  let previous = null
  for (const key of completed) {
    run = previous && addDays(previous, 1) === key ? run + 1 : 1
    best = Math.max(best, run)
    previous = key
  }
  return best
}

function ratio(correct, total) {
  return total ? correct / total : 0
}

export function subjectBreakdown(state, questionsById) {
  const rows = new Map(
    SUBJECT_ORDER.map((key) => [
      key,
      {
        key,
        name: SUBJECTS[key].name,
        color: SUBJECTS[key].color,
        attempts: 0,
        correct: 0,
        firstAttempts: 0,
        firstCorrect: 0,
      },
    ]),
  )

  for (const [id, progress] of Object.entries(state.progress || {})) {
    const question = questionsById.get(id)
    const subject = question?.subject || progress.subject
    const row = rows.get(subject)
    if (!row) continue
    row.attempts += progress.attempts || 0
    row.correct += progress.correct || 0
    if (progress.firstCorrect !== undefined) {
      row.firstAttempts += 1
      if (progress.firstCorrect) row.firstCorrect += 1
    }
  }

  return [...rows.values()].map((row) => ({
    ...row,
    accuracy: ratio(row.firstCorrect, row.firstAttempts),
    attemptAccuracy: ratio(row.correct, row.attempts),
  }))
}

export function topicBreakdown(state, questionsById) {
  const rows = new Map()
  for (const [id, progress] of Object.entries(state.progress || {})) {
    if (progress.firstCorrect === undefined) continue
    const question = questionsById.get(id)
    const subject = question?.subject || progress.subject
    const topic = question?.topic || progress.topic || '未分类'
    const key = `${subject}::${topic}`
    const row = rows.get(key) || { key, subject, topic, attempts: 0, correct: 0 }
    row.attempts += 1
    if (progress.firstCorrect) row.correct += 1
    rows.set(key, row)
  }
  return [...rows.values()]
    .map((row) => ({ ...row, accuracy: ratio(row.correct, row.attempts) }))
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
}

export function weakTopics(state, questionsById, minimum = 2) {
  return topicBreakdown(state, questionsById).filter((row) => row.attempts >= minimum && row.accuracy < 0.75)
}

export function wrongEntries(state, questionsById) {
  return Object.entries(state.progress || {})
    .filter(([, progress]) => progress.everWrong && !isMastered(progress))
    .map(([id, progress]) => ({ question: questionsById.get(id), progress }))
    .filter((entry) => Boolean(entry.question))
    .sort((a, b) => String(a.progress.due || '').localeCompare(String(b.progress.due || '')))
}

export function heatmap(state, days = 84, today) {
  const range = lastNDays(days, today)
  return range.map((key) => {
    const answers = Object.values(state.days?.[key]?.answers || {})
    const count = answers.length
    const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4
    return { key, count, level }
  })
}

export function overallStats(state, questionsById, today) {
  let attempts = 0
  let correct = 0
  let firstAttempts = 0
  let firstCorrect = 0
  for (const progress of Object.values(state.progress || {})) {
    attempts += progress.attempts || 0
    correct += progress.correct || 0
    if (progress.firstCorrect !== undefined) {
      firstAttempts += 1
      if (progress.firstCorrect) firstCorrect += 1
    }
  }

  const studiedDays = Object.values(state.days || {}).filter(
    (day) => Object.keys(day.answers || {}).length > 0,
  ).length

  const todayAnswers = Object.values(state.days?.[today]?.answers || {})
  return {
    attempts,
    correct,
    firstAttempts,
    firstCorrect,
    accuracy: ratio(firstCorrect, firstAttempts),
    attemptAccuracy: ratio(correct, attempts),
    studiedDays,
    solved: Object.keys(state.progress || {}).length,
    streak: computeStreak(state, today),
    longest: longestStreak(state),
    todayTotal: todayAnswers.length,
    todayCorrect: todayAnswers.filter((answer) => answer.correct).length,
    wrongOpen: wrongEntries(state, questionsById).length,
  }
}
