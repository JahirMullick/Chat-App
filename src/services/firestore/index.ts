// Firestore Services - Main Export
import { getFirestore } from "@react-native-firebase/firestore";

export { ChatService } from "./chatService";
export { MessageService } from "./messageService";
export { StoryService } from "./storyService";
export { TabService } from "./tabService";
export { UserService } from "./userService";

// Re-export types for convenience
export * from "../../types/firestore.types";

/**
 * Test Firestore database connection
 * Call this function to verify if Firestore is properly connected
 */
export const testFirestoreConnection = async (): Promise<boolean> => {
    try {
        const firestore = getFirestore();
        console.log("🔄 Testing Firestore connection...");
        console.log("📱 Firebase App:", firestore.app.name);
        
        // Try to access Firestore - this will fail if not connected
        const testRef = firestore.collection("_connection_test");
        
        // Attempt a simple read operation
        await testRef.limit(1).get();
        
        console.log("✅ Firestore connection successful!");
        console.log("📊 Firestore Settings:", {
            app: firestore.app.name,
        });
        
        return true;
    } catch (error: any) {
        console.error("❌ Firestore connection failed!");
        console.error("🔴 Full Error:", JSON.stringify(error, null, 2));
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        // Provide helpful error messages
        if (error.code === "firestore/permission-denied") {
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
        } else if (error.code === "firestore/unavailable") {
            console.error("💡 Hint: Check your internet connection or Firebase project configuration");
        } else if (error.message?.includes("No Firebase App")) {
            console.error("💡 Hint: Firebase is not initialized. Check google-services.json");
        }
        
        return false;
    }
};
