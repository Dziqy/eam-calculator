import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useCalculator } from "../../context/CalculatorContext";
import { ThemeProvider } from "../../context/ThemeContext";

export default function Method5() {
  const { data, updateField } = useCalculator();

  const [showMethod5, setShowMethod5] = useState(false); // Kontrol show/hide
  const [showPersenL, setShowPersenL] = useState(false); // Kontrol show/hide

  // Nilai-nilai diambil langsung dari global state
  const stackTemp = data.stackTemp;
  const kadarCO2 = data.kadarCO2;
  const kadarO2 = data.kadarO2;
  const kadarCO = data.kadarCO;
  const barometricPressure = data.barometricPressure;
  const moisture = data.moisture;
  const staticPressure = data.staticPressure;
  const pitotCoeff = data.pitotCoeff;
  const pitotDP = data.pitotDP;
  const dgmDeltaH = data.dgmDeltaH;
  const dgmTempTM = data.dgmTempTM;
  const estPitotDeltaP = data.estPitotDeltaP;
  const samplingRate = data.samplingRate;
  const actualNozzleDia = data.actualNozzleDia;
  const vmInitial = data.vmInitial;
  const vmFinal = data.vmFinal;
  const faktorKalibrasiMeter = data.faktorKalibrasiMeter;
  const deltaHActual = data.deltaHActual;
  const samplingTime = data.samplingTime;

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
    let cleanedText = text.replace(/[^0-9,.\-]/g, "");

    // Pastikan hanya satu minus yang valid di awal
    // Jika minus ada tapi bukan di urutan pertama, pindahkan ke awal
    const minusIndex = cleanedText.indexOf("-");
    if (minusIndex > 0) {
      cleanedText = "-" + cleanedText.replace(/-/g, "");
    } else if (minusIndex === -1) {
      // tidak ada minus, lakukan apa adanya
    }

    // Ubah titik jadi koma agar seragam desimal
    cleanedText = cleanedText.replace(/\./g, ",");

    // Hanya boleh satu koma
    const parts = cleanedText.split(",");
    if (parts.length > 2) {
      cleanedText = parts[0] + "," + parts.slice(1).join("");
    }

    updateField(fieldName, cleanedText);
  };

  // --- Konversi Input ---
  // Di sini, sebelum parseFloat, GANTI koma (,) menjadi titik (.)
  const DDH = parseFloat(dgmDeltaH.replace(",", ".")) || 0;
  const ST = parseFloat(stackTemp.replace(",", ".")) || 0;
  const KCO2 = parseFloat(kadarCO2.replace(",", ".")) || 0;
  const KO2 = parseFloat(kadarO2.replace(",", ".")) || 0;
  const KCO = parseFloat(kadarCO.replace(",", ".")) || 0;
  const BP = parseFloat(barometricPressure.replace(",", ".")) || 0;
  const M = parseFloat(moisture.replace(",", ".")) || 0;
  const SP = parseFloat(staticPressure.replace(",", ".")) || 0;
  const PC = parseFloat(pitotCoeff.replace(",", ".")) || 0;
  const PD = parseFloat(pitotDP.replace(",", ".")) || 0;
  const DTT = parseFloat(dgmTempTM.replace(",", ".")) || 0;
  const EPD = parseFloat(estPitotDeltaP.replace(",", ".")) || 0;
  const SR = parseFloat(samplingRate.replace(",", ".")) || 0;
  const AN = parseFloat(actualNozzleDia.replace(",", ".")) || 0;
  const VF = parseFloat(vmFinal.replace(",", ".")) || 0;
  const VI = parseFloat(vmInitial.replace(",", ".")) || 0;
  const FKM = parseFloat(faktorKalibrasiMeter.replace(",", ".")) || 0;
  const DHA = parseFloat(deltaHActual.replace(",", ".")) || 0;
  const SAT = parseFloat(samplingTime.replace(",", ".")) || 0;

  // --- Kontrol Ketersediaan Input ---
  // Variabel ini akan menjadi TRUE jika SEMUA string input TIDAK kosong.
  const allInputsFilled =
    dgmDeltaH &&
    stackTemp &&
    kadarCO2 &&
    kadarO2 &&
    kadarCO &&
    barometricPressure &&
    staticPressure &&
    pitotCoeff &&
    pitotDP &&
    dgmTempTM &&
    estPitotDeltaP &&
    samplingRate &&
    actualNozzleDia &&
    moisture;

  let nozzelEstimateDiameter = null; // Inisialisasi nozzelEstimateDiameter sebagai null (atau nilai placeholder)
  let kFactorIsokinetic = null;
  let idealDeltaH = null;
  let persenL = null;

  // --- Logika Perhitungan Kondisional ---

  persenL =
    (100 *
      ((ST + 273.15) *
        ((FKM * (298.15 / 760) * (VF - VI) * (BP + DHA / 13.6)) /
          (DTT + 273.15)) *
        760)) /
    (60 *
      298 *
      (BP + SP / 13.6) *
      (34.97 *
        PC *
        Math.sqrt(PD) *
        Math.sqrt(
          (ST + 273.15) /
            ((BP + SP / 13.6) *
              ((0.44 * KCO2 +
                0.32 * KO2 +
                0.28 * (100 - KCO2 - KO2 - KCO + KCO)) *
                (1 - M / 100) +
                18 * (M / 100)))
        )) *
      (Math.PI * Math.pow(AN / 2 / 1000, 2)) *
      SAT *
      (1 - M / 100));

  nozzelEstimateDiameter = Math.sqrt(
    Math.sqrt(
      ((ST + 273.15) *
        ((0.44 * KCO2 + 0.32 * KO2 + 0.28 * (100 - KCO2 - KO2 - KCO + KCO)) *
          (1 - M / 100) +
          18 * (M / 100))) /
        ((BP + SP / 13.6) * EPD)
    ) *
      ((0.6071 * SR * (BP + DDH / 13.6)) / ((DTT + 273.15) * PC * (1 - 0.1432)))
  );
  if (allInputsFilled) {
    kFactorIsokinetic =
      (((0.44 * KCO2 + 0.32 * KO2 + 0.28 * (100 - KCO2 - KO2 - KCO + KCO)) *
        (DTT + 273.15) *
        (BP + SP / 13.6)) /
        (((0.44 * KCO2 + 0.32 * KO2 + 0.28 * (100 - KCO2 - KO2 - KCO + KCO)) *
          (1 - M / 100) +
          18 * (M / 100)) *
          (ST + 273.15) *
          (BP + DDH / 13.6))) *
      (0.00008038 *
        Math.pow(AN, 4) *
        DDH *
        Math.pow(PC, 2) *
        Math.pow(1 - M / 100, 2));

    idealDeltaH = kFactorIsokinetic * PD;
  }

  // Toggle function untuk tombol
  const toggleMethod5 = () => {
    setShowMethod5((prev) => !prev);
  };
  const togglePersenL = () => {
    setShowPersenL((prev) => !prev);
  };

  return (
    <ThemeProvider>
      <ScrollView style={styles.container}>
        {/* ... (Header Section) ... */}
        <View style={styles.headerSection}>
          <Text style={styles.methodTitle}>
            Method 5 –{" "}
            <Text style={styles.methodSubtitle}>
              Penentuan kadar partikulat emisi sumber tidak bergerak secara
              isokinetik
            </Text>
          </Text>
        </View>
        <View style={styles.card1}>
          <Pressable style={styles.toggleButton} onPress={toggleMethod5}>
            <Text style={styles.toggleButtonText}>
              {showMethod5
                ? "Sembunyikan Nozzle & Faktor Isokinetic"
                : "Tampilkan Nozzle & Faktor Isokinetic"}
            </Text>
            <MaterialIcons
              name={showMethod5 ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color="#9EC83E"
            />
          </Pressable>
          {showMethod5 && (
            <>
              <View style={styles.card}>
                <Text style={styles.title}>Input Data Method 5</Text>

                {[
                  {
                    label: "Kadar CO₂ (%)",
                    value: data.kadarCO2,
                    fieldKey: "kadarCO2",
                  },
                  {
                    label: "Kadar O₂ (%)",
                    value: data.kadarO2,
                    fieldKey: "kadarO2",
                  },
                  {
                    label: "Kadar CO (%)",
                    value: data.kadarCO,
                    fieldKey: "kadarCO",
                  },
                  {
                    label: "Moisture bws (%)",
                    value: data.moisture,
                    fieldKey: "moisture",
                  },
                  {
                    label: "Temperatur Cerobong (°C)",
                    value: data.stackTemp,
                    fieldKey: "stackTemp",
                  },
                  {
                    label: "Tekanan Statis (mmH₂O)",
                    value: data.staticPressure,
                    fieldKey: "staticPressure",
                  },
                  {
                    label: "Tekanan Barometrik (mmHg)",
                    value: data.barometricPressure,
                    fieldKey: "barometricPressure",
                  },
                  {
                    label: "Pitot Koefisien",
                    value: data.pitotCoeff,
                    fieldKey: "pitotCoeff",
                  },
                  {
                    label: "Pitot Δp",
                    value: data.pitotDP,
                    fieldKey: "pitotDP",
                  },
                  {
                    label: "DGM ΔH @ (mmH₂O)",
                    value: data.dgmDeltaH,
                    fieldKey: "dgmDeltaH",
                  },
                  {
                    label: "DGM Temperature Tm (°C)",
                    value: data.dgmTempTM,
                    fieldKey: "dgmTempTM",
                  },
                  {
                    label: "Est. Pitot Δp",
                    value: data.estPitotDeltaP,
                    fieldKey: "estPitotDeltaP",
                  },
                  {
                    label: "Sampling Rate Qs (LPM)",
                    value: data.samplingRate,
                    fieldKey: "samplingRate",
                  },
                  {
                    label: "Actual Nozzle Diameter (mm)",
                    value: data.actualNozzleDia,
                    fieldKey: "actualNozzleDia",
                  },
                ].map((f, i) => (
                  <View style={styles.field} key={i}>
                    <Text style={styles.label}>{f.label}</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      placeholder="Masukkan nilai..."
                      placeholderTextColor="#655f5fff"
                      value={f.value}
                      onChangeText={(text) =>
                        handleNumericInput(
                          text,
                          f.fieldKey as keyof typeof data
                        )
                      }
                    />
                  </View>
                ))}
              </View>

              <View style={styles.card}>
                <Text style={styles.title}>
                  Hasil Perhitungan Nozzle & Faktor Isokinetik
                </Text>

                <View style={styles.outputIdealNozzle}>
                  <Text style={styles.outputLabel}>
                    Ideal Nozzel Estimasi Diameter:
                  </Text>
                  {/* Tampilkan nozzelEstimateDiameter HANYA jika nilainya bukan null */}
                  <Text style={styles.outputValue}>
                    {nozzelEstimateDiameter !== null
                      ? nozzelEstimateDiameter.toLocaleString("id-ID", {
                          maximumFractionDigits: 2,
                          useGrouping: false,
                        })
                      : "-"}{" "}
                    mm
                  </Text>
                </View>

                <View style={styles.outputRow}>
                  <Text style={styles.outputLabel}>
                    K Factor (Isokinetic rate):
                  </Text>
                  <Text style={styles.outputValue}>
                    {kFactorIsokinetic !== null
                      ? kFactorIsokinetic.toLocaleString("id-ID", {
                          maximumFractionDigits: 2,
                          useGrouping: false,
                        })
                      : "-"}
                  </Text>
                </View>

                <View style={styles.outputRow}>
                  <Text style={styles.outputLabel}>Ideal ΔH:</Text>
                  <Text style={styles.outputValue}>
                    {idealDeltaH !== null
                      ? idealDeltaH.toLocaleString("id-ID", {
                          maximumFractionDigits: 2,
                          useGrouping: false,
                        })
                      : "-"}{" "}
                    mmH₂O
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.card1}>
          <Pressable style={styles.toggleButton} onPress={togglePersenL}>
            <Text style={styles.toggleButtonText}>
              {showPersenL
                ? "Sembunyikan %Isokinetik"
                : "Tampilkan %Isokinetik"}
            </Text>
            <MaterialIcons
              name={showPersenL ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color="#9EC83E"
            />
          </Pressable>
          {showPersenL && (
            <>
              <View style={styles.card}>
                <Text style={styles.title}>Input Data %Isokinetik</Text>

                {[
                  {
                    label: "Sampling Rate Qs (LPM)",
                    value: data.samplingRate,
                    fieldKey: "samplingRate",
                  },
                  {
                    label: "Volume Awal (m³)",
                    value: data.vmInitial,
                    fieldKey: "vmInitial",
                  },
                  {
                    label: "Volume Akhir (m³)",
                    value: data.vmFinal,
                    fieldKey: "vmFinal",
                  },
                  {
                    label: "Faktor Kalibrasi Meter",
                    value: data.faktorKalibrasiMeter,
                    fieldKey: "faktorKalibrasiMeter",
                  },
                  {
                    label: "ΔH Actual (mmH₂O)",
                    value: data.deltaHActual,
                    fieldKey: "deltaHActual",
                  },
                  {
                    label: "Sampling Time (menit)",
                    value: data.samplingTime,
                    fieldKey: "samplingTime",
                  },
                ].map((f, i) => (
                  <View style={styles.field} key={i}>
                    <Text style={styles.label}>{f.label}</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="Masukkan nilai..."
                      placeholderTextColor="#655f5fff"
                      value={f.value}
                      onChangeText={(text) =>
                        handleNumericInput(
                          text,
                          f.fieldKey as keyof typeof data
                        )
                      }
                    />
                  </View>
                ))}
              </View>

              <View style={styles.card}>
                <Text style={styles.title}>Hasil Perhitungan %l</Text>

                <View style={styles.outputIdealNozzle}>
                  <Text style={styles.outputLabel}>%l:</Text>
                  <Text style={styles.outputValue}>
                    {persenL !== null
                      ? persenL.toLocaleString("id-ID", {
                          maximumFractionDigits: 5,
                          useGrouping: false,
                        })
                      : "-"}{" "}
                    %
                  </Text>
                </View>
              </View>
            </>
          )}
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
  label: { fontSize: 14, color: "#003366", marginBottom: 4 },
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
  outputIdealNozzle: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#41e851ff",
    borderRadius: 5,
  },
  outputLabel: { fontSize: 15, color: "#444", fontWeight: "bold" },
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
    marginBottom: 10,
    elevation: 3,
  },
  card1: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 15,
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
    flexDirection: "row", // Menyusun item secara horizontal
    justifyContent: "space-between", // Mendorong item ke kiri dan kanan (teks di kiri, ikon di kanan)
    alignItems: "center", // Memastikan item sejajar di tengah secara vertikal
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  toggleButtonText: {
    color: "#9EC83E",
    fontWeight: "900",
    marginRight: 8,
  },
});
