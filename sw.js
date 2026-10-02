const CACHE_NAME = "timetable-v0.4.4-trial";

const ASSETS = [
    "./",
    "index.html",
    "timetable.js",
    "manifest.json",
    "icon-192.png",
    "icon-512.png",
    "paper-menu.css",
    "paper-menu.js",
    "paper/2027_timetable_static.html",
    "paper/2027_timetable_scroll.html",
    "paper/2027_timetable_en.html"
];

self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );

    self.skipWaiting();

});

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys =>

            Promise.all(

                keys.map(key => {

                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }

                })

            )

        )

    );

    self.clients.claim();

});

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(response => response || fetch(event.request))

    );

});
