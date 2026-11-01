import { SUBJECT_ORDER } from './subjects.js'
import { isDue } from './review.js'
import { shuffleSeeded } from './random.js'
import { isSourced } from './source.js'

export function dailySignature(settings) {
  return JSON.stringify({
    daily: settings?.daily || {},
    reviewLimit: settings?.reviewLimit ?? 4,
    preferSourced: settings?.preferSourced !== false,
  })
}

function orderedSubjects(daily = {}) {
  return SUBJECT_ORDER.filter((subject) => Number(daily[subject] || 0) > 0)
}

/**
 * 生成某天的计划：
 * 1. 先放入到期的复习题（最多 reviewLimit 道）；
 * 2. 再按科目取没做过的新题；
 * 3. 新题不够时，用最久没做的旧题补位。
 *
 * 用日期做随机种子，同一天刷新多次结果一致；但计划会存进 state，
 * 所以用户中途改设置也不会打乱已经开始的练习。
 */
export function buildDailyPlan({ questions, state, dayKey, settings = state.settings }) {
  const daily = settings.daily || {}
  const reviewLimit = Number(settings.reviewLimit ?? 4)
  const enabled = new Set(orderedSubjects(daily))
  const byId = new Map(questions.map((question) => [question.id, question]))
  const progress = state.progress || {}
  const selected = new Set()
  const plan = []

  const due = Object.entries(progress)
    .filter(([id, item]) => byId.has(id) && enabled.has(byId.get(id).subject) && isDue(item, dayKey))
    .sort((left, right) => {
      if (left[1].due !== right[1].due) return left[1].due < right[1].due ? -1 : 1
      return left[0] < right[0] ? -1 : 1
    })
    .slice(0, Math.max(0, reviewLimit))

  for (const [id] of due) {
    plan.push({ id, kind: 'review' })
    selected.add(id)
  }

  for (const subject of orderedSubjects(daily)) {
    const count = Math.max(0, Number(daily[subject] || 0))
    if (!count) continue

    const pool = questions.filter((question) => question.subject === subject && !selected.has(question.id))
    const fresh = pool.filter((question) => !progress[question.id])
    const seen = pool
      .filter((question) => progress[question.id])
      .sort((a, b) => String(progress[a.id]?.lastAt || '').localeCompare(String(progress[b.id]?.lastAt || '')))

    const shuffledFresh = shuffleSeeded(fresh, `${dayKey}:${subject}:fresh`)
    const orderedFresh =
      settings.preferSourced !== false
        ? [
            ...shuffledFresh.filter((question) => isSourced(question.source)),
            ...shuffledFresh.filter((question) => !isSourced(question.source)),
          ]
        : shuffledFresh
    const picks = orderedFresh.slice(0, count)
    if (picks.length < count) {
      // 旧题补位时优先最久没碰过的，同时避免把今天刚复习的题又塞进来。
      const fill = shuffleSeeded(seen, `${dayKey}:${subject}:fill`)
        .filter((question) => !selected.has(question.id) && !isDue(progress[question.id], dayKey))
        .slice(0, count - picks.length)
      picks.push(...fill)
    }

    for (const question of picks) {
      if (selected.has(question.id)) continue
      plan.push({ id: question.id, kind: 'new' })
      selected.add(question.id)
    }
  }

  return plan
}

export function isDayComplete(day) {
  if (!day?.plan?.length) return false
  return day.plan.every((item) => Boolean(day.answers?.[item.id]))
}

export function planCounts(day) {
  const plan = day?.plan || []
  return {
    total: plan.length,
    done: plan.filter((item) => day?.answers?.[item.id]).length,
    reviews: plan.filter((item) => item.kind === 'review').length,
  }
}

export function findFirstUnanswered(day) {
  return (day?.plan || []).find((item) => !day?.answers?.[item.id])?.id || null
}
