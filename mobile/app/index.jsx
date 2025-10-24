import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Subheading, BodyText } from './components/CustomText';
import SplashScreen from './components/SplashScreen';

const INTRO_DELAY = 2000;
const SHAPE_WIDTH = 117;
const SHAPE_HEIGHT = 75;
const PRIMARY_COLOR = '#FCC8D1';
const SECONDARY_COLOR = '#D14D72';
const TEXT_INACTIVE_COLOR = '#fcc8d1';

const Index = () => {
    const [mode, setMode] = useState('login');
    const [showIntro, setShowIntro] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [activeButton, setActiveButton] = useState('login');
    const router = useRouter();

    useEffect(() => { setTimeout(() => setShowIntro(false), INTRO_DELAY); }, []);

    const goSignUp = () => { setMode('signup'); setActiveButton('signup'); router.push('./SignUp'); };
    const handleLogin = () => { setActiveButton('login'); };
    const handleSignUp = () => { setActiveButton('signup'); router.push('./SignUp'); };
    const handleFinalLogin = () => { router.replace({ pathname: '/(tabs)/home', params: { justLoggedIn: 'true' } }); };
    const submit = () => {
        if (!username.trim() || !password.trim()) return Alert.alert('Required', 'Please enter username/email and password');
        router.replace('/(tabs)/home');
    };

    if (showIntro) return <SplashScreen />;

    const isSignUp = mode === 'signup';
    const hasInput = username && password;

    return (
        <KeyboardAvoidingView style={s.flex1} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={s.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={s.container}>
                    <View style={s.topContainer}>
                        <Image source={require('../assets/images/logo.png')} style={s.logo} />
                        <BodyText style={s.topText}>Log in to explore about our app</BodyText>
                    </View>

                    <View>
                        <View style={s.pinkRectangle} />
                        <View style={s.roundedRectangle} />
                    </View>

                    <View style={s.toggleRow}>
                        <TouchableOpacity
                            style={[s.toggleBtn, !isSignUp && s.activeToggle]}
                            onPress={() => { setMode('login'); handleLogin(); }}
                        >
                            <Subheading style={[s.toggleText, !isSignUp && s.activeText]}>Log in</Subheading>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.toggleBtn, isSignUp && s.activeToggle]}
                            onPress={() => { goSignUp(); handleSignUp(); }}
                        >
                            <Subheading style={[s.toggleText, isSignUp ? s.activeText : s.inactiveText]}>Sign up</Subheading>
                        </TouchableOpacity>
                    </View>

                    <View style={s.inputContainer}>
                        <TextInput placeholder="Username or Email" keyboardType="email-address" style={[s.input, s.inputFont]} onChangeText={setUsername}/>
                    </View>

                    <View style={s.inputContainer}>
                        <TextInput placeholder="Password" secureTextEntry style={[s.input, s.inputFont]} onChangeText={setPassword}/>
                    </View>

                    <TouchableOpacity onPress={() => {}} style={s.forgotPassword}>
                        <BodyText style={s.forgotPasswordText}>Forgot password?</BodyText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={submit} style={[s.btn, !hasInput && s.disabled]} disabled={!hasInput}>
                        <Subheading style={s.btnText}>Log in</Subheading>
                    </TouchableOpacity>

                    <BodyText style={s.orText}>or login with</BodyText>

                    <View style={s.iconRow}>
                        <TouchableOpacity style={s.iconContainer} onPress={() => {}}>
                            <View>
                                <Ionicons name="logo-google" size={30} color="#DB4437" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.iconContainer} onPress={() => {}}>
                            <View>
                                <Ionicons name="logo-facebook" size={30} color="#1877F2" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const s = StyleSheet.create({
    // General Layout
    flex1: { flex: 1 },
    scrollContainer: { flexGrow: 1, paddingBottom: 40 },
    container: { flex: 1, backgroundColor: '#fff' },
    // Top Section
    topContainer: {
        backgroundColor: PRIMARY_COLOR,
        width: '100%',
        height: 350,
        borderBottomLeftRadius: 60,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    logo: { 
        width: '80%', 
        height: 300, 
        position: 'absolute', 
        marginTop: 30 
    },
    topText: { 
        position: 'fixed', 
        top: 300, 
        fontSize: 18,
         color: SECONDARY_COLOR, 
         zIndex: 1 
        },
    // Design Shapes
    pinkRectangle: { 
        position: 'absolute', 
        right: 0, width: SHAPE_WIDTH, 
        height: SHAPE_HEIGHT, 
        backgroundColor: SECONDARY_COLOR 
    },
    roundedRectangle: { 
        position: 'absolute', 
        right: 0, 
        width: SHAPE_WIDTH, 
        height: SHAPE_HEIGHT, 
        backgroundColor: '#fff', 
        borderTopRightRadius: 60 
    },
    // Toggle Buttons
    toggleRow: {
        flexDirection: 'row',
        width: '90%',
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FEF2F4',
        overflow: 'hidden',
        marginTop: 30,
        alignSelf: 'center',
    },
    toggleBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    activeToggle: { backgroundColor: PRIMARY_COLOR },
    slideRight: { transform: [{ translateX: '100%' }] },
    toggleText: { fontSize: 20 },
    activeText: { color: 'black' },
    inactiveText: { color: TEXT_INACTIVE_COLOR },
    // Inputs
    inputContainer: {
        marginTop: 20,
        alignSelf: 'center',
        width: '90%',
        height: 60,
        backgroundColor: '#fff',
        borderRadius: 40,
        shadowColor: '#000',
        shadowRadius: 3.84,
        elevation: 5,
        paddingHorizontal: 20,
        justifyContent: 'center',
        marginVertical: 10,
    },
    input: { fontSize: 16 },
    inputFont: { fontFamily: 'Quicksand-Regular' },

    // Forgot Password
    forgotPassword: {
         alignSelf: 'flex-end', 
         marginRight: '5%', 
         marginBottom: 10 
        },
    forgotPasswordText: { 
        color: SECONDARY_COLOR, 
        fontSize: 16, 
        textDecorationLine: 'underline'
     },

    // Button
    btn: {
        marginTop: 20,
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 40,
        shadowRadius: 3.84,
        elevation: 5,
        paddingVertical: 15,
        width: '40%',
        alignSelf: 'center',
        alignItems: 'center',
    },
    btnText: { fontSize: 15 },
    disabled: { opacity: 0.6 },
    // Socials
    orText: { 
        textAlign: 'center', 
        marginTop: 15, 
        marginBottom: 5, 
        color: '#000', 
        fontSize: 16 
    },
    iconRow: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 20
     },
    iconContainer: { 
        marginHorizontal: 10 
    },
});

export default Index;