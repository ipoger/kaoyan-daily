#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('dist')
if (!fs.existsSync(root)) {
  console.error('dist/ 不存在，请先运行 vite build。')
  process.exit(1)
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

const files = walk(root)
  .map((file) => `./${path.relative(root, file).split(path.sep).join('/')}`)
  .filter((file) => !file.endsWith('/sw.js') && !file.endsWith('/precache-manifest.json'))
  .sort()

fs.writeFileSync(
  path.join(root, 'precache-manifest.json'),
  `${JSON.stringify(files, null, 2)}\n`,
)

const swPath = path.join(root, 'sw.js')
if (fs.existsSync(swPath)) {
  const version = Date.now().toString(36)
  const source = fs.readFileSync(swPath, 'utf8').replaceAll('__BUILD_VERSION__', version)
  fs.writeFileSync(swPath, source)
}

console.log(`离线清单：${files.length} 个文件`)
