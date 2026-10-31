import { describe, expect, it } from 'vitest'
import { builtinQuestions } from '../content/index.js'
import { validateQuestions } from '../src/lib/schema.js'

describe('built-in content', () => {
  it('passes schema validation and has unique ids', () => {
    expect(validateQuestions(builtinQuestions)).toEqual([])
    expect(new Set(builtinQuestions.map((question) => question.id)).size).toBe(builtinQuestions.length)
  })

  it('has enough content for the 24-day starter plan', () => {
    for (const subject of ['math', 'english', 'cs408']) {
      expect(builtinQuestions.filter((question) => question.subject === subject).length).toBeGreaterThanOrEqual(
        subject === 'cs408' ? 48 : 24,
      )
    }
  })

  it('keeps every choice answer inside its options', () => {
    for (const question of builtinQuestions.filter((item) => item.type === 'choice')) {
      expect(question.answer).toBeGreaterThanOrEqual(0)
      expect(question.answer).toBeLessThan(question.options.length)
    }
  })
})
