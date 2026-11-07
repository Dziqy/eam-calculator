import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  downstreamPoint,
  hitungNilaiLookupD,
  hitungNilaiLookupU,
  upstreamPoint,
} from "../../components/utils/lookupPoint";
import {
  calculateFinalPoints,
  hierarchicalPointData,
} from "../../components/utils/tabelTitikLintas";
import { useCalculator } from "../../context/CalculatorContext";
import { ThemeProvider } from "../../context/ThemeContext";

// ====================================================================
// --- KOMPONEN UTAMA ---
// ====================================================================

export default function Method1() {
  const { data, updateField } = useCalculator();
  // Nilai-nilai diambil langsung dari global state
  const diameter = data.diameter;
  const height = data.height;
  const shape = data.shape;
  const flange = data.flange;
  const length = data.length;
  const width = data.width;
  const upstreamB = data.upstreamB;
  const downstreamA = data.downstreamA;
  const flangeSize = data.flangeSize;

  // --- DAFTAR OPSI FLANGE ---
  const allFlangeOptions = {
    "Cerobong Lingkaran": ["1 Flange", "2 Flange", "4 Flange"],
    "Cerobong Persegi": ["3 Flange", "4 Flange", "5 Flange"],
  };
  // Dapatkan opsi flange yang saat ini tersedia
  const availableFlangeOptions =
    allFlangeOptions[shape as keyof typeof allFlangeOptions] || [];

  // State input
  const [showCerobongOptions, setShowCerobongOptions] = useState(false);
  const [showFlangeOptions, setShowFlangeOptions] = useState(false);

  // State output yang dihitung di useEffect
  const [downstreamVar, setDownstreamVar] = useState<number | null>(null);
  const [upstreamVar, setUpstreamVar] = useState<number | null>(null);
  const [portA, setPortA] = useState<number | null>(null); // Titik Lintas Downstream
  const [portB, setPortB] = useState<number | null>(null); // Titik Lintas Upstream

  // --- STATE BARU UNTUK TABEL TITIK LINTAS ---
  const [pointsTableData, setPointsTableData] = useState<
    { tl: string; percent: number; cm: number }[] | null
  >(null);

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

  // --- Fungsi Rendering Input Dimensi Kondisional ---
  const renderDimensionInputs = () => {
    const inputs = [];

    // Tentukan input dimensi berdasarkan bentuk
    if (shape === "Cerobong Lingkaran") {
      // Bulat: Diameter
      inputs.unshift({
        label: "Diameter Cerobong (m)",
        value: data.diameter,
        fieldKey: "diameter",
      });
    } else if (shape === "Cerobong Persegi") {
      // Persegi: Panjang dan Lebar
      inputs.unshift(
        {
          label: "Panjang Sisi Cerobong (m)",
          value: data.length || "", // Asumsi field length ada di data
          fieldKey: "length",
        },
        {
          label: "Lebar Sisi Cerobong (m)",
          value: data.width || "", // Asumsi field width ada di data
          fieldKey: "width",
        }
      );
    }

    // Tambahkan input Gangguan B (Upstream) dan A (Downstream)
    inputs.push(
      {
        label: "Gangguan Atas B (m)",
        value: data.upstreamB,
        fieldKey: "upstreamB",
      },
      {
        label: "Gangguan Bawah A (m)",
        value: data.downstreamA,
        fieldKey: "downstreamA",
      }
    );

    // Jika bentuk belum dipilih, tampilkan input diameter secara default (atau kosongkan)
    if (!shape) {
    }

    return inputs.map((f, i) => (
      <View style={styles.field} key={i}>
        <Text style={styles.label}>{f.label}</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Masukkan nilai..."
          placeholderTextColor="#655f5fff"
          value={f.value}
          // handleNumericInput akan memanggil updateField dengan fieldKey yang benar
          onChangeText={(text) =>
            handleNumericInput(text, f.fieldKey as keyof typeof data)
          }
        />
      </View>
    ));
  };

  // --- Konversi Input ---
  let D_calculated = 0;

  // Konversi tinggi (H)
  const UB = parseFloat(upstreamB.replace(",", ".")) || 0;
  const DA = parseFloat(downstreamA.replace(",", ".")) || 0;

  if (shape === "Cerobong Lingkaran") {
    // Bulat: Gunakan diameter yang dimasukkan
    D_calculated = parseFloat(diameter.replace(",", ".")) || 0;
  } else if (shape === "Cerobong Persegi") {
    // Persegi: Gunakan Panjang dan Lebar
    const L = parseFloat((data.length || "").replace(",", ".")) || 0; // Ambil dari data.length
    const W = parseFloat((data.width || "").replace(",", ".")) || 0; // Ambil dari data.width

    // Hitung Diameter Ekuivalen (De)
    if (L > 0 && W > 0) {
      // Rumus De = (2 * L * W) / (L + W)
      D_calculated = (2 * L * W) / (L + W);
    } else if (L > 0 || W > 0) {
      // Jika hanya satu sisi yang terisi (asumsi persegi)
      D_calculated = L || W;
    }
  }
  // Gunakan D_calculated sebagai D untuk semua rumus berikutnya
  const D = D_calculated;

  let rasio = null;
  let min2D = null;
  let min8D = null;
  let downstream = null;
  let upstream = null;
  let lokasiSampling = null;

  if (D > 0 && UB > 0 && DA > 0) {
    const rasioBD = UB / D;
    const rasioAD = DA / D;
    rasio = `${Math.round(rasioBD)}D/${Math.round(rasioAD)}D`;
    min2D = D * 2;
    min8D = D * 8;

    // Lokasi Sampling: Cek apakah Downstream Lokasi memenuhi min8D
    lokasiSampling = UB > min8D ? "IDEAL" : "TIDAK IDEAL";
  }

  // Total Titik Lintas menggunakan MAX(Port A, Port B)
  const totalPoints =
    portA !== null && portB !== null ? Math.max(portA, portB) : 0;

  // --- LOGIKA PESAN ERROR BARU ---
  // 1. Cek apakah ada input utama (D, H, Shape, Flange)
  const hasRequiredInputs = D > 0 && UB > 0 && DA > 0 && !!shape && !!flange;

  let tableErrorMessage = null;
  if (!hasRequiredInputs) {
    // Pesan default jika input utama wajib (D, H, Shape, Flange) belum terisi
    tableErrorMessage =
      "Tidak ada data titik lintas (masukkan Diameter, Tinggi, bentuk Cerobong, dan jumlah Flange)";
  } else if (
    hasRequiredInputs &&
    pointsTableData &&
    pointsTableData.length === 0
  ) {
    // Pesan kustom jika input lengkap tapi data lookup tidak ditemukan
    tableErrorMessage =
      "Tidak ada data titik lintas (pilih ulang jumlah flange tersedia yang sesuai)";
  } else if (pointsTableData === null) {
    // Kasus fallback jika ada error di useEffect (misal: hanya D dan H terisi, tapi shape/flange kosong)
    tableErrorMessage = "Lengkapi input Bentuk Cerobong dan Jumlah Flange.";
  }

  // --- Logika Kompleks (Lookup) ---
  useEffect(() => {
    // Ambil nilai D yang sudah dikalkulasi (dari logika di Langkah 1)
    let D_val = 0;
    if (shape === "Cerobong Lingkaran") {
      D_val = parseFloat((data.diameter || "").replace(",", ".")) || 0;
    } else if (shape === "Cerobong Persegi") {
      const L = parseFloat((data.length || "").replace(",", ".")) || 0;
      const W = parseFloat((data.width || "").replace(",", ".")) || 0;
      if (L > 0 && W > 0) {
        D_val = (2 * L * W) / (L + W);
      } else if (L > 0 || W > 0) {
        D_val = L || W;
      }
    }

    const UB_val = parseFloat((data.upstreamB || "").replace(",", ".")) || 0;
    const DA_val = parseFloat((data.downstreamA || "").replace(",", ".")) || 0;

    // Reset jika input kosong
    if (D_val <= 0 || UB_val <= 0 || DA_val <= 0) {
      setDownstreamVar(null);
      setUpstreamVar(null);
      setPortA(null);
      setPortB(null);
      setPointsTableData(null); // <-- RESET DATA TABEL
      return;
    }

    const upstreamVar = UB_val / D_val;
    setUpstreamVar(upstreamVar);
    const downstreamVar = DA_val / D_val;
    setDownstreamVar(downstreamVar);

    // 2. Hitung Port A (Upstream)
    const hasilPortA = hitungNilaiLookupU(
      D_val,
      downstreamVar,
      downstreamPoint
    );
    setPortA(hasilPortA);

    // 3. Hitung Port B (Downstream)
    const hasilPortB = hitungNilaiLookupD(D_val, upstreamVar, upstreamPoint);
    setPortB(hasilPortB);

    // --- LOGIKA BARU: HITUNG TABEL TITIK LINTAS ---
    const maxPoints = Math.max(hasilPortA || 0, hasilPortB || 0);

    if (maxPoints > 0) {
      // Panggil fungsi calculateFinalPoints yang diimpor
      const resultTable = calculateFinalPoints(
        shape,
        flange,
        maxPoints,
        D_val, // Diameter dalam meter
        data.flangeSize,
        hierarchicalPointData
      );
      setPointsTableData(resultTable);
    } else {
      setPointsTableData(null);
    }
  }, [
    data.diameter,
    data.upstreamB,
    data.downstreamA,
    data.length,
    data.width,
    shape,
    flange,
    data.flangeSize
  ]); // Jalankan ulang saat D dll berubah

  return (
    <ThemeProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar style="light" backgroundColor="#003366" />

        <View style={styles.headerSection}>
          <Text style={styles.methodTitle}>
            Method 1 –{" "}
            <Text style={styles.methodSubtitle}>
              Penentuan lokasi dan titik-titik lintas untuk pengambilan contoh
              uji partikulat dan kecepatan linier
            </Text>
          </Text>
        </View>

        {/* INPUT SECTION */}
        <View style={styles.card}>
          <Text style={styles.title}>Input Data</Text>
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
                      // 1. Ganti setShape(item)
                      // Gunakan fungsi updateField dari Context
                      updateField("shape", item);

                      // 2. Tutup dropdown (state lokal)
                      setShowCerobongOptions(false);
                      // --- LOGIKA BARU UNTUK RESET FLANGE ---
                      const nextOptions =
                        allFlangeOptions[item as keyof typeof allFlangeOptions];

                      // Cek apakah flange yang dipilih saat ini TIDAK ada di opsi baru
                      if (nextOptions && !nextOptions.includes(flange)) {
                        // Reset flange ke opsi pertama
                        updateField("flange", nextOptions[0]);
                      }
                    }}
                    style={styles.dropdownItem}
                  >
                    <Text style={styles.dropdownItemText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          {/* INPUT DIMENSI KONDISIONAL BARU */}
          {renderDimensionInputs()}

          {/* Panjang Flange HANYA MUNCUL JIKA SHAPE SUDAH DIPILIH */}
          {shape ? (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Panjang Flange</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Masukkan nilai..."
                placeholderTextColor="#655f5fff"
                value={data.flangeSize}
                // onChangeText={f.set}
                onChangeText={(text) => handleNumericInput(text, "flangeSize")}
              />
            </View>
          ) : (
            // Pesan petunjuk jika shape belum dipilih
            <View style={styles.formGroup}>
              <Text style={styles.label}>Panjang Flange</Text>
              <View style={[styles.dropdown, { backgroundColor: "#F0F0F0" }]}>
                <Text style={[styles.dropdownText, { color: "#888" }]}>
                  (Pilih Bentuk Cerobong terlebih dahulu)
                </Text>
              </View>
            </View>
          )}

          {/* Dropdown: Flange HANYA MUNCUL JIKA SHAPE SUDAH DIPILIH */}
          {shape ? (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Jumlah Flange</Text>
              <Pressable
                style={styles.dropdown}
                onPress={() => setShowFlangeOptions(!showFlangeOptions)}
              >
                <Text style={styles.dropdownText}>
                  {flange || "Pilih jumlah flange..."}
                </Text>
                <MaterialIcons
                  name={
                    showFlangeOptions
                      ? "keyboard-arrow-up"
                      : "keyboard-arrow-down"
                  }
                  size={24}
                  color="#555"
                  style={styles.dropdownIcon}
                />
              </Pressable>
              {showFlangeOptions && (
                <View style={styles.dropdownList}>
                  {/* Menggunakan availableFlangeOptions yang sudah didefinisikan */}
                  {availableFlangeOptions.map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => {
                        updateField("flange", item);
                        setShowFlangeOptions(false);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ) : (
            // Pesan petunjuk jika shape belum dipilih
            <View style={styles.formGroup}>
              <Text style={styles.label}>Jumlah Flange</Text>
              <View style={[styles.dropdown, { backgroundColor: "#F0F0F0" }]}>
                <Text style={[styles.dropdownText, { color: "#888" }]}>
                  (Pilih Bentuk Cerobong terlebih dahulu)
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* OUTPUT SECTION */}
        <View style={styles.card}>
          <Text style={styles.title}>Hasil Perhitungan</Text>
          <View style={styles.outputRow}>
            <Text style={styles.outputLabel}>Rasio:</Text>
            <Text style={styles.outputValue}>{rasio || "–"}</Text>
          </View>
          <View style={styles.outputRow}>
            <Text style={styles.outputLabel}>Min. (2D):</Text>
            <Text style={styles.outputValue}>
              {min2D !== null
                ? min2D.toLocaleString("id-ID", {
                    maximumFractionDigits: 2,
                    useGrouping: false,
                  })
                : "–"}{" "}
              m
            </Text>
          </View>
          <View style={styles.outputRow}>
            <Text style={styles.outputLabel}>Min. (8D):</Text>
            <Text style={styles.outputValue}>
              {min8D !== null
                ? min8D.toLocaleString("id-ID", {
                    maximumFractionDigits: 2,
                    useGrouping: false,
                  })
                : "–"}{" "}
              m
            </Text>
          </View>

          {/* Lokasi Sampling */}
          <View style={styles.outputRow}>
            <Text style={styles.outputLabel}>Lokasi Sampling:</Text>
            <Text
              style={[
                styles.outputValue,
                {
                  color: lokasiSampling === "IDEAL" ? "green" : "red",
                },
              ]}
            >
              {lokasiSampling || "–"}
            </Text>
          </View>

          <View style={styles.outputRow}>
            <Text style={styles.outputLabel}>Total Titik Lintas: </Text>
            <Text style={styles.outputValue}>
              {totalPoints !== 0 ? totalPoints : "–"}
            </Text>
          </View>

          {/* Output Titik Lintas */}
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>Output Titik Lintas</Text>

            {/* ... (Tabel titik lintas menggunakan totalPoints) ... */}
            <View style={styles.tableHeaderRow}>
              <View style={styles.tableHeaderCol}>
                <Text style={styles.tableHeaderText}>TL</Text>
                {pointsTableData &&
                  pointsTableData.map(
                    (
                      item,
                      i // <-- MAPPING DATA BARU
                    ) => (
                      <View key={`tl-${i}`} style={styles.tableRowBox}>
                        <Text style={styles.tableCellText}>{item.tl}</Text>
                      </View>
                    )
                  )}
              </View>
              <View style={styles.tableHeaderCol}>
                <Text style={styles.tableHeaderText}>%</Text>
                {pointsTableData &&
                  pointsTableData.map(
                    (
                      item,
                      i // <-- MAPPING DATA BARU
                    ) => (
                      <View key={`percent-${i}`} style={styles.tableRowBox}>
                        <Text style={styles.tableCellText}>
                          {item.percent.toLocaleString("id-ID", {
                            maximumFractionDigits: 2,
                            useGrouping: false,
                          })}
                          %
                        </Text>
                      </View>
                    )
                  )}
              </View>
              <View style={styles.tableHeaderCol}>
                <Text style={styles.tableHeaderText}>cm</Text>
                {pointsTableData &&
                  pointsTableData.map(
                    (
                      item,
                      i // <-- MAPPING DATA BARU
                    ) => (
                      <View key={`cm-${i}`} style={styles.tableRowBox}>
                        <Text style={styles.tableCellText}>
                          {item.cm.toLocaleString("id-ID", {
                            maximumFractionDigits: 2,
                            useGrouping: false,
                          })}
                        </Text>
                      </View>
                    )
                  )}
              </View>
            </View>

            {/* Tampilkan pesan error/kosong */}
            {(!pointsTableData || pointsTableData.length === 0) &&
              tableErrorMessage && (
                <View style={styles.tableEmpty}>
                  <Text style={styles.tableEmptyText}>{tableErrorMessage}</Text>
                </View>
              )}
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
  container: {
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  field: { marginBottom: 12 },
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
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003366",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: "#003366",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F8FAFC",
    fontSize: 14,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 4,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    marginLeft: 10,
  },
  outputLabel: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "500",
  },
  outputValue: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "600",
  },
  outputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 8,
  },
  footer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
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
  tableContainer: {
    marginTop: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0369A1",
    marginBottom: 8,
    textAlign: "center",
  },
  tableHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tableHeaderCol: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: "#CBD5E1",
  },
  tableHeaderText: {
    fontWeight: "700",
    color: "#0369A1",
    fontSize: 14,
    backgroundColor: "#E0F2FE",
    width: "100%",
    textAlign: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#CBD5E1",
  },
  tableRowBox: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  tableCellText: {
    fontSize: 14,
    color: "#1E293B",
  },
  tableEmpty: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
  },
  tableEmptyText: {
    textAlign: "center",
    color: "#475569",
    fontStyle: "italic",
  },
});
