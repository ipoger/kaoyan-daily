import { SUBJECTS, SUBJECT_ORDER, OPTION_LETTERS, answerText, isChoice } from '../lib/subjects.js'
import { formatDate, daysUntil } from '../lib/date.js'
import { planCounts, isDayComplete } from '../lib/plan.js'
import { wrongEntries, subjectBreakdown, weakTopics, overallStats, heatmap } from '../lib/stats.js'
import { dueLabel } from '../lib/review.js'
import {
  buildReviewPool,
  dueReviewQuestions,
  recentSessions,
  reviewSummary,
  scopeLabel,
  sessionLabel,
  subjectOverview,
  topicOverview,
} from '../lib/study.js'
import { icon } from './icons.js'
import { escapeHTML, rich, pct, preview, difficultyDots } from './format.js'

const NAV = [
  { id: 'today', label: '今日', icon: 'today' },
  { id: 'review', label: '复习', icon: 'review' },
  { id: 'learn', label: '学习', icon: 'learn' },
  { id: 'wrong', label: '错题本', icon: 'wrong' },
  { id: 'stats', label: '数据', icon: 'stats' },
  { id: 'settings', label: '设置', icon: 'settings' },
]

const MOBILE_NAV = NAV.filter((item) => item.id !== 'settings')

function activeNav(ctx) {
  if (ctx.activeTab !== 'practice') return ctx.activeTab
  const kind = ctx.practice?.kind
  if (kind === 'due' || kind === 'random') return 'review'
  if (kind === 'subject' || kind === 'topic') return 'learn'
  return 'wrong'
}

export function topbar(ctx) {
  const active = activeNav(ctx)
  return `
    <header class="topbar">
      <a class="brand" href="#today" aria-label="研途首页">
        <span class="seal" aria-hidden="true">研</span>
        <span class="brand-copy"><strong>研途</strong><small>每日四题</small></span>
      </a>
      <nav class="topnav" aria-label="主导航">
        ${NAV.map(
          (item) => `
          <a class="topnav-link ${active === item.id ? 'is-active' : ''}" href="#${item.id}" ${active === item.id ? 'aria-current="page"' : ''}>
            ${item.label}
          </a>`,
        ).join('')}
      </nav>
      <a class="icon-btn mobile-settings" href="#settings" aria-label="设置" title="设置">${icon('sliders', 19)}</a>
      <button class="icon-btn theme-btn" type="button" data-action="toggle-theme" aria-label="切换明暗主题" title="切换明暗主题">
        ${icon(ctx.dark ? 'sun' : 'moon', 19)}
      </button>
    </header>`
}

export function bottomNav(ctx) {
  const active = activeNav(ctx)
  return `
    <nav class="bottomnav" aria-label="底部导航">
      ${MOBILE_NAV.map(
        (item) => `
        <a class="bottomnav-link ${active === item.id ? 'is-active' : ''}" href="#${item.id}" ${active === item.id ? 'aria-current="page"' : ''}>
          ${icon(item.icon, 21)}
          <span>${item.label}</span>
        </a>`,
      ).join('')}
    </nav>`
}

function page(ctx, content) {
  return `${topbar(ctx)}${content}${bottomNav(ctx)}`
}

function countdown(settings, dayKey) {
  const days = daysUntil(settings.examDate, dayKey)
  if (!Number.isFinite(days)) return { value: '—', label: '初试' }
  if (days > 0) return { value: days, label: '距初试' }
  if (days === 0) return { value: '今天', label: '初试日' }
  return { value: Math.abs(days), label: '初试已过' }
}

function progressRing(percent) {
  return `<div class="progress-ring" style="--value:${Math.max(0, Math.min(100, percent))}" role="img" aria-label="今日完成 ${Math.round(percent)}%">
    <div class="progress-ring-inner"><strong>${Math.round(percent)}<small>%</small></strong><span>今日</span></div>
  </div>`
}

