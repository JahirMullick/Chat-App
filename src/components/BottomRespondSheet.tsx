import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const BottomRespondSheet = ({ visible, onClose }: any) => {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <TouchableOpacity style={styles.primaryBtn}>
                        <Text style={styles.primaryText}>OPEN CHAT</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.msgBtn}>
                        <Text style={styles.msgText}>I’ll call you later.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.msgBtn}>
                        <Text style={styles.msgText}>Can't talk now.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onClose} style={styles.closePill} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    sheet: {
        backgroundColor: "white",
        paddingTop: 25,
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    primaryBtn: {
        backgroundColor: "#1B93FF",
        padding: 14,
        borderRadius: 40,
        marginBottom: 15,
    },
    primaryText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
        textAlign: "center",
    },
    msgBtn: {
        backgroundColor: "#F4F4F4",
        padding: 14,
        borderRadius: 40,
        marginBottom: 12,
    },
    msgText: {
        textAlign: "center",
        fontSize: 16,
    },
    closePill: {
        marginTop: 15,
        alignSelf: "center",
        width: 55,
        height: 6,
        backgroundColor: "#ddd",
        borderRadius: 20,
    },
});
