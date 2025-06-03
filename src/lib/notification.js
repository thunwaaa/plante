import app from './firebase';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { API_URL } from './api';

// Initialize messaging only on client side
let messaging = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
  }
}

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
    if (typeof window === 'undefined' || !messaging) {
        console.warn('Firebase Messaging is not available');
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });
            
            if (!token) {
                throw new Error('Failed to get FCM token');
            }

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
                throw new Error('Failed to save FCM token to backend');
            }

            console.log('FCM token saved successfully');
            return token;
        } else {
            console.warn('Notification permission denied');
            return null;
        }
    } catch (error) {
        console.error('Error in requestNotificationPermission:', error);
        return null;
    }
};

export const onMessageListener = () => {
    if (typeof window === 'undefined' || !messaging) {
        console.warn('Firebase Messaging is not available');
        return Promise.resolve(null);
    }

    return new Promise((resolve) => {
        try {
            onMessage(messaging, (payload) => {
                console.log('Received foreground message:', payload);
                
                // Handle both reminder notifications and other notifications
                const { notification, data } = payload;
                
                if (data && data.reminder) {
                    let reminder = null;
                    try {
                        reminder = typeof data.reminder === 'string' ? JSON.parse(data.reminder) : data.reminder;
                    } catch (e) {
                        console.error('Invalid reminder JSON:', data.reminder, e);
                        return;
                    }

                    const { title, body } = formatNotificationMessage(reminder);
                    
                    // Create notification
                    const notificationOptions = {
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
                    };

                    try {
                        const notification = new Notification(title, notificationOptions);
                        console.log('Notification created successfully');
                        
                        // Handle notification click
                        notification.onclick = (event) => {
                            event.preventDefault();
                            if (event.action === 'view') {
                                window.location.href = `/reminder/detail/${reminder.plantId}`;
                            }
                            notification.close();
                        };
                    } catch (error) {
                        console.error('Error creating notification:', error);
                    }
                } else if (notification) {
                    // Handle regular notifications
                    try {
                        new Notification(notification.title, {
                            body: notification.body,
                            icon: '/plantelogo.svg',
                            badge: '/plantelogo.svg'
                        });
                    } catch (error) {
                        console.error('Error creating regular notification:', error);
                    }
                }
                
                resolve(payload);
            });
        } catch (error) {
            console.error('Error setting up message listener:', error);
            resolve(null);
        }
    });
};

// Initialize notification handling
export const initializeNotifications = async () => {
    if (typeof window === 'undefined') {
        console.log('Skipping notification initialization on server side');
        return;
    }

    try {
        // Check if the browser supports notifications
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        // Check if permission is already granted
        if (Notification.permission === 'granted') {
            const token = await requestNotificationPermission();
            if (token) {
                console.log('Notifications initialized successfully');
            }
        } else if (Notification.permission !== 'denied') {
            // If permission is not denied, request it
            const token = await requestNotificationPermission();
            if (token) {
                console.log('Notifications initialized successfully after permission request');
            }
        }
        
        // Handle foreground messages
        onMessageListener().catch(error => {
            console.error('Error in message listener:', error);
        });
    } catch (error) {
        console.error('Failed to initialize notifications:', error);
    }
}; 