function emptyState({ iconName = 'spark', title, text, href = '#today', action = '回到今日' }) {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon(iconName, 28)}</div>
      <h2>${escapeHTML(title)}</h2>
      <p>${escapeHTML(text)}</p>
      <a class="btn btn-primary" href="${href}">${escapeHTML(action)}</a>
    </div>`
}

function subjectPill(subject) {
  return `<span class="subject-pill" style="--subject:${subject.color}">
    <span class="subject-char">${subject.short}</span>${subject.name}
  </span>`
}

function optionMarkup(question, answer, mode) {
  return `<div class="options" role="radiogroup" aria-label="选项">
    ${question.options
      .map((option, index) => {
        let classes = 'option'
        if (answer) {
          if (index === question.answer) classes += ' is-correct'
          if (Number(answer.response) === index && !answer.correct) classes += ' is-wrong'
          classes += ' is-locked'
        }
        return `<button type="button" class="${classes}" data-action="select-option" data-index="${index}" ${answer ? 'disabled' : ''} aria-pressed="false">
          <span class="option-key">${OPTION_LETTERS[index]}</span>
          <span class="option-text">${rich(option)}</span>
        </button>`
      })
      .join('')}
  </div>`
}

function englishReveal(question) {
  const answer = question.options[question.answer]
  const [before, ...rest] = String(question.passage || '').split('____')
  const marked = `${rich(before)}<mark>${escapeHTML(answer)}</mark>${rich(rest.join('____'))}`
  return `<div class="full-sentence">
      <span class="mini-label">完整句子</span>
      <p>${marked}</p>
    </div>
    <div class="translation-block">
      <span class="mini-label">参考译文</span>
      <p>${rich(question.translation)}</p>
    </div>
    ${
      question.vocab?.length
        ? `<div class="vocab-list">${question.vocab
            .map(
              (item) =>
                `<span class="vocab-chip"><strong>${escapeHTML(item.word)}</strong><span>${escapeHTML(item.meaning)}</span></span>`,
            )
            .join('')}</div>`
        : ''
    }`
}

function passageMarkup(passage) {
  const [before, ...rest] = String(passage || '').split('____')
  return `${rich(before)}<span class="blank">____</span>${rich(rest.join('____'))}`
}

function feedback(question, answer, progress) {
  const correctText = answerText(question)
  const userText = isChoice(question)
    ? `${OPTION_LETTERS[answer.response]}. ${question.options[answer.response]}`
    : answer.response
  const next = progress?.mastered
    ? '已掌握，移出每日复习队列'
    : progress?.due
      ? `下次复习：${progress.due}`
      : ''
  return `
    <div class="feedback ${answer.correct ? 'is-correct' : 'is-wrong'}">
      <div class="feedback-head">
        <span class="feedback-icon">${icon(answer.correct ? 'check' : 'close', 18)}</span>
        <strong>${answer.correct ? '答对了' : '答错了'}</strong>
        ${answer.correct ? '' : '<span class="feedback-note">已自动加入错题本</span>'}
      </div>
      <div class="answer-compare">
        <span>你的答案 <b>${rich(userText)}</b></span>
        ${answer.correct ? '' : `<span>正确答案 <b>${rich(correctText)}</b></span>`}
      </div>
      ${next ? `<div class="next-review">${icon('clock', 14)} ${escapeHTML(next)}${progress?.streak ? ` · 连续答对 ${progress.streak} 次` : ''}</div>` : ''}
    </div>
    <div class="explain">
      <span class="mini-label">解析</span>
      <div class="rich-text">${rich(question.explanation)}</div>
      ${question.subject === 'english' ? englishReveal(question) : ''}
    </div>`
}

export function questionCard(ctx, item, { mode = 'daily', active = false } = {}) {
  const question = ctx.questionMap.get(item.id)
  if (!question) return ''
  const answer = mode === 'daily' ? ctx.day?.answers?.[item.id] : ctx.practice?.answers?.[item.id]
  const progress = ctx.state.progress?.[item.id]
  const subject = SUBJECTS[question.subject] || SUBJECTS.math
  const isReview = item.kind === 'review'
  const answered = Boolean(answer)
  const isEnglish = question.subject === 'english'

  return `
    <article class="qa-card ${answered ? 'is-answered' : ''} ${active ? 'is-active' : ''}" data-qid="${question.id}" data-subject="${question.subject}" data-mode="${mode}" ${active ? 'data-active="true"' : ''}>
      <div class="card-top">
        ${subjectPill(subject)}
        <span class="topic">${escapeHTML(question.topic)}</span>
        ${isReview ? '<span class="review-pill">到期复习</span>' : ''}
        <span class="difficulty" title="难度 ${question.difficulty || 2}/3">${difficultyDots(question.difficulty || 2)}</span>
      </div>
      <div class="qa-main">
        ${
          isEnglish && question.passage
            ? `<div class="passage">${passageMarkup(question.passage)}</div>`
            : ''
        }
        <div class="prompt rich-text">${rich(question.prompt)}</div>
        ${
          isChoice(question)
            ? optionMarkup(question, answer, mode)
            : `<div class="fill-wrap">
                <label class="sr-only" for="fill-${mode}-${question.id}">填写答案</label>
                <input class="fill-input" id="fill-${mode}-${question.id}" type="text" inputmode="decimal" autocomplete="off" placeholder="输入答案" value="${answered ? escapeHTML(answer.response) : ''}" ${answered ? 'disabled' : ''} data-fill="${question.id}" />
                <span class="fill-unit">填写数值即可</span>
              </div>`
        }
        ${
          answered
            ? feedback(question, answer, progress)
            : `<div class="card-actions">
                <button class="btn btn-primary" type="button" data-action="submit" data-qid="${question.id}" data-mode="${mode}">
                  提交答案 ${icon('arrow', 17)}
                </button>
                <span class="key-hint">${isChoice(question) ? '按 1–4 选择' : '输入后按 Enter'} · 先自己想，再看解析</span>
              </div>`
        }
        ${
          answered && mode === 'daily'
            ? `<div class="card-foot">
                <button class="btn btn-ghost" type="button" data-action="next-question" data-qid="${question.id}">
                  ${ctx.day && isDayComplete(ctx.day) ? '今日已完成' : '下一题'} ${icon('arrow', 16)}
                </button>
              </div>`
            : ''
        }
        ${
          answered && mode === 'retry'
            ? `<div class="card-foot">
                <button class="btn btn-ghost" type="button" data-action="next-session">
                  ${ctx.practice && ctx.practice.index >= ctx.practice.ids.length - 1 ? '查看结果' : '下一题'} ${icon('arrow', 16)}
                </button>
              </div>`
            : ''
        }
      </div>
    </article>`
}

function completionBanner(ctx, counts) {
  const doneCorrect = Object.values(ctx.day.answers || {}).filter((item) => item.correct).length
  return `
    <section class="finish-banner" aria-label="今日完成">
      <div class="finish-stamp" aria-hidden="true">今日<br>已毕</div>
      <div class="finish-copy">
        <p class="eyebrow">DAILY COMPLETE</p>
        <h2>${counts.total === 4 ? '四道题' : `${counts.total} 道题`}，收进脑子里了。</h2>
        <p>完成 ${counts.done} 题，答对 ${doneCorrect} 题 · 连续学习 ${ctx.stats.streak} 天</p>
        <div class="finish-actions">
          <a class="btn btn-primary" href="#wrong">去错题本复盘 ${icon('arrow', 16)}</a>
          <a class="btn btn-ghost" href="#stats">看学习数据</a>
        </div>
      </div>
    </section>`
}

export function todayView(ctx) {
  const counts = planCounts(ctx.day)
  const complete = isDayComplete(ctx.day)
  const percent = counts.total ? (counts.done / counts.total) * 100 : 0
  const remaining = Math.max(0, counts.total - counts.done)
  const cd = countdown(ctx.settings, ctx.dayKey)
  const firstUnanswered = ctx.day?.plan?.find((item) => !ctx.day.answers?.[item.id])?.id

  const subjectRows = SUBJECT_ORDER.map((key) => {
    const total = (ctx.day?.plan || []).filter((item) => ctx.questionMap.get(item.id)?.subject === key).length
    const done = (ctx.day?.plan || []).filter(
      (item) => ctx.questionMap.get(item.id)?.subject === key && ctx.day.answers?.[item.id],
    ).length
    return { key, subject: SUBJECTS[key], total, done }
  }).filter((row) => row.total > 0)

  return page(
    ctx,
    `<main id="main" class="shell today-shell">
      <div class="today-layout">
        <aside class="day-rail">
          <div class="rail-date">
            <p class="eyebrow">TODAY</p>
            <h1>${formatDate(ctx.dayKey)}</h1>
            <p class="rail-sub">${complete ? '今日任务已完成' : remaining ? `还剩 ${remaining} 题` : '今天的题已经刷完'}</p>
          </div>
          <div class="rail-progress">
            ${progressRing(percent)}
            <div class="countdown">
              <span class="countdown-value">${cd.value}</span>
              <span class="countdown-label">${cd.label}</span>
            </div>
          </div>
          <div class="rail-stats">
            <div class="rail-stat">${icon('flame', 17)}<span>连续 <b>${ctx.stats.streak}</b> 天</span></div>
            <div class="rail-stat">${icon('book', 17)}<span>累计 <b>${ctx.stats.solved}</b> 题</span></div>
            ${ctx.settings.daily.politics > 0 ? '' : '<p class="rail-note">政治模块未开启，可在设置中打开。</p>'}
          </div>
          <div class="task-list">
            <p class="mini-label">今日配比</p>
            ${subjectRows
              .map(
                (row) => `<div class="task-row">
                  <span class="task-dot" style="--subject:${row.subject.color}"></span>
                  <span class="task-name">${row.subject.name}</span>
                  <span class="task-count">${row.done}/${row.total}</span>
                </div>`,
              )
              .join('')}
            ${counts.reviews ? `<p class="rail-note">含 ${counts.reviews} 道到期复习</p>` : ''}
          </div>
          <div class="rail-quote">
            <p>“先作答，再看解析。<br>不会的题，才算真正开始。”</p>
          </div>
        </aside>

        <section class="day-main">
          <div class="day-heading">
            <div>
              <p class="eyebrow">${complete ? 'DONE FOR TODAY' : 'DAILY PRACTICE'}</p>
              <h2>${complete ? '今日已收笔。' : counts.done ? '继续，把剩下的题做完。' : `今天，把 ${counts.total || 4} 道题弄懂。`}</h2>
            </div>
            <div class="heading-meta">
              <span>${counts.done}/${counts.total} 已完成</span>
              <span class="meta-divider"></span>
              <span>${counts.reviews ? `${counts.reviews} 道复习` : '新题 + 复习'}</span>
            </div>
          </div>
          ${complete ? completionBanner(ctx, counts) : ''}
          <div class="question-stack">
            ${
              ctx.day?.plan?.length
                ? ctx.day.plan
                    .map((item) =>
                      questionCard(ctx, item, {
                        mode: 'daily',
                        active: !complete && item.id === firstUnanswered,
                      }),
                    )
                    .join('')
                : emptyState({
                    iconName: 'book',
                    title: '题库暂时没有可安排的题',
                    text: '检查设置里的每日配比，或在设置页导入自己的题库。',
                    href: '#settings',
                    action: '去设置',
                  })
            }
          </div>
          ${
            complete
              ? `<div class="end-note">${icon('spark', 18)} 明天见。错题会在到期后自动回到这里。</div>`
              : ''
          }
        </section>
      </div>
    </main>`,
  )
}

export function wrongView(ctx) {
  const entries = wrongEntries(ctx.state, ctx.questionMap)
  const filter = ctx.wrongFilter || 'all'
  const filtered = filter === 'all' ? entries : entries.filter((entry) => entry.question.subject === filter)
  const filterSubjects = SUBJECT_ORDER.filter((key) => entries.some((entry) => entry.question.subject === key))

  return page(
    ctx,
    `<main id="main" class="shell narrow-shell">
      <div class="page-heading">
        <div>
          <p class="eyebrow">MISTAKE BOOK</p>
          <h1>错题本</h1>
          <p class="page-sub">答错的题会自动排进复习。连续答对 3 次后，它会悄悄离开。</p>
        </div>
        ${
          entries.length
            ? `<button class="btn btn-primary" type="button" data-action="retry-all">重练 ${filtered.length || entries.length} 题 ${icon('arrow', 16)}</button>`
            : ''
        }
      </div>
      ${
        entries.length
          ? `<div class="filter-row" role="group" aria-label="按科目筛选">
              <button class="filter-chip ${filter === 'all' ? 'is-active' : ''}" data-action="wrong-filter" data-filter="all">全部 <span>${entries.length}</span></button>
              ${filterSubjects
                .map(
                  (key) => `<button class="filter-chip ${filter === key ? 'is-active' : ''}" data-action="wrong-filter" data-filter="${key}">
                    ${SUBJECTS[key].name} <span>${entries.filter((entry) => entry.question.subject === key).length}</span>
                  </button>`,
                )
                .join('')}
            </div>
            <div class="wrong-list">
              ${filtered
                .map(
                  ({ question, progress }) => `<article class="wrong-row">
                    <div class="wrong-main">
                      <div class="card-top">
                        ${subjectPill(SUBJECTS[question.subject])}
                        <span class="topic">${escapeHTML(question.topic)}</span>
                        <span class="wrong-count">错 ${progress.wrong || 1} 次</span>
                      </div>
                      <p class="wrong-preview">${escapeHTML(preview(question.prompt))}</p>
                    </div>
                    <div class="wrong-side">
                      <span class="due-label">${escapeHTML(dueLabel(progress, ctx.dayKey))}</span>
                      <button class="btn btn-small" type="button" data-action="retry-one" data-qid="${question.id}">重练</button>
                    </div>
                  </article>`,
                )
                .join('')}
            </div>
            <p class="list-note">${icon('clock', 15)} 重练会更新复习间隔，但不会计入今日进度。</p>`
          : emptyState({
              iconName: 'check',
              title: '错题本是空的',
              text: '可能是你还没开始，也可能是你都做对了。今天的题做完后，答错的题会自动出现在这里。',
              href: '#today',
              action: '去做今天的题',
            })
      }
    </main>`,
  )
}


function resourceHref(resource) {
  const query = encodeURIComponent(resource.query || resource.name)
  if (resource.kind === 'github') return `https://github.com/search?q=${query}&type=repositories`
  if (resource.kind === 'web') return `https://www.baidu.com/s?wd=${query}`
  return `https://search.bilibili.com/all?keyword=${query}`
}

