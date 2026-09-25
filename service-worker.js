const CACHE_NAME='tbpg-isg-shell-v21';
const SHELL=[
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  const url=new URL(req.url);

  // Sadece GitHub Pages uygulama kabuğunu cache'le.
  // Apps Script/Google verileri cross-origin ve canlı bağlantı gerektirir.
  if(url.origin===self.location.origin){
    event.respondWith(
      caches.match(req).then(cached=>{
        const fresh=fetch(req).then(res=>{
          if(res && res.ok){
            const copy=res.clone();
            caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));
          }
          return res;
        }).catch(()=>cached);
        return cached || fresh;
      })
    );
  }
});
