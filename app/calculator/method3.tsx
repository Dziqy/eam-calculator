import React from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useCalculator } from "../../context/CalculatorContext";
import { ThemeProvider } from "../../context/ThemeContext";

export default function Method3() {
    const { data, updateField } = useCalculator();

    // Nilai-nilai diambil langsung dari global state
    const kadarCO2 = data.kadarCO2;
    const kadarO2 = data.kadarO2;
    const kadarCO = data.kadarCO;
    const moisture = data.moisture;

    /**
     * Memproses input numerik:
     * 1. Menjaga tampilan input agar tetap menggunakan koma (,) untuk desimal.
     * 2. Mencegah karakter yang tidak valid (angka, koma, titik).
     * 3. Mencegah lebih dari satu pemisah desimal.
     * @param {string} text Input dari TextInput.
     * @param {React.Dispatch<React.SetStateAction<string>>} setter Fungsi setter state terkait.
     */
    const handleNumericInput = (text: string, fieldName: keyof typeof data) => {
      // Hapus karakter tak diinginkan kecuali angka, koma, titik, dan minus
      let cleanedText = text.replace(/[^0-9,.\-]/g, '');

      // Pastikan hanya satu minus yang valid di awal
      // Jika minus ada tapi bukan di urutan pertama, pindahkan ke awal
      const minusIndex = cleanedText.indexOf('-');
      if (minusIndex > 0) {
        cleanedText = '-' + cleanedText.replace(/-/g, '');
      } else if (minusIndex === -1) {
        // tidak ada minus, lakukan apa adanya
      }

      // Ubah titik jadi koma agar seragam desimal
      cleanedText = cleanedText.replace(/\./g, ',');

      // Hanya boleh satu koma
      const parts = cleanedText.split(',');
      if (parts.length > 2) {
        cleanedText = parts[0] + ',' + parts.slice(1).join('');
      }

      updateField(fieldName, cleanedText);
    };
    
    // --- Konversi Input ---
    const KCO2 = parseFloat(kadarCO2.replace(',', '.')) || 0;
    const KO2 = parseFloat(kadarO2.replace(',', '.')) || 0;
    const KCO = parseFloat(kadarCO.replace(',', '.')) || 0;
    const M = parseFloat(moisture.replace(',', '.')) || 0;

    // --- Kontrol Ketersediaan Input ---
    // Variabel ini akan menjadi TRUE jika SEMUA string input TIDAK kosong.
    const allInputsFilled = kadarCO2 && kadarO2 && kadarCO && moisture;

    let molBasisKering = null; // Inisialisasi molBasisKering sebagai null (atau nilai placeholder)
    let molBasisBasah = null; // Inisialisasi molBasisBasah sebagai null
    
    
    // --- Logika Perhitungan Kondisional ---
    if (allInputsFilled) {
        // 1. Perhitungan molBasisKering (Hanya jika semua input diisi)
       molBasisKering = (0.44 * KCO2) + (0.32 * KO2) + (0.28 * ((100 - KCO2 - KO2 - (KCO*10000)) + (KCO*10000)));

        // 2. Perhitungan molBasisBasah (Bergantung pada molBasisKering)
        molBasisBasah = molBasisKering * (1 - (M / 100)) + (18 * (M / 100));
    }
    // Jika 'allInputsFilled' FALSE, maka molBasisKering dan molBasisBasah tetap null.

    return (
      <ThemeProvider>
        <ScrollView style={styles.container}>
            
            {/* ... (Header Section) ... */}
            <View style={styles.headerSection}>
              <Text style={styles.methodTitle}>
                Method 3 – <Text style={styles.methodSubtitle}>
                  Komposisi gas dan berat molekul kering
                </Text>
              </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.title}>Input Data</Text>

                {[
                    { label: "Kadar CO₂ (%)", value: data.kadarCO2, fieldKey: 'kadarCO2' },
                    { label: "Kadar O₂ (%)", value: data.kadarO2, fieldKey: 'kadarO2' },
                    { label: "Kadar CO (ppm)", value: data.kadarCO, fieldKey: 'kadarCO' },
                    { label: "Moisture bws (%)", value: data.moisture, fieldKey: 'moisture' },
                ].map((f, i) => (
                    <View style={styles.field} key={i}>
                        <Text style={styles.label}>{f.label}</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="number-pad"
                            placeholder="Masukkan nilai..."
                            placeholderTextColor="#655f5fff"
                            value={f.value}
                            onChangeText={(text) => handleNumericInput(text, f.fieldKey as keyof typeof data)}
                        />
                    </View>
                ))}
            </View>

            <View style={styles.card}>
                <Text style={styles.title}>Hasil Perhitungan</Text>

                <View style={styles.outputRow}>
                    <Text style={styles.outputLabel}>Berat Molekul Basis Kering (Md):</Text>
                    {/* Tampilkan molBasisKering HANYA jika nilainya bukan null */}
                    <Text style={styles.outputValue}>
                        {molBasisKering !== null 
                            ? molBasisKering.toLocaleString('id-ID', { maximumFractionDigits: 2, useGrouping: false }) 
                            : "–"} g/g.mol
                    </Text>
                </View>

                <View style={styles.outputRow}>
                    <Text style={styles.outputLabel}>Berat Molekul  Basis basah (Ms):</Text>
                    {/* Tampilkan molBasisBasah HANYA jika nilainya bukan null */}
                    <Text style={styles.outputValue}>
                        {molBasisBasah !== null 
                            ? molBasisBasah.toLocaleString('id-ID', { maximumFractionDigits: 2, useGrouping: false }) 
                            : "–"} g/g.mol
                    </Text>
                </View>
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>© 2025</Text>
              <Text style={styles.footerSub}>EAM Instrument</Text>
            </View>
        </ScrollView>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#F9FAFB", padding: 16 },
  //title: { fontSize: 18, fontWeight: "bold", color: "#22C55E", marginVertical: 12 },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003366",
    marginBottom: 20,
    textAlign: "center",
  },
  field: { marginBottom: 12 },
  label: { fontSize: 14, color: "#003366", marginBottom: 4, },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F8FAFC",
    fontSize: 14,
  },
  outputContainer: {
    marginTop: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  outputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  outputLabel: { fontSize: 15, color: "#444",fontWeight: "bold" },
  outputValue: { fontSize: 15, fontWeight: "bold", color: "#444" },
  table: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    marginTop: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderBottomWidth: 1,
    borderColor: "#999",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#999",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    padding: 8,
    fontSize: 14,
  },
  headerCell: { fontWeight: "bold" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  
  footer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 50,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
  },
  footerSub: {
    fontSize: 12,
    color: "#64748B",
  },
    headerSection: {
    backgroundColor: "#9EC83E",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9EC83E",
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#003366",
    flexShrink: 1,
  },
  methodSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#0F172A",
  },
  formGroup: {
    marginBottom: 14,
  },
    dropdown: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    
    // Penyesuaian Utama:
    flexDirection: 'row',          // Menyusun item secara horizontal
    justifyContent: 'space-between', // Mendorong item ke kiri dan kanan (teks di kiri, ikon di kanan)
    alignItems: 'center',          // Memastikan item sejajar di tengah secara vertikal
  },
  dropdownText: {
    fontSize: 14,
    color: "#555",
  },
  dropdownList: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    backgroundColor: "#FFF",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#003366",
  },
  dropdownIcon: {
    marginLeft: 10, // Memberikan sedikit jarak antara teks dan ikon
  },
});
