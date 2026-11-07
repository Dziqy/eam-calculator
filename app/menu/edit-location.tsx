// app/menu/edit-location.tsx
import * as Location from 'expo-location';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Region } from 'react-native-maps'; // <-- Import Map Components
import { useCalculator } from '../../context/CalculatorContext';

export default function EditLocationScreen() {
    const navigation = useNavigation();
    const router = useRouter();
    const { data, updateField } = useCalculator();

    const [loading, setLoading] = useState(false);
    
    // 1. Deklarasi Map Ref
    const mapRef = useRef<MapView>(null); // <-- Deklarasikan Ref

    // Default Region (Jika koordinat Context masih null, gunakan default, misal Jakarta)
    const DEFAULT_REGION: Region = {
        latitude: -6.200000, // Jakarta
        longitude: 106.816666, // Jakarta
        latitudeDelta: 0.05, // Zoom level
        longitudeDelta: 0.05,
    };
    const initialCenter = {
        latitude: data.stackLocationLatitude || DEFAULT_REGION.latitude,
        longitude: data.stackLocationLongitude || DEFAULT_REGION.longitude,
    };
    const [markerPosition, setMarkerPosition] = useState(initialCenter);
    
    // Tentukan region peta: gunakan data Context atau default
    const initialRegion: Region = {
        latitude: data.stackLocationLatitude || DEFAULT_REGION.latitude,
        longitude: data.stackLocationLongitude || DEFAULT_REGION.longitude,
        latitudeDelta: DEFAULT_REGION.latitudeDelta,
        longitudeDelta: DEFAULT_REGION.longitudeDelta,
    };
    
    // State untuk posisi Marker (mengikuti data Context)
    // const [markerPosition, setMarkerPosition] = useState({
    //     latitude: initialRegion.latitude,
    //     longitude: initialRegion.longitude,
    // });

    // Update state marker lokal jika Context berubah
    // useEffect(() => {
    //     if (data.stackLocationLatitude && data.stackLocationLongitude) {
    //         setMarkerPosition({
    //             latitude: data.stackLocationLatitude,
    //             longitude: data.stackLocationLongitude,
    //         });
    //     }
    // }, [data.stackLocationLatitude, data.stackLocationLongitude]);
    // Effect untuk sinkronisasi marker ketika data Context dimuat pertama kali
    useEffect(() => {
        if (data.stackLocationLatitude && data.stackLocationLongitude) {
            setMarkerPosition({
                latitude: data.stackLocationLatitude,
                longitude: data.stackLocationLongitude,
            });
            
            // Opsional: Animasi ke lokasi saat aplikasi dimuat
            if (mapRef.current) {
                 mapRef.current.animateToRegion({
                    latitude: data.stackLocationLatitude,
                    longitude: data.stackLocationLongitude,
                    latitudeDelta: DEFAULT_REGION.latitudeDelta,
                    longitudeDelta: DEFAULT_REGION.longitudeDelta,
                 }, 1000); // Durasi animasi 1000ms
            }
        }
    }, [data.stackLocationLatitude, data.stackLocationLongitude]); // Dipanggil hanya saat Context berubah


    const handleChangeAddress = (text: string) => {
      updateField('stackLocationAddress', text);
    };

    // Fungsi untuk mengambil lokasi GPS saat ini (Tombol "Ambil Lokasi")
    const fetchLocation = async () => {
        setLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Izin Ditolak", "Aplikasi memerlukan izin lokasi untuk mengambil posisi GPS Anda saat ini.");
            setLoading(false);
            return;
        }

        try {
            let location = await Location.getCurrentPositionAsync({});
            const lat = location.coords.latitude;
            const lng = location.coords.longitude;

            // 1. Update Context dan State Lokal
            updateField('stackLocationLatitude', lat);
            updateField('stackLocationLongitude', lng);
            setMarkerPosition({ latitude: lat, longitude: lng }); // Langsung update state lokal
            
            // 2. Animasi Peta ke Lokasi Baru (menggunakan Ref)
            if (mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: DEFAULT_REGION.latitudeDelta,
                    longitudeDelta: DEFAULT_REGION.longitudeDelta,
                }, 1500); // Animasi selama 1.5 detik
            }
            
            // Opsional: Mengubah koordinat menjadi alamat (Reverse Geocoding)
            let geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            const addressText = geocode[0] 
              ? `${geocode[0].street}, ${geocode[0].city}, ${geocode[0].region}, ${geocode[0].country}` 
              : `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;

            // Simpan ke Context Global
            updateField('stackLocationLatitude', lat);
            updateField('stackLocationLongitude', lng);
            updateField('stackLocationAddress', addressText); // Anda dapat menambahkan reverse geocoding di sini

            Alert.alert("Sukses", `Lokasi GPS berhasil diambil dan ditampilkan di peta.`);

        } catch (error) {
            Alert.alert("Gagal", "Tidak dapat mengambil lokasi GPS.");
        } finally {
            setLoading(false);
        }
    };
    
    // Fungsi dipanggil saat Marker selesai di-drag
    const handleMarkerDragEnd = async (e: any) => {
        const newLat = e.nativeEvent.coordinate.latitude;
        const newLng = e.nativeEvent.coordinate.longitude;
        
        // 1. Update State Lokal (Visual Marker)
        setMarkerPosition({ latitude: newLat, longitude: newLng });
        
        // 2. Update Context Global
        updateField('stackLocationLatitude', newLat);
        updateField('stackLocationLongitude', newLng);
        
        // Opsional: Lakukan Reverse Geocoding untuk mendapatkan alamat baru
        try {
            let geocode = await Location.reverseGeocodeAsync({ 
                latitude: newLat, 
                longitude: newLng 
            });
            const addressText = geocode[0] 
                ? `${geocode[0].street}, ${geocode[0].city}, ${geocode[0].region}` 
                : `Lat: ${newLat.toFixed(6)}, Lng: ${newLng.toFixed(6)}`;
            
            updateField('stackLocationAddress', addressText); // Update alamat teks
        } catch (e) {
            console.error("Geocoding failed:", e);
        }
    };

    return (
        <View style={styles.container}>

            {/* Input Alamat Teks */}
            <Text style={styles.label}>Alamat Lokasi (Otomatis terisi dari GPS)</Text>
            <TextInput
              style={styles.input}
              value={data.stackLocationAddress} 
              onChangeText={handleChangeAddress} 
              placeholder="Masukkan alamat cerobong"
              placeholderTextColor="#655f5fff"
            />
            <Text style={styles.label}>Geser marker di peta untuk menentukan lokasi cerobong. (apk versi development, fitur sedang dinonaktifkan)</Text>

            {/* Tampilkan Koordinat GPS yang Tersimpan */}
            <View style={styles.coordinatesBox}>
                <Text style={styles.coordinateText}>
                  Latitude: {data.stackLocationLatitude ? data.stackLocationLatitude.toFixed(6) : 'N/A'}
                </Text>
                <Text style={styles.coordinateText}>
                     Longitude: {data.stackLocationLongitude ? data.stackLocationLongitude.toFixed(6) : 'N/A'}
                </Text>
            </View>
            

            {/* Tombol Ambil Lokasi GPS */}
            <View style={styles.buttonContainer}>
                <Button 
                    title={loading ? "Mengambil Lokasi..." : "GUNAKAN LOKASI SAAT INI"} 
                    onPress={fetchLocation} 
                    disabled={loading}
                    color="#29a3e3"
                />
            </View>
            
            <View style={styles.saveButtonContainer}>
                <Button title="Simpan" onPress={() => router.back()} color="#9ec83e" />
            </View>
            
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#003366" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
    },
    map: {
        width: '100%',
        height: 300, // Ukuran tetap untuk peta
        marginBottom: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    coordinatesBox: {
        padding: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginBottom: 20,
    },
    coordinateText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    buttonContainer: {
        marginBottom: 20,
    },
    saveButtonContainer: {
        marginTop: 10,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      paddingVertical: 10,
      fontSize: 16,
      marginBottom: 20,
  },
});