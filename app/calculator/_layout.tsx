// app/calculator/_layout.tsx

import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Alert, BackHandler, View } from 'react-native';
import CalculatorHeader from '../../components/CalculatorHeader';
import { useCalculator } from '../../context/CalculatorContext';

export default function CalculatorLayout() {
    const router = useRouter();
    const { resetData } = useCalculator();

    const handleBackPress = () => {
        // Tampilkan Alert Konfirmasi
        Alert.alert(
            "Konfirmasi Keluar",
            "Yakin ingin keluar? Keluar menyebabkan data saat ini akan hilang. (Abaikan dan Keluar jika Anda sudah menyimpan).",
            [
                { 
                    text: "Batal", 
                    style: "cancel" 
                    // TIDAK PERLU MENAMBAHKAN onPress: () => {} KARENA DEFAULTNYA HANYA MENUTUP ALERT
                }, 
                {
                    text: "Keluar",
                    style: "destructive",
                    onPress: () => {
                        resetData(); 
                        router.replace('/'); // Tindakan Keluar
                    }
                },
            ],
            { cancelable: false }
        );
        return true;
    };

    useFocusEffect(
        React.useCallback(() => {
            // BackHandler.addEventListener mengembalikan objek listener
            const backHandlerListener = BackHandler.addEventListener(
                'hardwareBackPress', 
                handleBackPress
            );

            // Gunakan metode remove() yang ada pada objek listener
            return () => 
                backHandlerListener.remove(); // <-- PERBAIKAN DI SINI
        }, [])
    );

    return (
        <View style={{ flex: 1 }}>
            <CalculatorHeader />
            <Stack screenOptions={{ headerShown: false }} />
        </View>
    );
}