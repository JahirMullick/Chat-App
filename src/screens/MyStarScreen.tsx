// import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import React, { useState } from 'react';
// import {
//     FlatList,
//     Image,
//     Modal,
//     ScrollView,
//     StatusBar,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// // --- Data for the Purchase List ---
// const PACKAGES = [
//     { id: '1', stars: '100 Stars', price: '₹199.00', icon: 'star' },
//     { id: '2', stars: '150 Stars', price: '₹299.00', icon: 'star' },
//     { id: '3', stars: '250 Stars', price: '₹502.99', icon: 'star' },
//     { id: '4', stars: '350 Stars', price: '₹709.00', icon: 'star' }, // simulated icon variation
//     { id: '5', stars: '500 Stars', price: '₹999.00', icon: 'star' },
//     { id: '6', stars: '750 Stars', price: '₹1,499.00', icon: 'star' },
//     { id: '7', stars: '1 000 Stars', price: '₹1,999.00', icon: 'star' },
//     { id: '8', stars: '1 500 Stars', price: '₹2,999.00', icon: 'star' },
//     { id: '9', stars: '2 500 Stars', price: '₹4,999.00', icon: 'star' },
// ];

// // export default function MyStarScreen() {
// const MyStarScreen: React.FC = () => {
//     const navigation = useNavigation();
//     const [modalVisible, setModalVisible] = useState(false);

//     // Helper to render the custom Star Graphic (Composite of icons)
//     const renderHeroGraphic = () => (
//         <View style={styles.heroContainer}>
//             {/* Decorative small stars (simulated positions) */}
//             <MaterialCommunityIcons name="star-four-points" size={20} color="#FFD700" style={{ position: 'absolute', top: 10, left: 80, opacity: 0.6 }} />
//             <MaterialCommunityIcons name="star-four-points" size={15} color="#FF8C00" style={{ position: 'absolute', top: 40, right: 90, opacity: 0.8 }} />
//             <MaterialCommunityIcons name="star-four-points" size={25} color="#FFA500" style={{ position: 'absolute', bottom: 20, left: 100, opacity: 0.5 }} />
//             <MaterialCommunityIcons name="star-four-points" size={18} color="#FFD700" style={{ position: 'absolute', bottom: 50, right: 70, opacity: 0.7 }} />

//             {/* Main Star */}
//             <Image
//                 source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png' }} // Using a generic star image for the 3D look, or fallback to icon
//                 style={{ width: 140, height: 140, tintColor: '#FFD700' }}
//             />
//         </View>
//     );

//     return (
//         <SafeAreaView style={styles.container}>
//             <StatusBar barStyle="dark-content" backgroundColor="#fff" />

//             {/* --- Main Screen Content --- */}
//             <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

//                 {/* Header Back Button */}
//                 <View style={styles.header}>
//                     <TouchableOpacity onPress={() => navigation.goBack()}>
//                         <Ionicons name="arrow-back" size={26} color="black" />
//                     </TouchableOpacity>
//                 </View>

//                 {/* Hero Section */}
//                 {renderHeroGraphic()}

//                 <View style={styles.textSection}>
//                     <Text style={styles.title}>Telegram Stars</Text>
//                     <Text style={styles.subtitle}>
//                         Buy Stars to unlock content and services{'\n'}in mini apps on Telegram.
//                         <Text style={styles.linkText}> More about Stars &gt;</Text>
//                     </Text>
//                 </View>

//                 {/* Balance Card Section */}
//                 <View style={styles.cardContainer}>
//                     <View style={styles.balanceRow}>
//                         <Ionicons name="star" size={28} color="#FFD700" />
//                         <Text style={styles.balanceAmount}> 0</Text>
//                     </View>
//                     <Text style={styles.balanceLabel}>your balance</Text>

