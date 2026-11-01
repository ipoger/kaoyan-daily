import { describe, expect, it } from 'vitest'
import { isSourced, sourceBreakdown, sourceInfo, sourceLabel, sourceRank } from '../src/lib/source.js'
import { buildDailyPlan } from '../src/lib/plan.js'
import { sampleReview } from '../src/lib/study.js'
import { validateQuestions } from '../src/lib/schema.js'

const base = (id, source, subject = 'math') => ({
  id,
  subject,
  topic: '极限',
  type: 'choice',
  prompt: '题干',
  options: ['A', 'B', 'C', 'D'],
  answer: 0,
  explanation: '解析',
  source,
})

describe('source metadata', () => {
  it('normalizes strings and structured sources', () => {
    expect(sourceInfo('原创')).toMatchObject({ type: '原创' })
    expect(sourceInfo('某本参考书')).toMatchObject({ type: '其他' })
    expect(
      sourceInfo({ type: '真题', name: '2024 数学一', detail: '第 3 题' }),
    ).toMatchObject({ type: '真题', name: '2024 数学一', detail: '第 3 题' })
    expect(sourceLabel({ type: '真题', name: '2024 数学一', detail: '第 3 题' })).toBe(
      '真题 · 2024 数学一 · 第 3 题',
    )
    expect(isSourced({ type: '模拟题', name: 'A' })).toBe(true)
    expect(isSourced('原创')).toBe(false)
    expect(sourceRank({ type: '真题' })).toBe(3)
  })

  it('counts sources', () => {
    const rows = sourceBreakdown([
      base('a', { type: '真题', name: 'x' }),
      base('b', { type: '真题', name: 'y' }),
      base('c', { type: '原创' }),
    ])
    expect(rows).toEqual([
      { type: '真题', count: 2 },
      { type: '原创', count: 1 },
    ])
  })

  it('validates structured source objects', () => {
    const errors = validateQuestions([base('src-1', { type: '不存在的类型', name: 'x' })])
    expect(errors.some((error) => error.includes('source.type'))).toBe(true)
  })
})

describe('source priority', () => {
  it('puts sourced fresh questions before original ones in the daily plan', () => {
    const questions = [
      base('math-001', { type: '原创' }),
      base('math-002', { type: '真题', name: '2024 数学一' }),
      base('eng-001', '原创', 'english'),
      base('cs-001', '原创', 'cs408'),
      base('cs-002', '原创', 'cs408'),
    ]
    const plan = buildDailyPlan({
      questions,
      state: { progress: {} },
      dayKey: '2026-11-01',
      settings: {
        daily: { math: 1, english: 1, cs408: 2, politics: 0 },
        reviewLimit: 4,
        preferSourced: true,
      },
    })
    expect(plan.map((item) => item.id)).toContain('math-002')
    expect(plan.map((item) => item.id)).not.toContain('math-001')
  })

  it('weights sourced questions in random review', () => {
    const questions = [
      base('math-001', { type: '原创' }),
      base('math-002', { type: '真题', name: '2024 数学一' }),
    ]
    const picked = sampleReview(questions, 1, {
      preferSourced: true,
      rng: () => 0.9,
    })
    expect(picked[0].id).toBe('math-002')
  })
})
