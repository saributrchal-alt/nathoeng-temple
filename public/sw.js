self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      body: event.data ? event.data.text() : ''
    };
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Nathoeng Connect',
      {
        body:
          data.body ||
          'มีข้อความใหม่จากวัดพุทธอุทยานนาเทิง',
        icon: '/icons/nathoeng-connect.svg',
        badge: '/icons/nathoeng-connect-badge.png',
        tag:
          data.tag ||
          'nathoeng-connect-test',
        data: {
          url:
            data.url ||
            '/#practice-messages'
        }
      }
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url ||
      '/#practice-messages',
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then((clients) => {
        for (const client of clients) {
          if ('focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        return self.clients.openWindow(targetUrl);
      })
  );
});
