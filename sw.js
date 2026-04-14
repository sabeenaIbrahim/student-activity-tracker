const CACHE_NAME = "activity-tracker-v1";
const urlsToCache = [
    "./",
    "./index.html",
    "./activities.html",
    "./profile.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./favicon.ico",
    "./images/Google.png",
    "./images/ChatGPT.png",
    "./images/icon-192.png",
    "./images/icon-512.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames.map((cacheName) => {
                if (cacheName !== CACHE_NAME) {
                    return caches.delete(cacheName);
                }

                return Promise.resolve();
            })
        ))
    );
    self.clients.claim();
});

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
