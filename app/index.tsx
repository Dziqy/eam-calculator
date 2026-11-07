import { useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useEffect } from "react";
import { BackHandler, Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider } from "../context/ThemeContext";

export default function HomeScreen() {
  const router = useRouter();

  // --- PERBAIKAN LOGIKA TOMBOL BACK ---
   useEffect(() => {
     if (Platform.OS === 'android') {
        const backAction = () => {
          // Jika router BISA kembali, kita biarkan navigasi default terjadi
          // (Mengembalikan 'false' memberitahu sistem untuk menggunakan perilaku default)
          if (router.canGoBack()) {
             return false; 
          } else {
             // Jika router TIDAK bisa kembali (berarti kita di root sebenarnya)
             BackHandler.exitApp();
             return true; // Kita telah menangani event ini (keluar aplikasi)
          }
        };

        const backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          backAction
        );

        return () => backHandler.remove();
     }
   }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <ThemeProvider>
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      {/* Logo */}
      <Image
        source={require("../assets/Logo-eam-black.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Judul */}
      {/* <Text style={styles.title}>EAM Mobile Tools</Text>
      <Text style={styles.subtitle}>Kalkulator & Metode Pengukuran Emisi</Text> */}

      {/* Dua fitur sejajar */}
      <View style={styles.rowContainer}>
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/calculator")}
          >
          <Image
            source={require("../assets/calculator.png")}
            style={styles.featureImage}
            resizeMode="contain"
          />
          <Text style={styles.menu}>Mulai Baru</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/bookmarks")}
          >
            <Image
              source={require("../assets/saved.png")}
              style={styles.featureImage}
              resizeMode="contain"
            />
          <Text style={styles.menu}>Tersimpan</Text>
          </TouchableOpacity>
      </View>

      {/* Tentang PT. Enerviro */}
      <View style={styles.aboutContainer}>
        <View style={{alignItems: "center" }}>
                    <Image
                      source={require("../assets/eam-instruments.png")}
                      style={styles.featureImage2}
                      resizeMode="contain"
                    />
                    <Text style={styles.cardTitle}>EAM INSTRUMENTS</Text>
                    <Text style={styles.cardText}>
                      EAM INSTRUMENTS ialah brand untuk peralatan pengambil sampel emisi 
                      pada cerobong emisi sumber tidak bergerak yang diproduksi oleh 
                      PT Enerviro Rinata Adi. Pelajari lebih lanjut tentang keunggulannya!
                    </Text>
                    <TouchableOpacity
                      style={[styles.button, styles.secondaryButton]}
                      onPress={() => Linking.openURL("https://eam-instruments.com/")}
                    >
                      <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                        Lihat Detail
                      </Text>
                    </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025</Text>
        <Text style={styles.footerSubText}>EAM Instrument</Text>
      </View>
    </ScrollView>
    </ThemeProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  logo: {
    width: 180,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#003366",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    marginBottom: 30,
    textAlign: "center",
  },
  menu:{
    fontSize: 12,
    color: "#555",
    textAlign: "center",

  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 6,
    width: "47%",
    elevation: 4,
    alignItems: "center",
  },
  featureImage: {
    width: 140,
    height: 140,
    marginBottom: 5,
  },
  featureImage2: {
    width: 280,
    height: 170,
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#003366",
    marginBottom: 6,
    textAlign: "center",
  },
  cardText: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#9EC83E",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#01a3e9",
    borderColor: "#01a3e9",
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FFF",
  },
  aboutContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    elevation: 3,
    marginBottom: 20,
    alignItems: "center",
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003366",
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    textAlign: "justify",
  },
  footer: {
    marginTop: 10,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
  },
  footerSubText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  // Gaya (styles) yang digunakan:

listItem: {
  // Menempatkan angka dan teks dalam satu baris
  flexDirection: 'row', 
  // Margin bawah untuk memberi jarak antar poin
  marginBottom: 10, 
},

listNumber: {
  fontSize: 14,
  color: "#555",
  // **LINE HEIGHT DI SINI**
  lineHeight: 20, 
  // Jarak setelah angka
  paddingRight: 5, 
},

listItemText: {
  fontSize: 14,
  color: "#555",
  // **LINE HEIGHT DI SINI**
  lineHeight: 20, 
  // flex: 1 memastikan teks melipat ke bawah dan sejajar dengan awal teks
  flex: 1, 
  textAlign: "justify",
},

});  