import React from "react";
import { Button, Text, View } from "react-native";
import { withIncomingCall } from "../components/hoc/withIncomingCall";

const TestScreenBase = (props: any) => {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Test Screen</Text>
            <Button title="Simulate Incoming Call Sheet" onPress={props.onOpenSheet} />
        </View>
    );
};

// Example props for incoming call
const TestScreen = withIncomingCall((props: any) => (
    // <TestScreenBase
    //     {...props}
    //     callType="voice"
    //     callName="John Doe"
    //     callAvatar={require("../assets/avatar.png")}
    //     callGroupAvatars={[]}
    //     onAccept={() => alert("Call Accepted")}
    //     onReject={() => alert("Call Rejected")}
    // />
    <TestScreenBase
        {...props}
        callType="group"
        callName="Group Call"
        callGroupAvatars={[
            "https://i.pravatar.cc/101",
            "https://i.pravatar.cc/102",
            "https://i.pravatar.cc/103",
        ]}
        onAccept={() => alert("Call Accepted")}
        onReject={() => alert("Call Rejected")}
    />
));

export default TestScreen;
