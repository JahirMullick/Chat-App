// Background images configuration
export const CHAT_BACKGROUNDS = {
    none: null,
    batman: require("../../assets/Backgrounds/batman.jpg"),
    eyes: require("../../assets/Backgrounds/eyes.jpg"),
    file: require("../../assets/Backgrounds/file.jpg"),
    sayings: require("../../assets/Backgrounds/sayings.jpg"),
    sayings1: require("../../assets/Backgrounds/sayings1.jpg"),
    sayings2: require("../../assets/Backgrounds/sayings2.jpg"),
    totoro: require("../../assets/Backgrounds/totoro.jpg"),
    tweety_bird: require("../../assets/Backgrounds/tweety_bird.jpg"),
} as const;

export type BackgroundId = keyof typeof CHAT_BACKGROUNDS;

// Helper function to get background source by ID
export const getBackgroundSource = (id: string | undefined) => {
    console.log("🖼️ getBackgroundSource called with ID:", id);
    if (!id || id === "none") {
        console.log("🖼️ Returning null (no background)");
        return null;
    }
    const source = CHAT_BACKGROUNDS[id as BackgroundId] || null;
    console.log("🖼️ Returning source:", source ? "Found" : "Not found");
    return source;
};
