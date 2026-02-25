# Quick Action Checklist - Google Sign-In Fix

## 🎯 Your Specific SHA-1 Certificate
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

## ⚠️ CRITICAL: Current Issue Found
Your `google-services.json` is **MISSING Android OAuth client** (client_type: 1).
Current file only has Web client (client_type: 3).

**This is why Google Sign-In fails!**

---

## ✅ Step-by-Step Actions

### Step 1: Add SHA-1 to Firebase Console (Android) - **CRITICAL**

⚠️ **This step creates the Android OAuth client you're missing!**

1. Open: https://console.firebase.google.com/project/testchat-1c3c7/settings/general
2. Scroll to "Your apps" section
3. Find your Android app: `com.anonymous.testchat`
4. Under "SHA certificate fingerprints" section, click "Add fingerprint"
5. Paste this SHA-1:
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```
6. Click "Save"
7. **WAIT 2-3 minutes** for Firebase to generate the Android OAuth client
8. ⚠️ **MUST DO**: Download the updated `google-services.json` file
   - Click the download icon next to your Android app
   - Or click "google-services.json" link
9. Replace `android/app/google-services.json` with the newly downloaded file
10. **Verify**: The new file should have both:
    - `"client_type": 1` (Android client) ← Currently missing!
    - `"client_type": 3` (Web client) ← You already have this

---

### Step 2: Download iOS Configuration
1. Same page: https://console.firebase.google.com/project/testchat-1c3c7/settings/general
2. Scroll to "Your apps" section
3. Find your iOS app: `com.anonymous.testchat`
4. Click "GoogleService-Info.plist" download button
5. Replace the file at: `ios/testchat/GoogleService-Info.plist`

---

### Step 3: Rebuild the App

After updating configuration files:

```bash
# Clean and reinstall dependencies
npm install

# For Android
cd android
./gradlew clean
cd ..
npm run android

# For iOS (if needed)
cd ios
pod install
cd ..
npm run ios
```

---

### Step 4: Test Google Sign-In

1. Completely uninstall the app from device/emulator first
2. Rebuild and install fresh
3. Try Google Sign-In
4. Check for errors

---

## 🔍 Verification Checklist

After completing the steps above:

- [ ] SHA-1 fingerprint added to Firebase Console (Android app)
- [ ] Updated `google-services.json` downloaded and replaced
- [ ] `GoogleService-Info.plist` downloaded and replaced (iOS)
- [ ] App completely uninstalled from device
- [ ] Dependencies reinstalled (`npm install`)
- [ ] Android cleaned (`./gradlew clean`)
- [ ] App rebuilt and installed
- [ ] Google Sign-In tested on Android
- [ ] Google Sign-In tested on iOS (if applicable)

---

## 🐛 Troubleshooting

### If still getting "No ID token found":

**Android**:
```bash
# Verify the google-services.json was updated
cat android/app/google-services.json | grep client_id
```
You should see client IDs listed. If empty, re-download from Firebase.

**iOS**:
```bash
# Check if GoogleService-Info.plist has real values
cat ios/testchat/GoogleService-Info.plist | grep API_KEY
```
Should NOT contain "YOUR_IOS_API_KEY" - should be actual key.

**Both Platforms**:
```bash
# Clear Metro cache and restart
npm start -- --reset-cache
```

---

## ⚠️ Common Mistakes to Avoid

1. ❌ Adding SHA-1 but NOT downloading updated `google-services.json`
2. ❌ Replacing config files but NOT rebuilding the app
3. ❌ Testing without completely uninstalling the old app first
4. ❌ Using old keystore SHA-1 instead of the current one

---

## 📞 Support Links

- **Firebase Project**: https://console.firebase.google.com/project/testchat-1c3c7
- **SHA-1 Location**: Settings → Your apps → (Select app) → SHA certificate fingerprints
- **Download Configs**: Settings → Your apps → (Click download button next to app)

---

## Expected Result

✅ Google Sign-In button tapped
✅ Google authentication dialog appears
✅ User selects Google account
✅ ID token successfully retrieved
✅ User signed in without errors
✅ User document created in Firestore
✅ Navigated to home screen

---

**Current Status**: Waiting for Firebase Console configuration updates
**Estimated Time**: 10-15 minutes (including rebuild)
