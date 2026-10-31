import { SUBJECTS, SUBJECT_ORDER, OPTION_LETTERS, answerText, isChoice } from '../lib/subjects.js'
import { formatDate, daysUntil } from '../lib/date.js'
import { planCounts, isDayComplete } from '../lib/plan.js'
import { wrongEntries, subjectBreakdown, weakTopics, overallStats, heatmap } from '../lib/stats.js'
import { dueLabel } from '../lib/review.js'
import { icon } from './icons.js'
import { escapeHTML, rich, pct, preview, difficultyDots } from './format.js'

const NAV = [
  { id: 'today', label: '今日', icon: 'today' },
  { id: 'wrong', label: '错题本', icon: 'wrong' },
  { id: 'stats', label: '数据', icon: 'stats' },
  { id: 'settings', label: '设置', icon: 'settings' },
]

export function topbar(ctx) {
  const active = ctx.activeTab === 'retry' ? 'wrong' : ctx.activeTab
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
      <button class="icon-btn theme-btn" type="button" data-action="toggle-theme" aria-label="切换明暗主题" title="切换明暗主题">
        ${icon(ctx.dark ? 'sun' : 'moon', 19)}
      </button>
    </header>`
}

export function bottomNav(ctx) {
  const active = ctx.activeTab === 'retry' ? 'wrong' : ctx.activeTab
  return `
    <nav class="bottomnav" aria-label="底部导航">
      ${NAV.map(
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
                <button class="btn btn-ghost" type="button" data-action="next-retry">
                  ${ctx.practice && ctx.practice.index >= ctx.practice.ids.length - 1 ? '完成重练' : '下一题'} ${icon('arrow', 16)}
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
        <div class="stat-card"><span class="stat-label">待复习</span><strong>${overall.wrongOpen}<small>题</small></strong><span class="stat-foot">连续答对 3 次移出</span></div>
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

export function retryView(ctx) {
  const practice = ctx.practice
  if (!practice || !practice.ids.length) {
    return page(ctx, `<main id="main" class="shell narrow-shell">${emptyState({ title: '没有待重练的题', text: '先去做今天的题，或者从错题本选择一道。', href: '#wrong', action: '回到错题本' })}</main>`)
  }
  const index = Math.min(practice.index, practice.ids.length - 1)
  const qid = practice.ids[index]
  const question = ctx.questionMap.get(qid)
  if (!question) {
    return page(ctx, `<main id="main" class="shell narrow-shell">${emptyState({ title: '题目不存在', text: '它可能来自已删除的自定义题库。', href: '#wrong', action: '回到错题本' })}</main>`)
  }
  const answer = practice.answers?.[qid]
  const complete = Object.keys(practice.answers || {}).length >= practice.ids.length

  return page(
    ctx,
    `<main id="main" class="shell narrow-shell retry-shell">
      <div class="retry-head">
        <a class="back-link" href="#wrong">← 错题本</a>
        <div class="retry-title"><p class="eyebrow">RETRY SESSION</p><h1>错题重练</h1></div>
        <span class="retry-counter">${index + 1} / ${practice.ids.length}</span>
      </div>
      <div class="retry-progress"><span style="width:${((index + (answer ? 1 : 0)) / practice.ids.length) * 100}%"></span></div>
      ${complete && answer ? `<div class="retry-done">${icon('check', 18)} 这组错题已经过了一遍。答对的题会延长复习间隔，答错的题明天还会回来。</div>` : ''}
      ${questionCard(
        { ...ctx, practice },
        { id: qid, kind: 'review' },
        { mode: 'retry', active: !answer },
      )}
      <div class="retry-foot"><a class="text-link" href="#wrong">结束重练</a></div>
    </main>`,
  )
}
