// import firestore from '@react-native-firebase/firestore';
// import { AuthorizationStatus, getInitialNotification, getMessaging, getToken, onMessage, onNotificationOpenedApp, onTokenRefresh, requestPermission, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
// import * as Notifications from 'expo-notifications';
// import { Platform } from 'react-native';
// import { UserService } from './firestore';

// // Configure how notifications should be handled when app is in foreground
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

// export const NotificationService = {
//   /**
//    * Request notification permissions for iOS and Android
//    */
//   requestUserPermission: async (): Promise<boolean> => {
//     if (Platform.OS === 'ios') {
//       const messaging = getMessaging();
//       const authStatus = await requestPermission(messaging);
//       const enabled =
//         authStatus === AuthorizationStatus.AUTHORIZED ||
//         authStatus === AuthorizationStatus.PROVISIONAL;

//       if (enabled) {
//         console.log('✅ iOS notification permission granted:', authStatus);
//       } else {
//         console.log('⚠️ iOS notification permission denied');
//       }
//       return enabled;
//     } else {
//       // Android 13+ requires permission

//       const { status: existingStatus } = await Notifications.getPermissionsAsync();
//       let finalStatus = existingStatus;

//       if (existingStatus !== 'granted') {
//         const { status } = await Notifications.requestPermissionsAsync();
//         finalStatus = status;
//       }

//       const granted = finalStatus === 'granted';
//       console.log(granted ? '✅ Android notification permission granted' : '⚠️ Android notification permission denied');
//       return granted;
//     }
//   },

//   /**
//    * Get FCM token and save to Firestore
//    */
//   registerDeviceForNotifications: async (userId: string): Promise<string | null> => {
//     try {
//       // Request permission first
//       const hasPermission = await NotificationService.requestUserPermission();
//       if (!hasPermission) {
//         console.warn('⚠️ Notification permission not granted');
//         return null;
//       }

//       // Create multiple notification channels for Android with high priority
//       if (Platform.OS === 'android') {
//         // Default channel for general notifications
//         await Notifications.setNotificationChannelAsync('default', {
//           name: 'Default Notifications',
//           importance: Notifications.AndroidImportance.MAX,
//           vibrationPattern: [0, 250, 250, 250],
//           lightColor: '#FF231F7C',
//           sound: 'default',
//           enableVibrate: true,
//           showBadge: true,
//           enableLights: true,
//         });

//         // High priority channel for chat messages
//         await Notifications.setNotificationChannelAsync('fcm_default_channel', {
//           name: 'Chat Notifications',
//           description: 'Notifications for new chat messages',
//           importance: Notifications.AndroidImportance.MAX,
//           vibrationPattern: [0, 250, 250, 250],
//           lightColor: '#FF231F7C',
//           sound: 'default',
//           enableVibrate: true,
//           showBadge: true,
//           enableLights: true,
//           lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
//         });

//         console.log('✅ Android notification channels created');
//       }

//       // Get FCM token
//       const messaging = getMessaging();
//       const fcmToken = await getToken(messaging);
//       console.log('📱 FCM Token:', fcmToken);

//       // Save token to Firestore
//       if (fcmToken && userId) {
//         await UserService.updateProfile(userId, {
//           fcmToken,
//           lastTokenUpdate: firestore.Timestamp.now(),
//         });
//         console.log('✅ FCM token saved to Firestore');
//       }

//       return fcmToken;
//     } catch (error) {
//       console.error('❌ Error registering device for notifications:', error);
//       return null;
//     }
//   },

//   /**
//    * Listen for token refresh
//    */
//   onTokenRefresh: (userId: string) => {
//     const messaging = getMessaging();
//     return onTokenRefresh(messaging, async (fcmToken) => {
//       console.log('🔄 FCM Token refreshed:', fcmToken);
//       if (userId) {
//         await UserService.updateProfile(userId, {
//           fcmToken,
//           lastTokenUpdate: firestore.Timestamp.now(),
//         });
//       }
//     });
//   },

//   /**
//    * Handle foreground messages
//    */
//   onMessageReceived: (callback: (message: any) => void) => {
//     const messaging = getMessaging();
//     return onMessage(messaging, async (remoteMessage) => {
//       console.log('📬 Foreground notification received:', remoteMessage);

//       // Display local notification when app is in foreground
//       if (remoteMessage.notification) {
//         await Notifications.scheduleNotificationAsync({
//           content: {
//             title: remoteMessage.notification.title || 'New Message',
//             body: remoteMessage.notification.body || '',
//             data: remoteMessage.data,
//             sound: true,
//             priority: Notifications.AndroidNotificationPriority.MAX,
//             vibrate: [0, 250, 250, 250],
//           },
//           trigger: null, // Show immediately
//         });
//       }

