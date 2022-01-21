const cacheName = 'site-static-v2';
const dynCacheName = 'site-dynamic-v1';
const assets = [
  '/',
  'offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(assets);
    }))
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(key => key != cacheName && dynCacheName)
        .map(key => caches.delete(key)))
    })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cacheRes => {
      return cacheRes || fetch(event.request).then(cacheRes => {
        return caches.open(dynCacheName).then(cache => {
          cache.put(event.request.url, cacheRes.clone());
          return cacheRes;
        })
      })
    }).catch(() => caches.match('offline.html'))
  );
});