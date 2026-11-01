import { defineConfig } from 'vite'

// GitHub Pages 项目站点部署在 /<repo>/ 下，由 Action 传入 BASE_PATH。
// 本地开发与自定义域名部署时默认使用根路径。
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 650,
  },
})
