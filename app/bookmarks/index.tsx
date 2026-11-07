// app/bookmarks/index.tsx

import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { Bookmark, useCalculator } from '../../context/CalculatorContext';

export default function BookmarksScreen() {
    const { bookmarks, loadSessionFromBookmark, deleteBookmark } = useCalculator();
    const router = useRouter();

    // Memuat bookmark yang dipilih ke sesi saat ini
    // Terapkan tipe Bookmark pada parameter
    const handleLoadBookmark = (bookmark: Bookmark) => { 
        loadSessionFromBookmark(bookmark.data);
        Alert.alert("Sesi Dimuat", `Data sesi "${bookmark.name}" telah dimuat kembali.`);
        router.push('/calculator'); 
    };

    // Konfirmasi penghapusan
    // Terapkan tipe string pada parameter id
    const handleDelete = (id: string) => { 
        Alert.alert(
            "Hapus Perhitungan Tersimpan",
            "Apakah Anda yakin ingin menghapus sesi ini?",
            [
                { text: "Batal", style: "cancel" },
                { 
                    text: "Hapus", 
                    style: "destructive", 
                    onPress: () => deleteBookmark(id) 
                },
            ]
        );
    };

    // Terapkan ListRenderItemInfo<Bookmark> pada renderItem
    const renderItem = ({ item }: ListRenderItemInfo<Bookmark>) => (
        <View style={styles.itemContainer}>
            <Pressable 
                onPress={() => handleLoadBookmark(item)} 
                style={styles.itemContent}
            >
                <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.date}>
                        Disimpan pada: {new Date(item.date).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false
                    })}
                    {' '}
                    {new Date(item.date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.coordinates}>
                        Lokasi: {item.data.stackLocationAddress ? item.data.stackLocationAddress : 'N/A'}
                    </Text>
                </View>
            </Pressable>
            <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                <MaterialIcons name="delete" size={24} color="#EF4444" />
            </Pressable>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header sudah tidak diperlukan karena dihandle oleh Stack Navigator */}
            
            {bookmarks.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada sesi yang disimpan.</Text>
            ) : (
                <FlatList // <-- Komponen ini secara otomatis dapat di-scroll
                    data={bookmarks}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, // <-- PASTIKAN flex: 1 ADA DI SINI
        backgroundColor: '#fff', 
        padding: 16 
    },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginBottom: 10,
    },
    itemContent: {
        flex: 1,
        padding: 15,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#003366',
    },
    date: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    coordinates: {
        fontSize: 12,
        color: '#374151',
        marginTop: 2,
    },
    deleteButton: {
        padding: 15,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#6B7280',
    }
});