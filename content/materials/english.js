import longSentences from './english/long-sentences.md?raw'
import reading from './english/reading.md?raw'
import writing from './english/writing.md?raw'

export default [
  {
    id: 'long-sentences',
    subject: 'english',
    order: 1,
    title: '长难句拆解',
    summary: '先找谓语，再挂从句和非谓语；配一套每天 10 分钟的断句流程。',
    topics: ['长难句 · 定语从句', '长难句 · 倒装', '长难句 · 分词作状语'],
    books: ['田静《句句真研》', '考研英语历年真题'],
    video: { title: '田静 · 每日一句', kind: 'bilibili', query: '田静 考研英语 每日一句' },
    body: longSentences,
  },
  {
    id: 'reading',
    subject: 'english',
    order: 2,
    title: '阅读方法与题型',
    summary: '题干定位、同义替换、干扰项特征，以及一篇真题的精读流程。',
    topics: ['长难句 · 比较结构', '长难句 · 让步', '长难句 · 条件'],
    books: ['唐迟《阅读的逻辑》', '考研英语历年真题'],
    video: { title: '唐迟 · 阅读', kind: 'bilibili', query: '唐迟 考研英语 阅读 方法论' },
    body: reading,
  },
  {
    id: 'writing',
    subject: 'english',
    order: 3,
    title: '翻译与写作',
    summary: '翻译的拆句顺序、小作文格式、大作文骨架，以及每周练习安排。',
    topics: ['长难句 · 定语从句', '长难句 · 分词作状语'],
    books: ['田静《句句真研》', '考研英语写作真题'],
    video: { title: '田静 · 翻译写作', kind: 'bilibili', query: '田静 考研英语 翻译 写作' },
    body: writing,
  },
]
