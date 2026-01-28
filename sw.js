const CACHE_NAME = 'jp-gojuon-v1';

const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
];

// 安裝時：快取所有必要檔案
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// 啟用時：清除舊快取（版本更新用）
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        )
    );
});

// 攔截請求：優先使用快取
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(res => {
            return res || fetch(event.request);
        })
    );
});