//                     <TouchableOpacity
//                         style={styles.buyButton}
//                         activeOpacity={0.8}
//                         onPress={() => setModalVisible(true)}
//                     >
//                         <Text style={styles.buyButtonText}>Buy Stars</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity style={styles.giftButton}>
//                         <Ionicons name="people" size={20} color="#5CA5E6" style={{ marginRight: 6 }} />
//                         <Text style={styles.giftButtonText}>Gift Stars to Friends</Text>
//                     </TouchableOpacity>
//                 </View>

//                 {/* Earn Stars Section */}
//                 <View style={styles.listSection}>
//                     <TouchableOpacity style={styles.listItem}>
//                         <View style={[styles.iconBox, { backgroundColor: '#62D568' }]}>
//                             <FontAwesome5 name="hand-holding-usd" size={18} color="white" />
//                         </View>
//                         <View style={styles.listItemContent}>
//                             <View style={styles.listItemHeader}>
//                                 <Text style={styles.listItemTitle}>Earn Stars</Text>
//                                 <View style={styles.badge}>
//                                     <Text style={styles.badgeText}>NEW</Text>
//                                 </View>
//                             </View>
//                             <Text style={styles.listItemDesc}>
//                                 Distribute links to mini apps and earn a share of their revenue in Stars.
//                             </Text>
//                         </View>
//                         <Ionicons name="chevron-forward" size={20} color="#C8C7CC" />
//                     </TouchableOpacity>
//                 </View>

//             </ScrollView>

//             {/* --- Purchase Bottom Sheet Modal --- */}
//             <Modal
//                 animationType="slide"
//                 transparent={true}
//                 visible={modalVisible}
//                 onRequestClose={() => setModalVisible(false)}
//             >
//                 <View style={styles.modalOverlay}>
//                     {/* Transparent touchable to close modal when clicking outside */}
//                     <TouchableOpacity
//                         style={styles.modalDismissArea}
//                         onPress={() => setModalVisible(false)}
//                         activeOpacity={1}
//                     />

//                     <View style={styles.modalContent}>
//                         <View style={styles.modalHeader}>
//                             <Text style={styles.modalTitle}>Choose package</Text>
//                         </View>

//                         <FlatList
//                             data={PACKAGES}
//                             keyExtractor={(item) => item.id}
//                             showsVerticalScrollIndicator={false}
//                             renderItem={({ item, index }) => (
//                                 <TouchableOpacity style={styles.packageItem}>
//                                     {/* Simulate star stacking icons based on index */}
//                                     <View style={styles.packageIconContainer}>
//                                         {index > 5 ? (
//                                             <MaterialCommunityIcons name="star-box-multiple" size={24} color="#FFD700" />
//                                         ) : index > 2 ? (
//                                             <MaterialCommunityIcons name="star-three-points" size={24} color="#FFD700" />
//                                         ) : (
//                                             <Ionicons name="star" size={24} color="#FFD700" />
//                                         )}
//                                     </View>
//                                     <Text style={styles.packageText}>{item.stars}</Text>
//                                     <View style={{ flex: 1 }} />
//                                     <Text style={styles.packagePrice}>{item.price}</Text>
//                                 </TouchableOpacity>
//                             )}
//                             ListFooterComponent={() => (
//                                 <View style={styles.modalFooter}>
//                                     <Text style={styles.termsText}>
//                                         By proceeding and purchasing Stars, you agree with the
//                                         <Text style={{ color: '#40A7E3' }}> Terms and Conditions</Text>.
//                                     </Text>
//                                 </View>
//                             )}
//                         />
//                     </View>
//                 </View>
//             </Modal>
//         </SafeAreaView>
//     );
// }


// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#FFFFFF', // Or slightly off-white if needed
//     },
//     header: {
//         paddingHorizontal: 16,
//         paddingTop: 10,
//         paddingBottom: 10,
//     },

//     // Hero
//     heroContainer: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         height: 200,
//         marginTop: 10,
//     },