export function reviewView(ctx) {
  const due = dueReviewQuestions(ctx.state, ctx.questionMap, ctx.dayKey)
  const pool = buildReviewPool({
    state: ctx.state,
    questionsById: ctx.questionMap,
    today: ctx.dayKey,
    scopeDays: ctx.settings.review.scopeDays,
    preferWrong: ctx.settings.review.preferWrong,
  })
  const summary = reviewSummary(ctx.state)
  const logs = recentSessions(ctx.state, 6)
  const scope = ctx.settings.review.scopeDays
  const count = Number(ctx.settings.review.count) || 6
  const preferWrong = Boolean(ctx.settings.review.preferWrong)
  const dueCap = 12
  const dueTopics = [...new Set(due.map((question) => question.topic))].slice(0, 5)

  return page(
    ctx,
    `<main id="main" class="shell narrow-shell review-shell">
      <div class="page-heading">
        <div>
          <p class="eyebrow">REVIEW</p>
          <h1>复习</h1>
          <p class="page-sub">到期错题会自动回来；也可以从前几天做过的题里随机抽一组，看看是真的会了，还是只是记住了答案。</p>
        </div>
      </div>

      <div class="review-grid">
        <section class="panel review-panel review-due">
          <div class="panel-head">
            <div><p class="eyebrow">DUE TODAY</p><h2>到期复习</h2></div>
            <span class="panel-meta">${due.length ? `最多一次 ${Math.min(due.length, dueCap)} 道` : '暂无到期'}</span>
          </div>
          <div class="due-count"><strong>${due.length}</strong><span>道题到期</span></div>
          <p class="form-help">答错的题次日回来，答对后间隔逐步拉长。连续答对 3 次后移出队列。</p>
          ${
            dueTopics.length
              ? `<div class="due-topics">${dueTopics.map((topic) => `<span class="soft-chip">${escapeHTML(topic)}</span>`).join('')}${due.length > dueTopics.length ? `<span class="soft-chip">…</span>` : ''}</div>`
              : ''
          }
          <p class="due-tip">先自己回忆思路，再展开解析。答错的题明天还会回来。</p>
          <button class="btn btn-primary" type="button" data-action="start-due" ${due.length ? '' : 'disabled'}>
            ${due.length ? `开始到期复习 ${icon('arrow', 16)}` : '今天没有到期题'}
          </button>
        </section>

        <section class="panel review-panel review-random">
          <div class="panel-head">
            <div><p class="eyebrow">RANDOM SET</p><h2>随机抽题</h2></div>
            <span class="panel-meta">可抽 ${pool.questions.length} 题</span>
          </div>
          <div class="review-field">
            <span class="form-label">抽题范围</span>
            <div class="segmented" role="group" aria-label="抽题范围">
              ${[3, 7, 14, 'all']
                .map(
                  (value) => `<button class="segment ${String(scope) === String(value) ? 'is-active' : ''}" type="button" data-action="review-scope" data-value="${value}">${value === 'all' ? '全部' : `${value} 天`}</button>`,
                )
                .join('')}
            </div>
          </div>
          <div class="review-field">
            <span class="form-label">抽几道</span>
            <div class="segmented" role="group" aria-label="抽题数量">
              ${[4, 6, 8, 10]
                .map(
                  (value) => `<button class="segment ${count === value ? 'is-active' : ''}" type="button" data-action="review-count" data-value="${value}">${value} 题</button>`,
                )
                .join('')}
            </div>
          </div>
          <div class="review-field review-field-inline">
            <span class="form-help">优先抽还没掌握的错题（权重更高）</span>
            <button class="toggle-pill ${preferWrong ? 'is-on' : ''}" type="button" data-action="review-prefer" aria-pressed="${preferWrong}">
              <span class="toggle-dot"></span>优先错题
            </button>
          </div>
          <button class="btn btn-primary" type="button" data-action="start-random" ${pool.questions.length ? '' : 'disabled'}>
            ${pool.questions.length ? `随机抽 ${Math.min(count, pool.questions.length)} 题 ${icon('arrow', 16)}` : '还没有前几天的作答记录'}
          </button>
          <p class="form-help review-hint">${scopeLabel(scope)}做过的题 · ${pool.wrongCount} 道错题待巩固</p>
        </section>
      </div>

      <section class="panel review-log-panel">
        <div class="panel-head">
          <div><p class="eyebrow">REVIEW LOG</p><h2>复习记录</h2></div>
          <span class="panel-meta">${summary.sessions} 次 · ${summary.answers ? pct(summary.accuracy) : '—'} 正确率</span>
        </div>
        ${
          logs.length
            ? `<div class="review-log-list">${logs
                .map(
                  (log) => `<div class="review-log-row">
                    <span class="review-log-kind">${escapeHTML(sessionLabel(log.kind))}</span>
                    <span class="review-log-title">${escapeHTML(log.title && log.title !== sessionLabel(log.kind) ? log.title : '')}</span>
                    <span class="review-log-score">${log.correct}/${log.total}</span>
                    <span class="review-log-date">${formatDate(log.day || String(log.at || '').slice(0, 10), { withWeekday: false })}</span>
                  </div>`,
                )
                .join('')}</div>`
            : `<div class="quiet-empty">${icon('review', 20)} 还没有复习记录。做完今天的题，或从上面抽一组开始。</div>`
        }
      </section>

      <p class="review-note">${icon('clock', 15)} 复习会更新间隔，但不会计入今日进度；每日计划里的到期题仍会照常出现。</p>
    </main>`,
  )
}

