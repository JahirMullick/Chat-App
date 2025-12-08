# 🚀 Quick Start - Notifications

## ⚡ 3-Step Setup

### 1️⃣ Get EAS Project ID
```bash
npx eas-cli init
# Or check: npx eas-cli project:info
```

### 2️⃣ Update `app.config.js`
Replace line 64:
```javascript
projectId: "your-actual-eas-project-id"
```

### 3️⃣ Build & Test on Physical Device
```bash
# Android
npx expo prebuild
npx expo run:android

# Or EAS build
npx eas build --profile development --platform android
```

---

## 📱 How to Test

1. **Login** on two physical devices with different users
2. **Send message** from User A to User B
3. **Check** if User B receives notification
4. **Tap** notification - should navigate to chat

---

## 🔍 Debug Checklist

```typescript
// Check permission status
const { status } = await Notifications.getPermissionsAsync();
console.log('Permission:', status); // Should be 'granted'

// Check if token exists
const user = auth().currentUser;
const profile = await UserService.getUserById(user.uid);
console.log('Push Token:', profile?.pushToken); // Should have token
```

---

## 📍 Console Logs to Watch For

✅ **Success:**
- `📱 Expo Push Token: ExponentPushToken[...]`
- `✅ Push token saved to Firestore`
- `✅ Push notifications sent`
- `📬 Notification received:`
- `👆 Notification tapped:`

❌ **Errors:**
- `Must use physical device` → Use real phone
- `Failed to get push token` → Check EAS project ID
- `Permission denied` → Grant notification permissions

---

## 🎯 Test Commands

```typescript
// Test manual notification
import NotificationService from './services/notificationService';

await NotificationService.sendPushNotification(
    "ExponentPushToken[xxxxx]", // Recipient's token
    "Test",
    "Hello!",
    { type: "test" }
);
```

---

## ⚠️ Common Issues

| Problem | Solution |
|---------|----------|
| No notifications | Use physical device, not emulator |
| Token not saving | Check Firestore rules allow writes |
| Wrong EAS ID | Update `app.config.js` line 64 |
| Crashes on send | Rebuild app after config changes |

---

## 📂 Files Modified

- ✅ `src/services/notificationService.ts` (NEW)
- ✅ `app.config.js` (notification plugin)
- ✅ `src/types/firestore.types.ts` (pushToken field)
- ✅ `src/services/firestore/userService.ts` (updateProfile)
- ✅ `src/services/firestore/messageService.ts` (send notifications)
- ✅ `src/App.tsx` (notification listeners)
- ✅ `src/Navigation/AppNavigator.tsx` (navigation ref)

---

**Read full guide:** `NOTIFICATION_SETUP_GUIDE.md`
