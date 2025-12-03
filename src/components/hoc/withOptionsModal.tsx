import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export type MenuItemType = {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    showArrow?: boolean;
    onPress?: () => void;
};

export type OptionsModalRef = {
    open: () => void;
    close: () => void;
};

type OptionsModalProps = {
    items: MenuItemType[];
    position?: "top-right" | "top-left" | "center";
};

const OptionsModal = forwardRef<OptionsModalRef, OptionsModalProps>(
    ({ items = [], position = "top-right" }, ref) => {
        const [visible, setVisible] = useState(false);

        useImperativeHandle(ref, () => ({
            open: () => setVisible(true),
            close: () => setVisible(false),
        }));

        const handlePress = (item: MenuItemType) => {
            setVisible(false);
            item.onPress?.();
        };

        const getPositionStyle = () => {
            switch (position) {
                case "top-left":
                    return { justifyContent: "flex-start", alignItems: "flex-start" };
                case "center":
                    return { justifyContent: "center", alignItems: "center" };
                case "top-right":
                default:
                    return { justifyContent: "flex-start", alignItems: "flex-end" };
            }
        };

        return (
            <Modal
                transparent
                visible={visible}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <Pressable
                    style={[styles.backdrop, getPositionStyle() as any]}
                    onPress={() => setVisible(false)}
                >
                    <Pressable style={styles.menuContainer}>
                        {items.map((item, idx) => (
                            <TouchableOpacity
                                key={`${item.label}-${idx}`}
                                style={[
                                    styles.row,
                                    idx < items.length - 1 && styles.rowBorder,
                                ]}
                                activeOpacity={0.7}
                                onPress={() => handlePress(item)}
                            >
                                <View style={styles.iconContainer}>
                                    <Ionicons
                                        name={item.icon}
                                        size={24}
                                        color="#555"
                                    />
                                </View>
                                <Text style={styles.label}>{item.label}</Text>
                                {item.showArrow && (
                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color="#999"
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </Pressable>
                </Pressable>
            </Modal>
        );
    }
);

OptionsModal.displayName = "OptionsModal";

/**
 * HOC: Wraps a component and injects `openOptionsModal` prop.
 * 
 * Usage:
 * const MyComponentWithMenu = withOptionsModal(MyComponent, menuItems);
 * 
 * In MyComponent, you can call props.openOptionsModal() to open the modal.
 */
export const withOptionsModal = <P extends object>(
    WrappedComponent: React.ComponentType<P & { openOptionsModal: () => void }>,
    items: MenuItemType[],
    position?: OptionsModalProps["position"]
) => {
    const WithOptionsModal = (props: Omit<P, "openOptionsModal">) => {
        const modalRef = React.useRef<OptionsModalRef>(null);

        const openOptionsModal = () => {
            modalRef.current?.open();
        };

        return (
            <>
                <WrappedComponent
                    {...(props as P)}
                    openOptionsModal={openOptionsModal}
                />
                <OptionsModal ref={modalRef} items={items} position={position} />
            </>
        );
    };

    WithOptionsModal.displayName = `WithOptionsModal(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

    return WithOptionsModal;
};

export default OptionsModal;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        paddingTop: 50,
        paddingHorizontal: 12,
    },
    menuContainer: {
        width: Math.min(280, SCREEN_WIDTH * 0.75),
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 8,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 14,
    },
    rowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E5E5EA",
    },
    iconContainer: {
        width: 32,
        alignItems: "center",
        marginRight: 14,
    },
    label: {
        flex: 1,
        fontSize: 17,
        color: "#1C1C1E",
        fontWeight: "400",
    },
});