export function learnView(ctx) {
  const subject = SUBJECTS[ctx.learnSubject]
  if (subject) {
    const overview = subjectOverview(ctx.state, ctx.questions, subject.key, ctx.dayKey)
    const topics = topicOverview(ctx.state, ctx.questions, subject.key, ctx.dayKey)
    return page(
      ctx,
      `<main id="main" class="shell narrow-shell learn-shell">
        <a class="back-link" href="#learn">← 全部科目</a>
        <div class="learn-detail-head" style="--subject:${subject.color}">
          <div class="subject-seal">${subject.short}</div>
          <div class="learn-detail-copy">
            <p class="eyebrow">SUBJECT · ${subject.en}</p>
            <h1>${subject.name}</h1>
            <p>${escapeHTML(subject.description)}</p>
            <div class="path-chips">${subject.path.map((step, index) => `<span>${escapeHTML(step)}</span>${index < subject.path.length - 1 ? '<i>→</i>' : ''}`).join('')}</div>
          </div>
          <button class="btn btn-primary" type="button" data-action="practice-subject" data-subject="${subject.key}">
            本科目专项 ${icon('arrow', 16)}
          </button>
        </div>

        <section class="subject-stat-row">
          <div><span>已练题目</span><strong>${overview.attempted}<small>/${overview.total}</small></strong></div>
          <div><span>首答正确率</span><strong>${overview.firstAttempts ? pct(overview.accuracy) : '—'}</strong></div>
          <div><span>已掌握</span><strong>${overview.mastered}<small>题</small></strong></div>
          <div><span>到期复习</span><strong>${overview.due}<small>题</small></strong></div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div><p class="eyebrow">KNOWLEDGE MAP</p><h2>知识点地图</h2></div>
            <span class="panel-meta">按内容顺序 · 练习后自动标记状态</span>
          </div>
          <div class="topic-list">
            ${topics
              .map(
                (row) => `<div class="topic-row">
                  <div class="topic-main">
                    <div class="topic-title">
                      <strong>${escapeHTML(row.topic)}</strong>
                      <span class="topic-status is-${row.status.key}">${row.status.label}</span>
                    </div>
                    <div class="topic-bar"><span style="width:${Math.round(row.accuracy * 100)}%;--subject:${subject.color}"></span></div>
                    <div class="topic-meta">${row.questions.length} 题 · ${row.firstAttempts} 次首答 · ${row.firstAttempts ? `正确率 ${pct(row.accuracy)}` : '还没开始'}${row.wrong ? ` · ${row.wrong} 道错题` : ''}</div>
                  </div>
                  <button class="btn btn-small" type="button" data-action="practice-topic" data-subject="${subject.key}" data-topic="${escapeHTML(row.topic)}">练这组</button>
                </div>`,
              )
              .join('')}
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div><p class="eyebrow">FREE RESOURCES</p><h2>免费资源入口</h2></div>
            <span class="panel-meta">外部搜索</span>
          </div>
          <div class="resource-list">
            ${(subject.resources || [])
              .map(
                (resource) => `<a class="resource-row" href="${resourceHref(resource)}" target="_blank" rel="noopener noreferrer">
                  <span class="resource-copy"><strong>${escapeHTML(resource.name)}</strong><small>${escapeHTML(resource.note)}</small></span>
                  ${icon('arrow', 16)}
                </a>`,
              )
              .join('')}
          </div>
          <p class="form-help resource-help">链接是搜索入口，不直接搬运课程或真题；具体合集以 UP 主和站点最新发布为准。</p>
        </section>
      </main>`,
    )
  }

  return page(
    ctx,
    `<main id="main" class="shell narrow-shell learn-shell">
      <div class="page-heading">
        <div>
          <p class="eyebrow">LEARN</p>
          <h1>学习</h1>
          <p class="page-sub">按科目看知识点，哪里不会点哪里。每个知识点都能单独练一组，练完自动记录掌握情况。</p>
        </div>
      </div>

      <div class="learn-grid">
        ${SUBJECT_ORDER.map((key) => {
          const item = SUBJECTS[key]
          const overview = subjectOverview(ctx.state, ctx.questions, key, ctx.dayKey)
          const isOff = key === 'politics' && Number(ctx.settings.daily.politics) === 0
          return `<a class="learn-card" href="#learn/${key}" style="--subject:${item.color}">
            <div class="learn-card-top">
              ${subjectPill(item)}
              <span class="learn-arrow">${icon('arrow', 17)}</span>
            </div>
            <h2>${item.name}${isOff ? '<small>未开启</small>' : ''}</h2>
            <p>${escapeHTML(item.description)}</p>
            <div class="learn-progress"><span style="width:${Math.round(overview.progress * 100)}%"></span></div>
            <div class="learn-meta">
              <span>已练 <b>${overview.attempted}</b>/${overview.total}</span>
              <span>首答 <b>${overview.firstAttempts ? pct(overview.accuracy) : '—'}</b></span>
              <span>掌握 <b>${overview.mastered}</b></span>
            </div>
            <div class="path-chips">${item.path.map((step) => `<span>${escapeHTML(step)}</span>`).join('')}</div>
          </a>`
        }).join('')}
      </div>

      <div class="learn-foot">
        <p>${icon('spark', 17)} 知识点里的题来自内置题库和导入题库；做错的题会自动进入错题本与复习队列。</p>
        <a class="text-link" href="#review">去复习页随机抽题 →</a>
      </div>
    </main>`,
  )
}

