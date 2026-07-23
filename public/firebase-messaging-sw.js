/* global firebase */

importScripts(
  'https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js',
);

importScripts(
  'https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js',
);
        
firebase.initializeApp({
  apiKey: 'AIzaSyAExG4TV6WEADj9gy_Af0nkZ4w988d0bX0',
  authDomain: 'isd-tickets.firebaseapp.com',
  projectId: 'isd-tickets',
  storageBucket: 'isd-tickets.firebasestorage.app',
  messagingSenderId:
    '1089268940329',
  appId: '1:1089268940329:web:4b304013e4c200ea5ae638',
});



const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  // Firebase automatically displays messages that include
  // a notification payload. Only manually display data-only
  // messages to avoid duplicate notifications.
  if (payload.notification) {
    return;
  }

  const title =
    payload.data?.title ||
    'Nirnayan Service Desk';

  const options = {
    body:
      payload.data?.body ||
      'You have a new ticket notification.',

    icon:
      '/icons/icon-192x192.png',

    badge:
      '/icons/icon-72x72.png',

    data: {
      url:
        payload.data?.url ||
        payload.data?.ticket_id
          ? `/tickets/${payload.data.ticket_id}`
          : '/dashboard',
    },
  };

  return self.registration
    .showNotification(
      title,
      options,
    );
});

self.addEventListener(
  'notificationclick',
  event => {
    event.notification.close();

    const targetUrl =
      event.notification.data?.url ||
      '/dashboard';

    event.waitUntil(
      clients
        .matchAll({
          type: 'window',
          includeUncontrolled: true,
        })
        .then(windowClients => {
          for (
            const client of windowClients
          ) {
            if (
              'focus' in client
            ) {
              client.navigate(targetUrl);
              return client.focus();
            }
          }

          return clients.openWindow(
            targetUrl,
          );
        }),
    );
  },
);