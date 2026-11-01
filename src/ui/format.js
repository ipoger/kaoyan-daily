import renderMathInElement from 'katex/contrib/auto-render'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 极简 Markdown：只支持 **加粗**、`行内代码` 和换行。
 * 先转义 HTML，再把纯文本写回 DOM，用户导入的题库不会注入脚本。
 */
export function rich(value) {
  let text = escapeHTML(value)
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>')
  text = text.replace(/\n/g, '<br>')
  return text
}

export function renderMath(root) {
  if (!root) return
  try {
    renderMathInElement(root, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
      ],
      throwOnError: false,
      strict: false,
      trust: false,
    })
  } catch (error) {
    console.warn('公式渲染失败', error)
  }
}

export function pct(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`
}

export function preview(text, length = 96) {
  const plain = String(text || '')
    .replace(/\$\$[\s\S]*?\$\$/g, '［公式］')
    .replace(/\$[^$]*\$/g, '［公式］')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > length ? `${plain.slice(0, length)}…` : plain
}

export function difficultyDots(level = 2) {
  return Array.from({ length: 3 }, (_, index) => (index < level ? '●' : '○')).join('')
}

export function initials(name) {
  return String(name || '?').slice(0, 1)
}


/** 讲义 Markdown → 安全 HTML。公式仍由 renderMath() 统一渲染。 */
export function renderMarkdown(markdown) {
  // 先把公式抽成占位符，避免 Markdown 把 x_1 之类解析成强调。
  const formulas = []
  const protectedText = String(markdown || '').replace(/\$\$[\s\S]*?\$\$|\$[^$\n]*\$/g, (formula) => {
    formulas.push(formula)
    return `YANTUMATHPLACEHOLDER${formulas.length - 1}TOKEN`
  })
  let html = marked.parse(protectedText, { gfm: true, breaks: false })
  html = html.replace(/YANTUMATHPLACEHOLDER(\d+)TOKEN/g, (_, index) => formulas[Number(index)] || '')
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  })
}
