// Service Worker for Push Notifications
// This service worker handles push notifications and notification clicks

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let notificationData = {
    title: 'New Notification',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        data: payload.data || {},
      };
    } catch (error) {
      console.error('Failed to parse push notification data:', error);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    data: notificationData.data,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'view',
        title: 'View',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
    requireInteraction: false,
    tag: notificationData.data.id || 'notification',
  };

  event.waitUntil(self.registration.showNotification(notificationData.title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Determine URL to open based on notification data
  let urlToOpen = '/';

  if (event.notification.data) {
    const { type, id, url } = event.notification.data;

    if (url) {
      urlToOpen = url;
    } else if (type === 'message') {
      urlToOpen = `/messages/${id}`;
    } else if (type === 'forum') {
      urlToOpen = `/forum/${id}`;
    } else if (type === 'course') {
      urlToOpen = `/courses/${id}`;
    }
  }

  // Focus or open window
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window if none found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification);
  // Track notification dismissal if needed
});

// Handle background sync (optional)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event);

  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  // Sync notifications with server when online
  try {
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      console.log('Notifications synced successfully');
    }
  } catch (error) {
    console.error('Failed to sync notifications:', error);
  }
}
