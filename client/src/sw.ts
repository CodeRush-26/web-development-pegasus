/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// This will be replaced by workbox-build during build step
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Fleet Command Alert';
    const options = {
      body: data.body || 'New operational update received.',
      icon: 'https://cdn-icons-png.flaticon.com/512/913/913264.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/913/913264.png',
      data: {
        url: data.url || '/'
      },
      vibrate: [200, 100, 200, 100, 200, 100, 200]
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    console.error('Error parsing push data', e);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url;
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, just focus it.
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
