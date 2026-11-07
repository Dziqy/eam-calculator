import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
// ✅ Import untuk mendapatkan tinggi Status Bar
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Tipe untuk props CustomHeader
interface CustomHeaderProps {
    title: string;
    router: ReturnType<typeof useRouter>;
    insets: { top: number };
    canGoBack: boolean;
}

// Tipe untuk commonHeader (minimalis untuk menghindari error import)
type CommonHeaderProps = { 
    options: { title?: string }; 
    navigation: { canGoBack: () => boolean; [key: string]: any; };
    route: any; 
};

// Tinggi konten header standar (di luar Status Bar)
const HEADER_CONTENT_HEIGHT = 56; 

// Komponen Header Kustom yang menerapkan insets.top
const CustomHeader = ({ title, router, insets, canGoBack }: CustomHeaderProps) => { 
    // Tinggi total header = Tinggi Konten + Tinggi Status Bar (insets.top)
    const totalHeight = HEADER_CONTENT_HEIGHT + insets.top; 

    return (
        // View Container menerapkan insets.top sebagai paddingTop
        <View style={[stylesB.customHeaderContainer, { paddingTop: insets.top, height: totalHeight }]}>
            <View style={stylesB.headerContent}>
                
                {/* Tombol Kiri (Back) */}
                <Pressable onPress={() => router.back()} style={stylesB.headerButton}>
                    {canGoBack ? (
                        // Menggunakan MaterialIcons chevron-left untuk tombol kembali
                        <MaterialIcons name="chevron-left" size={30} color="#000" />
                    ) : (
                        // Spacer jika tombol kembali tidak diperlukan
                        <View style={{ width: 30 }} /> 
                    )}
                </Pressable>

                {/* Judul di Tengah */}
                <Text style={stylesB.headerTitle}>{title}</Text>

                {/* Tombol Kanan (Spacer) */}
                {/* Di layout Bookmarks, kita hanya memerlukan Spacer agar judul tetap di tengah, karena tidak ada tombol Close */}
                <View style={{ width: 30 }} /> 
            </View>
        </View>
    );
};


export default function BookmarksLayout() {
 const router = useRouter();
    // ✅ AMBIL INSETS
    const insets = useSafeAreaInsets(); 

    // Fungsi yang merender CustomHeader untuk semua layar
    const commonHeader = (props: CommonHeaderProps) => { 
        // 'props.navigation.canGoBack()' digunakan untuk menentukan apakah tombol 'Back' harus ditampilkan.
        return (
            <CustomHeader
                title={props.options.title || 'Perhitungan Tersimpan'}
                router={router}
                insets={insets}
                canGoBack={props.navigation.canGoBack()}
            />
        );
    };

 return (
       <Stack
           screenOptions={{
            headerShown: true,
                    // Hapus semua properti gaya header bawaan, ganti dengan Custom Header
           }}
       >
           {/* Konfigurasi Screen Index */}
           <Stack.Screen
            name="index" // Merujuk pada app/bookmarks/index.tsx
            options={{
             title: "Perhitungan Tersimpan", // Judul Header
                        header: commonHeader, // ✅ Terapkan Custom Header
            }}
           />
       </Stack>
 );
}

const stylesB = StyleSheet.create({
    customHeaderContainer: {
        backgroundColor: '#F9FAFB', // Warna terang untuk bookmarks
        justifyContent: 'flex-end', // Mendorong konten header ke bawah
        paddingHorizontal: 10,
        borderBottomWidth: 1, // Optional visual separation
        borderBottomColor: '#E2E8F0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: HEADER_CONTENT_HEIGHT, 
        paddingBottom: 4,
    },
    headerTitle: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerButton: {
        padding: 5,
    },
});