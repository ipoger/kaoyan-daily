import './styles.css'
import 'katex/dist/katex.min.css'

import { builtinQuestions, CONTENT_VERSION } from '../content/index.js'
import { buildQuestionPool, indexQuestions } from './lib/content.js'
import { todayKey } from './lib/date.js'
import { isCorrect } from './lib/grade.js'
import { buildDailyPlan, dailySignature, isDayComplete } from './lib/plan.js'
import { nextReview } from './lib/review.js'
import { validateQuestion, validateQuestions } from './lib/schema.js'
import { clearState, createDefaultState, loadState, normalizeState, saveState } from './lib/storage.js'
import { overallStats, wrongEntries } from './lib/stats.js'
import { buildReviewPool, dueReviewQuestions, sampleReview, scopeLabel, sessionLabel } from './lib/study.js'
import { SUBJECTS } from './lib/subjects.js'
import { renderMath } from './ui/format.js'
import { learnView, reviewView, sessionView, settingsView, statsView, todayView, wrongView } from './ui/views.js'

const app = document.getElementById('app')
const toastEl = document.getElementById('toast')
const TABS = ['today', 'review', 'learn', 'wrong', 'stats', 'settings', 'practice']
const VERSION = '1.1.0'

let state = loadState()
let questions = buildQuestionPool(state.customQuestions)
let questionMap = indexQuestions(questions)
let route = parseRoute()
let activeTab = route.tab
let learnSubject = route.subject
let wrongFilter = 'all'
let practice = null
let toastTimer = null

