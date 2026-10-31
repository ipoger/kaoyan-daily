import { describe, expect, it } from 'vitest'
import { addDays, dateKey, daysBetween, parseDateKey } from '../src/lib/date.js'
import { normalizeText, isCorrect } from '../src/lib/grade.js'
import { nextReview } from '../src/lib/review.js'
import { buildDailyPlan, isDayComplete, planCounts } from '../src/lib/plan.js'
import { computeStreak, overallStats, subjectBreakdown, wrongEntries } from '../src/lib/stats.js'
import { validateQuestions } from '../src/lib/schema.js'
import { normalizeState } from '../src/lib/storage.js'

const choice = (id, subject = 'math', answer = 1) => ({
  id,
  subject,
  topic: subject === 'math' ? '极限' : '测试',
  difficulty: 2,
  type: 'choice',
  prompt: '题干',
  options: ['A', 'B', 'C', 'D'],
  answer,
  explanation: '解析',
})

const fill = (id) => ({
  id,
  subject: 'math',
  topic: '计算',
  type: 'fill',
  prompt: '题干',
  answer: '2',
  accept: ['2', '2.0'],
  explanation: '解析',
})

function pool() {
  const math = Array.from({ length: 8 }, (_, index) => choice(`math-${index + 1}`))
  const english = Array.from({ length: 8 }, (_, index) => ({
    ...choice(`eng-${index + 1}`, 'english'),
    passage: 'A sentence with ____ here.',
    translation: '译文',
  }))
  const cs = Array.from({ length: 16 }, (_, index) => choice(`cs-${index + 1}`, 'cs408'))
  return [...math, ...english, ...cs]
}

describe('date', () => {
  it('uses local calendar dates and handles month boundaries', () => {
    expect(dateKey(new Date(2026, 10, 1, 23, 30))).toBe('2026-11-01')
    expect(addDays('2026-11-01', 1)).toBe('2026-11-02')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(daysBetween('2026-11-01', '2026-12-19')).toBe(48)
    expect(parseDateKey('2026-02-29').getMonth()).toBe(2)
  })
})

describe('grading', () => {
  it('grades choice answers by index', () => {
    expect(isCorrect(choice('math-1'), 1)).toBe(true)
    expect(isCorrect(choice('math-1'), '1')).toBe(true)
    expect(isCorrect(choice('math-1'), 2)).toBe(false)
    expect(isCorrect(choice('math-1'), null)).toBe(false)
  })

  it('accepts numeric equivalents and normalizes punctuation', () => {
    expect(isCorrect(fill('math-2'), '2')).toBe(true)
    expect(isCorrect(fill('math-2'), '2.0')).toBe(true)
    expect(isCorrect(fill('math-2'), ' ２ ')).toBe(true)
    expect(isCorrect(fill('math-2'), '2。')).toBe(true)
    expect(isCorrect(fill('math-2'), '3')).toBe(false)
    expect(normalizeText('－１．０')).toBe('-1.0')
  })
})

describe('review scheduling', () => {
  it('resets a wrong answer to tomorrow and increases interval on success', () => {
    const wrong = nextReview(undefined, false, '2026-11-01', choice('math-1'))
    expect(wrong.due).toBe('2026-11-02')
    expect(wrong.interval).toBe(1)
    expect(wrong.firstCorrect).toBe(false)

    const firstCorrect = nextReview(wrong, true, '2026-11-02', choice('math-1'))
    expect(firstCorrect.due).toBe('2026-11-05')
    expect(firstCorrect.streak).toBe(1)
    expect(firstCorrect.mastered).toBe(false)
  })

  it('masters a question after three consecutive correct reviews', () => {
    let progress = nextReview(undefined, true, '2026-11-01', choice('math-1'))
    progress = nextReview(progress, true, '2026-11-04', choice('math-1'))
    progress = nextReview(progress, true, '2026-11-11', choice('math-1'))
    expect(progress.streak).toBe(3)
    expect(progress.mastered).toBe(true)
    expect(progress.attempts).toBe(3)
  })
})

