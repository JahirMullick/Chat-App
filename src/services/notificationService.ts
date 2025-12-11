import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { UserService } from './firestore';

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
   * Register for push notifications and get expo push token
   */
  registerForPushNotificationsAsync: async (): Promise<string | null> => {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C', // Keep as is - this is a notification system color
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return null;
      }
      
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: '8a9b4461-d8c8-46db-8fee-d8b7d21ce494', // Get from app.json expo.extra.eas.projectId
        });
        token = tokenData.data;
        console.log('📱 Expo Push Token:', token);
      } catch (error) {
        console.error('Error getting push token:', error);
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  },

  /**
   * Save push token to user's Firestore document
   */
  saveUserPushToken: async (userId: string, token: string): Promise<void> => {
    try {
      await UserService.updateProfile(userId, {
        pushToken: token,
      });
      console.log('✅ Push token saved to Firestore');
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  },

  /**
   * Send a push notification to specific user(s)
   */
  sendPushNotification: async (
    expoPushToken: string,
    title: string,
    body: string,
    data?: any
  ): Promise<void> => {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high' as const,
    };

    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      console.log('✅ Push notification sent');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  },

  /**
   * Send notification to all chat participants except sender
   */
  sendChatNotification: async (
    chatId: string,
    senderId: string,
    senderName: string,
    messageText: string,
    participantIds: string[]
  ): Promise<void> => {
    try {
      // Get push tokens for all participants except sender
      const recipientIds = participantIds.filter(id => id !== senderId);
      
      const notifications = recipientIds.map(async (recipientId) => {
        try {
          const recipient = await UserService.getUserById(recipientId);
          if (recipient?.pushToken) {
            await NotificationService.sendPushNotification(
              recipient.pushToken,
              senderName,
              messageText,
              {
                type: 'chat_message',
                chatId,
                senderId,
              }
            );
          }
        } catch (err) {
          console.error(`Error sending notification to ${recipientId}:`, err);
        }
      });

      await Promise.all(notifications);
    } catch (error) {
      console.error('Error sending chat notifications:', error);
    }
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
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> => {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: trigger || null,
    });
    return id;
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
};

export default NotificationService;
