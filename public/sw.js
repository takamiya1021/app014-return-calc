// シンプルなService Worker
const CACHE_NAME = 'investment-calculator-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.svg'
];

// インストール時のキャッシュ設定
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチイベントでキャッシュファーストの戦略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュがあればキャッシュから、なければネットワークから
        return response || fetch(event.request);
      })
  );
});