describe('daily plan', () => {
  const settings = {
    daily: { math: 1, english: 1, cs408: 2, politics: 0 },
    reviewLimit: 4,
  }

  it('creates the configured mix without duplicates and is deterministic', () => {
    const state = { progress: {} }
    const questions = pool()
    const first = buildDailyPlan({ questions, state, dayKey: '2026-11-01', settings })
    const second = buildDailyPlan({ questions, state, dayKey: '2026-11-01', settings })
    expect(first).toEqual(second)
    expect(first).toHaveLength(4)
    expect(new Set(first.map((item) => item.id)).size).toBe(4)
    expect(first.map((item) => item.kind)).toEqual(['new', 'new', 'new', 'new'])
    expect(first.filter((item) => item.id.startsWith('math-'))).toHaveLength(1)
    expect(first.filter((item) => item.id.startsWith('eng-'))).toHaveLength(1)
    expect(first.filter((item) => item.id.startsWith('cs-'))).toHaveLength(2)
  })

  it('puts due reviews first and respects the review limit', () => {
    const questions = pool()
    const progress = {}
    for (let index = 1; index <= 5; index += 1) {
      progress[`math-${index}`] = { due: '2026-10-30', streak: 0, attempts: 1, lastAt: '2026-10-29' }
    }
    const plan = buildDailyPlan({
      questions,
      state: { progress },
      dayKey: '2026-11-01',
      settings: { ...settings, reviewLimit: 2 },
    })
    expect(plan.filter((item) => item.kind === 'review')).toHaveLength(2)
    expect(plan[0].kind).toBe('review')
    expect(plan[1].kind).toBe('review')
  })

  it('does not schedule politics while it is switched off', () => {
    const questions = [...pool(), choice('pol-1', 'politics')]
    const plan = buildDailyPlan({
      questions,
      state: { progress: {} },
      dayKey: '2026-11-01',
      settings,
    })
    expect(plan.some((item) => item.id === 'pol-1')).toBe(false)
  })

  it('tracks completion and counts', () => {
    const day = {
      plan: [{ id: 'math-1', kind: 'new' }, { id: 'math-2', kind: 'new' }],
      answers: { 'math-1': { correct: true } },
    }
    expect(isDayComplete(day)).toBe(false)
    expect(planCounts(day)).toEqual({ total: 2, done: 1, reviews: 0 })
    day.answers['math-2'] = { correct: false }
    expect(isDayComplete(day)).toBe(true)
  })
})

describe('stats', () => {
  it('computes streak from completed days only', () => {
    const state = {
      days: {
        '2026-10-30': { plan: [{ id: 'a' }], answers: { a: {} } },
        '2026-10-31': { plan: [{ id: 'b' }], answers: { b: {} } },
        '2026-11-01': { plan: [{ id: 'c' }], answers: {} },
      },
    }
    expect(computeStreak(state, '2026-11-01')).toBe(2)
    state.days['2026-11-01'].answers.c = {}
    expect(computeStreak(state, '2026-11-01')).toBe(3)
  })

  it('uses first attempts for accuracy and opens wrong entries', () => {
    const questions = pool()
    const byId = new Map(questions.map((question) => [question.id, question]))
    const state = {
      days: {},
      progress: {
        'math-1': { attempts: 2, correct: 1, firstCorrect: false, everWrong: true, streak: 0, due: '2026-11-02' },
        'math-2': { attempts: 1, correct: 1, firstCorrect: true, streak: 1 },
        'math-3': { attempts: 3, correct: 3, firstCorrect: true, everWrong: true, streak: 3, mastered: true },
      },
    }
    const overall = overallStats(state, byId, '2026-11-01')
    expect(overall.accuracy).toBeCloseTo(2 / 3)
    expect(overall.wrongOpen).toBe(1)
    expect(wrongEntries(state, byId)).toHaveLength(1)
    const rows = subjectBreakdown(state, byId)
    expect(rows.find((row) => row.key === 'math').firstAttempts).toBe(3)
  })
})

describe('schema and storage', () => {
  it('rejects malformed questions and duplicate ids', () => {
    const errors = validateQuestions([
      { id: 'ok-1', subject: 'math', topic: 't', type: 'choice', prompt: 'p', options: ['a'], answer: 0, explanation: 'e' },
      { id: 'ok-1', subject: 'math', topic: 't', type: 'fill', prompt: 'p', answer: '2', explanation: 'e' },
    ])
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((error) => error.includes('重复'))).toBe(true)
  })

  it('normalizes partial backups and fills default settings', () => {
    const state = normalizeState({ days: {}, progress: {}, settings: { theme: 'dark' } })
    expect(state.settings.theme).toBe('dark')
    expect(state.settings.daily.math).toBe(1)
    expect(state.customQuestions).toEqual([])
    expect(state.version).toBe(2)
    expect(state.settings.review.count).toBe(6)
    expect(state.reviewLog).toEqual([])
  })
})
