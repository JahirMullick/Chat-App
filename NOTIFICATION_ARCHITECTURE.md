# 📊 Notification System Architecture

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER A (Sender)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. Sends message "Hello!"
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              MessageService.sendMessage()                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ✅ Save message to Firestore                              │  │
│  │ ✅ Update chat lastMessage                                │  │
│  │ ✅ Increment unread counts                                │  │
│  │ ✅ Unhide chat for all participants                       │  │
│  │ 📬 Send push notification to recipients                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 2. Fetch recipient push tokens
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Firestore Database                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ users/{userB_id}                                          │  │
│  │   ├── displayName: "User B"                               │  │
│  │   ├── email: "userb@example.com"                          │  │
│  │   └── pushToken: "ExponentPushToken[xxxxxxxxx]"          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 3. Send notification via Expo API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               Expo Push Notification Service                     │
│                 (https://exp.host/--/api/v2/push/send)          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ {                                                         │  │
│  │   to: "ExponentPushToken[xxxxx]",                        │  │
│  │   title: "User A",                                        │  │
│  │   body: "Hello!",                                         │  │
│  │   data: { chatId: "chat123", senderId: "userA_id" }      │  │
│  │ }                                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 4. Deliver to device
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  USER B's Device (Recipient)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📱 NOTIFICATION                                           │  │
│  │ ┌─────────────────────────────────────────────────────┐   │  │
│  │ │ User A                                    [App Icon] │   │  │
│  │ │ Hello!                                               │   │  │
│  │ │                                              now      │   │  │
│  │ └─────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 5. User taps notification
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              App.tsx - Notification Response Listener           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ responseListener.current =                                │  │
│  │   NotificationService.addNotificationResponseListener(   │  │
│  │     (response) => {                                       │  │
│  │       const data = response.notification...content.data   │  │
│  │       navigate("Chat", { chatId: data.chatId })          │  │
│  │     }                                                      │  │
│  │   )                                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 6. Navigate to chat
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ChatScreen Component                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ┌─────────────────────────────────────────────────────┐   │  │
│  │ │ User A                               [≡] [⋮]        │   │  │
│  │ ├─────────────────────────────────────────────────────┤   │  │
│  │ │                                                     │   │  │
│  │ │  ┌────────────────┐                                │   │  │
│  │ │  │ Hello!         │                                │   │  │
│  │ │  │           12:34│                                │   │  │
│  │ │  └────────────────┘                                │   │  │
│  │ │                                                     │   │  │
│  │ ├─────────────────────────────────────────────────────┤   │  │
│  │ │ [Type a message...                         ] [>]   │   │  │
│  │ └─────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Step-by-Step Breakdown

### **Step 1: User Registration (App Launch)**

```typescript
// App.tsx - useEffect on auth state change
auth().onAuthStateChanged(async (user) => {
    if (user) {
        // Request notification permissions
        const token = await NotificationService.registerForPushNotificationsAsync();
        
        // Save token to Firestore
        await NotificationService.saveUserPushToken(user.uid, token);
    }
});
```

**Result:** Push token stored in `users/{userId}/pushToken`

---

### **Step 2: Message Sent**

```typescript
// MessageService.sendMessage() - Line 90
await NotificationService.sendChatNotification(
    chatId,          // "chat123"
    senderId,        // "userA_id"
    senderName,      // "User A"
    messageText,     // "Hello!"
    participantIds   // ["userA_id", "userB_id"]
);
```

**Process:**
1. Filters out sender from recipients
2. Fetches push tokens for recipients
3. Sends notification to each recipient

---

### **Step 3: Notification Delivery**

```typescript
// NotificationService.sendPushNotification()
await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    body: JSON.stringify({
        to: "ExponentPushToken[xxxxx]",
        title: "User A",
        body: "Hello!",
        data: {
            type: "chat_message",
            chatId: "chat123",
            senderId: "userA_id"
        }
    })
});
```

**Delivery Time:** Usually 1-3 seconds

---

### **Step 4: User Interaction**

#### **Scenario A: App in Foreground**
```typescript
// App.tsx - Notification received listener
notificationListener.current = NotificationService.addNotificationReceivedListener(
    (notification) => {
        // Shows banner at top of screen
        // Plays sound
        // Updates badge count
    }
);
```

#### **Scenario B: App in Background/Killed**
- Notification appears in system tray
- Badge count updated on app icon
- Sound/vibration plays

#### **Scenario C: User Taps Notification**
```typescript
// App.tsx - Notification response listener
responseListener.current = NotificationService.addNotificationResponseListener(
    (response) => {
        const chatId = response.notification.request.content.data.chatId;
        
        // Navigate to specific chat
        navigationRef.current?.navigate("MainStack", {
            screen: "Chat",
            params: { chatId }
        });
    }
);
```

