/* 日程 · 离线缓存。改了文件就把版本号 +1 */
const CACHE = 'desk-schedule-v3';
const FILES = ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  // 用 cache:'reload' 绕开 HTTP 缓存 —— 不然 GitHub Pages 那 10 分钟的缓存
  // 会让手机装上新 SW、却缓存回旧的 index.html
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(FILES.map(f => fetch(f, { cache: 'reload' })
      .then(r => c.put(f, r)))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true })
      .then(hit => hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => { });
        return res;
      }).catch(() => caches.match('index.html')))
  );
});
