import webpush from 'web-push';
import crypto from 'crypto';

// In a real app, these should be generated once and stored in .env
// For this MVP, we generate them dynamically if not provided, but this means
// subscriptions will invalidate on server restart. That is acceptable for an MVP demo.
const vapidKeys = process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
  ? { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY }
  : webpush.generateVAPIDKeys();

webpush.setVapidDetails(
  'mailto:admin@fleetcommand.local',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export const getPublicKey = () => vapidKeys.publicKey;

// In-memory store for subscriptions for the MVP
const subscriptions = new Map();

export const saveSubscription = (userId, subscription) => {
  let userSubs = subscriptions.get(userId) || [];
  // Basic deduplication
  const exists = userSubs.find(s => s.endpoint === subscription.endpoint);
  if (!exists) {
    userSubs.push(subscription);
    subscriptions.set(userId, userSubs);
  }
};

export const sendPushNotification = async (userId, payload) => {
  const userSubs = subscriptions.get(userId);
  if (!userSubs || userSubs.length === 0) return;

  const notifications = userSubs.map(sub => 
    webpush.sendNotification(sub, JSON.stringify(payload))
      .catch(err => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription expired or invalid
          console.log('Subscription has expired or is no longer valid');
        } else {
          console.error('Error sending push notification:', err);
        }
      })
  );

  await Promise.all(notifications);
};

export const broadcastPushNotification = async (payload) => {
  const allNotifications = [];
  
  for (const [userId, userSubs] of subscriptions.entries()) {
    userSubs.forEach(sub => {
      allNotifications.push(
        webpush.sendNotification(sub, JSON.stringify(payload)).catch(() => {})
      );
    });
  }

  await Promise.all(allNotifications);
};
