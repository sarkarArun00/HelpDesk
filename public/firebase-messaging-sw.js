/* global firebase */

importScripts(
  'https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js',
);

importScripts(
  'https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js',
);

firebase.initializeApp({
  apiKey:
    'AIzaSyAExG4TV6WEADj9gy_Af0nkZ4w988d0bX0',

  authDomain:
    'isd-tickets.firebaseapp.com',

  projectId:
    'isd-tickets',

  storageBucket:
    'isd-tickets.firebasestorage.app',

  messagingSenderId:
    '1089268940329',

  appId:
    '1:1089268940329:web:4b304013e4c200ea5ae638',
});

const messaging =
  firebase.messaging();

messaging.onBackgroundMessage(
  payload => {
    console.log(
      'Background Firebase message:',
      payload,
    );

    /*
     * Firebase automatically displays
     * messages containing a notification
     * payload while the app is in the
     * background.
     */
    if (payload.notification) {
      return;
    }

    const data =
      payload.data || {};

    const title =
      data.title ||
      'NHCPL Helpdesk';

    const body =
      data.body ||
      data.message ||
      'You have a new notification.';

    const ticketId =
      data.ticketId ||
      data.ticket_id ||
      null;

    const targetUrl =
      data.url ||
      (
        ticketId
          ? `/tickets/${ticketId}`
          : '/dashboard'
      );

    const options = {
      body,

      icon:
        '/pwa-icons/icon-192x192.png',

      badge:
        '/pwa-icons/icon-72x72.png',

      tag:
        data.notificationId ||
        data.notification_id ||
        `helpdesk-${Date.now()}`,

      data: {
        url: targetUrl,
        ticketId,
      },
    };

    return self.registration
      .showNotification(
        title,
        options,
      );
  },
);

self.addEventListener(
  'notificationclick',
  event => {
    event.notification.close();

    const targetUrl =
      event.notification.data?.url ||
      '/dashboard';

    event.waitUntil(
      self.clients
        .matchAll({
          type: 'window',
          includeUncontrolled: true,
        })
        .then(windowClients => {
          const absoluteTargetUrl =
            new URL(
              targetUrl,
              self.location.origin,
            ).href;

          for (
            const client of windowClients
          ) {
            if (
              client.url ===
                absoluteTargetUrl &&
              'focus' in client
            ) {
              return client.focus();
            }
          }

          if (windowClients.length) {
            const client =
              windowClients[0];

            return client
              .navigate(absoluteTargetUrl)
              .then(() =>
                client.focus(),
              );
          }

          return self.clients
            .openWindow(
              absoluteTargetUrl,
            );
        }),
    );
  },
);