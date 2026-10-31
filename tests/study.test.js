import { describe, expect, it } from 'vitest'
import {
  buildReviewPool,
  dueReviewQuestions,
  previousQuestionIds,
  reviewSummary,
  sampleReview,
  subjectOverview,
  topicOverview,
} from '../src/lib/study.js'

const q = (id, topic = '极限', subject = 'math') => ({
  id,
  subject,
  topic,
  type: 'choice',
  prompt: '题干',
  options: ['A', 'B', 'C', 'D'],
  answer: 0,
  explanation: '解析',
})

const questions = [q('math-1', '极限'), q('math-2', '极限'), q('math-3', '导数'), q('eng-1', '长难句', 'english')]
const byId = new Map(questions.map((question) => [question.id, question]))

function stateWithDays() {
  return {
    days: {
      '2026-10-28': { answers: { 'math-1': { correct: false } } },
      '2026-10-31': { answers: { 'math-2': { correct: false }, 'eng-1': { correct: true } } },
      '2026-11-01': { answers: { 'math-3': { correct: true } } },
    },
    progress: {
      'math-1': { firstCorrect: false, everWrong: true, due: '2026-11-02', streak: 0 },
      'math-2': { firstCorrect: false, everWrong: true, due: '2026-11-01', streak: 0 },
      'math-3': { firstCorrect: true, everWrong: false, due: '2026-11-04', streak: 1 },
      'eng-1': { firstCorrect: true, everWrong: false, due: '2026-11-07', streak: 1 },
    },
    reviewLog: [],
  }
}

describe('review pool', () => {
  it('only includes days before today and respects the scope', () => {
    const state = stateWithDays()
    const last3 = previousQuestionIds(state, '2026-11-01', 3)
    expect([...last3].sort()).toEqual(['eng-1', 'math-2'])

    const last7 = previousQuestionIds(state, '2026-11-01', 7)
    expect([...last7].sort()).toEqual(['eng-1', 'math-1', 'math-2'])

    const all = previousQuestionIds(state, '2026-11-01', 'all')
    expect([...all].sort()).toEqual(['eng-1', 'math-1', 'math-2'])
    expect(all.has('math-3')).toBe(false)
  })

  it('falls back to local progress days and does not treat today as history', () => {
    const state = {
      days: {},
      progress: {
        'math-1': { lastDay: '2026-10-30', firstCorrect: false },
        'math-2': { lastDay: '2026-11-01', firstCorrect: true },
      },
    }
    expect([...previousQuestionIds(state, '2026-11-01', 7)]).toEqual(['math-1'])
  })

  it('builds a pool with questions and wrong count', () => {
    const state = stateWithDays()
    const pool = buildReviewPool({ state, questionsById: byId, today: '2026-11-01', scopeDays: 7 })
    expect(pool.questions.map((item) => item.id).sort()).toEqual(['eng-1', 'math-1', 'math-2'])
    expect(pool.wrongCount).toBe(2)
  })

  it('samples without duplicates and can weight wrong questions', () => {
    const state = stateWithDays()
    const pool = buildReviewPool({ state, questionsById: byId, today: '2026-11-01', scopeDays: 7 })
    const picked = sampleReview(pool.questions, 2, { progress: state.progress, rng: () => 0.9 })
    expect(picked).toHaveLength(2)
    expect(new Set(picked.map((item) => item.id)).size).toBe(2)

    const weighted = sampleReview(pool.questions, 1, {
      progress: state.progress,
      preferWrong: true,
      rng: () => 0.6,
    })
    expect(weighted[0].id).toBe('math-2')
  })

  it('returns due reviews and excludes mastered questions', () => {
    const state = stateWithDays()
    state.progress['math-3'] = { due: '2026-10-30', streak: 3, mastered: true }
    const due = dueReviewQuestions(state, byId, '2026-11-01')
    expect(due.map((question) => question.id)).toEqual(['math-2'])
  })
})

describe('study overviews', () => {
  it('aggregates subject progress and first-answer accuracy', () => {
    const state = stateWithDays()
    const overview = subjectOverview(state, questions, 'math', '2026-11-01')
    expect(overview.total).toBe(3)
    expect(overview.attempted).toBe(3)
    expect(overview.firstAttempts).toBe(3)
    expect(overview.accuracy).toBeCloseTo(1 / 3)
    expect(overview.due).toBe(1)
  })

  it('groups knowledge points and assigns statuses', () => {
    const state = stateWithDays()
    const topics = topicOverview(state, questions, 'math', '2026-11-01')
    const limits = topics.find((topic) => topic.topic === '极限')
    expect(limits.questions).toHaveLength(2)
    expect(limits.firstAttempts).toBe(2)
    expect(limits.accuracy).toBe(0)
    expect(limits.status.key).toBe('weak')
    expect(limits.wrong).toBe(2)
  })

  it('summarizes review logs', () => {
    const summary = reviewSummary({
      reviewLog: [
        { total: 6, correct: 4 },
        { total: 4, correct: 4 },
      ],
    })
    expect(summary.sessions).toBe(2)
    expect(summary.answers).toBe(10)
    expect(summary.accuracy).toBe(0.8)
  })
})
