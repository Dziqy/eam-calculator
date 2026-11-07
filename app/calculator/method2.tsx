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

export default function Method2() {
  const { data, updateField } = useCalculator();
  // Nilai-nilai diambil langsung dari global state
  const diameter = data.diameter;
  const length = data.length || ""; // <-- TAMBAHKAN length
  const width = data.width || ""; // <-- TAMBAHKAN width
  const shape = data.shape;
  const stackTemp = data.stackTemp;
  const staticPressure = data.staticPressure;
  const barometricPressure = data.barometricPressure;
  const pitotCoeff = data.pitotCoeff;
  const pitotDP = data.pitotDP;
  const kadarCO2 = data.kadarCO2;
  const kadarO2 = data.kadarO2;
  const kadarCO = data.kadarCO;
  const moisture = data.moisture;

  const handleNumericInput = (text: string, fieldName: keyof typeof data) => {
    // Hapus karakter tak diinginkan kecuali angka, koma, titik, dan minus
    let cleanedText = text.replace(/[^0-9,.\-]/g, "");

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

  let D_calculated = 0;

  if (shape === "Cerobong Lingkaran") {
    D_calculated = parseFloat(diameter.replace(",", ".")) || 0;
  } else if (shape === "Cerobong Persegi") {
    const L = parseFloat((length || "").replace(",", ".")) || 0;
    const W = parseFloat((width || "").replace(",", ".")) || 0;

    if (L > 0 && W > 0) {
      // Diameter Ekuivalen De = (2 * L * W) / (L + W)
      D_calculated = (2 * L * W) / (L + W);
    } else if (L > 0 || W > 0) {
      // Jika hanya satu sisi terisi, asumsikan persegi sama sisi (De = sisi)
      D_calculated = L || W;
    }
  }
  const D = D_calculated;

  // --- Konversi Input ---
  const ST = parseFloat(stackTemp.replace(",", ".")) || 0;
  const SP = parseFloat(staticPressure.replace(",", ".")) || 0;
  const BP = parseFloat(barometricPressure.replace(",", ".")) || 0;
  const PC = parseFloat(pitotCoeff.replace(",", ".")) || 0;
  const PD = parseFloat(pitotDP.replace(",", ".")) || 0;
  const KCO2 = parseFloat(kadarCO2.replace(",", ".")) || 0;
  const KO2 = parseFloat(kadarO2.replace(",", ".")) || 0;
  const KCO = parseFloat(kadarCO.replace(",", ".")) || 0;
  const M = parseFloat(moisture.replace(",", ".")) || 0;

  const [showCerobongOptions, setShowCerobongOptions] = useState(false);

  // --- Kontrol Ketersediaan Input ---

  // Variabel ini akan menjadi TRUE jika SEMUA string input TIDAK kosong.
  const hasDimension = shape === "Cerobong Lingkaran" ? D > 0 : D > 0; // D > 0 menunjukkan dimensi sudah valid

  // Input validation
  // Input validation - LOOSEN untuk testing

  const psInputFilled = SP && BP;
  const vsInputFilled = PC && PD;
  const qsdInputFilled = ST && hasDimension;
  const mollInputsFilled = kadarCO2 && kadarO2 && kadarCO && moisture;

  let tekananAbsolut: number | null = null;
  let kecepatanGas: number | null = null;
  let kuantitasGasKering: number | null = null;
  let molBasisKering: number | null = null;
  let molBasisBasah: number | null = null;

  if (psInputFilled) {
    tekananAbsolut = BP + SP / 13.6;
  }
  if (mollInputsFilled) {
    molBasisKering =
      0.44 * KCO2 + 0.32 * KO2 + 0.28 * (100 - KCO2 - KO2 - (KCO*10000) + (KCO*10000));
    molBasisBasah = molBasisKering * (1 - M / 100) + 18 * (M / 100);
  }

  if (vsInputFilled && tekananAbsolut !== null && molBasisBasah !== null) {
    kecepatanGas =
      34.97 *
      PC *
      Math.sqrt(PD) *
      Math.sqrt((ST + 273.15) / (tekananAbsolut * molBasisBasah));
  }

  if (
    qsdInputFilled &&
    D > 0 &&
    kecepatanGas !== null &&
    M &&
    tekananAbsolut !== null
  ) {
    let area; // Luas Penampang (A)

    if (shape === "Cerobong Lingkaran") {
      // Area Lingkaran = (1/4) * pi * D^2
      area = (1 / 4) * Math.PI * Math.pow(D, 2);
    } else {
      // Area Persegi = L * W. Karena D_calculated adalah De, kita perlu L dan W aktual.
      // Asumsi: Jika persegi, area = L * W
      const L_actual = parseFloat((data.length || "").replace(",", ".")) || 0;
      const W_actual = parseFloat((data.width || "").replace(",", ".")) || 0;
      area = L_actual * W_actual;
    }

    kuantitasGasKering =
      (1 - M / 100) *
      area *
      kecepatanGas *
      (298 / (ST + 273.15)) *
      (tekananAbsolut / 760);
  }

  // ------------------------------------------------------------------
  // --- FUNGSI RENDERING INPUT DIMENSI KONDISIONAL ---
  // ------------------------------------------------------------------
  const renderDimensionInputs = () => {
    const inputs = [];
    // Tentukan input dimensi berdasarkan bentuk
    if (shape === "Cerobong Lingkaran") {
      inputs.push({
        label: "Diameter Cerobong (m)",
        value: data.diameter,
        fieldKey: "diameter",
      });
    } else if (shape === "Cerobong Persegi") {
      inputs.push(
        {
          label: "Panjang Sisi Cerobong (m)",
          value: data.length || "",
          fieldKey: "length",
        },
        {
          label: "Lebar Sisi Cerobong (m)",
          value: data.width || "",
          fieldKey: "width",
        }
      );
    }
    // Fallback/Default
    if (!shape) {
    }
    return inputs.map((f, i) => (
      <View style={styles.field} key={`dim-${i}`}>
        <Text style={styles.label}>{f.label}</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          placeholder="Masukkan nilai..."
          placeholderTextColor="#655f5fff"
          value={f.value}
          onChangeText={(text) =>
            handleNumericInput(text, f.fieldKey as keyof typeof data)
          }
        />
      </View>
    ));
  };

  return (
    <ThemeProvider>
      <ScrollView style={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.methodTitle}>
            Method 2 –{" "}
            <Text style={styles.methodSubtitle}>
              Penentuan laju alir linier dan laju alir volumetric gas buang
            </Text>
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tekanan Barometrik (mmHg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Masukkan nilai..."
              placeholderTextColor="#655f5fff"
              value={data.barometricPressure}
              onChangeText={(text) =>
                handleNumericInput(text, "barometricPressure")
              }
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tekanan Statis (mmH₂O)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Masukkan nilai..."
              placeholderTextColor="#655f5fff"
              value={data.staticPressure}
              onChangeText={(text) =>
                handleNumericInput(text, "staticPressure")
              }
            />
          </View>
          {tekananAbsolut !== null ? (
            <View style={styles.formGroup}>
              <View style={styles.outputRow2}>
                <Text style={styles.outputLabel}>Tekanan Absolut (Ps):</Text>
                <Text style={styles.outputValue}>
                  {tekananAbsolut.toLocaleString("id-ID", {
                    maximumFractionDigits: 2,
                    useGrouping: false,
                  })}{" "}
                  mmHg
                </Text>
              </View>
            </View>
          ) : (
            // Pesan petunjuk jika tekananAbsolut belum terisi
            <View style={styles.formGroup}>
              <View style={styles.outputRow3}>
                <Text style={styles.outputLabel2}>Tekanan Absolut (Ps):</Text>
                <Text style={styles.outputValue2}>– mmHg</Text>
              </View>
            </View>
          )}

          {molBasisBasah ? (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Berat Molekul Basis Basah (Ms):</Text>
              <View style={[styles.dropdown, { backgroundColor: "#F0F0F0" }]}>
                <Text
                  style={[
                    styles.dropdownText,
                    { color: "#000000ff", fontWeight: "bold" },
                  ]}
                >
                  {molBasisBasah.toLocaleString("id-ID", {
                    maximumFractionDigits: 2,
                    useGrouping: false,
                  })}{" "}
                  g/g.mol
                </Text>
              </View>
            </View>
          ) : (
            // Pesan petunjuk jika molbasiskering pada method 3 belum diinput
            <View style={styles.formGroup}>
              <Text style={styles.label}>Berat Molekul Basis Basah (Ms):</Text>
              <View style={[styles.dropdown, { backgroundColor: "#F0F0F0" }]}>
                <Text style={[styles.dropdownText, { color: "#888" }]}>
                  Masukkan nilai pada method 3 terlebih dahulu...
                </Text>
              </View>
            </View>
          )}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Pitot Koefisien (mmHg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Masukkan nilai..."
              placeholderTextColor="#655f5fff"
              value={data.pitotCoeff}
              onChangeText={(text) => handleNumericInput(text, "pitotCoeff")}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Pitot ΔP</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Masukkan nilai..."
              placeholderTextColor="#655f5fff"
              value={data.pitotDP}
              onChangeText={(text) => handleNumericInput(text, "pitotDP")}
            />
          </View>
          {kecepatanGas !== null ? (
            <View style={styles.formGroup}>
              <View style={styles.outputRow2}>
                <Text style={styles.outputLabel}>Kecepatan Gas (Vs):</Text>
                <Text style={styles.outputValue}>
                  {kecepatanGas.toLocaleString("id-ID", {
                    maximumFractionDigits: 2,
                    useGrouping: false,
                  })}{" "}
                  m/s
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.formGroup}>
              <View style={styles.outputRow3}>
                <Text style={styles.outputLabel2}>Kecepatan Gas (Vs):</Text>
                <Text style={styles.outputValue2}>– m/s</Text>
              </View>
            </View>
          )}

          {/* Dropdown: Bentuk Cerobong */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Bentuk Cerobong</Text>
            <Pressable
              style={styles.dropdown}
              onPress={() => setShowCerobongOptions(!showCerobongOptions)}
            >
              <Text style={styles.dropdownText}>
                {shape || "Pilih bentuk cerobong..."}
              </Text>
              <MaterialIcons
                name={
                  showCerobongOptions
                    ? "keyboard-arrow-up"
                    : "keyboard-arrow-down"
                }
                size={24}
                color="#555"
                style={styles.dropdownIcon}
              />
            </Pressable>
            {showCerobongOptions && (
              <View style={styles.dropdownList}>
                {["Cerobong Lingkaran", "Cerobong Persegi"].map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      updateField("shape", item);
                      setShowCerobongOptions(false);
                    }}
                    style={styles.dropdownItem}
                  >
                    <Text style={styles.dropdownItemText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          {renderDimensionInputs()}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Temperatur Cerobong (°C)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Masukkan nilai..."
              placeholderTextColor="#655f5fff"
              value={data.stackTemp}
              onChangeText={(text) => handleNumericInput(text, "stackTemp")}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Moisture bws (%)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Masukkan nilai..."
              placeholderTextColor="#655f5fff"
              value={data.moisture}
              onChangeText={(text) => handleNumericInput(text, "moisture")}
            />
          </View>
          {kuantitasGasKering !== null ? (
            <View style={styles.formGroup}>
              <View style={styles.outputRow2}>
                <Text style={styles.outputLabel}>
                  Flow Rate Basis Kering (Qsd):
                </Text>
                <Text style={styles.outputValue}>
                  {kuantitasGasKering.toLocaleString("id-ID", {
                    maximumFractionDigits: 2,
                    useGrouping: false,
                  })}{" "}
                  m³/s
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.formGroup}>
              <View style={styles.outputRow3}>
                <Text style={styles.outputLabel2}>
                  Flow Rate Basis Kering (Qsd):
                </Text>
                <Text style={styles.outputValue2}>– m³/s</Text>
              </View>
            </View>
          )}
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
  outputRow2: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    borderTopColor: "#ddd",
    backgroundColor: "#9fc83eff",
    elevation: 10,
    borderRadius: 3,
    paddingHorizontal: 10,
  },
  outputRow3: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    borderTopColor: "#ddd",
    backgroundColor: "#88c83e91",
    paddingHorizontal: 10,
  },
  outputLabel: { fontSize: 15, color: "#444", fontWeight: "bold" },
  outputValue: { fontSize: 15, fontWeight: "bold", color: "#444" },
  outputLabel2: { fontSize: 15, color: "#0000006f", fontWeight: "bold" },
  outputValue2: { fontSize: 15, fontWeight: "bold", color: "#0000006f" },
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
});
