// app/menu/edit-name.tsx
import { useCalculator } from '@/context/CalculatorContext';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function EditNameScreen() {
    const router = useRouter(); // Atau gunakan useRouter jika Anda mau
  const navigation = useNavigation();
  // Ganti dengan state dari Context Global Anda
  // const [name, setName] = useState("Cerobong Pabrik A"); 
  const { data, updateField } = useCalculator(); // Ambil data dan updater
  const currentStackName = data.stackName; // Nilai saat ini dari Context

  // Menyesuaikan judul header secara dinamis
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Nama Cerobong' });
  }, [navigation]);

  // Fungsi yang dipanggil saat ada perubahan pada TextInput
  const handleChangeText = (text: string) => {
      // Panggil updateField untuk menyimpan nilai ke Context Global
      // 'stackName' adalah kunci field di CalculatorData
      updateField('stackName', text); 
  };

  const handleSave = () => {
    // Jika Anda ingin tombol Simpan mengarahkan kembali
    // (Opsi: Expo Router/React Navigation akan otomatis menyimpan saat user kembali)
    router.back(); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nama Cerobong</Text>
      <TextInput
        style={styles.input}
        // Gunakan nilai dari Context
        value={currentStackName} 
        // Ganti handler lokal dengan handler Context
        onChangeText={handleChangeText} 
        placeholder="Masukkan nama cerobong.."
        placeholderTextColor="#655f5fff"
      />
      
      {/* Tombol Simpan (Opsional, untuk demonstrasi) */}
      <View style={styles.saveButtonContainer}>
        <Button title="Simpan" onPress={handleSave} color="#9ec83e" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    fontSize: 16,
  },
  saveButtonContainer: {
    marginTop: 30,
  }
});