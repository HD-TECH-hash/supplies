// service-worker.js
const CACHE_VERSION = "v1-boot-clean";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Não intercepta chamadas ao GAS
  if (url.hostname.endsWith("script.google.com") || url.hostname.endsWith("googleusercontent.com")) {
    return;
  }

  // Cache-first para os assets locais
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(resp => {
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, copy));
          return resp;
        });
      })
    );
  }
});