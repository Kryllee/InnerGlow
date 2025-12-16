import React, { useState } from 'react';
import { View, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Subheading, BodyText } from './components/CustomText';
import { FONTS } from './constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from './config';
import { useUser } from './context/UserContext';

const PRIMARY_COLOR = '#FCC8D1';
const SECONDARY_COLOR = '#D14D72';

export default function SignUp() {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ n: false, u: false, e: false, p: false });
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { updateProfile, login } = useUser();

    // Updates state and clears specific error
    const handleChange = (setter, key) => (t) => {
        setter(t);
        if (errors[key]) setErrors(e => ({ ...e, [key]: false }));
    };

    const handleLogin = () => {
        router.push('/');
    };

    const submit = async () => {
        const e = {
            n: !fullName.trim(),
            u: !username.trim(),
            e: !email.trim(),
            p: !password.trim()
        };
        setErrors(e);
        if (e.n || e.u || e.e || e.p) return Alert.alert('Required', 'Please fill all fields');

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
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
                _id: data.user._id // Save ID for API calls
            }, data.token);

            // Navigate to Home
            router.replace('/(tabs)/home');

        } catch (error) {
            Alert.alert("Registration Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const hasAllInput = fullName && username && email && password;

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
                        <TouchableOpacity style={[s.toggleBtn, s.activeToggle]} disabled>
                            <Subheading style={[s.toggleText, s.activeText]}>Sign up</Subheading>
                        </TouchableOpacity>
                    </View>

                    {/* Full Name Input */}
                    <View style={s.inputWrap}>
                        <TextInput
                            placeholder="Full Name" style={[s.input, s.inputFont]} value={fullName} onChangeText={handleChange(setFullName, 'n')} />
                        {errors.n && <BodyText style={s.err}>Required</BodyText>}
                    </View>

                    {/* Username Input */}
                    <View style={s.inputWrap}>
                        <TextInput
                            placeholder="Username" style={[s.input, s.inputFont]} value={username} onChangeText={handleChange(setUsername, 'u')} />
                        {errors.u && <BodyText style={s.err}>Required</BodyText>}
                    </View>

                    {/* Email Input - NEW */}
                    <View style={s.inputWrap}>
                        <TextInput
                            placeholder="Email" keyboardType="email-address" style={[s.input, s.inputFont]} value={email} onChangeText={handleChange(setEmail, 'e')} />
                        {errors.e && <BodyText style={s.err}>Required</BodyText>}
                    </View>

                    {/* Password Input */}
                    <View style={s.inputWrap}>
                        <TextInput
                            placeholder="Password"
                            secureTextEntry={!showPassword}
                            style={[s.input, s.inputFont, s.passwordInput]}
                            value={password}
                            onChangeText={handleChange(setPassword, 'p')}
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
                        {errors.p && <BodyText style={s.err}>Required</BodyText>}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity onPress={submit} style={[s.btn, (!hasAllInput || loading) && s.disabled]} disabled={!hasAllInput || loading}>
                        {loading ? <ActivityIndicator color="#000" /> : <Subheading style={s.btnText}>Sign up</Subheading>}
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
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        fontSize: 16,
        flex: 1,
    },
    inputFont: {
        fontFamily: FONTS.regular
    },
    passwordInput: { paddingRight: 10 },
    eyeIcon: {
        padding: 5,
    },
    err: {
        color: SECONDARY_COLOR,
        fontSize: 12,
        position: 'absolute',
        bottom: -20,
        left: 8,
    },
    btn: {     // Button
        marginTop: 30,
        backgroundColor: PRIMARY_COLOR,
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