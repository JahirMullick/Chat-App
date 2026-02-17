// Background images configuration
export const CHAT_BACKGROUNDS = {
    none: null,
    default: require("../../assets/Backgrounds/batman.jpg"), // Set default background
    batman: require("../../assets/Backgrounds/batman.jpg"),
    eyes: require("../../assets/Backgrounds/eyes.jpg"),
    file: require("../../assets/Backgrounds/file.jpg"),
    sayings: require("../../assets/Backgrounds/sayings.jpg"),
    sayings1: require("../../assets/Backgrounds/sayings1.jpg"),
    sayings2: require("../../assets/Backgrounds/sayings2.jpg"),
    totoro: require("../../assets/Backgrounds/totoro.jpg"),
    tweety_bird: require("../../assets/Backgrounds/tweety_bird.jpg"),
    anime: require("../../assets/Backgrounds/anime.jpg"),
    a1: require("../../assets/Backgrounds/a1.jpeg"),
    a2: require("../../assets/Backgrounds/a2.jpeg"),
    a3: require("../../assets/Backgrounds/a3.jpeg"),

} as const;

export type BackgroundId = keyof typeof CHAT_BACKGROUNDS;

// Helper function to get background source by ID
export const getBackgroundSource = (id: string | undefined) => {
    console.log("🖼️ getBackgroundSource called with ID:", id);
    if (!id || id === "none") {
        console.log("🖼️ Returning default background");
        return CHAT_BACKGROUNDS.default; // Return default background
    }
    const source = CHAT_BACKGROUNDS[id as BackgroundId] || CHAT_BACKGROUNDS.default; // Fallback to default
    console.log("🖼️ Returning source:", source ? "Found" : "Not found");
    return source;
};
