import math from './math.js'
import english from './english.js'
import cs408 from './cs408.js'
import politics from './politics.js'

/** 内置题库由 content/*.js 提供，新增文件后在这里合并即可。 */
export const builtinQuestions = [...math, ...english, ...cs408, ...politics]

export const CONTENT_VERSION = '1.0.0'
export const CONTENT_COUNTS = {
  math: math.length,
  english: english.length,
  cs408: cs408.length,
  politics: politics.length,
}
