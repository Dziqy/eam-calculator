import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useCalculator } from "../../context/CalculatorContext";
import { ThemeProvider } from "../../context/ThemeContext";

export default function Method4() {
    const { data, updateField } = useCalculator();
    
    // Tempat menyimpan jumlah impinger lokal sementara

    const [showBeratInputs, setShowBeratInputs] = useState(false); // Kontrol show/hide

    // Nilai-nilai diambil langsung dari global state
    const barometricPressure = data.barometricPressure;
    const vmInitial = data.vmInitial;
    const vmFinal = data.vmFinal;
    const meterTemp = data.meterTemp;
    const faktorKalibrasiMeter = data.faktorKalibrasiMeter;
    const dgmDeltaH = data.dgmDeltaH;

    // Ambil array berat awal dan akhir, fallback ke array kosong jika belum ada
    const beratAwalArray: string[] = Array.isArray(data.beratAwalAirArray) ? data.beratAwalAirArray : [];
    const beratAkhirArray: string[] = Array.isArray(data.beratAkhirAirArray) ? data.beratAkhirAirArray : [];

    const jumlahImpinger = parseInt(data.jumlahImpinger, 10) || 0;
    // Perbarui jumlah impinger dan sesuaikan panjang array berat awal & akhir di context
    const handleJumlahImpingerChange = (text: string) => {
      updateField('jumlahImpinger', text); // sync ke context
      const number = parseInt(text, 10);
      if (!isNaN(number) && number > 0) {
        // update beratAwalAirArray dan beratAkhirAirArray jika perlu
        if (data.beratAwalAirArray.length !== number) {
          updateField('beratAwalAirArray', Array(number).fill(''));
        }
        if (data.beratAkhirAirArray.length !== number) {
          updateField('beratAkhirAirArray', Array(number).fill(''));
        }
      }
    };
    
    const handleNumericInputInArray = (
      text: string,
      fieldName: "beratAwalAirArray" | "beratAkhirAirArray",
      index: number
    ) => {
      // Proses pembersihan input seperti handleNumericInput
      let cleanedText = text.replace(/[^0-9,.\-]/g, '');

      const minusIndex = cleanedText.indexOf('-');
      if (minusIndex > 0) {
        cleanedText = '-' + cleanedText.replace(/-/g, '');
      } else if (minusIndex === -1) {
        // tidak ada minus, langsung
      }

      cleanedText = cleanedText.replace(/\./g, ',');

      const parts = cleanedText.split(',');
      if (parts.length > 2) {
        cleanedText = parts[0] + ',' + parts.slice(1).join('');
      }

      // Update array di context pada index tertentu
      const currentArray = (fieldName === 'beratAwalAirArray' ? beratAwalArray : beratAkhirArray) ?? [];
      const newArray = [...currentArray];

      // Pastikan newArray cukup panjang
      while (newArray.length <= index) {
        newArray.push('');
      }
      newArray[index] = cleanedText;

      updateField(fieldName, newArray);
    };


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
    const BP = parseFloat(barometricPressure.replace(',', '.')) || 0;
    const VI = parseFloat(vmInitial.replace(',', '.')) || 0;
    const VF = parseFloat(vmFinal.replace(',', '.')) || 0;
    const MT = parseFloat(meterTemp.replace(',', '.')) || 0;
    const FKM = parseFloat(faktorKalibrasiMeter.replace(',', '.')) || 0;
    const DDH = parseFloat(dgmDeltaH.replace(',', '.')) || 0;

    // Fungsi untuk konversi nilai string array ke number dan jumlahkan
    const sumArrayStringToNumber = (arr: string[]) => {
      return arr.reduce((total, val) => {
        const num = parseFloat(val.replace(',', '.')) || 0;
        return total + num;
      }, 0);
    };

    // Hitung total berat awal dan akhir
    const totalBeratAwal = sumArrayStringToNumber(beratAwalArray);
    const totalBeratAkhir = sumArrayStringToNumber(beratAkhirArray);


    // --- Kontrol Ketersediaan Input ---
    // Variabel ini akan menjadi TRUE jika SEMUA string input TIDAK kosong.
    const allInputsFilled = barometricPressure && vmInitial && vmFinal && meterTemp && faktorKalibrasiMeter;
    
    let beratTotalAir = null;
    let volumeUapAir = null;
    let volumeGasKering = null;
    let volumeTotalGas = null;
    let persentaseKadarAir = null;

    // --- Logika Perhitungan Kondisional ---
    if (allInputsFilled) {
        // Perhitungan (Hanya jika semua input diisi)
        beratTotalAir = totalBeratAkhir - totalBeratAwal;
        volumeUapAir = beratTotalAir * 0.001333;
        volumeGasKering = (VF-VI) * FKM * (BP +(DDH/13.6)) * 298.15 /(760 * (MT+273));
        volumeTotalGas = volumeGasKering + volumeUapAir;
        persentaseKadarAir = (volumeUapAir / volumeTotalGas) * 100;
    }
    // Jika 'allInputsFilled' FALSE, maka Md dan Ms tetap null.

    // Toggle function untuk tombol
    const toggleBeratInputs = () => {
      setShowBeratInputs(prev => !prev);
    };
    
    return (
      <ThemeProvider>
        <ScrollView style={styles.container}>
            
            {/* ... (Header Section) ... */}
            <View style={styles.headerSection}>
              <Text style={styles.methodTitle}>
                Method 4 – <Text style={styles.methodSubtitle}>
                  Penentuan kadar uap air dalam aliran gas buang di dalam cerobong
                </Text>
              </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.title}>Input Data</Text>

                {[
                    { label: "DGM ΔH @ (mmH₂O)", value: data.dgmDeltaH, fieldKey: 'dgmDeltaH' },
                    { label: "Tekanan Barometrik (mmHg)", value: data.barometricPressure, fieldKey: 'barometricPressure' },
                    { label: "Volume Awal (m³)", value: data.vmInitial, fieldKey: 'vmInitial' },
                    { label: "Volume Akhir (m³)", value: data.vmFinal, fieldKey: 'vmFinal' },
                    { label: "Temperature Meter (°C)", value: data.meterTemp, fieldKey: 'meterTemp' },
                    { label: "Faktor Kalibrasi Meter", value: data.faktorKalibrasiMeter, fieldKey: 'faktorKalibrasiMeter' },
                ].map((f, i) => (
                    <View style={styles.field} key={i}>
                        <Text style={styles.label}>{f.label}</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="Masukkan nilai..."
                            placeholderTextColor="#655f5fff"
                            value={f.value}
                            // onChangeText={f.set}
                            onChangeText={(text) => handleNumericInput(text, f.fieldKey as keyof typeof data)}
                        />
                    </View>
                ))}

                {/* Input Jumlah Impinger */}
                  <View style={styles.card2}>
                    <View style={styles.field}>
                      <Text style={styles.label}>Jumlah Impinger</Text>
                      <TextInput
                        keyboardType="numeric"
                        placeholder="Masukkan jumlah impinger"
                        placeholderTextColor="#655f5fff"
                        value={jumlahImpinger !== null ? jumlahImpinger.toString() : ''}
                        onChangeText={handleJumlahImpingerChange}
                        style={styles.input}
                      />
                      {/* Tombol untuk toggle show/hide form input berat */}
                      <Pressable 
                        style={styles.toggleButton} 
                        onPress={toggleBeratInputs}
                      >
                        <Text style={styles.toggleButtonText}>
                          {showBeratInputs ? 'Sembunyikan Input Berat Air/Silika Gel' : 'Tampilkan Input Berat Air/Silika Gel'}
                        </Text>
                        <MaterialIcons 
                          name={showBeratInputs ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                          size={24} 
                          color="#9EC83E"
                        />
                      </Pressable>
                    </View>
                    {/* Render input berat hanya jika toggle show dan jumlahImpinger valid */}
                    {showBeratInputs && jumlahImpinger > 0 && (
                      <>
                        <View style={styles.field}>
                          <Text style={styles.label}>Berat Awal Air/Silika Gel Wi (g)</Text>
                          {Array.from({ length: jumlahImpinger }).map((_, idx) => (
                            <TextInput
                              key={idx}
                              style={styles.input}
                              value={beratAwalArray[idx] || ''}
                              keyboardType="numeric"
                              placeholderTextColor="#655f5fff"
                              placeholder={`Berat Awal Impinger ke-${idx + 1}`}
                              onChangeText={(text) => handleNumericInputInArray(text, 'beratAwalAirArray', idx)}
                            />
                          ))}
                        </View>

                        <View style={styles.field}>
                          <Text style={styles.label}>Berat Akhir Air/Silika Gel Wf (g)</Text>
                          {Array.from({ length: jumlahImpinger }).map((_, idx) => (
                            <TextInput
                              key={idx}
                              style={styles.input}
                              value={beratAkhirArray[idx] || ''}
                              keyboardType="numeric"
                              placeholderTextColor="#655f5fff"
                              placeholder={`Berat Akhir Impinger ke-${idx + 1}`}
                              onChangeText={(text) => handleNumericInputInArray(text, 'beratAkhirAirArray', idx)}
                            />
                          ))}
                        </View>
                      </>
                    )}


                  </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.title}>Hasil Perhitungan</Text>

                <View style={styles.outputRow}>
                    <Text style={styles.outputLabel}>Berat Total Air Ww :</Text>
                    {/* Tampilkan beratTotalAir HANYA jika nilainya bukan null */}
                    <Text style={styles.outputValue}>
                        {beratTotalAir !== null 
                            ? beratTotalAir.toLocaleString('id-ID', { maximumFractionDigits: 4, useGrouping: false }) 
                            : "–"} g
                    </Text>
                </View>
                <View style={styles.outputRow}>
                    <Text style={styles.outputLabel}>Volume Uap Air Vw (std) :</Text>
                    {/* Tampilkan volumeUapAir HANYA jika nilainya bukan null */}
                    <Text style={styles.outputValue}>
                        {volumeUapAir !== null 
                            ? volumeUapAir.toLocaleString('id-ID', { maximumFractionDigits: 4, useGrouping: false })
                            : "–"} m³
                    </Text>
                </View>
                <View style={styles.outputRow}>
                    <Text style={styles.outputLabel}>Volume Gas Kering Vm (std) :</Text>
                    {/* Tampilkan volumeGasKering HANYA jika nilainya bukan null */}
                    <Text style={styles.outputValue}>
                        {volumeGasKering !== null 
                            ? volumeGasKering.toLocaleString('id-ID', { maximumFractionDigits: 4, useGrouping: false })
                            : "–"} m³
                    </Text>
                </View>
                <View style={styles.outputRow}>
                    <Text style={styles.outputLabel}>Volume Total Gas Vt (std) :</Text>
                    {/* Tampilkan volumeTotalGas HANYA jika nilainya bukan null */}
                    <Text style={styles.outputValue}>
                        {volumeTotalGas !== null 
                            ? volumeTotalGas.toLocaleString('id-ID', { maximumFractionDigits: 4, useGrouping: false })
                            : "–"} m³
                    </Text>
                </View>
                <View style={styles.outputRow}>
                    <Text style={styles.outputLabel}>Persentase Kadar Air (bws):</Text>
                    {/* Tampilkan persentaseKadarAir HANYA jika nilainya bukan null */}
                    <Text style={styles.outputValue}>
                        {persentaseKadarAir !== null 
                            ? persentaseKadarAir.toLocaleString('id-ID', { maximumFractionDigits: 2, useGrouping: false })
                            : "–"} %
                    </Text>
                </View>

            </View>

            {/* ... (Footer) ... */}
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
  card2: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderColor: "#CBD5E1",
    borderWidth: 1,
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

  toggleButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  toggleButtonText: {
    color: '#9EC83E',
    fontWeight: '500',
    marginRight: 8,
  },

});
