import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { StyleSheet, View } from 'react-native';

interface GoogleSignInButtonProps {
    onPress: () => void;
    disabled?: boolean;
}

const GoogleSignInButtonComponent = ({ onPress, disabled = false }: GoogleSignInButtonProps) => {
    return (
        <View style={styles.container}>
            <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                onPress={onPress}
                disabled={disabled}
            />
        </View>
    )
}

export default GoogleSignInButtonComponent

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 8,
    },
})