// app/menu/index.tsx
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Link } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { useCalculator } from '../../context/CalculatorContext';
import { ThemeProvider } from "../../context/ThemeContext";

interface WatermarkImageProps {
  uri: string;
  watermarkEditor: string;
  latitude?: number | null;
  longitude?: number | null;
  stackName?: string;
  onWatermarked: (uriWithWatermark: string) => void;
}

function WatermarkImage(
  { 
    uri, 
    watermarkEditor, 
    latitude,
    longitude,
    stackName,
    onWatermarked 
  }: 
  WatermarkImageProps) 
  {
    const viewShotRef = useRef<ViewShot | null>(null);

    useEffect(() => {
      if (uri && viewShotRef.current) {
        setTimeout(() => {
          viewShotRef.current?.capture()?.then((uriWithWatermark) => {
            onWatermarked(uriWithWatermark);
          }).catch(console.error);
        }, 500);
      }
    }, [uri]);

    return (
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={{ position: 'relative' }}>
      <Image source={{ uri }} style={{ width: 350, height: 300, borderRadius: 8 }} resizeMode="cover" />
      <View style={{
        position: 'absolute',
        bottom: 1,
        right: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.41)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 5,
        width: 180,
      }}>
        <Image 
          source={require("../../assets/Logo-eam-white.png")}
          style={{ width: 61, height: 25 }}
          resizeMode="contain"
        />
        <Text style={{ color: '#ffffffff', fontWeight: 'regular', fontSize: 12 }}>
            {stackName && `${stackName}\n`}
            {latitude && `Lat: ${latitude?.toFixed(6)}`} {longitude && `| Long: ${longitude?.toFixed(6)}`}
        </Text>
        <Text style={{ color: '#ffffffff', fontWeight: 'regular', fontSize: 12 }}>{watermarkEditor && `Editor: ${watermarkEditor}`}</Text>
      </View>
    </ViewShot>
    );
}