function parseRoute() {
  const raw = window.location.hash.replace(/^#/, '')
  const [tab, ...rest] = raw.split('/')
  if (tab === 'learn') {
    const subject = rest[0]
    return { tab: 'learn', subject: SUBJECTS[subject] ? subject : null }
  }
  return { tab: TABS.includes(tab) ? tab : 'today', subject: null }
}

function effectiveDark() {
  const preference = state.settings.theme || 'auto'
  return (
    preference === 'dark' ||
    (preference === 'auto' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  )
}

function applyTheme() {
  const dark = effectiveDark()
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', dark ? '#171512' : '#f4efe4')
}

function save() {
  saveState(state)
}

function toast(message, type = 'info') {
  if (!toastEl) return
  window.clearTimeout(toastTimer)
  toastEl.textContent = message
  toastEl.dataset.type = type
  toastEl.classList.add('is-visible')
  toastTimer = window.setTimeout(() => toastEl.classList.remove('is-visible'), 2600)
}

function ensureToday() {
  const key = todayKey()
  if (!state.days[key]) {
    state.days[key] = {
      plan: [],
      answers: {},
      createdAt: new Date().toISOString(),
      signature: null,
    }
  }
  const day = state.days[key]
  day.answers = day.answers || {}
  day.plan = (day.plan || []).filter((item) => questionMap.has(item.id))

  const signature = dailySignature(state.settings)
  const untouched = Object.keys(day.answers).length === 0
  if (!day.plan.length || (day.signature !== signature && untouched)) {
    day.plan = buildDailyPlan({
      questions,
      state,
      dayKey: key,
      settings: state.settings,
    })
    day.signature = signature
    save()
  }
  return day
}

function rebuildTodayIfUntouched() {
  const key = todayKey()
  const day = state.days[key]
  if (!day || Object.keys(day.answers || {}).length) return
  day.plan = buildDailyPlan({ questions, state, dayKey: key, settings: state.settings })
  day.signature = dailySignature(state.settings)
}

function context() {
  const day = ensureToday()
  return {
    state,
    day,
    dayKey: todayKey(),
    settings: state.settings,
    questionMap,
    questions,
    stats: overallStats(state, questionMap, todayKey()),
    activeTab,
    learnSubject,
    dark: effectiveDark(),
    wrongFilter,
    practice,
    builtinCount: builtinQuestions.length,
    version: VERSION,
    contentVersion: CONTENT_VERSION,
  }
}

function render() {
  const ctx = context()
  if (activeTab === 'today') {
    app.innerHTML = todayView(ctx)
  } else if (activeTab === 'review') {
    app.innerHTML = reviewView(ctx)
  } else if (activeTab === 'learn') {
    app.innerHTML = learnView(ctx)
  } else if (activeTab === 'wrong') {
    app.innerHTML = wrongView(ctx)
  } else if (activeTab === 'stats') {
    app.innerHTML = statsView(ctx)
  } else if (activeTab === 'settings') {
    app.innerHTML = settingsView(ctx)
  } else if (activeTab === 'practice') {
    app.innerHTML = sessionView(ctx)
  } else {
    activeTab = 'today'
    app.innerHTML = todayView(ctx)
  }
  renderMath(app)
  document.body.dataset.tab = activeTab
  const titles = {
    today: '今日 · 研途',
    review: '复习 · 研途',
    learn: learnSubject ? `${SUBJECTS[learnSubject].name}学习 · 研途` : '学习 · 研途',
    wrong: '错题本 · 研途',
    stats: '学习数据 · 研途',
    settings: '设置 · 研途',
    practice: practice ? `${practice.title} · 研途` : '练习 · 研途',
  }
  document.title = titles[activeTab] || '研途 · 每日四题'
}

function renderPreservingCard(qid) {
  const before = document.querySelector(`.qa-card[data-qid="${qid}"]`)?.getBoundingClientRect().top
  render()
  if (before === undefined) return
  const after = document.querySelector(`.qa-card[data-qid="${qid}"]`)?.getBoundingClientRect().top
  if (after !== undefined) window.scrollBy(0, after - before)
}

function go(tab, { replace = false, subject = null } = {}) {
  activeTab = tab
  learnSubject = tab === 'learn' ? subject : null
  const hash = tab === 'learn' && subject ? `#learn/${subject}` : `#${tab}`
  if (window.location.hash !== hash) {
    if (replace) window.history.replaceState(null, '', hash)
    else window.history.pushState(null, '', hash)
  }
  render()
  window.scrollTo(0, 0)
}

function updateReviewSetting(key, value) {
  state.settings.review = { ...state.settings.review, [key]: value }
  save()
  render()
}

function recordDailyAnswer(qid, response) {
  const question = questionMap.get(qid)
  if (!question) return
  const day = ensureToday()
  if (day.answers[qid]) return
  const item = day.plan.find((entry) => entry.id === qid)
  const correct = isCorrect(question, response)
  day.answers[qid] = {
    response,
    correct,
    at: new Date().toISOString(),
    kind: item?.kind || 'new',
  }
  state.progress[qid] = nextReview(state.progress[qid], correct, todayKey(), question)
  if (isDayComplete(day)) day.completedAt = new Date().toISOString()
  save()
  renderPreservingCard(qid)
  toast(correct ? '答对了，继续。' : '已加入错题本，稍后会再考你。', correct ? 'success' : 'error')
}

function maybeLogSession() {
  if (!practice || practice.logged) return
  if (Object.keys(practice.answers || {}).length < practice.ids.length) return
  const answers = Object.values(practice.answers || {})
  state.reviewLog = [
    {
      at: new Date().toISOString(),
      day: todayKey(),
      kind: practice.kind,
      title:
        practice.kind === 'random'
          ? `${scopeLabel(practice.meta?.scopeDays)}随机抽题`
          : practice.title,
      total: practice.ids.length,
      correct: answers.filter((answer) => answer.correct).length,
      ids: [...practice.ids],
    },
    ...(state.reviewLog || []),
  ].slice(0, 50)
  practice.logged = true
}

function recordSessionAnswer(qid, response) {
  const question = questionMap.get(qid)
  if (!question || !practice) return
  const correct = isCorrect(question, response)
  practice.answers[qid] = { response, correct, at: new Date().toISOString() }
  state.progress[qid] = nextReview(state.progress[qid], correct, todayKey(), question)
  maybeLogSession()
  save()
  renderPreservingCard(qid)
  toast(correct ? '这次对了。' : '还是不对，明天继续。', correct ? 'success' : 'error')
}

function readAnswer(card) {
  const qid = card.dataset.qid
  const question = questionMap.get(qid)
  if (!question) return { qid, response: null }
  if (question.type === 'choice') {
    const selected = card.querySelector('.option.is-selected')
    return { qid, response: selected ? Number(selected.dataset.index) : null }
  }
  const input = card.querySelector('[data-fill]')
  return { qid, response: input?.value?.trim() || '' }
}

function submitCard(card) {
  const mode = card.dataset.mode
  const { qid, response } = readAnswer(card)
  if (response === null || response === '') {
    toast('先选一个答案，或填写结果。', 'error')
    const input = card.querySelector('[data-fill]')
    input?.focus()
    return
  }
  if (mode === 'retry') recordSessionAnswer(qid, response)
  else recordDailyAnswer(qid, response)
}

function startPractice(ids, options = {}) {
  const unique = [...new Set(ids)].filter((id) => questionMap.has(id))
  if (!unique.length) {
    toast('没有可练习的题。', 'error')
    return
  }
  const kind = options.kind || 'wrong'
  practice = {
    ids: unique,
    index: 0,
    answers: {},
    kind,
    title: options.title || sessionLabel(kind),
    returnTo: options.returnTo || (kind === 'wrong' ? '#wrong' : '#review'),
    meta: options.meta || {},
    startedAt: new Date().toISOString(),
    finished: false,
    logged: false,
  }
  go('practice')
}

function startRandomReview() {
  const { scopeDays, count, preferWrong } = state.settings.review
  const pool = buildReviewPool({
    state,
    questionsById: questionMap,
    today: todayKey(),
    scopeDays,
    preferWrong,
  })
  const picked = sampleReview(pool.questions, Number(count) || 6, {
    progress: state.progress,
    preferWrong,
  })
  if (!picked.length) {
    toast('这个范围里还没有做过的题。', 'error')
    return
  }
  startPractice(picked.map((question) => question.id), {
    kind: 'random',
    title: '随机复习',
    returnTo: '#review',
    meta: { scopeDays, count },
  })
}

function startDueReview() {
  const due = dueReviewQuestions(state, questionMap, todayKey()).slice(0, 12)
  if (!due.length) {
    toast('今天没有到期复习题。', 'error')
    return
  }
  startPractice(due.map((question) => question.id), {
    kind: 'due',
    title: '到期复习',
    returnTo: '#review',
  })
}

function startSubjectPractice(subject) {
  if (!SUBJECTS[subject]) return
  const pool = questions.filter((question) => question.subject === subject)
  const picked = sampleReview(pool, 8, { progress: state.progress, preferWrong: true })
  if (!picked.length) {
    toast('这个科目还没有题目。', 'error')
    return
  }
  startPractice(picked.map((question) => question.id), {
    kind: 'subject',
    title: `${SUBJECTS[subject].name} · 专项练习`,
    returnTo: `#learn/${subject}`,
    meta: { subject },
  })
}

function startTopicPractice(subject, topic) {
  if (!SUBJECTS[subject] || !topic) return
  const pool = questions.filter((question) => question.subject === subject && question.topic === topic)
  const picked = sampleReview(pool, 8, { progress: state.progress, preferWrong: true })
  if (!picked.length) {
    toast('这个知识点还没有题目。', 'error')
    return
  }
  startPractice(picked.map((question) => question.id), {
    kind: 'topic',
    title: `${topic} · 专项练习`,
    returnTo: `#learn/${subject}`,
    meta: { subject, topic },
  })
}

function restartSession() {
  if (!practice) return
  const { kind, meta } = practice
  if (kind === 'random') startRandomReview()
  else if (kind === 'due') {
    const due = dueReviewQuestions(state, questionMap, todayKey())
    if (due.length) startDueReview()
    else {
      toast('到期题已经清空，换一组随机复习。', 'success')
      startRandomReview()
    }
  }
  else if (kind === 'subject') startSubjectPractice(meta.subject)
  else if (kind === 'topic') startTopicPractice(meta.subject, meta.topic)
  else startPractice(practice.ids, { kind: 'wrong', title: '错题重练', returnTo: '#wrong' })
}

function startSessionWrongs() {
  if (!practice) return
  const ids = practice.ids.filter((id) => practice.answers?.[id] && !practice.answers[id].correct)
  if (!ids.length) {
    toast('这一组没有错题。', 'success')
    return
  }
  startPractice(ids, { kind: 'wrong', title: '错题重练', returnTo: practice.returnTo })
}

function scrollToNext(qid) {
  const cards = [...document.querySelectorAll('.qa-card[data-mode="daily"]')]
  const current = cards.findIndex((card) => card.dataset.qid === qid)
  const next = cards.slice(current + 1).find((card) => !card.classList.contains('is-answered'))
  if (!next) {
    const banner = document.querySelector('.finish-banner')
    if (banner) {
      banner.scrollIntoView({ behavior: 'smooth', block: 'center' })
      banner.classList.add('is-celebrating')
      window.setTimeout(() => banner.classList.remove('is-celebrating'), 900)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    return
  }
  next.scrollIntoView({ behavior: 'smooth', block: 'start' })
  next.classList.add('is-pulsing')
  window.setTimeout(() => next.classList.remove('is-pulsing'), 900)
}

function download(filename, content, type = 'application/json;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function exportBackup() {
  download(`yantu-backup-${todayKey()}.json`, JSON.stringify(state, null, 2))
  toast('备份已导出。', 'success')
}

function exportWrongMarkdown() {
  const entries = wrongEntries(state, questionMap)
  if (!entries.length) {
    toast('错题本是空的。', 'error')
    return
  }
  const lines = [`# 研途错题本`, '', `导出日期：${todayKey()}`, '']
  for (const { question, progress } of entries) {
    const subject = SUBJECTS[question.subject]
    lines.push(`## ${subject?.name || ''} · ${question.topic}`, '')
    lines.push(`**题目**：${question.prompt}`, '')
    if (question.options) {
      question.options.forEach((option, index) => lines.push(`- ${'ABCD'[index]}. ${option}`))
      lines.push('')
    }
    lines.push(`**正确答案**：${question.type === 'choice' ? `${'ABCD'[question.answer]}. ${question.options[question.answer]}` : question.answer}`, '')
    lines.push(`**解析**：${question.explanation}`, '')
    if (progress?.wrong) lines.push(`**累计答错**：${progress.wrong} 次`, '')
    lines.push('---', '')
  }
  download(`yantu-wrong-${todayKey()}.md`, lines.join('\n'), 'text/markdown;charset=utf-8')
  toast('错题笔记已导出。', 'success')
}

async function readJSONFile(input) {
  const file = input.files?.[0]
  if (!file) return null
  try {
    return JSON.parse(await file.text())
  } catch {
    toast('文件不是有效的 JSON。', 'error')
    return null
  } finally {
    input.value = ''
  }
}

async function importBackup(input) {
  const parsed = await readJSONFile(input)
  if (!parsed) return
  if (!parsed.settings || !parsed.days || !parsed.progress) {
    toast('这不像研途的备份文件。', 'error')
    return
  }
  if (!window.confirm('导入备份会覆盖当前所有进度，确定继续吗？')) return
  state = normalizeState(parsed)
  state.customQuestions = state.customQuestions.filter((question) => !validateQuestion(question).length)
  questions = buildQuestionPool(state.customQuestions)
  questionMap = indexQuestions(questions)
  save()
  practice = null
  applyTheme()
  go('today')
  toast('备份已恢复。', 'success')
}

async function importQuestions(input) {
  const parsed = await readJSONFile(input)
  if (!parsed) return
  const list = Array.isArray(parsed) ? parsed : parsed.questions
  if (!Array.isArray(list)) {
    toast('题库应为 JSON 数组，或包含 questions 数组。', 'error')
    return
  }
  const existingIds = new Set(questions.map((question) => question.id))
  const errors = validateQuestions(list, { existingIds })
  if (errors.length) {
    window.alert(`题库导入失败，共 ${errors.length} 处问题：\n\n${errors.slice(0, 12).join('\n')}`)
    return
  }
  state.customQuestions = [...(state.customQuestions || []), ...list]
  questions = buildQuestionPool(state.customQuestions)
  questionMap = indexQuestions(questions)
  save()
  go('settings')
  toast(`已导入 ${list.length} 道题。`, 'success')
}

function resetProgress() {
  if (!window.confirm('这会清空所有作答记录、错题和自定义题库，且不可恢复。确定继续吗？')) return
  clearState()
  state = createDefaultState()
  questions = buildQuestionPool([])
  questionMap = indexQuestions(questions)
  practice = null
  save()
  applyTheme()
  go('today')
  toast('已清空，重新开始。', 'success')
}

function handleSettingChange(target) {
  if (target.dataset.setting === 'examDate') {
    if (!target.value) return
    state.settings.examDate = target.value
  } else if (target.dataset.setting === 'reviewLimit') {
    state.settings.reviewLimit = Number(target.value)
  } else if (target.dataset.daily) {
    state.settings.daily[target.dataset.daily] = Number(target.value)
  } else if (target.dataset.toggle === 'politicsEnabled') {
    state.settings.daily.politics = target.checked ? 1 : 0
  } else if (target.dataset.theme) {
    state.settings.theme = target.dataset.theme
  } else {
    return
  }
  save()
  rebuildTodayIfUntouched()
  applyTheme()
  render()
  toast('已保存。', 'success')
}

async function onClick(event) {
  const option = event.target.closest('.option')
  if (option && !option.disabled) {
    const card = option.closest('.qa-card')
    card.querySelectorAll('.option').forEach((item) => {
      item.classList.remove('is-selected')
      item.setAttribute('aria-pressed', 'false')
    })
    option.classList.add('is-selected')
    option.setAttribute('aria-pressed', 'true')
    document.querySelectorAll('.qa-card[data-active="true"]').forEach((item) => item.removeAttribute('data-active'))
    card.dataset.active = 'true'
    return
  }

  const actionEl = event.target.closest('[data-action]')
  if (!actionEl) return
  const action = actionEl.dataset.action

  if (action === 'submit') {
    const card = actionEl.closest('.qa-card')
    if (card) submitCard(card)
  } else if (action === 'next-question') {
    scrollToNext(actionEl.dataset.qid)
  } else if (action === 'next-session') {
    if (!practice) return
    if (practice.index >= practice.ids.length - 1) {
      practice.finished = true
    } else {
      practice.index += 1
    }
    render()
    window.scrollTo(0, 0)
  } else if (action === 'session-again') {
    restartSession()
  } else if (action === 'session-wrongs') {
    startSessionWrongs()
  } else if (action === 'review-scope') {
    updateReviewSetting('scopeDays', actionEl.dataset.value === 'all' ? 'all' : Number(actionEl.dataset.value))
  } else if (action === 'review-count') {
    updateReviewSetting('count', Number(actionEl.dataset.value))
  } else if (action === 'review-prefer') {
    updateReviewSetting('preferWrong', !state.settings.review.preferWrong)
  } else if (action === 'start-random') {
    startRandomReview()
  } else if (action === 'start-due') {
    startDueReview()
  } else if (action === 'practice-subject') {
    startSubjectPractice(actionEl.dataset.subject)
  } else if (action === 'practice-topic') {
    startTopicPractice(actionEl.dataset.subject, actionEl.dataset.topic)
  } else if (action === 'wrong-filter') {
    wrongFilter = actionEl.dataset.filter || 'all'
    render()
  } else if (action === 'retry-one') {
    startPractice([actionEl.dataset.qid], { kind: 'wrong', title: '错题重练', returnTo: '#wrong' })
  } else if (action === 'retry-all') {
    const entries = wrongEntries(state, questionMap)
    const filtered = wrongFilter === 'all' ? entries : entries.filter((entry) => entry.question.subject === wrongFilter)
    startPractice((filtered.length ? filtered : entries).map((entry) => entry.question.id), {
      kind: 'wrong',
      title: '错题重练',
      returnTo: '#wrong',
    })
  } else if (action === 'toggle-theme') {
    state.settings.theme = effectiveDark() ? 'light' : 'dark'
    save()
    applyTheme()
    render()
  } else if (action === 'set-theme') {
    state.settings.theme = actionEl.dataset.theme
    save()
    applyTheme()
    render()
    toast('主题已切换。', 'success')
  } else if (action === 'export-backup') {
    exportBackup()
  } else if (action === 'import-backup') {
    document.getElementById('backup-file')?.click()
  } else if (action === 'import-questions') {
    document.getElementById('questions-file')?.click()
  } else if (action === 'export-wrong') {
    exportWrongMarkdown()
  } else if (action === 'reset-progress') {
    resetProgress()
  }
}

function onKeyDown(event) {
  if (event.target.matches('input, select, textarea')) {
    if (event.key === 'Enter' && event.target.dataset.fill) {
      const card = event.target.closest('.qa-card')
      if (card) {
        event.preventDefault()
        submitCard(card)
      }
    }
    return
  }
  if (activeTab !== 'today' && activeTab !== 'practice') return
  const card = event.target.closest('.qa-card') || document.querySelector('.qa-card[data-active="true"]')
  if (!card) return
  if (/^[1-4]$/.test(event.key)) {
    const option = card.querySelectorAll('.option')[Number(event.key) - 1]
    if (option && !option.disabled) {
      event.preventDefault()
      option.click()
    }
  } else if (event.key === 'Enter') {
    // 焦点通常停在选项按钮上，所以这里主动接管 Enter，
    // 避免“按了 Enter 只是再次点击选项”的错觉。
    const submit = card.querySelector('[data-action="submit"]')
    const next = card.querySelector('[data-action="next-question"], [data-action="next-session"]')
    if (submit) {
      event.preventDefault()
      submit.click()
    } else if (next) {
      event.preventDefault()
      next.click()
    }
  }
}

app.addEventListener('click', onClick)
app.addEventListener('change', (event) => {
  if (event.target.id === 'backup-file') {
    importBackup(event.target)
  } else if (event.target.id === 'questions-file') {
    importQuestions(event.target)
  } else {
    handleSettingChange(event.target)
  }
})
document.addEventListener('keydown', onKeyDown)
window.addEventListener('hashchange', () => {
  const next = parseRoute()
  activeTab = next.tab
  learnSubject = next.subject
  render()
  window.scrollTo(0, 0)
})
window.matchMedia?.('(prefers-color-scheme: dark)')?.addEventListener?.('change', () => {
  if (state.settings.theme === 'auto') {
    applyTheme()
    render()
  }
})

applyTheme()
render()

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch((error) => console.warn('离线缓存注册失败', error))
  })
}
