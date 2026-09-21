self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Phase 2A only: service worker is installed so the browser can create
// a PushSubscription. No push handler is enabled in this phase.
