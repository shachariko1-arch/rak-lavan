/* Yalla English – offline cache */
const CACHE = 'yalla-english-v5';
const FILES = ['./', 'index.html', 'css/app.css', 'js/config.js', 'js/data.js', 'js/core.js', 'js/lesson.js', 'js/screens.js', 'js/ai.js', 'js/app.js',
  'assets/logo.jpg', 'assets/art/hero.jpg', 'assets/art/cafe.jpg', 'assets/art/sabi-headphones.jpg', 'assets/art/coffee.jpg', 'assets/art/skyline.jpg', 'assets/art/london.jpg', 'assets/icon-192.png', 'assets/icon-512.png', 'manifest.webmanifest'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// network first, so updates show up immediately; cache is the offline fallback
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((res) => {
    const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res;
  }).catch(() => caches.match(e.request).then((r) => r || caches.match('index.html'))));
});
