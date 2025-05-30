importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyD48TYOAwvyHExo1yQQFONa1wUnzDqMsEU',
  authDomain: 'plante-15bba.firebaseapp.com',
  projectId: 'plante-15bba',
  storageBucket: 'plante-15bba.appspot.com',
  messagingSenderId: '55778410067',
  appId: '1:55778410067:web:dc8c9ef00db565fe7c50a6'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/plantelogo.svg',
    badge: '/plantelogo.svg',
    tag: payload.data?.reminderId || 'default',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'ดูรายละเอียด'
      },
      {
        action: 'dismiss',
        title: 'ปิด'
      }
    ],
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view' && event.notification.data?.reminderId) {
    // Open the reminder detail page
    const reminderId = event.notification.data.reminderId;
    event.waitUntil(
      clients.openWindow(`/reminder/detail/${reminderId}`)
    );
  }
});
