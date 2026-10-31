export const SUBJECTS = {
  math: {
    key: 'math',
    name: '数学',
    short: '数',
    en: 'MATH',
    hint: '数学一 · 高数 / 线代 / 概率',
    description: '数学一覆盖高数、线代、概率。先把极限、导数、积分这条主线走稳，再滚动线代和概率。',
    path: ['极限', '导数', '积分', '线代', '概率'],
    color: '#b23a2b',
    resources: [
      { name: '武忠祥每日一题', note: 'B 站搜索入口', kind: 'bilibili', query: '武忠祥 每日一题' },
      { name: '李永乐线性代数', note: 'B 站搜索入口', kind: 'bilibili', query: '李永乐 线性代数 考研' },
      { name: '数学一历年真题库', note: 'GitHub 仓库搜索', kind: 'github', query: '考研数学一 真题' },
    ],
  },
  english: {
    key: 'english',
    name: '英语',
    short: '英',
    en: 'ENGLISH',
    hint: '英语一 · 长难句与词汇',
    description: '英语靠日常积累。每天一句长难句、十个词，比周末突击一套卷更稳。',
    path: ['长难句', '语法', '阅读', '翻译', '写作'],
    color: '#3e5f8a',
    resources: [
      { name: '田静每日一句', note: 'B 站搜索入口', kind: 'bilibili', query: '田静 考研英语 每日一句' },
      { name: '唐迟阅读', note: 'B 站搜索入口', kind: 'bilibili', query: '唐迟 考研英语 阅读' },
      { name: '北瓜考研英语', note: '微信小程序，可在微信搜索', kind: 'web', query: '北瓜考研英语 小程序' },
    ],
  },
  cs408: {
    key: 'cs408',
    name: '408',
    short: '计',
    en: 'CS 408',
    hint: '数据结构 / 组原 / 操作系统 / 网络',
    description: '408 四门课的分值都不低。用选择题保持手感，再用真题和专题课补结构。',
    path: ['数据结构', '组成原理', '操作系统', '计算机网络'],
    color: '#526e4c',
    resources: [
      { name: '王道公开课', note: 'B 站搜索入口', kind: 'bilibili', query: '王道 408 公开课' },
      { name: 'CodeBrick 码砖', note: '浏览器搜索入口', kind: 'web', query: 'CodeBrick 码砖 408' },
      { name: 'KY408 公益刷题', note: '浏览器搜索入口', kind: 'web', query: 'KY408 公益刷题' },
    ],
  },
  politics: {
    key: 'politics',
    name: '政治',
    short: '政',
    en: 'POLITICS',
    hint: '马原 / 史纲 / 思修 / 时政',
    description: '政治不宜过早堆时间。先开选择题保持熟悉感，等进入正式备考期再系统背诵。',
    path: ['马原', '史纲', '思修', '毛中特', '时政'],
    color: '#8a6a2f',
    resources: [
      { name: '腿姐每日一题', note: 'B 站搜索入口', kind: 'bilibili', query: '腿姐 考研政治 每日一题' },
      { name: '徐涛强化课', note: 'B 站搜索入口', kind: 'bilibili', query: '徐涛 考研政治' },
      { name: '政治历年真题', note: '浏览器搜索入口', kind: 'web', query: '考研政治 历年真题 在线' },
    ],
  },
}

export const SUBJECT_ORDER = ['math', 'english', 'cs408', 'politics']
export const OPTION_LETTERS = ['A', 'B', 'C', 'D']

export function subjectOf(question) {
  return SUBJECTS[question?.subject] || SUBJECTS.math
}

export function isChoice(question) {
  return question?.type === 'choice'
}

export function answerText(question) {
  if (!question) return ''
  if (isChoice(question)) {
    return `${OPTION_LETTERS[question.answer]}. ${question.options[question.answer]}`
  }
  return String(question.answer)
}
