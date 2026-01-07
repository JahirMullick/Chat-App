# Firebase Cloud Messaging (FCM) Setup Guide

## ✅ What's Been Configured

### 1. **Installed Packages**
- ✅ `@react-native-firebase/messaging` - FCM for push notifications

### 2. **Android Configuration**
- ✅ Updated `AndroidManifest.xml` with FCM service
- ✅ Google Services already configured

### 3. **iOS Configuration**
- ✅ Updated `Info.plist` with background modes for remote notifications
- ⚠️ **Action Required**: Enable Push Notifications capability in Xcode

### 4. **App Code**
- ✅ Updated `notificationService.ts` with FCM methods
- ✅ Updated `App.tsx` to register FCM on user login
- ✅ Updated `index.js` with background message handler

### 5. **Firebase Cloud Functions**
- ✅ Created `functions/index.js` with automatic notification triggers
- ✅ Created `functions/package.json`

---

## 🚀 Next Steps to Complete Setup

### Step 1: Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase in Your Project
Run this in your project root:
```bash
firebase init functions
```

**During initialization:**
- Select your existing Firebase project
- Choose **JavaScript** (already created)
- **DO NOT** overwrite existing files
- Install dependencies with npm: **Yes**

### Step 4: Deploy Cloud Functions
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

This will deploy:
- ✅ `sendChatNotification` - Sends notification when new message arrives
- ✅ `sendFriendRequestNotification` - Sends notification for friend requests
- ✅ `cleanupOldMessages` - Cleans up old messages (runs daily)

### Step 5: Enable Cloud Functions in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Build** → **Functions**
4. Upgrade to **Blaze Plan** (Pay as you go - has free tier)
   - Free tier includes: 2M invocations/month
   - More than enough for most chat apps

### Step 6: iOS Setup (if building for iOS)
1. Open `ios/testchat.xcworkspace` in Xcode
2. Select your project → **Signing & Capabilities**
3. Click **+ Capability**
4. Add **Push Notifications**
5. Add **Background Modes** and enable:
   - ✅ Remote notifications

### Step 7: Rebuild Your App
```bash
# For Android
npx expo prebuild --clean --platform android
npx expo run:android

# For iOS
npx expo prebuild --clean --platform ios
npx expo run:ios
```

---

## 🔍 How It Works

### Architecture Flow:

1. **User Login** → FCM token generated → Saved to Firestore (`users/{userId}/fcmToken`)

2. **New Message Sent** → Firestore trigger → Cloud Function runs → Sends FCM notification to recipient

3. **User Receives Notification**:
   - **App Closed/Killed**: System notification appears
   - **App in Background**: System notification appears
   - **App in Foreground**: Local notification displayed

4. **User Taps Notification** → App opens → Navigates to chat screen

---

## 📱 Testing Notifications

### Test 1: Send a Test Notification from Firebase Console
1. Go to Firebase Console → **Engage** → **Cloud Messaging**
2. Click **Send your first message**
3. Enter title and message
4. Click **Send test message**
5. Enter your FCM token (check console logs when app starts)

### Test 2: Send Real Chat Message
1. Login with two different accounts on two devices
2. Send a message from Device A
3. Device B should receive notification (if app is in background/closed)

### Check Console Logs:
```javascript
// Look for these logs:
✅ FCM Token: ExponentPushToken[...]
✅ FCM token saved to Firestore
📬 Foreground message received
📱 Notification opened app from background
```

---

## 🐛 Troubleshooting

### Issue 1: No FCM Token Generated
**Solution:**
- Ensure `google-services.json` (Android) is in `android/app/`
- Ensure `GoogleService-Info.plist` (iOS) is in `ios/testchat/`
- Run `npx expo prebuild --clean`

### Issue 2: Notifications Not Arriving
**Check:**
1. FCM token exists in Firestore: `users/{userId}/fcmToken`
2. Cloud Functions deployed: `firebase deploy --only functions`
3. Cloud Functions logs: `firebase functions:log`
4. Firestore structure matches (see below)

### Issue 3: Permission Denied
**Solution:**
- Make sure user granted notification permission
- Check Settings → App → Notifications → Enabled

### Issue 4: Cloud Functions Not Triggering
**Check:**
1. Firebase project is on **Blaze Plan** (required for functions)
2. Functions are deployed: `firebase functions:list`
3. Check logs: `firebase functions:log --only sendChatNotification`

---

## 📊 Required Firestore Structure

Your Firestore database should have this structure:

```
users/
  {userId}/
    displayName: "John Doe"
    email: "john@example.com"
    fcmToken: "abc123..."  ← Added automatically by app
    lastTokenUpdate: "2026-01-07..."

chats/
  {chatId}/
    participants: ["userId1", "userId2"]
    lastMessage: {...}
    
    messages/  ← subcollection
      {messageId}/
        senderId: "userId1"
        text: "Hello!"
        createdAt: Timestamp
        type: "text"
```

---

## 🔐 Security Rules

Update your Firestore security rules to allow FCM token writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can update their own FCM token
    match /users/{userId} {
      allow read: if request.auth != null;
      allow update: if request.auth.uid == userId;
    }
    
    // Messages can be created by authenticated users
    match /chats/{chatId}/messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

---

## 📈 Monitor Usage

### View Cloud Functions Usage:
```bash
firebase functions:log --only sendChatNotification
```

### View in Firebase Console:
1. Functions → Dashboard
2. See invocations, errors, and execution time

---

## 💰 Cost Estimates

**Free Tier (Blaze Plan):**
- 2M function invocations/month
- 400K GB-seconds/month
- 200K CPU-seconds/month

**Typical Chat App:**
- 1000 messages/day = ~30K invocations/month
- **Well within free tier!**

---

## 🎯 What's Next?

After completing the setup:

1. ✅ Test notifications on physical device
2. ✅ Deploy Cloud Functions
3. ✅ Test with multiple users
4. ✅ Monitor function logs
5. ✅ Add custom notification sounds (optional)
6. ✅ Add notification badge counts (optional)

---

## 📞 Support

If you encounter issues:
1. Check Cloud Functions logs: `firebase functions:log`
2. Check app console logs
3. Verify Firestore structure
4. Ensure FCM tokens are being saved

---

**Your FCM setup is now complete!** 🎉

Just deploy the Cloud Functions and rebuild your app to start receiving automatic notifications.