//     // Texts
//     textSection: {
//         alignItems: 'center',
//         paddingHorizontal: 30,
//         marginBottom: 20,
//     },
//     title: {
//         fontSize: 26,
//         fontWeight: '700',
//         color: '#000000',
//         marginBottom: 10,
//     },
//     subtitle: {
//         fontSize: 15,
//         color: '#000000',
//         textAlign: 'center',
//         lineHeight: 22,
//     },
//     linkText: {
//         color: '#40A7E3',
//     },

//     // Main Card
//     cardContainer: {
//         backgroundColor: '#FFFFFF',
//         marginHorizontal: 16,
//         borderRadius: 12,
//         paddingVertical: 20,
//         alignItems: 'center',
//         // Slight shadow to separate from background if background wasn't white
//         // Here strictly following the white-on-white look of Image 1
//         borderBottomWidth: 10,
//         borderBottomColor: '#F0F2F5', // The grey gap separator
//         paddingBottom: 30,
//     },
//     balanceRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 4,
//     },
//     balanceAmount: {
//         fontSize: 42,
//         fontWeight: '600',
//         color: '#000000',
//     },
//     balanceLabel: {
//         fontSize: 16,
//         color: '#707579',
//         marginBottom: 20,
//     },
//     buyButton: {
//         backgroundColor: '#40A7E3',
//         width: '90%',
//         paddingVertical: 14,
//         borderRadius: 10,
//         alignItems: 'center',
//         marginBottom: 15,
//     },
//     buyButtonText: {
//         color: '#FFFFFF',
//         fontSize: 17,
//         fontWeight: '600',
//     },
//     giftButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     giftButtonText: {
//         color: '#5CA5E6',
//         fontSize: 16,
//         fontWeight: '500',
//     },

//     // List Section
//     listSection: {
//         backgroundColor: '#FFFFFF',
//     },
//     listItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//     },
//     iconBox: {
//         width: 36,
//         height: 36,
//         borderRadius: 10,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 14,
//     },
//     listItemContent: {
//         flex: 1,
//         marginRight: 10,
//     },
//     listItemHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 2,
//     },
//     listItemTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#000000',
//     },
//     badge: {
//         backgroundColor: '#40A7E3',
//         paddingHorizontal: 4,
//         paddingVertical: 1,
//         borderRadius: 4,
//         marginLeft: 6,
//     },
//     badgeText: {
//         color: 'white',
//         fontSize: 10,
//         fontWeight: 'bold',
//     },
//     listItemDesc: {
//         fontSize: 14,
//         color: '#707579',
//         lineHeight: 18,
//     },

//     // Modal Styles
//     modalOverlay: {
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.3)', // Dimmed background
//         justifyContent: 'flex-end',
//     },
//     modalDismissArea: {
//         flex: 1,
//     },
//     modalContent: {
//         backgroundColor: '#FFFFFF',
//         borderTopLeftRadius: 16,
//         borderTopRightRadius: 16,
//         height: '65%', // Adjust height to match screenshot
//         paddingTop: 20,
//     },
//     modalHeader: {
//         paddingHorizontal: 16,
//         marginBottom: 10,
//     },
//     modalTitle: {
//         fontSize: 17,
//         fontWeight: '600',
//         color: '#40A7E3',
//     },
//     packageItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 14,
//         paddingHorizontal: 16,
//         borderBottomWidth: StyleSheet.hairlineWidth,
//         borderBottomColor: '#E5E5EA',
//     },
//     packageIconContainer: {
//         width: 30,
//         alignItems: 'center',
//         marginRight: 12,
//     },
//     packageText: {
//         fontSize: 17,
//         fontWeight: '500',
//         color: '#000000',
//     },
//     packagePrice: {
//         fontSize: 17,
//         color: '#707579',
//     },
//     modalFooter: {
//         padding: 20,
//         alignItems: 'center',
//         paddingBottom: 40,
//     },
//     termsText: {
//         textAlign: 'center',
//         color: '#707579',
//         fontSize: 13,
//         lineHeight: 18,
//     },
// });

