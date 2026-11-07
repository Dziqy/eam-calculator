import React, { createContext, useContext, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName, useColorScheme } from 'react-native';

// --- DEFINISI TEMA ---

// Warna dasar yang akan digunakan aplikasi Anda
interface AppColors {
    primary: string;        // Warna utama (mis. tombol, ikon)
    background: string;     // Latar belakang utama (putih/abu-abu gelap)
    card: string;           // Latar belakang elemen (kartu, kotak input)
    text: string;           // Warna teks utama
    subtext: string;        // Warna teks sekunder/deskripsi
    header: string;         // Warna header navigasi
}

// Objek tema untuk Light Mode
const LightTheme: AppColors = {
    primary: '#003366',       // Biru Tua
    background: '#FFFFFF',    // Putih Cerah
    card: '#F3F4F6',          // Abu-abu Sangat Terang (untuk kartu)
    text: '#000000',          // Hitam
    subtext: '#64748B',       // Abu-abu Dingin
    header: '#003366',
};

// Objek tema untuk Dark Mode
const DarkTheme: AppColors = {
    primary: '#A8C9FF',       // Biru Muda (kontras dengan latar gelap)
    background: '#121212',    // Abu-abu Sangat Gelap (Hampir Hitam)
    card: '#1D1D1D',          // Abu-abu Gelap (untuk kartu)
    text: '#FFFFFF',          // Putih
    subtext: '#A0A0A0',       // Abu-abu Terang
    header: '#1D1D1D',
};

// --- DEFINISI CONTEXT ---

type ThemeMode = 'light' | 'dark' | 'system'; // Opsi tema: terang, gelap, atau ikuti sistem

interface ThemeContextProps {
    themeMode: ThemeMode;          // Mode tema yang dipilih pengguna ('light', 'dark', atau 'system')
    colors: AppColors;             // Objek warna yang sedang aktif
    setThemeMode: (mode: ThemeMode) => void; // Fungsi untuk mengubah mode tema
    isDarkMode: boolean;           // Status boolean: apakah tema saat ini gelap?
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 1. Dapatkan skema warna dari sistem (null, 'light', atau 'dark')
    const systemColorScheme = useColorScheme(); 

    // 2. Simpan mode yang dipilih pengguna (default: 'system')
    const [themeMode, setThemeMode] = useState<ThemeMode>('system');

    // 3. Tentukan tema efektif (terang/gelap)
    const effectiveColorScheme: ColorSchemeName = 
        themeMode === 'system' 
            ? systemColorScheme 
            : themeMode;

    // 4. Pilih objek warna yang sesuai
    const colors = effectiveColorScheme === 'dark' ? DarkTheme : LightTheme;
    const isDarkMode = effectiveColorScheme === 'dark';

    // 5. Gunakan useMemo untuk memastikan objek Context tidak berubah kecuali themeMode berubah
    const contextValue = useMemo(() => ({
        themeMode,
        colors,
        setThemeMode,
        isDarkMode,
    }), [themeMode, colors, isDarkMode]);
    
    // Opsional: Atur Status Bar sesuai tema
    // useEffect(() => {
    //     if (isDarkMode) {
    //         StatusBar.setBarStyle('light-content');
    //     } else {
    //         StatusBar.setBarStyle('dark-content');
    //     }
    // }, [isDarkMode]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// --- Fungsi utilitas untuk mendapatkan warna di luar komponen React (misalnya di _layout.tsx) ---
// Gunakan ini untuk mendapatkan tema awal saat aplikasi dimuat
export const getInitialThemeColors = (): AppColors => {
    const systemMode = Appearance.getColorScheme();
    return systemMode === 'dark' ? DarkTheme : LightTheme;
};

// Ekspor objek warna default untuk penggunaan awal
export { DarkTheme, LightTheme };
