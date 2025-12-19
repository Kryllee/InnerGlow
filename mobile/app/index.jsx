import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Subheading, BodyText } from './components/CustomText';
import { FONTS } from './constants/fonts';
import SplashScreen from './components/SplashScreen';
import { API_BASE_URL } from './config';
import { useUser } from './context/UserContext';
import CustomAlert from './components/CustomAlert';

const INTRO_DELAY = 2000;
const SHAPE_WIDTH = 117;
const SHAPE_HEIGHT = 75;
const PRIMARY_COLOR = '#FCC8D1';
const SECONDARY_COLOR = '#D14D72';
const TEXT_INACTIVE_COLOR = '#fcc8d1';

let hasShownSplash = false;

const Index = () => {
    const [mode, setMode] = useState('login');
    const [showIntro, setShowIntro] = useState(!hasShownSplash);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });

    const showAlert = (title, message) => {
        setAlertConfig({ visible: true, title, message });
    };

    const router = useRouter();
    const { updateProfile, login } = useUser();

    useEffect(() => {
        if (!hasShownSplash) {
            setTimeout(() => {
                setShowIntro(false);
                hasShownSplash = true;
            }, INTRO_DELAY);
        }
    }, []);

    const handleSignUp = () => {
        router.push('./SignUp');
    };

    const submit = async () => {
        if (!username.trim() || !password.trim()) {
            return showAlert('Required', 'Please enter username/email and password');
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernameOrEmail: username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Sync user data to context
            const names = data.user.fullName.split(' ');
            login({
                firstName: names[0] || data.user.fullName,
                surname: names.slice(1).join(' ') || '',
                username: data.user.username,
                email: data.user.email,
                avatar: { uri: data.user.profileImage },
                bio: data.user.bio || "",
                _id: data.user._id
            }, data.token);

            router.replace('/(tabs)/home');

        } catch (error) {
            showAlert("Login Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    if (showIntro) return <SplashScreen />;

    const hasInput = username && password;

    return (
        <SafeAreaView style={s.flex1}>
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
                                style={[s.toggleBtn, s.activeToggle]}
                                disabled
                            >
                                <Subheading style={[s.toggleText, s.activeText]}>Log in</Subheading>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[s.toggleBtn]}
                                onPress={handleSignUp}
                            >
                                <Subheading style={[s.toggleText, s.inactiveText]}>Sign up</Subheading>
                            </TouchableOpacity>
                        </View>

                        <View style={s.inputContainer}>
                            <TextInput
                                placeholder="Username or Email"
                                keyboardType="email-address"
                                style={[s.input, s.inputFont]}
                                onChangeText={setUsername}
                                value={username}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={s.inputContainer}>
                            <TextInput
                                placeholder="Password"
                                secureTextEntry={!showPassword}
                                style={[s.input, s.inputFont, s.passwordInput]}
                                onChangeText={setPassword}
                                value={password}
                            />
                            <TouchableOpacity
                                style={s.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={24}
                                    color="#999"
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => { }} style={s.forgotPassword}>
                            <BodyText style={s.forgotPasswordText}>Forgot password?</BodyText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={submit}
                            style={[s.btn, (!hasInput || loading) && s.disabled]}
                            disabled={!hasInput || loading}
                        >
                            {loading ? <ActivityIndicator color="#000" /> : <Subheading style={s.btnText}>Log in</Subheading>}
                        </TouchableOpacity>

                        <BodyText style={s.orText}>or login with</BodyText>

                        <View style={s.iconRow}>
                            <TouchableOpacity style={s.iconContainer} onPress={() => { }}>
                                <Image source={require('./(tabs)/assets/images/google.png')} style={s.googleImage} />
                            </TouchableOpacity>
                            <TouchableOpacity style={s.iconContainer} onPress={() => { }}>
                                <Ionicons name="logo-facebook" size={30} color="#1877F2" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <CustomAlert
                        visible={alertConfig.visible}
                        title={alertConfig.title}
                        message={alertConfig.message}
                        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
                        singleButton
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
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
        position: 'absolute',
        top: 300,
        fontSize: 18,
        color: SECONDARY_COLOR,
        zIndex: 1
    },
    // Design Shapes
    pinkRectangle: {
        position: 'absolute',
        right: 0,
        width: SHAPE_WIDTH,
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
    toggleBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    activeToggle: {
        backgroundColor: PRIMARY_COLOR
    },
    toggleText: {
        fontSize: 20
    },
    activeText: {
        color: 'black'
    },
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
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        fontSize: 16,
        flex: 1,
    },
    inputFont: { fontFamily: FONTS.regular },
    passwordInput: { paddingRight: 10 },
    eyeIcon: {
        padding: 5,
    },
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
    googleImage: {
        width: 30,
        height: 30
    },
});

export default Index;