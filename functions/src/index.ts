// functions/src/index.ts

import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1"; // ✅ Use v1

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Cloud Function: Triggers when a new message is added
 * Sends push notification to the recipient
 */
export const sendChatNotification = functions.firestore
    .document("chats/{chatId}/messages/{messageId}")
    .onCreate(async (snapshot, context) => {
        try {
            const message = snapshot.data();
            const chatId = context.params.chatId;

            const senderId: string = message.senderId;
            const senderName: string = message.senderName || "Someone";
            const receiverId: string | null = message.receiverId;
            const text: string = message.text || "New message";

            console.log("📨 New message:", {
                chatId,
                senderId,
                senderName,
                receiverId,
                text: text.substring(0, 30),
            });

            // Validations
            if (!receiverId) {
                console.log("⚠️ No receiverId found in message");
                return null;
            }

            if (senderId === receiverId) {
                console.log("⚠️ Sender and receiver are same");
                return null;
            }

            // Get receiver's FCM token
            const receiverDoc = await db.collection("users").doc(receiverId).get();

            if (!receiverDoc.exists) {
                console.log("❌ Receiver document not found");
                return null;
            }

            const receiverData = receiverDoc.data();
            const fcmToken: string | undefined = receiverData?.fcmToken;

            if (!fcmToken) {
                console.log("⚠️ Receiver has no FCM token");
                return null;
            }

            console.log("📱 Sending to FCM token:", fcmToken.substring(0, 20) + "...");

            // Build notification payload
            const payload: admin.messaging.Message = {
                token: fcmToken,
                notification: {
                    title: senderName,
                    body: text.length > 100 ? text.substring(0, 100) + "..." : text,
                },
                data: {
                    chatId: chatId,
                    senderId: senderId,
                    senderName: senderName,
                    type: "chat_message",
                },
                android: {
                    priority: "high",
                    notification: {
                        channelId: "chat_messages",
                        priority: "high",
                        sound: "default",
                        defaultSound: true,
                        defaultVibrateTimings: true,
                    },
                },
                apns: {
                    headers: {
                        "apns-priority": "10",
                    },
                    payload: {
                        aps: {
                            sound: "default",
                            badge: 1,
                            contentAvailable: true,
                        },
                    },
                },
            };

            // Send notification
            const response = await admin.messaging().send(payload);
            console.log("✅ Notification sent successfully:", response);

            return { success: true };
        } catch (error: unknown) {
            console.error("❌ Error sending notification:", error);

            // Handle invalid token
            const firebaseError = error as { code?: string; message?: string };
            if (
                firebaseError.code === "messaging/invalid-registration-token" ||
                firebaseError.code === "messaging/registration-token-not-registered"
            ) {
                const receiverId = snapshot.data().receiverId;
                if (receiverId) {
                    console.log("🗑️ Removing invalid token for user:", receiverId);
                    await db.collection("users").doc(receiverId).update({
                        fcmToken: admin.firestore.FieldValue.delete(),
                    });
                }
            }

            return { success: false, error: firebaseError.message };
        }
    });