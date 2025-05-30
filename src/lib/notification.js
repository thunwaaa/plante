import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { API_URL } from './api';

const firebaseConfig = {
  // Your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Helper function to format notification message
const formatNotificationMessage = (reminder) => {
    const { type, plantName, frequency } = reminder;
    let title = '';
    let body = '';

    switch (type) {
        case 'watering':
            title = `🪴 ถึงเวลารดน้ำ ${plantName} แล้ว!`;
            body = frequency === 'once' 
                ? 'ถึงเวลาที่กำหนดไว้สำหรับการรดน้ำแล้ว'
                : frequency === 'daily'
                ? 'ถึงเวลารดน้ำประจำวันแล้ว'
                : 'ถึงเวลารดน้ำประจำสัปดาห์แล้ว';
            break;
        case 'fertilizing':
            title = `🌱 ถึงเวลาใส่ปุ๋ย ${plantName} แล้ว!`;
            body = frequency === 'once'
                ? 'ถึงเวลาที่กำหนดไว้สำหรับการใส่ปุ๋ยแล้ว'
                : frequency === 'daily'
                ? 'ถึงเวลาใส่ปุ๋ยประจำวันแล้ว'
                : 'ถึงเวลาใส่ปุ๋ยประจำสัปดาห์แล้ว';
            break;
        default:
            title = `🔔 การแจ้งเตือนสำหรับ ${plantName}`;
            body = 'ถึงเวลาดูแลต้นไม้ของคุณแล้ว';
    }

    return { title, body };
};

export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });
            
            // Save token to backend
            const response = await fetch(`${API_URL}/api/users/fcm-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ fcmToken: token }),
            });

            if (!response.ok) {
                throw new Error('Failed to save FCM token');
            }

            return token;
        } else {
            throw new Error('Notification permission denied');
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        throw error;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            // Handle both reminder notifications and other notifications
            const { notification, data } = payload;
            
            if (data && data.reminder) {
                // Handle reminder-specific notification
                const reminder = JSON.parse(data.reminder);
                const { title, body } = formatNotificationMessage(reminder);
                
                new Notification(title, {
                    body,
                    icon: '/plantelogo.svg',
                    badge: '/plantelogo.svg',
                    tag: `reminder-${reminder.plantId}`,
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
                    ]
                });
            } else if (notification) {
                // Handle regular notifications
                new Notification(notification.title, {
                    body: notification.body,
                    icon: '/plantelogo.svg',
                    badge: '/plantelogo.svg'
                });
            }
            
            resolve(payload);
        });
});

// Initialize notification handling
export const initializeNotifications = async () => {
    try {
        // Check if the browser supports notifications
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        // Check if permission is already granted
        if (Notification.permission === 'granted') {
            await requestNotificationPermission();
        }
        
        // Handle foreground messages
        onMessageListener().then((payload) => {
            // Handle notification click
            if (payload.data && payload.data.reminder) {
                const reminder = JSON.parse(payload.data.reminder);
                // You can add custom click handling here
                // For example, navigate to the plant detail page
                if (typeof window !== 'undefined') {
                    window.addEventListener('click', (e) => {
                        if (e.target.tagName === 'BUTTON' && e.target.getAttribute('data-action') === 'view') {
                            window.location.href = `/reminder/detail/${reminder.plantId}`;
                        }
                    });
                }
            }
        });
    } catch (error) {
        console.error('Failed to initialize notifications:', error);
    }
}; 