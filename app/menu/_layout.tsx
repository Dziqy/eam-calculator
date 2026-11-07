import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
    const totalHeight = HEADER_CONTENT_HEIGHT + insets.top; 

    return (
        <View style={[styles.customHeaderContainer, { paddingTop: insets.top, height: totalHeight }]}>
            <View style={styles.headerContent}>
                
                {/* Tombol Kiri (Back) */}
                <Pressable onPress={() => router.back()} style={styles.headerButton}>
                    {canGoBack ? (
                        <MaterialIcons name="chevron-left" size={30} color="#FFFFFF" />
                    ) : (
                        // Spacer jika tombol kembali tidak diperlukan (di layar index)
                        <View style={{ width: 30 }} /> 
                    )}
                </Pressable>

                {/* Judul di Tengah */}
                <Text style={styles.headerTitle}>{title}</Text>

                {/* Tombol Kanan (Close) */}
                <Pressable onPress={() => router.back()} style={styles.headerButton}>
                    <MaterialIcons name="close" size={24} color="#FFFFFF" />
                </Pressable>
            </View>
        </View>
    );
};

export default function MenuLayout() {
   const router = useRouter();
  const insets = useSafeAreaInsets(); 

  // Fungsi yang merender CustomHeader untuk semua layar
  const commonHeader = (props: CommonHeaderProps) => { 
    // Title diambil dari options screen individual, dengan fallback 
    const title = props.options.title || "Informasi Cerobong";
    
    return (
        <CustomHeader
            title={title}
            router={router}
            insets={insets}
            canGoBack={props.navigation.canGoBack()}
        />
    );
  };

   return (
     <Stack
          screenOptions={{
               presentation: 'modal', 
               headerShown: true, 
            header: commonHeader, 
          }}
          >
            {/* Definisi eksplisit yang sesuai dengan file Anda */}
            <Stack.Screen 
                name="index" 
                options={{ 
                    title: "Informasi Cerobong" 
                }} 
            />
            <Stack.Screen 
                name="edit-name" 
                options={{ 
                    title: "Nama Cerobong" 
                }} 
            />
            <Stack.Screen 
                name="edit-location" 
                options={{ 
                    title: "Lokasi Cerobong" 
                }} 
            />
            <Stack.Screen 
                name="edit-profile" 
                options={{ 
                    title: "Nama Editor" 
                }} 
            />
     </Stack>
     );
}

const styles = StyleSheet.create({
    customHeaderContainer: {
        backgroundColor: '#003366', // Warna biru tua
        justifyContent: 'flex-end', // Mendorong konten header ke bawah
        paddingHorizontal: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: HEADER_CONTENT_HEIGHT, 
        paddingBottom: 4,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerButton: {
        padding: 5,
    },
});