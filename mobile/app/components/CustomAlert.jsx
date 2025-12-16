
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FONTS } from '../constants/fonts';

const { width } = Dimensions.get('window');

const CustomAlert = ({ visible, title, message, onClose, onConfirm, confirmText = "Confirm", cancelText = "Cancel", singleButton = false }) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        {!singleButton && (
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton, singleButton && styles.fullWidthButton]}
                            onPress={onConfirm || onClose}
                        >
                            <Text style={styles.confirmButtonText}>{singleButton ? "OK" : confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: width * 0.8,
        backgroundColor: '#FFF0F5', // Lavender/Pinkish bg matches theme
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: '#D14D72',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: '#555',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#D14D72',
    },
    confirmButton: {
        backgroundColor: '#D14D72',
    },
    fullWidthButton: {
        flex: 1,
    },
    cancelButtonText: {
        color: '#D14D72',
        fontFamily: FONTS.semiBold,
        fontSize: 16,
    },
    confirmButtonText: {
        color: '#FFF',
        fontFamily: FONTS.bold,
        fontSize: 16,
    },
});

export default CustomAlert;