//       callback(remoteMessage);
//     });
//   },

//   /**
//    * Handle notification when app is opened from background/killed state
//    */
//   getInitialNotification: async () => {
//     const messaging = getMessaging();
//     const remoteMessage = await getInitialNotification(messaging);
//     if (remoteMessage) {
//       console.log('📱 App opened from notification:', remoteMessage);
//       return remoteMessage;
//     }
//     return null;
//   },

//   /**
//    * Handle notification tap when app is in background
//    */
//   onNotificationOpenedApp: (callback: (message: any) => void) => {
//     const messaging = getMessaging();
//     return onNotificationOpenedApp(messaging, (remoteMessage) => {
//       console.log('📱 Notification opened app from background:', remoteMessage);
//       callback(remoteMessage);
//     });
//   },

//   /**
//    * Set background message handler (must be called outside of component)
//    */
//   setBackgroundMessageHandler: () => {
//     const messaging = getMessaging();
//     setBackgroundMessageHandler(messaging, async (remoteMessage) => {
//       console.log('📬 Background notification received:', remoteMessage);
//       // Handle background notification here if needed
//     });
//   },

//   /**
//    * Handle notification tap/press
//    */
//   addNotificationResponseListener: (
//     callback: (response: Notifications.NotificationResponse) => void
//   ) => {
//     return Notifications.addNotificationResponseReceivedListener(callback);
//   },

//   /**
//    * Handle notification received while app is in foreground
//    */
//   addNotificationReceivedListener: (
//     callback: (notification: Notifications.Notification) => void
//   ) => {
//     return Notifications.addNotificationReceivedListener(callback);
//   },

//   /**
//    * Schedule a local notification
//    */
//   scheduleLocalNotification: async (
//     title: string,
//     body: string,
//     trigger?: Notifications.NotificationTriggerInput
//   ): Promise<string> => {
//     const id = await Notifications.scheduleNotificationAsync({
//       content: {
//         title,
//         body,
//         sound: true,
//       },
//       trigger: trigger || null,
//     });
//     return id;
//   },

//   /**
//    * Cancel all scheduled notifications
//    */
//   cancelAllNotifications: async (): Promise<void> => {
//     await Notifications.cancelAllScheduledNotificationsAsync();
//   },

//   /**
//    * Get notification badge count
//    */
//   getBadgeCount: async (): Promise<number> => {
//     return await Notifications.getBadgeCountAsync();
//   },

//   /**
//    * Set notification badge count
//    */
//   setBadgeCount: async (count: number): Promise<void> => {
//     await Notifications.setBadgeCountAsync(count);
//   },
// };

// export default NotificationService;











//TODO: V2


// services/NotificationService.ts

import firestore from '@react-native-firebase/firestore';
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { UserService } from './firestore';

