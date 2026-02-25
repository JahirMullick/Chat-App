// Firestore Services - Main Export
import firestore from "@react-native-firebase/firestore";

export { ChatService } from "./chatService";
export { MessageService } from "./messageService";
export { ReactionService } from "./reactionService";
export { StoryService } from "./storyService";
export { TabService } from "./tabService";
export { TypingService } from "./typingService";
export { UserService } from "./userService";

// Re-export types for convenience
export * from "../../types/firestore.types";

/**
 * Test Firestore database connection
 * Call this function to verify if Firestore is properly connected
 */
export const testFirestoreConnection = async (): Promise<boolean> => {
    try {
        const db = firestore();
        console.log("🔄 Testing Firestore connection...");
        
        // Try to access Firestore - this will fail if not connected
        const testRef = db.collection("_connection_test");
        
        // Attempt a simple read operation
        await testRef.limit(1).get();
        
        console.log("✅ Firestore connection successful!");
        
        return true;
    } catch (error: any) {
        console.error("❌ Firestore connection failed!");
        console.error("🔴 Error:", error?.message || "Unknown error");
        if (error?.code) {
            console.error("Error code:", error.code);
        }
        
        // Provide helpful error messages
        if (error?.code === "firestore/permission-denied") {
            console.error("💡 FIX: Go to Firebase Console → Firestore → Rules and add:");
            console.error(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
            `);
        } else if (error?.code === "firestore/unavailable") {
            console.error("💡 Hint: Check your internet connection or Firebase project configuration");
        } else if (error?.message?.includes("No Firebase App")) {
            console.error("💡 Hint: Firebase is not initialized. Check google-services.json");
        }
        
        return false;
    }
};