export default function MainMenuScreen() {
  const { data, updateField } = useCalculator();
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [watermarkedUri, setWatermarkedUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fullScreenUri, setFullScreenUri] = useState<string | null>(null);

  // Fungsi pilih gambar dari galeri
  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Maaf, izin akses galeri diperlukan!');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  // Fungsi ambil foto dari kamera
  const takePhotoWithCamera = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
      alert('Maaf, izin akses kamera diperlukan!');
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],  // Atur rasio crop 4:3
      quality: 1,
    });
    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const canPickImage = () => {
    if (!data.stackName) {
      alert("Silakan isi Nama Cerobong terlebih dahulu");
      return false;
    }
    if (data.stackLocationLatitude == null || data.stackLocationLongitude == null) {
      alert("Silakan isi Lokasi Cerobong terlebih dahulu");
      return false;
    }
    if (!data.stackLocationAddress) {
      alert("Silakan isi Alamat Lokasi Cerobong terlebih dahulu");
      return false;
    }
    if (!data.profileName) {
      alert("Silakan isi Nama Editor terlebih dahulu");
      return false;
    }
    return true;
  };

  // Fungsi tampilkan pilihan sumber gambar
  const selectImageSource = () => {
    if (!canPickImage()) {
      return; // Batalkan jika validasi gagal
    }
    Alert.alert(
      "Pilih sumber gambar",
      "Ambil gambar dari:",
      [
        {
          text: "Kamera",
          onPress: async () => {
            const uri = await takePhotoWithCamera();
            if (uri) setSelectedUri(uri);
          },
        },
        {
          text: "Galeri",
          onPress: async () => {
            const uri = await pickImageFromGallery();
            if (uri) setSelectedUri(uri);
          },
        },
        { text: "Batal", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const saveImageToGallery = async (uri: string) => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status === 'granted') {
    try {
      await MediaLibrary.saveToLibraryAsync(uri);
      alert('Gambar berhasil disimpan di galeri!');
    } catch (error: unknown) {
      // Tangani error sebagai unknown
      if (error instanceof Error) {
        alert('Gagal menyimpan gambar: ' + error.message);
      } else {
        alert('Gagal menyimpan gambar: ' + String(error));
      }
    }
  } else {
    alert('Izin akses galeri diperlukan untuk menyimpan gambar');
  }
};

  const onWatermarked = (uriWithWatermark: string) => {
    setWatermarkedUri(uriWithWatermark);
    saveImageToGallery(uriWithWatermark);
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Maaf, kami memerlukan izin akses galeri untuk melanjutkan!');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedUri(uri);
    }
  };

  // Setelah watermarkedUri didapat, simpan ke context
  useEffect(() => {
    if (watermarkedUri) {
      updateField('fotoCerobong', watermarkedUri);
    }
  }, [watermarkedUri]);

  // Tentukan sumber gambar yang sudah ada watermark atau placeholder
  const imageSource = data.fotoCerobong
    ? { uri: data.fotoCerobong }
    : require('../../assets/placeholder.png');

  return (
    <>
    <ThemeProvider>
    <ScrollView style={styles.container}>
      <View style={styles.contentHeader}>
        {/* Tampilkan gambar dengan watermark jika gambar baru dipilih */}
        {selectedUri ? (
          <Pressable
            onPress={() => {
              setFullScreenUri(selectedUri);
              setModalVisible(true);
            }}
          >
            <WatermarkImage 
              uri={selectedUri} 
              watermarkEditor={data.profileName} 
              latitude={data.stackLocationLatitude}
              longitude={data.stackLocationLongitude}
              stackName={data.stackName}
              onWatermarked={onWatermarked} 
            />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              setFullScreenUri(data.fotoCerobong || null);
              setModalVisible(true);
            }}
          >
            <Image
              source={imageSource}
              style={styles.placeholderBox}
              resizeMode="cover"
            />
          </Pressable>
        )}

        <Pressable 
          style={styles.editIcon}
          onPress={selectImageSource}
        >
          <MaterialIcons name="edit" size={20} color="#64748B" />
        </Pressable>
      </View>

      <Link href="/menu/edit-name" asChild>
        <Pressable style={styles.menuItem}>
          <MaterialIcons name="factory" size={24} color="#003366" style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={styles.menuLabel}>Nama Cerobong</Text>
            <Text style={styles.menuValue}>{data.stackName || "Masukkan nama cerobong.."}</Text>
          </View>
        </Pressable>
      </Link>

      <Link href="/menu/edit-location" asChild>
        <Pressable style={styles.menuItem}>
          <MaterialIcons name="location-on" size={24} color="#003366" style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={styles.menuLabel}>Lokasi Cerobong</Text>
            <View style={styles.coordinatesBox}>
              <Text style={styles.coordinateText}>
                Latitude: {data.stackLocationLatitude ? data.stackLocationLatitude.toFixed(6) : 'N/A'}
              </Text>
              <Text style={styles.coordinateText}>
                Longitude: {data.stackLocationLongitude ? data.stackLocationLongitude.toFixed(6) : 'N/A'}
              </Text>
            </View>
            <Text style={styles.menuValue}>{data.stackLocationAddress || "Masukkan lokasi cerobong.."}</Text>
          </View>
        </Pressable>
      </Link>

      <Link href="/menu/edit-profile" asChild>
        <Pressable style={styles.menuItem}>
          <MaterialIcons name="person" size={24} color="#003366" style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={styles.menuLabel}>Nama Editor</Text>
            <Text style={styles.menuValue}>{data.profileName || "Masukkan nama editor.."}</Text>
          </View>
        </Pressable>
      </Link>
    </ScrollView>
    </ThemeProvider>
    <Modal visible={modalVisible} transparent={true}>
  <Pressable style={styles.modalBackground} onPress={() => setModalVisible(false)}>
    <WatermarkImage 
      uri={fullScreenUri || ''}
      watermarkEditor={data.profileName}
      latitude={data.stackLocationLatitude}
      longitude={data.stackLocationLongitude}
      stackName={data.stackName}
      onWatermarked={() => {}}
    />
  </Pressable>
</Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', alignItems: 'center' },
  placeholderBox: { width: 350, height: 300, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 10 },
  editIcon: { position: 'absolute', top: 20, right: 20, padding: 4, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 50 },
  stackName: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },

  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 15, 
    paddingHorizontal: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0',
  },
  icon: { marginRight: 15 },
  textContainer: { flex: 1 },
  menuLabel: { fontSize: 12, color: '#64748B' },
  menuValue: { fontSize: 16, fontWeight: '500', color: '#000' },
  coordinatesBox: {
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  coordinateText: {
    fontSize: 16,
    color: '#003366',
    fontWeight: '500',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});
