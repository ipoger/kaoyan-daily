/* 研途离线缓存：构建时生成 precache-manifest.json，并在发布时替换版本号。 */
const CACHE = 'yantu-shell-__BUILD_VERSION__'
const SHELL = ['./', './index.html']

async function precache() {
  const cache = await caches.open(CACHE)
  await cache.addAll(SHELL)
  const response = await fetch('./precache-manifest.json', { cache: 'reload' })
  if (!response.ok) throw new Error('precache manifest unavailable')
  const files = await response.json()
  await cache.addAll(files)
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put('./index.html', copy))
          return response
        })
        .catch(() => caches.match('./index.html', { ignoreVary: true }).then((cached) => cached || caches.match('./', { ignoreVary: true }))),
    )
    return
  }

  event.respondWith(
    caches.match(request, { ignoreVary: true }).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(request, copy))
        return response
      })
    }),
  )
})
