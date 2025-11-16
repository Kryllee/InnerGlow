import React, { useState } from 'react';
import { View, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Subheading, BodyText } from './components/CustomText';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY_COLOR = '#FCC8D1';
const SECONDARY_COLOR = '#D14D72';

export default function SignUp() {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({ n: false, u: false, p: false });
    const [activeButton, setActiveButton] = useState('signup');
    const router = useRouter();

    // Updates state and clears specific error
    const handleChange = (setter, key) => (t) => {
        setter(t);
        if (errors[key]) setErrors(e => ({ ...e, [key]: false }));
    };

    // Handles login button press
    const handleLogin = () => {
        setActiveButton('login');
        router.push('./'); // Navigates back to the login screen
    };

    // Handles signup button press
    const handleSignUp = () => {
        setActiveButton('signup');
    };

    // Handles final signup action
    const handleFinalSignUp = () => {
        router.replace({ pathname: '/(tabs)/home', params: { justLoggedIn: 'true' } });
    };

    // Submits the signup form
    const submit = () => {
        const e = { n: !fullName.trim(), u: !username.trim(), p: !password.trim() };
        setErrors(e);
        if (e.n || e.u || e.p) return Alert.alert('Required', 'Please fill all fields');
        router.replace('/(tabs)/home');
    };

    const hasAllInput = fullName && username && password;

    return (
        <KeyboardAvoidingView style={s.flex1} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={s.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={s.container}>
                    {/* Top Section */}
                    <View style={s.top}>
                        <Image source={require('../assets/images/logo.png')} style={s.logo} />
                        <BodyText style={s.topText}>Sign up to explore about our app</BodyText>
                    </View>

                    {/* Design Shapes */}
                    <View>
                        <View style={s.pinkRectangle} />
                        <View style={s.roundedRectangle} />
                    </View>

                    {/* Toggle Buttons */}
                    <View style={s.toggleRow}>
                        <TouchableOpacity style={s.toggleBtn} onPress={handleLogin}>
                            <Subheading style={[s.toggleText, { color: PRIMARY_COLOR }]}>Log in</Subheading>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.toggleBtn, s.activeToggle]} onPress={handleSignUp}>
                            <Subheading style={[s.toggleText, s.activeText]}>Sign up</Subheading>
                        </TouchableOpacity>
                    </View>

                    {/* Full Name Input */}
                    <View style={s.inputWrap}>
                        <TextInput
                            placeholder="Full Name" style={[s.input, s.inputFont]} value={fullName} onChangeText={handleChange(setFullName, 'n')} />
                        {errors.n && <BodyText style={s.err}>Required</BodyText>}
                    </View>

                    {/* Username/Email Input */}
                    <View style={s.inputWrap}>
                        <TextInput
                            placeholder="Username or Email" keyboardType="email-address" style={[s.input, s.inputFont]} value={username} onChangeText={handleChange(setUsername, 'u')} />
                        {errors.u && <BodyText style={s.err}>Required</BodyText>}
                    </View>

                    {/* Password Input */}
                    <View style={s.inputWrap}>
                        <TextInput
                            placeholder="Password" secureTextEntry style={[s.input, s.inputFont]}  value={password} onChangeText={handleChange(setPassword, 'p')} />
                        {errors.p && <BodyText style={s.err}>Required</BodyText>}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity onPress={submit} style={[s.btn, !hasAllInput && s.disabled]} disabled={!hasAllInput}>
                        <Subheading style={s.btnText}>Sign up</Subheading>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    // General Layout
    flex1: { flex: 1 },
    scrollContainer: { 
        flexGrow: 1, 
        paddingBottom: 40 
    },
    container: { 
        flex: 1,
         backgroundColor: '#fff' 
    },
    top: {    // Top Section
        backgroundColor: PRIMARY_COLOR, 
        width: '100%', 
        height: 350,
        borderBottomLeftRadius: 60, 
        alignItems: 'center', 
        justifyContent: 'flex-start'
    },
    logo: { 
        width: '80%', 
        height: 300, 
        position: 'absolute', 
        marginTop: 30, 
    },
    topText: { 
        position: 'absolute', 
        top: 300, 
        fontSize: 18, 
        color: SECONDARY_COLOR,
        zIndex: 1 
    },
    pinkRectangle: {     // Design Shapes
        position: 'absolute', 
        right: 0, width: 117, 
        height: 75, 
        backgroundColor: SECONDARY_COLOR
    },
    roundedRectangle: { 
        position: 'absolute', 
        right: 0, width: 117, 
        height: 75, 
        backgroundColor: '#fff', 
        borderTopRightRadius: 60 
    },
    toggleRow: {    // Toggle Buttons
        flexDirection: 'row', 
        width: '90%', 
        alignSelf: 'center',
        marginTop: 40,
        marginBottom: 20, 
        borderRadius: 30,
        backgroundColor: '#FEF2F4', 
        overflow: 'hidden'
    },
    toggleBtn: { 
        flex: 1, 
        paddingVertical: 12, 
        alignItems: 'center' 
    },
    toggleText: { 
        fontSize: 20, 
        color: PRIMARY_COLOR 
    },
    activeToggle: { 
        backgroundColor: PRIMARY_COLOR 
    },
    activeText: { 
        color: '#000' 
    },
    inputWrap: {    // Inputs
        alignSelf: 'center', 
        width: '90%',
         marginTop: 12, 
         backgroundColor: '#fff',
        borderRadius: 40, 
        paddingHorizontal: 20, 
        justifyContent: 'center',
        height: 60, 
        elevation: 3
    },
    input: { fontSize: 16 },
    inputFont: { 
        fontFamily: 'Quicksand-Regular' 
    },
    err: {
        color: SECONDARY_COLOR, 
        fontSize: 12, 
        marginTop: 6, 
        marginLeft: 8
    },
    btn: {     // Button
        marginTop: 18, 
        backgroundColor: 
        PRIMARY_COLOR, 
        borderRadius: 40,
        paddingVertical: 14, 
        width: '40%', 
        alignSelf: 'center',
        alignItems: 'center', 
        elevation: 3
    },
    btnText: { fontSize: 16 },
    disabled: { opacity: 0.6 }
});