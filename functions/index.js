const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Send push notification when a new message is created
 * Triggers on: /chats/{chatId}/messages/{messageId}
 */
exports.sendChatNotification = functions.firestore
    .document('chats/{chatId}/messages/{messageId}')
    .onCreate(async (snap, context) => {
        try {
            const message = snap.data();
            const chatId = context.params.chatId;

            console.log('New message in chat:', chatId, message);

            // Don't send notification if message is from system or doesn't have required fields
            if (!message.senderId || !message.text) {
                console.log('Skipping notification - missing required fields');
                return null;
            }

            // Get chat details to find participants
            const chatDoc = await admin.firestore().collection('chats').doc(chatId).get();

            if (!chatDoc.exists) {
                console.log('Chat not found:', chatId);
                return null;
            }

            const chatData = chatDoc.data();
            const participants = chatData.participants || [];

            // Get sender info
            const senderDoc = await admin.firestore().collection('users').doc(message.senderId).get();
            const senderName = senderDoc.exists ? (senderDoc.data().displayName || 'Someone') : 'Someone';

            // Send notification to all participants except sender
            const notificationPromises = participants
                .filter(participantId => participantId !== message.senderId)
                .map(async (participantId) => {
                    try {
                        // Get recipient's FCM token
                        const recipientDoc = await admin.firestore().collection('users').doc(participantId).get();

                        if (!recipientDoc.exists) {
                            console.log('Recipient not found:', participantId);
                            return null;
                        }

                        const recipientData = recipientDoc.data();
                        const fcmToken = recipientData.fcmToken;

                        if (!fcmToken) {
                            console.log('No FCM token for user:', participantId);
                            return null;
                        }

                        // Prepare notification payload
                        const payload = {
                            token: fcmToken,
                            notification: {
                                title: senderName,
                                body: message.text.length > 100
                                    ? message.text.substring(0, 100) + '...'
                                    : message.text,
                            },
                            data: {
                                chatId: chatId,
                                senderId: message.senderId,
                                type: 'chat_message',
                                messageId: context.params.messageId,
                            },
                            android: {
                                priority: 'high',
                                notification: {
                                    channelId: 'default',
                                    sound: 'default',
                                    clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                                },
                            },
                            apns: {
                                payload: {
                                    aps: {
                                        sound: 'default',
                                        badge: 1,
                                    },
                                },
                            },
                        };

                        // Send the notification
                        const response = await admin.messaging().send(payload);
                        console.log('Notification sent successfully to:', participantId, response);
                        return response;
                    } catch (error) {
                        console.error('Error sending notification to:', participantId, error);

                        // If token is invalid, remove it from user document
                        if (error.code === 'messaging/invalid-registration-token' ||
                            error.code === 'messaging/registration-token-not-registered') {
                            await admin.firestore().collection('users').doc(participantId).update({
                                fcmToken: admin.firestore.FieldValue.delete(),
                            });
                            console.log('Removed invalid FCM token for user:', participantId);
                        }
                        return null;
                    }
                });

            await Promise.all(notificationPromises);
            console.log('All notifications processed');
            return null;
        } catch (error) {
            console.error('Error in sendChatNotification:', error);
            return null;
        }
    });

/**
 * Send notification when a user receives a friend request
 * Triggers on: /users/{userId}/friendRequests/{requestId}
 */
exports.sendFriendRequestNotification = functions.firestore
    .document('users/{userId}/friendRequests/{requestId}')
    .onCreate(async (snap, context) => {
        try {
            const request = snap.data();
            const recipientId = context.params.userId;

            // Get recipient's FCM token
            const recipientDoc = await admin.firestore().collection('users').doc(recipientId).get();

            if (!recipientDoc.exists) {
                return null;
            }

            const fcmToken = recipientDoc.data().fcmToken;
            if (!fcmToken) {
                console.log('No FCM token for user:', recipientId);
                return null;
            }

            // Get sender info
            const senderDoc = await admin.firestore().collection('users').doc(request.senderId).get();
            const senderName = senderDoc.exists ? (senderDoc.data().displayName || 'Someone') : 'Someone';

            const payload = {
                token: fcmToken,
                notification: {
                    title: 'New Friend Request',
                    body: `${senderName} sent you a friend request`,
                },
                data: {
                    type: 'friend_request',
                    senderId: request.senderId,
                },
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'default',
                        sound: 'default',
                    },
                },
            };

            const response = await admin.messaging().send(payload);
            console.log('Friend request notification sent:', response);
            return response;
        } catch (error) {
            console.error('Error sending friend request notification:', error);
            return null;
        }
    });

/**
 * Clean up old messages (optional - runs daily)
 */
exports.cleanupOldMessages = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
        const now = admin.firestore.Timestamp.now();
        const thirtyDaysAgo = new Date(now.toDate().getTime() - 30 * 24 * 60 * 60 * 1000);

        const snapshot = await admin.firestore()
            .collectionGroup('messages')
            .where('createdAt', '<', thirtyDaysAgo)
            .get();

        const batch = admin.firestore().batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`Deleted ${snapshot.size} old messages`);
        return null;
    });
