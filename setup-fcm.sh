#!/bin/bash

# Firebase Cloud Messaging - Complete Setup Script
# Run this script after reading FCM_SETUP_GUIDE.md

echo "🚀 Firebase Cloud Messaging Setup"
echo "=================================="
echo ""

# Step 1: Install Firebase CLI
echo "📦 Step 1: Installing Firebase CLI..."
npm install -g firebase-tools
echo "✅ Firebase CLI installed"
echo ""

# Step 2: Login to Firebase
echo "🔐 Step 2: Login to Firebase..."
echo "A browser window will open for authentication..."
firebase login
echo "✅ Logged in to Firebase"
echo ""

# Step 3: Initialize Functions (if not already done)
echo "🔧 Step 3: Initialize Firebase Functions..."
echo "IMPORTANT: Choose 'Use existing project' and select your Firebase project"
echo "           Choose 'JavaScript' as the language"
echo "           Say 'No' to ESLint"
echo "           Say 'Yes' to install dependencies"
echo ""
read -p "Press Enter to continue with initialization..."
firebase init functions
echo ""

# Step 4: Install function dependencies
echo "📦 Step 4: Installing Cloud Function dependencies..."
cd functions
yarn
cd ..
echo "✅ Dependencies installed"
echo ""

# Step 5: Deploy functions
echo "🚀 Step 5: Deploying Cloud Functions..."
firebase deploy --only functions
echo "✅ Functions deployed!"
echo ""

# Step 6: Rebuild the app
echo "📱 Step 6: Rebuilding the app..."
echo ""
echo "Choose your platform:"
echo "1) Android"
echo "2) iOS"
echo "3) Both"
read -p "Enter choice (1-3): " platform_choice

case $platform_choice in
  1)
    echo "🤖 Building for Android..."
    npx expo prebuild --clean --platform android
    npx expo run:android
    ;;
  2)
    echo "🍎 Building for iOS..."
    echo "⚠️  REMEMBER: Enable Push Notifications capability in Xcode!"
    npx expo prebuild --clean --platform ios
    npx expo run:ios
    ;;
  3)
    echo "🤖 Building for Android..."
    npx expo prebuild --clean --platform android
    echo "🍎 Building for iOS..."
    npx expo prebuild --clean --platform ios
    echo "⚠️  REMEMBER: Enable Push Notifications capability in Xcode!"
    echo ""
    echo "Choose which to run:"
    echo "1) Android"
    echo "2) iOS"
    read -p "Enter choice (1-2): " run_choice
    if [ "$run_choice" = "1" ]; then
      npx expo run:android
    else
      npx expo run:ios
    fi
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "✅ Setup Complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Firebase Cloud Messaging is now configured!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Don't forget to upgrade to Blaze Plan!"
echo "   👉 https://console.firebase.google.com"
echo "   👉 Settings → Usage and billing → Modify plan"
echo ""
echo "📱 To test notifications:"
echo "   1. Login with two different accounts on two devices"
echo "   2. Put one app in background"
echo "   3. Send message from the other device"
echo "   4. You should receive a notification! 🎉"
echo ""
echo "🔍 To view function logs:"
echo "   firebase functions:log --only sendChatNotification"
echo ""
echo "📚 For detailed docs, see FCM_SETUP_GUIDE.md"
echo ""
