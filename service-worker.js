// 缓存版本号，更新代码修改此数字即可刷新缓存
const CACHE_VER = "AnsonCRM-PWA-v2.0.0";
// 需要离线缓存的静态资源
const CACHE_FILES = [
  "./index.html",
  "./manifest.json"
];

// 安装SW，预缓存文件
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VER).then((cache) => {
      return cache.addAll(CACHE_FILES);
    }).then(() => self.skipWaiting())
  );
});

// 激活时清理旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_VER)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截请求，优先离线缓存，无缓存走网络
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      return cacheRes || fetch(event.request);
    })
  );
});