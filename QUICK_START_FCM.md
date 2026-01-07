# 🚀 Quick Start: Deploy FCM Notifications

## Deploy Cloud Functions (3 minutes)

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize & Deploy
```bash
# Initialize (if first time)
firebase init functions
# Choose: Use existing project, JavaScript, Yes to install deps

# Deploy functions
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 4. Upgrade to Blaze Plan
- Go to [Firebase Console](https://console.firebase.google.com)
- Select your project → ⚙️ Settings → Usage and billing
- Upgrade to **Blaze Plan** (required for Cloud Functions)
- **Don't worry**: Free tier is generous (2M invocations/month)

---

## Rebuild App (5 minutes)

### Android:
```bash
npx expo prebuild --clean --platform android
npx expo run:android
```

### iOS:
```bash
# First time: Open Xcode and enable Push Notifications capability
npx expo prebuild --clean --platform ios
npx expo run:ios
```

---

## Test Notifications

### 1. Login with User Account
- App will automatically register FCM token
- Check console logs: `✅ FCM token saved to Firestore`

### 2. Send a Message
- Open app on Device A (or Emulator A)
- Open app on Device B (or Emulator B)
- Login with different accounts
- Send message from Device A
- **Put Device B in background** (home button)
- 🎉 Notification should appear on Device B!

### 3. Tap Notification
- Tap notification on Device B
- App should open and navigate to chat screen

---

## Check if Everything Works

### ✅ Checklist:

1. **FCM Token Generated?**
   - Check console: `📱 FCM Token: ...`
   - Check Firestore: `users/{userId}/fcmToken` field exists

2. **Cloud Functions Deployed?**
   ```bash
   firebase functions:list
   ```
   Should show: `sendChatNotification`, `sendFriendRequestNotification`

3. **Notification Received?**
   - Send message with app in background
   - Should see system notification

4. **Function Logs (if issues):**
   ```bash
   firebase functions:log --only sendChatNotification
   ```

---

## Common Issues & Fixes

### ❌ No FCM Token
**Fix:** 
```bash
npx expo prebuild --clean
npx expo run:android  # or run:ios
```

### ❌ Notifications Not Arriving
**Check:**
1. Is Blaze Plan enabled? (required for Cloud Functions)
2. Are functions deployed? `firebase functions:list`
3. Check function logs: `firebase functions:log`

### ❌ "Permission Denied"
**Fix:** Grant notification permission in app settings

### ❌ Functions Not Triggering
**Fix:** Make sure Firestore structure matches:
```
chats/{chatId}/messages/{messageId}
```

---

## Monitor Your Setup

### View Function Logs:
```bash
# All logs
firebase functions:log

# Specific function
firebase functions:log --only sendChatNotification
```

### Firebase Console:
- Functions → Dashboard
- See invocations, errors, execution time

---

## 💡 Pro Tips

1. **Test on physical device** - Emulators can be unreliable for notifications
2. **Check Firestore** - Ensure FCM tokens are being saved
3. **Monitor logs** - Use `firebase functions:log` to debug
4. **Background mode** - Notifications work best when app is in background/killed

---

## What Was Installed?

✅ `@react-native-firebase/messaging` - FCM package  
✅ Cloud Functions - Automatic notification sender  
✅ Updated App.tsx - FCM initialization  
✅ Updated notificationService.ts - FCM methods  
✅ Updated Android/iOS config - Permissions & settings  

---

## Next Steps

1. ✅ Deploy Cloud Functions
2. ✅ Rebuild app
3. ✅ Test with two devices
4. ✅ Celebrate! 🎉

**See `FCM_SETUP_GUIDE.md` for detailed documentation.**
