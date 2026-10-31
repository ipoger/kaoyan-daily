import { isChoice } from './subjects.js'

const FULL_WIDTH = {
  '０': '0',
  '１': '1',
  '２': '2',
  '３': '3',
  '４': '4',
  '５': '5',
  '６': '6',
  '７': '7',
  '８': '8',
  '９': '9',
  '．': '.',
  '－': '-',
  '＋': '+',
  '，': ',',
}

export function normalizeText(input) {
  return String(input ?? '')
    .replace(/[０-９．－＋，]/g, (char) => FULL_WIDTH[char] || char)
    .replace(/[−–—]/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/\s+/g, '')
    .replace(/[。；;]$/, '')
    .toLowerCase()
}

function asNumber(value) {
  const text = normalizeText(value).replace(/,/g, '')
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(text)) return null
  const number = Number(text)
  return Number.isFinite(number) ? number : null
}

function almostEqual(a, b) {
  return Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b))
}

/** response：选择题为选项下标，填空题为字符串。 */
export function isCorrect(question, response) {
  if (!question) return false
  if (isChoice(question)) {
    return Number(response) === question.answer
  }

  const given = normalizeText(response)
  if (!given) return false
  const accepted = [question.answer, ...(question.accept || [])].map(normalizeText)

  if (accepted.includes(given)) return true

  const givenNumber = asNumber(given)
  if (givenNumber === null) return false
  return accepted.some((candidate) => {
    const number = asNumber(candidate)
    return number !== null && almostEqual(givenNumber, number)
  })
}

export function blankAnswer(question) {
  return isChoice(question) ? null : ''
}
