// SW bem simples: cache do shell (HTML/manifest/ícones). O conteúdo do iframe (GAS) fica sempre online.
const CACHE = "estoque-headset-shell-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first para o HTML (melhor atualização), cache-first para assets.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const isAsset = ASSETS.some(a => url.pathname.endsWith(a.replace("./","/")));
  if (isAsset) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  } else if (url.pathname.endsWith("/") || url.pathname.endsWith("/index.html")) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request))
    );
  }
});