function heatmapMarkup(ctx) {
  const cells = heatmap(ctx.state, 84, ctx.dayKey)
  const total = cells.reduce((sum, cell) => sum + cell.count, 0)
  return `<section class="panel heatmap-panel">
    <div class="panel-head">
      <div><p class="eyebrow">CONSISTENCY</p><h2>最近 12 周</h2></div>
      <span class="panel-meta">${total} 次作答</span>
    </div>
    <div class="heatmap-wrap">
      <div class="heatmap-grid" role="img" aria-label="最近 12 周每日答题热力图">
        ${cells
          .map(
            (cell) =>
              `<span class="heat-cell level-${cell.level}" title="${cell.key} · ${cell.count} 题"></span>`,
          )
          .join('')}
      </div>
      <div class="heatmap-legend"><span>少</span><i class="level-0"></i><i class="level-1"></i><i class="level-2"></i><i class="level-3"></i><i class="level-4"></i><span>多</span></div>
    </div>
  </section>`
}

export function statsView(ctx) {
  const overall = overallStats(ctx.state, ctx.questionMap, ctx.dayKey)
  const rows = subjectBreakdown(ctx.state, ctx.questionMap)
  const weak = weakTopics(ctx.state, ctx.questionMap)
  const review = reviewSummary(ctx.state)
  const activeRows = rows.filter((row) => row.firstAttempts > 0)

  if (!overall.attempts) {
    return page(
      ctx,
      `<main id="main" class="shell narrow-shell">
        <div class="page-heading"><div><p class="eyebrow">YOUR DATA</p><h1>学习数据</h1><p class="page-sub">做过的题、答对的题、薄弱的知识点，都会在这里留下痕迹。</p></div></div>
        ${emptyState({
          iconName: 'stats',
          title: '还没有数据',
          text: '完成第一天的练习后，这里会显示连续天数、正确率、科目分布和知识短板。',
          href: '#today',
          action: '开始第一天',
        })}
      </main>`,
    )
  }

  return page(
    ctx,
    `<main id="main" class="shell narrow-shell">
      <div class="page-heading">
        <div><p class="eyebrow">YOUR DATA</p><h1>学习数据</h1><p class="page-sub">不追求刷题数量，只看有没有把不会的变成会的。</p></div>
      </div>

      <section class="stat-grid">
        <div class="stat-card"><span class="stat-label">连续学习</span><strong>${overall.streak}<small>天</small></strong><span class="stat-foot">最长 ${overall.longest} 天</span></div>
        <div class="stat-card"><span class="stat-label">首答正确率</span><strong>${pct(overall.accuracy)}</strong><span class="stat-foot">只看第一次作答</span></div>
        <div class="stat-card"><span class="stat-label">已练题目</span><strong>${overall.solved}<small>题</small></strong><span class="stat-foot">累计作答 ${overall.attempts} 次</span></div>
        <div class="stat-card"><span class="stat-label">待复习</span><strong>${overall.wrongOpen}<small>题</small></strong><span class="stat-foot">连续 3 次答对移出 · 已复习 ${review.sessions} 次</span></div>
      </section>

      ${heatmapMarkup(ctx)}

      <section class="panel">
        <div class="panel-head">
          <div><p class="eyebrow">BY SUBJECT</p><h2>科目掌握度</h2></div>
          <span class="panel-meta">首答正确率</span>
        </div>
        <div class="subject-bars">
          ${rows
            .map(
              (row) => `<div class="subject-bar-row">
                <span class="subject-bar-name">${row.name}</span>
                <div class="bar-track"><span class="bar-fill" style="width:${Math.round(row.accuracy * 100)}%;--subject:${row.color}"></span></div>
                <span class="subject-bar-value">${row.firstAttempts ? pct(row.accuracy) : '—'}</span>
                <span class="subject-bar-count">${row.firstAttempts} 题</span>
              </div>`,
            )
            .join('')}
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div><p class="eyebrow">WEAK SPOTS</p><h2>该补的知识点</h2></div>
          <span class="panel-meta">至少作答 2 次</span>
        </div>
        ${
          weak.length
            ? `<div class="weak-list">${weak
                .map(
                  (row) => `<div class="weak-row">
                    <span class="weak-tag" style="--subject:${SUBJECTS[row.subject]?.color || 'var(--accent)'}">${SUBJECTS[row.subject]?.name || ''}</span>
                    <span class="weak-name">${escapeHTML(row.topic)}</span>
                    <span class="weak-acc">${pct(row.accuracy)}</span>
                    <span class="weak-count">${row.correct}/${row.attempts}</span>
                  </div>`,
                )
                .join('')}</div>`
            : `<div class="quiet-empty">${icon('spark', 20)} 暂时没有明显短板。继续按节奏练习，数据会慢慢显形。</div>`
        }
      </section>

      <section class="panel panel-compact">
        <div class="panel-head">
          <div><p class="eyebrow">ALL SUBJECTS</p><h2>练习分布</h2></div>
        </div>
        <div class="distribution">
          ${activeRows
            .map(
              (row) => `<div class="dist-row"><span>${row.name}</span><b>${row.firstAttempts}</b><span class="dist-sub">道首答题</span></div>`,
            )
            .join('')}
        </div>
      </section>
    </main>`,
  )
}

