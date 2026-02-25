#!/bin/bash

# Script to verify google-services.json has correct OAuth clients

echo "🔍 Checking google-services.json configuration..."
echo ""

FILE="android/app/google-services.json"

if [ ! -f "$FILE" ]; then
    echo "❌ ERROR: $FILE not found!"
    exit 1
fi

echo "📄 File found: $FILE"
echo ""

# Check for client_type 1 (Android)
ANDROID_CLIENT=$(cat "$FILE" | grep -c '"client_type": 1')

# Check for client_type 3 (Web)
WEB_CLIENT=$(cat "$FILE" | grep -c '"client_type": 3')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "OAuth Clients Found:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$ANDROID_CLIENT" -gt 0 ]; then
    echo "✅ Android OAuth client (type 1): FOUND ($ANDROID_CLIENT)"
else
    echo "❌ Android OAuth client (type 1): MISSING"
fi

if [ "$WEB_CLIENT" -gt 0 ]; then
    echo "✅ Web OAuth client (type 3): FOUND ($WEB_CLIENT)"
else
    echo "⚠️  Web OAuth client (type 3): MISSING"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$ANDROID_CLIENT" -gt 0 ] && [ "$WEB_CLIENT" -gt 0 ]; then
    echo "✅ RESULT: Configuration is CORRECT!"
    echo ""
    echo "Your google-services.json has both required OAuth clients."
    echo "Google Sign-In should work on Android."
    echo ""
    echo "Next steps:"
    echo "  1. Clean build: cd android && ./gradlew clean && cd .."
    echo "  2. Rebuild app: npm run android"
    echo "  3. Test Google Sign-In"
elif [ "$ANDROID_CLIENT" -eq 0 ]; then
    echo "❌ RESULT: Configuration is INCOMPLETE!"
    echo ""
    echo "Missing Android OAuth client (type 1)."
    echo "This is why Google Sign-In fails with 'No ID token found'."
    echo ""
    echo "Action required:"
    echo "  1. Go to Firebase Console"
    echo "  2. Add SHA-1 fingerprint: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25"
    echo "  3. Wait 2-3 minutes for Firebase to process"
    echo "  4. Download NEW google-services.json"
    echo "  5. Replace android/app/google-services.json"
    echo "  6. Run this script again to verify"
else
    echo "⚠️  RESULT: Configuration is UNUSUAL"
    echo ""
    echo "Has Android client but missing Web client."
    echo "This might cause issues."
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show all client IDs
echo "📋 All OAuth Client IDs in file:"
echo ""
cat "$FILE" | grep -o '"client_id": "[^"]*"' | sort -u
echo ""
