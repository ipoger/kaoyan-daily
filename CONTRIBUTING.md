# Contributing

欢迎修错题、补解析、加题库、改交互。这个项目优先保持小而清楚：每天打开、做完四题、看到解析，不需要注册。

## 开发

```bash
npm ci
npm run dev
npm test
npm run validate
npm run build
```

Node.js 20+。

## 提交题目

- 按 [`content/README.md`](content/README.md) 的字段写。
- 题目必须可验证、答案唯一；选择题的干扰项要有理由。
- 解析写关键步骤，不要只重复答案。
- 不提交未经授权的真题原文、课程讲义或出版社内容。
- 一次 PR 尽量只做一件事：修一道题、加一组题、或改一个功能。

## 修 bug

请附上：

- 复现步骤；
- 期望结果和实际结果；
- 浏览器 / 系统；
- 如果是排期或判分问题，附上当天的 `localStorage` 备份（设置页可以导出）。

## 代码约定

- 不引入后端和第三方统计。
- 学习数据只写 `localStorage`。
- 题库内容必须经过 `src/lib/schema.js` 校验。
- 新增交互尽量保持键盘可用，并照顾移动端。
- 提交前跑 `npm test && npm run build`。

## License

提交即表示同意以 MIT 许可证发布你的代码与题目内容。