// ✅ IMPORTANT: Define channel ID in ONE place
const NOTIFICATION_CHANNEL_ID = 'chat_messages';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  /**
   * ✅ NEW: Initialize notification channels early
   * Call this as soon as app starts (before any notification arrives)
   */
  initializeChannels: async (): Promise<void> => {
    if (Platform.OS === 'android') {
      try {
        // Create the main notification channel
        await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
          name: 'Chat Messages',
          description: 'Notifications for new chat messages',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
          enableLights: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: true, // Bypass Do Not Disturb
        });

        // Also create a fallback default channel
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default Notifications',
          description: 'General notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });

        console.log('✅ Android notification channels created');

        // Log all channels for debugging
        const channels = await Notifications.getNotificationChannelsAsync();
        console.log('📋 Available channels:', channels?.map(c => c.id));
      } catch (error) {
        console.error('❌ Error creating channels:', error);
      }
    }
  },

  /**
   * Request notification permissions for iOS and Android
   */
  requestUserPermission: async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      const messaging = getMessaging();
      const authStatus = await requestPermission(messaging);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ iOS notification permission granted:', authStatus);
      } else {
        console.log('⚠️ iOS notification permission denied');
      }
      return enabled;
    } else {
      // Android 13+ requires permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const granted = finalStatus === 'granted';
      console.log(
        granted
          ? '✅ Android notification permission granted'
          : '⚠️ Android notification permission denied'
      );
      return granted;
    }
  },

  /**
   * Get FCM token and save to Firestore
   */
  registerDeviceForNotifications: async (userId: string): Promise<string | null> => {
    try {
      // ✅ STEP 1: Create channels FIRST (before requesting permission)
      await NotificationService.initializeChannels();

      // STEP 2: Request permission
      const hasPermission = await NotificationService.requestUserPermission();
      if (!hasPermission) {
        console.warn('⚠️ Notification permission not granted');
        return null;
      }

      // STEP 3: Get FCM token
      const messaging = getMessaging();
      const fcmToken = await getToken(messaging);
      console.log('📱 FCM Token:', fcmToken);

      // Get Device Push Token
      let deviceToken = null;
      try {
        const tokenResult = await Notifications.getDevicePushTokenAsync();
        deviceToken = tokenResult.data;
        console.log('📱 Device Token:', deviceToken);
      } catch (e) {
        console.warn('⚠️ Could not get device token:', e);
      }

      // STEP 4: Save token to Firestore with retry logic
      if (fcmToken && userId) {
        // Retry logic in case user document is still being created
        let retries = 3;
        let saved = false;

        while (retries > 0 && !saved) {
          try {
            await UserService.updateProfile(userId, {
              fcmToken,
              deviceToken,
              devicePlatform: Platform.OS,
              lastTokenUpdate: firestore.Timestamp.now(),
            });
            console.log('✅ FCM and Device tokens saved to Firestore');
            saved = true;
          } catch (error: any) {
            retries--;
            if (error.code === 'firestore/not-found' && retries > 0) {
              console.log(`⏳ User document not ready, retrying... (${retries} attempts left)`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            } else {
              throw error; // Re-throw if not a not-found error or no retries left
            }
          }
        }
      }

      return fcmToken;
    } catch (error) {
      console.error('❌ Error registering device for notifications:', error);
      return null;
    }
  },

  /**
   * Listen for token refresh
   */
  onTokenRefresh: (userId: string) => {
    const messaging = getMessaging();
    return onTokenRefresh(messaging, async (fcmToken) => {
      console.log('🔄 FCM Token refreshed:', fcmToken);
      if (userId) {
        await UserService.updateProfile(userId, {
          fcmToken,
          lastTokenUpdate: firestore.Timestamp.now(),
        });
      }
    });
  },

  /**
   * Handle foreground messages
   */
  onMessageReceived: (callback: (message: any) => void) => {
    const messaging = getMessaging();
    return onMessage(messaging, async (remoteMessage) => {
      console.log('📬 Foreground notification received:', remoteMessage);

      // Display local notification when app is in foreground
      if (remoteMessage.notification) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification.title || 'New Message',
            body: remoteMessage.notification.body || '',
            data: remoteMessage.data,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            vibrate: [0, 250, 250, 250],
          },
          trigger: {
            channelId: NOTIFICATION_CHANNEL_ID, // ✅ Use the same channel
          } as any,
        });
      }

      callback(remoteMessage);
    });
  },

  /**
   * Handle notification when app is opened from background/killed state
   */
  getInitialNotification: async () => {
    const messaging = getMessaging();
    const remoteMessage = await getInitialNotification(messaging);
    if (remoteMessage) {
      console.log('📱 App opened from notification:', remoteMessage);
      return remoteMessage;
    }
    return null;
  },

  /**
   * Handle notification tap when app is in background
   */
  onNotificationOpenedApp: (callback: (message: any) => void) => {
    const messaging = getMessaging();
    return onNotificationOpenedApp(messaging, (remoteMessage) => {
      console.log('📱 Notification opened app from background:', remoteMessage);
      callback(remoteMessage);
    });
  },

  /**
   * Set background message handler (must be called outside of component)
   */
  setBackgroundMessageHandler: () => {
    const messaging = getMessaging();
    setBackgroundMessageHandler(messaging, async (remoteMessage) => {
      console.log('📬 Background notification received:', remoteMessage);
    });
  },

  /**
   * Handle notification tap/press
   */
  addNotificationResponseListener: (
    callback: (response: Notifications.NotificationResponse) => void
  ) => {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  /**
   * Handle notification received while app is in foreground
   */
  addNotificationReceivedListener: (
    callback: (notification: Notifications.Notification) => void
  ) => {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Schedule a local notification
   */
  scheduleLocalNotification: async (
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<string> => {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        channelId: NOTIFICATION_CHANNEL_ID,
      } as any,
    });
    return id;
  },

  /**
   * ✅ NEW: Test notification (for debugging)
   */
  sendTestNotification: async (): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Test Notification',
        body: 'If you see this, notifications are working!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        channelId: NOTIFICATION_CHANNEL_ID,
      } as any,
    });
    console.log('✅ Test notification sent');
  },

  /**
   * Cancel all scheduled notifications
   */
  cancelAllNotifications: async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Get notification badge count
   */
  getBadgeCount: async (): Promise<number> => {
    return await Notifications.getBadgeCountAsync();
  },

  /**
   * Set notification badge count
   */
  setBadgeCount: async (count: number): Promise<void> => {
    await Notifications.setBadgeCountAsync(count);
  },

  /**
   * Get the channel ID (for use in Cloud Functions)
   */
  getChannelId: (): string => {
    return NOTIFICATION_CHANNEL_ID;
  },
};

export default NotificationService;