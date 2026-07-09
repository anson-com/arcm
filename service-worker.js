// 缓存版本号，更新页面/图标代码时修改数字刷新缓存
const CACHE_VER = "AnsonCRMv2.0.0";
// 离线必须缓存的核心本地文件
const CACHE_FILES = [
  "./index.html",
  "./manifest.json"
];

// 安装：预缓存核心文件到本地浏览器
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VER).then((cache) => {
      return cache.addAll(CACHE_FILES);
    }).then(() => self.skipWaiting())
  );
});

// 激活：自动清理旧版本缓存，不占用本地空间
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

// 离线请求拦截策略：优先本地缓存，断网自动兜底首页
self.addEventListener("fetch", (event) => {
  const req = event.request;
  // 所有POST提交操作（保存客户、改密码等）直接走原生逻辑，不缓存
  if (req.method !== "GET") return;
  // 只缓存本地同源文件，外部在线字体、图标不参与缓存
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cacheRes) => {
      // 有本地缓存直接打开；无缓存尝试联网；完全断网返回缓存首页保证可用
      return cacheRes || fetch(req).catch(() => caches.match("./index.html"));
    })
  );
});
