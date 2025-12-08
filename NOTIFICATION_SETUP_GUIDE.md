# 📱 Expo Notifications Setup Guide

## ✅ What's Already Configured

### 1. **Packages Installed**
- ✅ expo-notifications@0.32.14
- ✅ expo-device@8.0.10
- ✅ expo-constants@18.0.11

### 2. **Files Created/Modified**

#### **Created:**
- `src/services/notificationService.ts` - Complete notification service

#### **Modified:**
- `app.config.js` - Added notification plugin and Android permissions
- `src/types/firestore.types.ts` - Added `pushToken` field to UserProfile
- `src/services/firestore/userService.ts` - Added `pushToken` to updateProfile
- `src/services/firestore/messageService.ts` - Integrated notification sending
- `src/App.tsx` - Added notification listeners and registration
- `src/Navigation/AppNavigator.tsx` - Added navigation ref for deep linking

---

## 🔧 Required Setup Steps

### Step 1: Get Your EAS Project ID

Run this command to create an EAS project (if you haven't already):

```bash
npx eas-cli init
```

Or if you already have an EAS project, find your project ID in:
- **Method 1:** Run `npx eas-cli project:info`
- **Method 2:** Check your [Expo dashboard](https://expo.dev)

### Step 2: Update `app.config.js`

Replace `"your-project-id"` with your actual EAS project ID:

```javascript
extra: {
    googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    eas: {
        projectId: "abc123-def456-ghi789" // Your actual project ID
    },
},
```

### Step 3: (Optional) Add Notification Assets

The config references optional assets. Create them or remove the references:

**Option A: Add Assets (Recommended)**
- Create `assets/images/notification-icon.png` (96x96px PNG)
- Create `assets/sounds/notification.wav` (optional custom sound)

**Option B: Use Defaults**
Remove these lines from `app.config.js`:

```javascript
[
    "expo-notifications",
    {
        icon: "./assets/images/notification-icon.png", // Remove this line
        color: "#ffffff",
        sounds: ["./assets/sounds/notification.wav"], // Remove this line
        mode: "production",
    },
],
```

Replace with:

```javascript
[
    "expo-notifications",
    {
        color: "#ffffff",
        mode: "production",
    },
],
```

### Step 4: Test on a Physical Device

**⚠️ Important:** Push notifications don't work on emulators/simulators!

#### **For Android:**

1. Build and install the development build:
```bash
npx eas build --profile development --platform android
```

2. Or use `expo run:android` after prebuild:
```bash
npx expo prebuild
npx expo run:android
```

3. Install on your physical Android device

#### **For iOS:**

1. You need an Apple Developer account
2. Build development build:
```bash
npx eas build --profile development --platform ios
```

3. Install on your physical iOS device via TestFlight or direct installation

---

## 🎯 How It Works

### **Automatic Features:**

1. **User Login → Token Registration**
   - When a user logs in, `App.tsx` automatically:
     - Requests notification permissions
     - Gets the Expo push token
     - Saves it to Firestore (`users/{userId}` with `pushToken` field)

2. **Message Sent → Notification**
   - When a message is sent via `MessageService.sendMessage()`:
     - Message is saved to Firestore
     - Chat is unhidden for recipient
     - Push notification is sent to all participants except sender
     - Notification contains sender name and message text

3. **Notification Tap → Navigate to Chat**
   - When user taps a notification:
     - App opens (or comes to foreground)
     - Automatically navigates to the specific chat
     - Uses the `chatId` from notification data

### **Notification Behavior:**

| App State | Behavior |
|-----------|----------|
| **Foreground** | Shows banner at top, plays sound |
| **Background** | Shows in notification tray, plays sound |
| **Killed/Closed** | Shows in notification tray, plays sound |
| **Tap Notification** | Opens app and navigates to chat |

---

## 🧪 Testing Notifications

### **Test 1: Self-Test (Two Devices)**

1. Sign in with **User A** on Device 1
2. Sign in with **User B** on Device 2
3. From User A, send a message to User B
4. **Expected:** User B should receive a push notification
5. Tap the notification on Device 2
6. **Expected:** App opens and navigates directly to the chat

### **Test 2: Check Token Registration**

Add this code temporarily to check if tokens are being saved:

```typescript
// In any component after login
import { UserService } from './services/firestore';
import auth from '@react-native-firebase/auth';

const checkToken = async () => {
    const user = auth().currentUser;
    if (user) {
        const userProfile = await UserService.getUserById(user.uid);
        console.log('Push Token:', userProfile?.pushToken);
    }
};
```

### **Test 3: Manual Notification Test**

Test sending a notification manually:

```typescript
import NotificationService from './services/notificationService';

// Get recipient's push token from Firestore
const recipientToken = "ExponentPushToken[xxxxxxxxxxxxxx]";

await NotificationService.sendPushNotification(
    recipientToken,
    "Test Message",
    "This is a test notification!",
    { type: "test" }
);
```

---

## 🐛 Troubleshooting

### **Issue 1: "Must use physical device for Push Notifications"**

**Solution:** You're using an emulator. Install on a physical device.

---

### **Issue 2: Notifications not received**

**Checklist:**
- ✅ Are you testing on a physical device?
- ✅ Did you grant notification permissions?
- ✅ Is the push token saved in Firestore? (Check Firebase Console)
- ✅ Is your EAS project ID correct in `app.config.js`?
- ✅ Are you in a development build (not Expo Go)?

**Debug:**
```typescript
// Check if permissions granted
const { status } = await Notifications.getPermissionsAsync();
console.log('Notification permission status:', status);

// Check if token exists
const tokenData = await Notifications.getExpoPushTokenAsync();
console.log('Expo Push Token:', tokenData.data);
```

---

### **Issue 3: "Failed to get push token"**

**Possible causes:**
- Missing or incorrect EAS project ID
- Not using a development build
- Network issues

**Solution:**
1. Verify your EAS project ID
2. Rebuild with `npx eas build --profile development --platform android`
3. Check console logs for detailed error

---

### **Issue 4: Notification tapped but doesn't navigate**

**Solution:** Make sure your navigation structure matches:

```typescript
navigationRef.current?.navigate("MainStack", {
    screen: "Chat",
    params: { chatId: data.chatId },
});
```

Check your actual route names in `MainStack.tsx` and adjust if needed.

---

## 🚀 Advanced Features

### **Feature 1: Notification Badge Count**

Update unread count badge on app icon:

```typescript
import NotificationService from './services/notificationService';

// Set badge count
await NotificationService.setBadgeCount(5);

// Clear badge
await NotificationService.setBadgeCount(0);
```

### **Feature 2: Local Notifications**

Schedule local notifications (not push):

```typescript
// Immediate notification
await NotificationService.scheduleLocalNotification(
    "Reminder",
    "You have unread messages"
);

// Scheduled notification
await NotificationService.scheduleLocalNotification(
    "Daily Reminder",
    "Check your messages!",
    {
        seconds: 60, // in 60 seconds
        repeats: false
    }
);
```

### **Feature 3: Custom Notification Sound**

1. Add sound file to `assets/sounds/notification.wav`
2. Already configured in `app.config.js`
3. Rebuild the app

### **Feature 4: Notification Categories (iOS)**

For actionable notifications with buttons:

```typescript
await Notifications.setNotificationCategoryAsync('chat_message', [
    {
        identifier: 'reply',
        buttonTitle: 'Reply',
        textInput: { submitButtonTitle: 'Send', placeholder: 'Type message...' }
    },
    {
        identifier: 'mark_read',
        buttonTitle: 'Mark as Read'
    }
]);
```

---

## 📊 Monitoring

### **Check notification delivery:**

1. **Expo Dashboard**: [expo.dev/notifications](https://expo.dev/notifications)
2. **Firestore Console**: Check `users/{userId}` for `pushToken` field
3. **App Logs**: Look for console logs:
   - `📱 Expo Push Token: ...`
   - `✅ Push token saved to Firestore`
   - `✅ Push notifications sent`
   - `📬 Notification received: ...`
   - `👆 Notification tapped: ...`

---

## 🔒 Security Notes

1. **Push tokens are public** - Safe to store in Firestore
2. **Never send sensitive data** in notification body (visible in notification tray)
3. **Use notification data** field for IDs, not sensitive content
4. **Validate on backend** if implementing server-side notifications

---

## 📚 Next Steps

### **Current Implementation:** ✅ Client-Side Notifications
- Works for development and testing
- Limited to ~100 notifications per day per device
- Uses Expo's push notification service

### **Production-Ready:** 🔄 Server-Side Notifications

For production with unlimited notifications, implement Firebase Cloud Functions:

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const sendMessageNotification = functions.firestore
    .document('chats/{chatId}/messages/{messageId}')
    .onCreate(async (snapshot, context) => {
        const message = snapshot.data();
        const chatDoc = await admin.firestore()
            .collection('chats')
            .doc(context.params.chatId)
            .get();
        
        const participants = chatDoc.data()?.participants || [];
        const recipients = participants.filter((id: string) => id !== message.senderId);
        
        // Get push tokens and send notifications
        // ... implementation
    });
```

---

## ✅ Quick Checklist

Before deploying to production:

- [ ] EAS project ID configured
- [ ] Tested on physical Android device
- [ ] Tested on physical iOS device (if targeting iOS)
- [ ] Notification permissions requested and granted
- [ ] Push tokens saving to Firestore
- [ ] Notifications received when message sent
- [ ] Navigation works when tapping notification
- [ ] Badge counts updated (if implemented)
- [ ] Notification icons/sounds configured
- [ ] Consider implementing Firebase Cloud Functions for production

---

## 🆘 Need Help?

- **Expo Notifications Docs**: https://docs.expo.dev/push-notifications/overview/
- **Troubleshooting**: https://docs.expo.dev/push-notifications/troubleshooting/
- **API Reference**: https://docs.expo.dev/versions/latest/sdk/notifications/

---

**Your notification system is ready! 🎉**

Just update the EAS project ID and test on a physical device.
