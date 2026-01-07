# Android Notification Troubleshooting Guide (Samsung A70 - Android 11)

## Changes Made to Fix Notifications

### 1. Created Custom Firebase Messaging Service
- **File**: `android/app/src/main/java/com/anonymous/testchat/MyFirebaseMessagingService.kt`
- **Purpose**: Handles incoming FCM messages and creates native Android notifications
- **Benefits**: More reliable than relying solely on React Native bridge

### 2. Updated AndroidManifest.xml
- Registered the custom `MyFirebaseMessagingService`
- Added default notification channel metadata
- Ensures FCM messages are properly routed

### 3. Created Notification Icon
- **File**: `android/app/src/main/res/drawable/notification_icon.xml`
- **Required**: Android requires a notification icon, missing icons cause silent failures

### 4. Enhanced Notification Channels
- Created high-priority channels: `default` and `fcm_default_channel`
- Set importance to MAX for visibility
- Enabled vibration, lights, and badges

### 5. Updated to Modular Firebase API
- Migrated from deprecated `messaging()` to `getMessaging()`
- Future-proof and resolves deprecation warnings

## Testing Steps on Samsung A70

### Step 1: Clean Build
```bash
cd android
./gradlew clean
cd ..
```

### Step 2: Rebuild and Install
```bash
npx expo run:android --device
```

### Step 3: Check Device Settings

#### A. App Notifications
1. Go to **Settings** → **Apps** → **testchat**
2. Tap **Notifications**
3. Ensure "Show notifications" is **ON**
4. Check all notification categories are enabled
5. Set importance to **High** or **Urgent**

#### B. Battery Optimization (CRITICAL for Samsung)
1. Go to **Settings** → **Apps** → **testchat**
2. Tap **Battery**
3. Set to **Not optimized** or **Unrestricted**
4. Samsung devices aggressively kill background apps

#### C. Background Data
1. Go to **Settings** → **Apps** → **testchat**
2. Tap **Mobile data**
3. Enable **Allow background data usage**

#### D. Auto-start Permission
1. Go to **Settings** → **Apps** → **testchat**
2. Look for **Auto-start** or **Start in background**
3. Enable it if available

### Step 4: Test Notification

#### Method 1: Firebase Console Test
1. Go to Firebase Console → Cloud Messaging
2. Click "Send test message"
3. Enter your FCM token (check app logs)
4. Send notification

#### Method 2: Send Message from Another User
1. Have another user send you a message
2. Test with app in different states:
   - Foreground (app open)
   - Background (app minimized)
   - Killed (app closed completely)

### Step 5: Check Logs
```bash
# Monitor Android logs
npx react-native log-android

# Or use adb directly
adb logcat | grep -E "FCM|Notification|testchat"
```

Look for:
- ✅ "FCM Token: ..." (token retrieved)
- ✅ "Notification channels created"
- ✅ "Message received" or "Notification displayed"

## Common Samsung-Specific Issues

### Issue 1: Notifications Not Showing in Killed State
**Solution**: Samsung's battery optimization is aggressive
- Go to Settings → Device care → Battery → App power management
- Add testchat to "Apps that won't be put to sleep"

### Issue 2: Notifications Delayed
**Solution**: Disable battery optimization completely
- Settings → Apps → testchat → Battery → Unrestricted

### Issue 3: No Sound/Vibration
**Solution**: Check Do Not Disturb mode
- Swipe down notification panel
- Ensure Do Not Disturb is OFF
- Check volume levels

### Issue 4: Notifications Only Work When App is Open
**Solution**: Background restrictions
- Settings → Apps → testchat → Permissions
- Enable all permissions including background activity

## Verification Checklist

- [ ] App has notification permission (POST_NOTIFICATIONS)
- [ ] FCM token is generated and logged
- [ ] Notification channels are created (check logs)
- [ ] Battery optimization is disabled
- [ ] Background data is enabled
- [ ] Notifications enabled in app settings
- [ ] Do Not Disturb is off
- [ ] Test in all app states (foreground, background, killed)

## Debug Commands

```bash
# Check if notification channels are created
adb shell dumpsys notification | grep testchat

# Check app battery optimization status
adb shell dumpsys deviceidle whitelist | grep testchat

# Test notification directly via adb (requires notification permission)
adb shell cmd notification post -S bigtext -t "Test Title" tag "Test notification body"

# Check FCM token from app logs
adb logcat | grep "FCM Token"
```

## Server-Side Notification Format

When sending from your backend, use this format:

```javascript
{
  "notification": {
    "title": "New Message",
    "body": "You have a new message"
  },
  "data": {
    "chatId": "123",
    "senderId": "456",
    "type": "chat_message"
  },
  "android": {
    "priority": "high",
    "notification": {
      "channelId": "fcm_default_channel",
      "sound": "default",
      "priority": "high"
    }
  },
  "token": "user_fcm_token_here"
}
```

## If Still Not Working

1. **Uninstall and reinstall** the app completely
2. **Restart the device** after installing
3. **Check Firebase Console** for successful token registration
4. **Test with Firebase Console** test message feature
5. **Check Android system logs** for errors

## Additional Samsung-Specific Settings

Some Samsung devices have additional restrictions:

1. **Smart Manager** → **Memory** → Exclude testchat
2. **Game Launcher** → Make sure testchat is not added
3. **Edge Screen** → Apps → Include testchat for notifications
4. **Lock screen** → Notifications → Show content

## Expected Behavior After Fix

- ✅ Notifications appear when app is in foreground
- ✅ Notifications appear when app is in background
- ✅ Notifications appear when app is killed
- ✅ Tapping notification opens the correct chat
- ✅ Sound and vibration work
- ✅ Badge count updates