function toggleRow(label, description, name, checked) {
  return `<label class="switch-row">
    <span class="switch-copy"><strong>${label}</strong><span>${description}</span></span>
    <input type="checkbox" data-toggle="${name}" ${checked ? 'checked' : ''} />
    <span class="switch" aria-hidden="true"></span>
  </label>`
}

export function settingsView(ctx) {
  const { settings } = ctx
  const customCount = ctx.state.customQuestions?.length || 0
  const review = reviewSummary(ctx.state)
  return page(
    ctx,
    `<main id="main" class="shell narrow-shell settings-shell">
      <div class="page-heading">
        <div><p class="eyebrow">SETTINGS</p><h1>设置</h1><p class="page-sub">进度只存在这台设备的浏览器里。换设备前记得导出备份。</p></div>
      </div>

      <section class="panel">
        <div class="panel-head"><div><p class="eyebrow">RHYTHM</p><h2>每日节奏</h2></div><span class="panel-meta">保存后立即生效</span></div>
        <div class="form-row">
          <div><label class="form-label" for="exam-date">初试日期</label><p class="form-help">用于首页倒计时，可随时修改。</p></div>
          <input class="input" id="exam-date" type="date" value="${escapeHTML(settings.examDate)}" data-setting="examDate" />
        </div>
        <div class="form-row">
          <div><label class="form-label">每日题量</label><p class="form-help">数学和英语各 1 题/句，408 建议 2 题。</p></div>
          <div class="stepper-grid">
            ${[
              ['math', '数学', 0, 3],
              ['english', '英语', 0, 3],
              ['cs408', '408', 0, 4],
              ['politics', '政治', 0, 3],
            ]
              .map(
                ([key, label, min, max]) => `<label class="stepper">
                  <span>${label}</span>
                  <select data-daily="${key}" aria-label="${label}每日题量">
                    ${Array.from({ length: max - min + 1 }, (_, index) => index + min)
                      .map((value) => `<option value="${value}" ${Number(settings.daily[key]) === value ? 'selected' : ''}>${value}</option>`)
                      .join('')}
                  </select>
                </label>`,
              )
              .join('')}
          </div>
        </div>
        <div class="form-row">
          <div><label class="form-label" for="review-limit">每日复习上限</label><p class="form-help">到期错题最多插入几道，0 表示不自动复习。</p></div>
          <select class="input input-short" id="review-limit" data-setting="reviewLimit">
            ${[0, 2, 3, 4, 5, 6, 8]
              .map((value) => `<option value="${value}" ${Number(settings.reviewLimit) === value ? 'selected' : ''}>${value} 题</option>`)
              .join('')}
          </select>
        </div>
        ${toggleRow('政治模块', '默认关闭；进入正式备考阶段再开启。', 'politicsEnabled', Number(settings.daily.politics) > 0)}
      </section>

      <section class="panel">
        <div class="panel-head"><div><p class="eyebrow">APPEARANCE</p><h2>外观</h2></div></div>
        <div class="segmented" role="group" aria-label="主题">
          ${[
            ['auto', '跟随系统'],
            ['light', '纸白'],
            ['dark', '夜读'],
          ]
            .map(
              ([value, label]) => `<button class="segment ${settings.theme === value ? 'is-active' : ''}" type="button" data-action="set-theme" data-theme="${value}">${label}</button>`,
            )
            .join('')}
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><div><p class="eyebrow">DATA</p><h2>数据与题库</h2></div><span class="panel-meta">本地存储</span></div>
        <div class="data-actions">
          <button class="btn" type="button" data-action="export-backup">${icon('download', 17)} 导出备份</button>
          <button class="btn" type="button" data-action="import-backup">${icon('upload', 17)} 导入备份</button>
          <button class="btn" type="button" data-action="import-questions">${icon('book', 17)} 导入题库</button>
          <button class="btn" type="button" data-action="export-wrong">${icon('download', 17)} 导出错题</button>
        </div>
        <div class="data-meta">
          <span>内置题库 <b>${ctx.builtinCount}</b> 题</span>
          <span>自定义 <b>${customCount}</b> 题</span>
          <span>已练 <b>${ctx.stats.solved}</b> 题</span>
          <span>复习 <b>${review.sessions}</b> 次</span>
        </div>
        <p class="form-help data-help">题库格式为 JSON 数组，字段说明见仓库 README。导入的题目只保存在本地，不会上传。内置题与用户题使用相同 id 时会拒绝导入，避免覆盖。</p>
        <details class="danger-zone">
          <summary>危险操作</summary>
          <div class="danger-body">
            <p>清空所有作答记录、错题和自定义题库，不可恢复。建议先导出备份。</p>
            <button class="btn btn-danger" type="button" data-action="reset-progress">${icon('trash', 17)} 清空全部进度</button>
          </div>
        </details>
        <input type="file" id="backup-file" accept="application/json,.json" hidden />
        <input type="file" id="questions-file" accept="application/json,.json" hidden />
      </section>

      <section class="panel about-panel">
        <p class="eyebrow">ABOUT</p>
        <h2>研途 · 每日四题</h2>
        <p>一个不登录、不收费、不上传数据的考研每日练习工具。代码 MIT，题库为原创内容，不收录历年真题原文；如需真题训练，请使用自己合法获得的资料导入。</p>
        <p class="about-meta">v${ctx.version} · ${ctx.builtinCount} 道内置题 · 本地优先</p>
      </section>
    </main>`,
  )
}

