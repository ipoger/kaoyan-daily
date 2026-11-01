# 题库格式

内置题库是 `content/*.js` 里的 ES 模块数组，构建时由 Vite 打包。也可以从「设置 → 导入题库」导入 JSON，数据只保存在当前浏览器。

## 字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 3–64 位小写字母、数字、短横线，全局唯一，例如 `math-025` |
| `subject` | 是 | `math` / `english` / `cs408` / `politics` |
| `topic` | 是 | 知识点，统计页按它聚合薄弱项 |
| `difficulty` | 否 | 1–3，默认 2 |
| `type` | 是 | `choice` 或 `fill` |
| `prompt` | 是 | 题干，支持 `$...$` KaTeX 公式和 `**加粗**` |
| `options` | 选择题 | 恰好 4 个选项 |
| `answer` | 是 | 选择题为 0–3 的下标（A–D）；填空题为字符串 |
| `accept` | 填空题 | 可接受的其他写法，必须包含 `answer` |
| `explanation` | 是 | 解析，提交后展示 |
| `source` | 否 | 题源。字符串 `原创`，或 `{ type, name, detail }` 对象 |
| `passage` | 英语必填 | 带 `____` 的英文原句 |
| `translation` | 英语必填 | 参考译文 |
| `vocab` | 否 | `[{ "word": "...", "meaning": "..." }]` |

## 题源

```js
source: { type: '真题', name: '2024 考研数学一', detail: '第 3 题' }
```

`type` 可选：`真题` / `模拟题` / `教材` / `原创` / `其他`。旧版字符串 `source: '原创'` 仍然兼容；非「原创」的字符串会归为「其他」，不会自动冒充真题。

导入后，题目卡片会显示题源；设置页可开启「优先练习已标注题源的题」，每日新题和随机复习会优先/加权安排。

> 不要把他人的教材、模拟卷或真题全文直接提交到仓库。题源字段只记录出处，不替代版权授权。

## 选择题

```js
{
  id: 'math-025',
  subject: 'math',
  topic: '函数极限',
  difficulty: 2,
  type: 'choice',
  prompt: String.raw`求 $\displaystyle \lim_{x\to 0}\frac{\sin x}{x}$。`,
  options: ['$0$', '$1$', '$2$', '$+\infty$'],
  answer: 1,
  explanation: String.raw`重要极限：$\lim_{x\to 0}\frac{\sin x}{x}=1$。`,
  source: '原创',
}
```

## 填空题

填空题目前只做数值 / 字符串归一化比较，不做符号等价判断。复杂表达式请做成选择题。

```js
{
  id: 'math-026',
  subject: 'math',
  topic: '导数与微分',
  type: 'fill',
  prompt: String.raw`设 $f(x)=x^2$，则 $f'(1)=\underline{\qquad}$。`,
  answer: '2',
  accept: ['2', '2.0'],
  explanation: String.raw`$f'(x)=2x$，所以 $f'(1)=2$。`,
  source: '原创',
}
```

## 英语长难句

```js
{
  id: 'eng-025',
  subject: 'english',
  topic: '长难句 · 定语从句',
  type: 'choice',
  passage: 'The evidence, ____ was collected over ten years, suggests a different conclusion.',
  prompt: '选择最恰当的选项补全句子，并先口头翻译全句。',
  options: ['which', 'what', 'that', 'where'],
  answer: 0,
  explanation: '非限制性定语从句用 which，that 不能引导非限制性定语从句。',
  translation: '这些历时十年收集的证据指向一个不同的结论。',
  vocab: [{ word: 'evidence', meaning: 'n. 证据' }],
  source: '原创',
}
```

## 新增内置题

1. 在对应的 `content/*.js` 末尾追加对象。
2. 运行 `npm run validate`。
3. 运行 `npm test`，确认没有破坏排期和内容约束。
4. 如果要新增科目，需要同时修改 `src/lib/subjects.js`、每日设置和统计展示。

## 导入 JSON

格式可以是：

```json
[
  { "id": "custom-001", "subject": "math", "...": "..." }
]
```

也可以包一层：

```json
{ "questions": [ { "id": "custom-001", "...": "..." } ] }
```

导入时会逐题校验；和内置题或已有自定义题重复的 `id` 会被拒绝，不会覆盖。示例见 [`examples/questions.sample.json`](../examples/questions.sample.json)。

## 出题检查清单

- 答案唯一且可验证，选择题的错误选项有明确的干扰理由。
- 解析能指出关键步骤，而不只是重复答案。
- 数学公式用 `$...$`，反斜杠在 JS 里用 `String.raw` 或双反斜杠。
- 英语句子语法正确、语境自然；译文不是逐词硬译。
- 不使用未经授权的真题原文、课程讲义或出版社题目。
- 政治题以当年大纲和权威表述为准，避免把有时效性的时政题写死。
