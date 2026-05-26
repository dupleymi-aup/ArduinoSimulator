const filesToCache = [
  "ArduinoEditor.js",
  "ArduinoSimulator.json",
  "ArduinoSimulator.svg",
  "ArduinoSimulatorFavIcon_192x192.png",
  "ArduinoSimulatorFavIcon_512x512.png",
  "ArduinoSimulatorInterpreter.min.js",
  "index.html",
]

// Use a versioned cache name — update this to bust the cache on deploy
const CACHE_VERSION = "v2"
const staticCacheName = "ArduinoSimulator-" + CACHE_VERSION

// eslint-disable-next-line no-restricted-globals
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      return cache.addAll(filesToCache)
    })
  )
  // Force the new service worker to activate immediately
  // eslint-disable-next-line no-restricted-globals
  self.skipWaiting()
})

// eslint-disable-next-line no-restricted-globals
self.addEventListener("activate", (event) => {
  // Delete old caches to free up space and prevent stale files
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name.startsWith("ArduinoSimulator-") && name !== staticCacheName)
          .map((name) => caches.delete(name))
      )
    )
  )
  // eslint-disable-next-line no-restricted-globals
  return self.clients.claim()
})

// eslint-disable-next-line no-restricted-globals
self.addEventListener("fetch", (event) => {
  const url = event.request.url
  // For JS bundles, always fetch from network first to get latest code
  if (url.endsWith(".js") || url.endsWith(".js?")) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Update cache with fresh response
          const responseClone = networkResponse.clone()
          caches.open(staticCacheName).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return networkResponse
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(event.request)
        })
    )
    return
  }

  // For other assets, use cache-first strategy
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request)
      })
      .catch(() => {})
  )
})
