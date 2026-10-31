#!/usr/bin/env node
import { builtinQuestions, CONTENT_VERSION } from '../content/index.js'
import { validateQuestions } from '../src/lib/schema.js'
import { SUBJECTS } from '../src/lib/subjects.js'

const errors = validateQuestions(builtinQuestions)
const counts = {}
for (const question of builtinQuestions) {
  counts[question.subject] = (counts[question.subject] || 0) + 1
}

console.log(`题库版本：${CONTENT_VERSION}`)
for (const [key, subject] of Object.entries(SUBJECTS)) {
  console.log(`  ${subject.name.padEnd(4, ' ')} ${String(counts[key] || 0).padStart(3, ' ')} 题`)
}
console.log(`  合计 ${builtinQuestions.length} 题`)

if (counts.math < 1 || counts.english < 1 || counts.cs408 < 1) {
  errors.push('数学、英语、408 至少各需要 1 道题。')
}

if (errors.length) {
  console.error('\n题库校验失败：')
  for (const error of errors) console.error(`  ✗ ${error}`)
  process.exit(1)
}

console.log('\n✓ 题库校验通过')