export function sessionView(ctx) {
  const practice = ctx.practice
  if (!practice || !practice.ids.length) {
    return page(
      ctx,
      `<main id="main" class="shell narrow-shell">${emptyState({ iconName: 'review', title: '没有进行中的练习', text: '从复习页抽一组题，或者去错题本选一道。', href: '#review', action: '去复习' })}</main>`,
    )
  }

  const backHref = practice.returnTo || (['due', 'random'].includes(practice.kind) ? '#review' : ['subject', 'topic'].includes(practice.kind) ? '#learn' : '#wrong')
  const backLabel = ['due', 'random'].includes(practice.kind) ? '复习' : ['subject', 'topic'].includes(practice.kind) ? '学习' : '错题本'
  const title = practice.title || sessionLabel(practice.kind)
  const eyebrow = ['due', 'random'].includes(practice.kind) ? 'REVIEW SESSION' : practice.kind === 'wrong' ? 'RETRY SESSION' : 'PRACTICE SESSION'
  const total = practice.ids.length
  const answers = Object.values(practice.answers || {})
  const finished = Boolean(practice.finished)
  const correct = answers.filter((answer) => answer.correct).length
  const wrongQuestions = practice.ids
    .filter((id) => practice.answers?.[id] && !practice.answers[id].correct)
    .map((id) => ctx.questionMap.get(id))
    .filter(Boolean)

  if (finished) {
    const minutes = practice.startedAt
      ? Math.max(1, Math.round((Date.now() - new Date(practice.startedAt).getTime()) / 60000))
      : null
    return page(
      ctx,
      `<main id="main" class="shell narrow-shell retry-shell">
        <div class="session-finish">
          <div class="finish-stamp" aria-hidden="true">${correct === total ? '全对' : '完成'}</div>
          <p class="eyebrow">SESSION COMPLETE</p>
          <h1>这组${escapeHTML(['due', 'random'].includes(practice.kind) ? '复习' : practice.kind === 'wrong' ? '错题重练' : '专项练习')}完成了。</h1>
          <p class="session-score"><strong>${correct}<small>/${total}</small></strong> 答对${minutes ? ` · 约 ${minutes} 分钟` : ''}</p>
          ${
            wrongQuestions.length
              ? `<div class="session-wrongs"><span class="mini-label">需要再看一眼</span><div class="due-topics">${[...new Set(wrongQuestions.map((question) => question.topic))].map((topic) => `<span class="soft-chip">${escapeHTML(topic)}</span>`).join('')}</div></div>`
              : `<p class="session-perfect">${icon('spark', 18)} 这一组全对，继续保持。</p>`
          }
          <div class="session-actions">
            <button class="btn btn-primary" type="button" data-action="session-again">${practice.kind === 'random' ? '再抽一组' : '再练一组'} ${icon('arrow', 16)}</button>
            ${wrongQuestions.length ? `<button class="btn" type="button" data-action="session-wrongs">只练这 ${wrongQuestions.length} 道</button>` : ''}
            <a class="btn btn-ghost" href="${backHref}">返回${backLabel}</a>
          </div>
        </div>
      </main>`,
    )
  }

  const index = Math.min(practice.index, total - 1)
  const qid = practice.ids[index]
  const question = ctx.questionMap.get(qid)
  if (!question) {
    return page(
      ctx,
      `<main id="main" class="shell narrow-shell">${emptyState({ iconName: 'review', title: '题目不存在', text: '它可能来自已删除的自定义题库。', href: backHref, action: `回到${backLabel}` })}</main>`,
    )
  }
  const answer = practice.answers?.[qid]
  const allAnswered = answers.length >= total

  return page(
    ctx,
    `<main id="main" class="shell narrow-shell retry-shell">
      <div class="retry-head">
        <a class="back-link" href="${backHref}">← ${backLabel}</a>
        <div class="retry-title"><p class="eyebrow">${eyebrow}</p><h1>${escapeHTML(title)}</h1></div>
        <span class="retry-counter">${index + 1} / ${total}</span>
      </div>
      <div class="retry-progress"><span style="width:${((index + (answer ? 1 : 0)) / total) * 100}%"></span></div>
      ${allAnswered && answer ? `<div class="retry-done">${icon('check', 18)} 这组题已经全部作答。查看结果后，错题会按间隔复习继续出现。</div>` : ''}
      ${questionCard({ ...ctx, practice }, { id: qid, kind: practice.kind === 'wrong' ? 'review' : 'new' }, { mode: 'retry', active: !answer })}
      <div class="retry-foot"><a class="text-link" href="${backHref}">结束本次练习</a></div>
    </main>`,
  )
}
