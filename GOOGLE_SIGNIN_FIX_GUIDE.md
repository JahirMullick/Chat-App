# Google Sign-In Configuration Fix Guide

## Problem
The error "No ID token found" occurs because Firebase configuration files contain placeholder values instead of actual credentials.

## Affected Files
- `ios/testchat/GoogleService-Info.plist` - Contains placeholder values
- Android configuration appears correct

## Steps to Fix

### 1. Download Correct iOS Configuration File

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `testchat-1c3c7`
3. Click the gear icon (⚙️) → Project Settings
4. Scroll to "Your apps" section
5. Find your iOS app (`com.anonymous.testchat`)
6. Click "GoogleService-Info.plist" download button
7. Replace the file at: `ios/testchat/GoogleService-Info.plist`

### 2. Verify Android Configuration (If Issues Persist)

#### Your SHA-1 Certificate (Already Retrieved)
**Debug SHA-1**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

**Add to Firebase Console**:
1. Go to [Firebase Console - Project Settings](https://console.firebase.google.com/project/testchat-1c3c7/settings/general)
2. Scroll to "Your apps" → Select Android app (`com.anonymous.testchat`)
3. Under "SHA certificate fingerprints", click "Add fingerprint"
4. Paste: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
5. Click "Save"

#### Verify google-services.json
The file at `android/app/google-services.json` should have:
- Correct `project_id`: `testchat-1c3c7`
- Valid `client_id` entries
- Matching `package_name`: `com.anonymous.testchat`

### 3. Rebuild the App

After updating configuration files:

```bash
# Clear cache
rm -rf node_modules
npm install

# For iOS
cd ios
pod install
cd ..

# Rebuild
npm run android  # or npm run ios
```

### 4. Verify Environment Variables

Check `.env` file has:
```env
GOOGLE_WEB_CLIENT_ID=1024974520138-251lvksk31g5f61c263ub17chipekdcp.apps.googleusercontent.com
```

Restart Metro bundler after any `.env` changes:
```bash
npm start -- --reset-cache
```

## Current Placeholder Values (MUST REPLACE)

In `ios/testchat/GoogleService-Info.plist`:
```xml
<key>API_KEY</key>
<string>YOUR_IOS_API_KEY</string>  <!-- PLACEHOLDER -->

<key>GCM_SENDER_ID</key>
<string>YOUR_GCM_SENDER_ID</string>  <!-- PLACEHOLDER -->

<key>PROJECT_ID</key>
<string>YOUR_PROJECT_ID</string>  <!-- PLACEHOLDER -->

<key>STORAGE_BUCKET</key>
<string>YOUR_STORAGE_BUCKET</string>  <!-- PLACEHOLDER -->

<key>GOOGLE_APP_ID</key>
<string>1:YOUR_APP_ID:ios:YOUR_IOS_ID</string>  <!-- PLACEHOLDER -->
```

These MUST be replaced with actual values from Firebase Console.

## Testing

After applying fixes:
1. Completely uninstall the app from your device/emulator
2. Rebuild and reinstall
3. Try Google Sign-In
4. Check logs for any remaining errors

## Common Issues

### "DEVELOPER_ERROR" on Android
- SHA-1 certificate not registered in Firebase Console
- Wrong OAuth client ID in Firebase

### "No ID token found" on iOS
- GoogleService-Info.plist has placeholder values
- App not rebuilt after updating plist file

### "The operation couldn't be completed"
- Bundle ID mismatch between Xcode and Firebase
- REVERSED_CLIENT_ID not properly set in Info.plist
