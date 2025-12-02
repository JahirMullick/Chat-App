import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabNavigation from "../../Navigation/TabNavigation";

// Stories data type
export type Story = {
    id: string;
    name: string;
    image?: string;
    hasNewStory?: boolean;
    isMyStory?: boolean;
};

// Tab filter type
export type TabFilter = {
    label: string;
    count?: number;
    isActive?: boolean;
};

interface ChatLayoutProps {
    title: string;
    stories?: Story[];
    tabs?: TabFilter[];
    activeTab?: string;
    onTabPress?: (tab: string) => void;
    onStoryPress?: (story: Story) => void;
    onSearchPress?: () => void;
    showFab?: boolean;
    onFabPress?: () => void;
    children: React.ReactNode;
}

const withChatLayout = <P extends object>(
    WrappedComponent: React.ComponentType<P>
) => {
    return (props: P & ChatLayoutProps) => {
        const {
            title,
            stories = [],
            tabs = [],
            activeTab = "All",
            onTabPress,
            onStoryPress,
            onSearchPress,
            showFab = true,
            onFabPress,
            children,
            ...restProps
        } = props;

        const insets = useSafeAreaInsets();

        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />

                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <Text style={styles.title}>{title}</Text>
                    <TouchableOpacity onPress={onSearchPress}>
                        <Ionicons name="search-outline" size={26} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Stories Row */}
                {stories.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.storiesContainer}
                        contentContainerStyle={styles.storiesContent}
                    >
                        {stories.map((story) => (
                            <TouchableOpacity
                                key={story.id}
                                style={styles.storyItem}
                                onPress={() => onStoryPress?.(story)}
                            >
                                <View
                                    style={[
                                        styles.storyAvatar,
                                        story.hasNewStory && styles.storyAvatarActive,
                                    ]}
                                >
                                    {story.image ? (
                                        <View style={styles.storyImagePlaceholder}>
                                            <Text style={styles.storyInitial}>
                                                {story.name.charAt(0)}
                                            </Text>
                                        </View>
                                    ) : (
                                        <View style={styles.storyImagePlaceholder}>
                                            <Ionicons name="paper-plane" size={24} color="#fff" />
                                        </View>
                                    )}
                                    {story.isMyStory && (
                                        <View style={styles.addStoryBadge}>
                                            <Ionicons name="add" size={14} color="#fff" />
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.storyName} numberOfLines={1}>
                                    {story.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Filter Tabs */}
                {tabs.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.tabsContainer}
                        contentContainerStyle={styles.tabsContent}
                    >
                        {tabs.map((tab, index) => {
                            const isActive = activeTab === tab.label;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.tabBtn}
                                    onPress={() => onTabPress?.(tab.label)}
                                >
                                    <Text
                                        style={[
                                            styles.tabText,
                                            isActive && styles.tabTextActive,
                                        ]}
                                    >
                                        {tab.label}
                                        {tab.count !== undefined && (
                                            <Text
                                                style={[
                                                    styles.tabCount,
                                                    isActive && styles.tabCountActive,
                                                ]}
                                            >
                                                {" "}
                                                {tab.count}
                                            </Text>
                                        )}
                                    </Text>
                                    {isActive && <View style={styles.tabIndicator} />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}

                {/* Content */}
                <View style={styles.content}>
                    <WrappedComponent {...(restProps as P)} />
                </View>

                {/* FAB Button */}
                {showFab && (
                    <TouchableOpacity
                        style={[styles.fab, { bottom: 80 + insets.bottom }]}
                        onPress={onFabPress}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={28} color="#fff" />
                    </TouchableOpacity>
                )}

                {/* Bottom Tab Navigation */}
                <TabNavigation activeTab="chats" />
            </View>
        );
    };
};

export default withChatLayout;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#000",
    },
    storiesContainer: {
        maxHeight: 110,
        backgroundColor: "#fff",
    },
    storiesContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    storyItem: {
        alignItems: "center",
        marginRight: 16,
        width: 70,
    },
    storyAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: "#E5E5EA",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    storyAvatarActive: {
        borderColor: "#007AFF",
    },
    storyImagePlaceholder: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
    },
    storyInitial: {
        fontSize: 24,
        fontWeight: "600",
        color: "#fff",
    },
    addStoryBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    storyName: {
        marginTop: 6,
        fontSize: 12,
        color: "#000",
        textAlign: "center",
    },
    tabsContainer: {
        maxHeight: 44,
        backgroundColor: "#fff",
        borderBottomWidth: 0.5,
        borderBottomColor: "#E5E5EA",
    },
    tabsContent: {
        paddingHorizontal: 16,
        alignItems: "center",
    },
    tabBtn: {
        marginRight: 24,
        paddingVertical: 10,
        position: "relative",
    },
    tabText: {
        fontSize: 15,
        color: "#8E8E93",
        fontWeight: "500",
    },
    tabTextActive: {
        color: "#007AFF",
    },
    tabCount: {
        fontSize: 15,
        color: "#8E8E93",
        fontWeight: "400",
    },
    tabCountActive: {
        color: "#007AFF",
    },
    tabIndicator: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: "#007AFF",
        borderRadius: 1,
    },
    content: {
        flex: 1,
        backgroundColor: "#fff",
    },
    fab: {
        position: "absolute",
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
