import React, { useState } from "react";
import { View } from "react-native";
import { BottomRespondSheet } from "../BottomRespondSheet";
import { IncomingCallCard } from "../IncomingCallCard";

export const withIncomingCall = (WrappedComponent: any) => {
    return (props: any) => {
        const [sheetVisible, setSheetVisible] = useState(false);

        return (
            <View style={{ flex: 1 }}>
                <WrappedComponent {...props} />

                <IncomingCallCard
                    type={props.callType}
                    name={props.callName}
                    avatar={props.callAvatar}
                    groupAvatars={props.callGroupAvatars}
                    onAccept={props.onAccept}
                    onReject={props.onReject}
                    onOpenSheet={() => setSheetVisible(true)}
                />

                <BottomRespondSheet
                    visible={sheetVisible}
                    onClose={() => setSheetVisible(false)}
                />
            </View>
        );
    };
};