// export default MyStarScreen;








// V2 

import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Data for the Purchase List ---
const PACKAGES = [
    { id: '1', stars: '100 Stars', price: '₹199.00', icon: 'star' },
    { id: '2', stars: '150 Stars', price: '₹299.00', icon: 'star' },
    { id: '3', stars: '250 Stars', price: '₹502.99', icon: 'star' },
    { id: '4', stars: '350 Stars', price: '₹709.00', icon: 'star' }, // simulated icon variation
    { id: '5', stars: '500 Stars', price: '₹999.00', icon: 'star' },
    { id: '6', stars: '750 Stars', price: '₹1,499.00', icon: 'star' },
    { id: '7', stars: '1 000 Stars', price: '₹1,999.00', icon: 'star' },
    { id: '8', stars: '1 500 Stars', price: '₹2,999.00', icon: 'star' },
    { id: '9', stars: '2 500 Stars', price: '₹4,999.00', icon: 'star' },
];

// export default function MyStarScreen() {
const MyStarScreen: React.FC = () => {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);

    // Helper to render the custom Star Graphic (Composite of icons)
    const renderHeroGraphic = () => (
        <View style={styles.heroContainer}>
            {/* Decorative small stars (simulated positions) */}
            <MaterialCommunityIcons name="star-four-points" size={20} color="#FFD700" style={{ position: 'absolute', top: 10, left: 80, opacity: 0.6 }} />
            <MaterialCommunityIcons name="star-four-points" size={15} color="#FF8C00" style={{ position: 'absolute', top: 40, right: 90, opacity: 0.8 }} />
            <MaterialCommunityIcons name="star-four-points" size={25} color="#FFA500" style={{ position: 'absolute', bottom: 20, left: 100, opacity: 0.5 }} />
            <MaterialCommunityIcons name="star-four-points" size={18} color="#FFD700" style={{ position: 'absolute', bottom: 50, right: 70, opacity: 0.7 }} />

            {/* Main Star */}
            <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png' }} // Using a generic star image for the 3D look, or fallback to icon
                style={{ width: 140, height: 140, tintColor: '#FFD700' }}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* --- Main Screen Content --- */}
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Header Back Button */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={26} color="black" />
                    </TouchableOpacity>
                </View>

                {/* Hero Section */}
                {renderHeroGraphic()}

                <View style={styles.textSection}>
                    <Text style={styles.title}>Telegram Stars</Text>
                    <Text style={styles.subtitle}>
                        Buy Stars to unlock content and services{'\n'}in mini apps on Telegram.
                        <Text style={styles.linkText}> More about Stars &gt;</Text>
                    </Text>
                </View>

                {/* Balance Card Section */}
                <View style={styles.cardContainer}>
                    <View style={styles.balanceRow}>
                        <Ionicons name="star" size={28} color="#FFD700" />
                        <Text style={styles.balanceAmount}> 0</Text>
                    </View>
                    <Text style={styles.balanceLabel}>your balance</Text>

                    <TouchableOpacity
                        style={styles.buyButton}
                        activeOpacity={0.8}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.buyButtonText}>Buy Stars</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.giftButton}>
                        <Ionicons name="people" size={20} color="#5CA5E6" style={{ marginRight: 6 }} />
                        <Text style={styles.giftButtonText}>Gift Stars to Friends</Text>
                    </TouchableOpacity>
                </View>

                {/* Earn Stars Section */}
                <View style={styles.listSection}>
                    <TouchableOpacity style={styles.listItem}>
                        <View style={[styles.iconBox, { backgroundColor: '#62D568' }]}>
                            <FontAwesome5 name="hand-holding-usd" size={18} color="white" />
                        </View>
                        <View style={styles.listItemContent}>
                            <View style={styles.listItemHeader}>
                                <Text style={styles.listItemTitle}>Earn Stars</Text>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>NEW</Text>
                                </View>
                            </View>
                            <Text style={styles.listItemDesc}>
                                Distribute links to mini apps and earn a share of their revenue in Stars.
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#C8C7CC" />
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* --- Purchase Bottom Sheet Modal --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    {/* Transparent touchable to close modal when clicking outside */}
                    <TouchableOpacity
                        style={styles.modalDismissArea}
                        onPress={() => setModalVisible(false)}
                        activeOpacity={1}
                    />

                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose package</Text>
                        </View>

                        <FlatList
                            data={PACKAGES}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity style={styles.packageItem}>
                                    {/* Simulate star stacking icons based on index */}
                                    <View style={styles.packageIconContainer}>
                                        {index > 5 ? (
                                            <MaterialCommunityIcons name="star-box-multiple" size={24} color="#FFD700" />
                                        ) : index > 2 ? (
                                            <MaterialCommunityIcons name="star-three-points" size={24} color="#FFD700" />
                                        ) : (
                                            <Ionicons name="star" size={24} color="#FFD700" />
                                        )}
                                    </View>
                                    <Text style={styles.packageText}>{item.stars}</Text>
                                    <View style={{ flex: 1 }} />
                                    <Text style={styles.packagePrice}>{item.price}</Text>
                                </TouchableOpacity>
                            )}
                            ListFooterComponent={() => (
                                <View style={styles.modalFooter}>
                                    <Text style={styles.termsText}>
                                        By proceeding and purchasing Stars, you agree with the
                                        <Text style={{ color: '#40A7E3' }}> Terms and Conditions</Text>.
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Or slightly off-white if needed
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
    },

    // Hero
    heroContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        marginTop: 10,
    },

    // Texts
    textSection: {
        alignItems: 'center',
        paddingHorizontal: 30,
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 15,
        color: '#000000',
        textAlign: 'center',
        lineHeight: 22,
    },
    linkText: {
        color: '#40A7E3',
    },

    // Main Card
    cardContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        borderRadius: 12,
        paddingVertical: 20,
        alignItems: 'center',
        // Slight shadow to separate from background if background wasn't white
        // Here strictly following the white-on-white look of Image 1
        borderBottomWidth: 10,
        borderBottomColor: '#F0F2F5', // The grey gap separator
        paddingBottom: 30,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    balanceAmount: {
        fontSize: 42,
        fontWeight: '600',
        color: '#000000',
    },
    balanceLabel: {
        fontSize: 16,
        color: '#707579',
        marginBottom: 20,
    },
    buyButton: {
        backgroundColor: '#40A7E3',
        width: '90%',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    buyButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
    },
    giftButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    giftButtonText: {
        color: '#5CA5E6',
        fontSize: 16,
        fontWeight: '500',
    },

    // List Section
    listSection: {
        backgroundColor: '#FFFFFF',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    listItemContent: {
        flex: 1,
        marginRight: 10,
    },
    listItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    listItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
    },
    badge: {
        backgroundColor: '#40A7E3',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
        marginLeft: 6,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    listItemDesc: {
        fontSize: 14,
        color: '#707579',
        lineHeight: 18,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)', // Dimmed background
        justifyContent: 'flex-end',
    },
    modalDismissArea: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        height: '65%', // Adjust height to match screenshot
        paddingTop: 20,
    },
    modalHeader: {
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#40A7E3',
    },
    packageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5EA',
    },
    packageIconContainer: {
        width: 30,
        alignItems: 'center',
        marginRight: 12,
    },
    packageText: {
        fontSize: 17,
        fontWeight: '500',
        color: '#000000',
    },
    packagePrice: {
        fontSize: 17,
        color: '#707579',
    },
    modalFooter: {
        padding: 20,
        alignItems: 'center',
        paddingBottom: 40,
    },
    termsText: {
        textAlign: 'center',
        color: '#707579',
        fontSize: 13,
        lineHeight: 18,
    },
});

export default MyStarScreen;