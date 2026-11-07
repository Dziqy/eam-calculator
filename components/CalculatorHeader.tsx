import { Link, useRouter, useSegments } from 'expo-router';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { useCalculator } from '../context/CalculatorContext';

const tabs = [
  { name: 'method1', icon: require('../assets/method1.png') },
  { name: 'method2', icon: require('../assets/method2.png') },
  { name: 'method3', icon: require('../assets/method3.png') },
  { name: 'method4', icon: require('../assets/method4.png') },
  { name: 'method5', icon: require('../assets/method5.png') },
]

export default function CalculatorHeader() {
  const segments = useSegments()
  const current = segments[segments.length - 1]

  const router = useRouter() // Ambil objek router

  // Menentukan lebar ikon
  const ICON_SIZE = 30;

  const { resetData, saveBookmark, data } = useCalculator(); // <-- Ambil resetData

  // [FUNGSI 1] Tampilkan modal konfirmasi
    const showExitAlert = () => {
        Alert.alert(
            "Konfirmasi Keluar",
            "Yakin ingin keluar? Keluar menyebabkan data saat ini akan hilang. (Abaikan dan Keluar jika Anda sudah menyimpan).",
            [
                { 
                    text: "Batal", 
                    style: "cancel",
                    // Tidak ada onPress di sini
                },
                {
                    text: "Keluar",
                    style: "destructive",
                    onPress: () => {
                        resetData(); 
                        router.replace('/');
                    }
                },
            ],
            { cancelable: false }
        );
    };
    
    const handleGoBack = () => {
        showExitAlert(); // Panggil alert
        // resetData(); // <-- Reset data sebelum kembali
        // router.push('/'); // Kembali ke halaman utama (app/index)
    };

  // Fungsi untuk menyimpan sesi
    const handleSaveBookmark = async () => {
        // Asumsi: Nama bookmark adalah nama cerobong saat ini (data.stackName)
        const name = data.stackName || `${new Date().toLocaleDateString()}`;

        await saveBookmark(name);
        Alert.alert("Tersimpan!", `Sesi "${name}" berhasil di simpan. Pada ${new Date().toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false
                    })} ${new Date().toLocaleDateString()}`);
    };
    
  return (
    <View style={{ ...styles.container, paddingTop: 48 }}>
      {/* Row logo + back */}
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', height:32, paddingHorizontal:12, paddingVertical:4, marginBottom:12 }}>
          {/* Grup Kiri: Ikon Back + Logo (Berdekatan) */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../assets/Logo-eam-white.png')} style={{ width:85, height:85 }} resizeMode="contain" />
        </View>
                  {/* Kontainer Kanan: Dua Ikon Berdekatan 
          Penting: Kontainer ini diberi lebar 30px agar seimbang dengan ikon Back.
        */}
        <View style={{ flexDirection: 'row', alignItems: 'center', width: ICON_SIZE, justifyContent: 'flex-end' }}>
          <Pressable onPress={handleGoBack} style={{ width: ICON_SIZE, height: ICON_SIZE, marginRight: 10 }}>
                      <Image source={require('../assets/back.png')} style={{ width:30, height:30 }} />
                    </Pressable>
                    
          {/* Ikon 1 (Bookmark) - Contoh */}
          <Pressable onPress={handleSaveBookmark}>
            <Image 
              source={require('../assets/unsave.png')} 
              style={{ width: 30, height: 30, marginRight: 10, tintColor: '#fff' }} // Lebar kecil, margin 5px
            />
          </Pressable>

          {/* Ikon 2 (Menu) - Contoh */}
            <Pressable onPress={() => router.push('/menu') }>
              <Image 
                source={require('../assets/informasi.png')} 
                style={{ width: 60, height: 25, tintColor: '#fff' }} // Lebar kecil, berdekatan dengan Ikon 1
              />
            </Pressable>
        </View>
        {/* Akhir Kontainer Ikon Kanan */}

      </View>


      {/* Tabs row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
        {tabs.map((t) => {
          const active = current === t.name
          return (
            <Link key={t.name} href={`../calculator/${t.name}`} asChild>
              <Pressable style={[styles.tab, active && styles.activeTab]}>
                <Image
                  source={t.icon}
                  style={[styles.icon, active && styles.activeIcon]}
                  resizeMode="contain"
                />
              </Pressable>
            </Link>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderBottomLeftRadius:24,
    borderBottomRightRadius:24,
    flexDirection: 'column',
    paddingVertical: 10,
    backgroundColor: '#003366',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12
  },
  tab: {
    padding: 8,
    borderRadius: 8
  },
  activeTab: {
    backgroundColor: '#e5e7eb'
  },
  icon: {
    width: 55,
    height: 55,
    opacity: 0.5
  },
  activeIcon: {
    opacity: 1
  }
})