---

## 🗂️ Data Structure

### **Firestore: `users/{userId}`**
```typescript
{
    uid: "userB_id",
    displayName: "User B",
    email: "userb@example.com",
    photoURL: "https://...",
    pushToken: "ExponentPushToken[xxxxxxxxx]",  // ← Added by notification system
    isOnline: true,
    lastSeen: Timestamp,
    createdAt: Timestamp,
    updatedAt: Timestamp
}
```

### **Notification Payload**
```typescript
{
    to: "ExponentPushToken[xxxxxxxxx]",
    sound: "default",
    title: "User A",              // Sender's name
    body: "Hello!",               // Message text
    data: {
        type: "chat_message",
        chatId: "chat123",
        senderId: "userA_id"
    },
    priority: "high"
}
```

---

## 🎯 Key Components

### **1. NotificationService** (`src/services/notificationService.ts`)
- Request permissions
- Get push token
- Send notifications
- Handle notification responses

### **2. MessageService** (`src/services/firestore/messageService.ts`)
- Integrated notification sending
- Calls `NotificationService.sendChatNotification()` after message saved

### **3. App.tsx**
- Registers for push notifications on login
- Listens for incoming notifications
- Handles notification taps
- Navigates to chat when tapped

### **4. UserService** (`src/services/firestore/userService.ts`)
- Stores push tokens in Firestore
- Updates user profile with token

---

## ⚙️ Configuration Files

### **app.config.js**
```javascript
plugins: [
    [
        "expo-notifications",
        {
            icon: "./assets/images/notification-icon.png",
            color: "#ffffff",
            sounds: ["./assets/sounds/notification.wav"],
            mode: "production",
        },
    ],
    // ... other plugins
],
extra: {
    eas: {
        projectId: "your-project-id"  // ← CRITICAL: Must be set!
    },
},
android: {
    permissions: [
        "android.permission.POST_NOTIFICATIONS",
    ],
},
```

---

## 🔐 Security & Best Practices

### ✅ **Safe to Do:**
- Store push tokens in Firestore (they're public by design)
- Include chat IDs in notification data
- Send user names and short message previews

### ❌ **Don't Do:**
- Send sensitive data in notification body (visible in notification tray)
- Send passwords, tokens, or private info
- Store push tokens in local storage only (won't sync across devices)

### 🎯 **Recommended:**
```typescript
// ✅ GOOD - Minimal sensitive info
{
    title: "John Doe",
    body: "Sent you a message",
    data: { chatId: "abc123" }
}

// ❌ BAD - Too much sensitive info
{
    title: "Banking App",
    body: "Your account balance is $5,432.10",
    data: { accountNumber: "123456789" }
}
```

---

## 📈 Monitoring & Debugging

### **Console Logs Flow:**
```
1. 📱 Expo Push Token: ExponentPushToken[...]
2. ✅ Push token saved to Firestore
3. ✅ Message sent successfully: msg123
4. ✅ Push notifications sent
5. 📬 Notification received: {...}
6. 👆 Notification tapped: {...}
```

### **Firestore Verification:**
Check `users/{userId}` document has:
```json
{
    "pushToken": "ExponentPushToken[xxxxx]",
    "updatedAt": Timestamp
}
```

### **Test Notification Delivery:**
```typescript
// Get token from Firestore
const user = await UserService.getUserById("userB_id");
console.log("User B Token:", user.pushToken);

// Send test notification
await NotificationService.sendPushNotification(
    user.pushToken,
    "Test",
    "This is a test!",
    { type: "test" }
);
```

---

## 🚨 Error Handling

```typescript
// In MessageService.sendMessage()
try {
    await NotificationService.sendChatNotification(...);
    console.log("✅ Push notifications sent");
} catch (notifError) {
    console.error("Error sending push notification:", notifError);
    // Don't throw - notification failure shouldn't block message sending
}
```

**Strategy:** Message sending always succeeds even if notification fails.

---

## 🔄 Production Considerations

### **Current Setup: Client-Side Notifications**
- ✅ Works for development/testing
- ✅ Easy to set up
- ⚠️ Limited to ~100 notifications/day/device
- ⚠️ Requires client-side token management

### **Production Setup: Server-Side Notifications**
- ✅ Unlimited notifications
- ✅ Better security
- ✅ Batch sending support
- ✅ Analytics & monitoring
- 🔧 Requires Firebase Cloud Functions or backend server

**Next step:** Implement Firebase Cloud Functions to trigger notifications server-side.

---

**System is ready to use!** Just set your EAS project ID and test on a physical device. 🚀
