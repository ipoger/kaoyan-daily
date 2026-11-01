# 讲义目录

学习页的「讲义」来自这里。每章是一个 `.md` 文件，由 `content/materials/*.js` 中的清单引入。

## 新增一章

1. 在对应科目目录下新建 Markdown，例如 `math/derivative-applications.md`。
2. 在 `content/materials/math.js` 中 `import` 它：

```js
import derivativeApplications from './math/derivative-applications.md?raw'
```

3. 在数组里追加元数据：

```js
{
  id: 'derivative-applications',
  subject: 'math',
  order: 5,
  title: '导数应用',
  summary: '单调性、极值、最值与不等式证明。',
  topics: ['导数与微分'],
  books: ['同济《高等数学》'],
  video: { title: '武忠祥 · 高数', kind: 'bilibili', query: '武忠祥 导数应用' },
  body: derivativeApplications,
}
```

4. 运行 `npm run dev` 查看页面，运行 `npm test && npm run build` 确认构建。

## 约定

- 讲义正文用 Markdown，标题从 `#` 开始；页面会自动去掉正文第一个一级标题，使用清单里的 `title`。
- 公式用 `$...$` / `$$...$$`，渲染时会先保护公式，避免 Markdown 误解析。
- `topics` 必须与题库里的 `topic` 完全一致，讲义页的“练相关题”才能命中。
- `video` 只存搜索入口，不直接托管视频。`kind` 支持 `bilibili` 和 `web`。
- `books` 只列书名，不提供电子书或扫描件。
- 讲义为原创整理；引用教材观点时请自己核对版本和表述。
