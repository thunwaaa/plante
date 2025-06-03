importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyD48TYOAwvyHExo1yQQFONa1wUnzDqMsEU',
  authDomain: 'plante-15bba.firebaseapp.com',
  projectId: 'plante-15bba',
  storageBucket: 'plante-15bba.appspot.com',
  messagingSenderId: '55778410067',
  appId: '1:55778410067:web:dc8c9ef00db565fe7c50a6',
  // Add your VAPID key here
  vapidKey: 'YOUR_VAPID_KEY_HERE' // Replace with your actual VAPID key
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  try {
    // Get notification data
    const notificationTitle = payload.notification?.title || 'แจ้งเตือนจาก Plante';
    const notificationBody = payload.notification?.body || 'มีแจ้งเตือนใหม่สำหรับคุณ';
    const reminderId = payload.data?.reminderId || payload.data?.plantId;

    // Create notification options
    const notificationOptions = {
      body: notificationBody,
      icon: '/plantelogo.svg',
      badge: '/plantelogo.svg',
      tag: reminderId ? `reminder-${reminderId}` : 'default',
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
      data: payload.data || {}
    };

    // Show notification
    self.registration.showNotification(notificationTitle, notificationOptions)
      .then(() => {
        console.log('[firebase-messaging-sw.js] Notification shown successfully');
      })
      .catch(error => {
        console.error('[firebase-messaging-sw.js] Error showing notification:', error);
      });

  } catch (error) {
    console.error('[firebase-messaging-sw.js] Error handling background message:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  // Close the notification
  event.notification.close();

  // Handle different actions
  if (event.action === 'view') {
    const reminderId = event.notification.data?.reminderId || event.notification.data?.plantId;
    if (reminderId) {
      // Open the reminder detail page
      event.waitUntil(
        clients.openWindow(`/reminder/detail/${reminderId}`)
          .catch(error => {
            console.error('[firebase-messaging-sw.js] Error opening window:', error);
          })
      );
    }
  }
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker installed');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activated');
  event.waitUntil(clients.claim());
});
