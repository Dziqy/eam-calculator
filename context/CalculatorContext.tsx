// context/CalculatorContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

// Kunci untuk AsyncStorage
const BOOKMARKS_KEY = '@chimney_bookmarks';

// Interface untuk data Bookmark (melacak data dan waktu simpan)
export interface Bookmark {
    id: string; // Timestamp atau ID unik
    name: string; // Nama cerobong saat disimpan
    data: CalculatorData; // Seluruh data sesi
    date: number; // Timestamp simpan
}

// 1. Definisikan Tipe Data Input/Output (sesuaikan dengan semua Method)
export interface CalculatorData {
    // Method 1 Input
    flange: string;
    height: string;
    flangeSize: string;

    // Method 1, 2 Input
    shape: string;
    diameter: string;
    length: string;
    width: string;
    upstreamB: string;
    downstreamA: string;

    // Method 2, 5 Input
    stackTemp: string;
    pitotCoeff: string;
    pitotDP: string;
    staticPressure: string;

    // Method 2, 4, 5 Input
    barometricPressure: string;

    // Method 2, 3, 5 Input
    kadarCO2: string;
    kadarO2: string;
    kadarCO: string;
    moisture: string;

    // Method 4,5
    vmInitial: string;
    vmFinal: string;
    faktorKalibrasiMeterY: string;
    deltaHActual: string;
    samplingTime: string;

    // Method 4 Input
    meterTemp: string;
    faktorKalibrasiMeter: string;
    beratAwalAir: string;
    beratAkhirAir: string;
    jumlahImpinger: string;
    beratAwalAirArray: string[];
    beratAkhirAirArray: string[];

    // Method 5 Input
    dgmDeltaH: string;
    dgmTempTM: string;
    estPitotDeltaP: string;
    samplingRate: string;
    actualNozzleDia: string;
    
    // Tambahkan field untuk URI Gambar
    fotoCerobong: string;
    stackName: string;
    location: string;
    profileName: string;

    stackLocationAddress: string;
    stackLocationLatitude: number | null;
    stackLocationLongitude: number | null;

    // Output Data (dapat ditambahkan belakangan)
    // molBasisKering: number | null;
    // ...
    tekananAbsolut: number | null;
    kecepatanGas: number | null;
    molBasisKering: number | null;
    molBasisBasah: number | null;
    volumeGasKering: number | null;
}

interface CalculatorContextType {
    data: CalculatorData;
    setData: React.Dispatch<React.SetStateAction<CalculatorData>>;
    // Fungsi untuk memperbarui field tertentu
    updateField: (field: keyof CalculatorData, value: string | number | null | string[] | number[]) => void;

    resetData: () => void;

    bookmarks: Bookmark[]; // <-- State baru untuk daftar bookmark
    loadBookmarks: () => Promise<void>;
    saveBookmark: (name: string) => Promise<Bookmark | undefined>;
    deleteBookmark: (id: string) => Promise<void>;
    loadSessionFromBookmark: (bookmarkData: CalculatorData) => void; // Fungsi memuat sesi
}

// Nilai default untuk Context
const initialData: CalculatorData = {
    flange: "", height: "", flangeSize: "", shape: "", diameter:"", length: "", width: "", upstreamB: "", downstreamA: "", kadarCO2: "", kadarO2: "", kadarCO: "", moisture: "", barometricPressure: "",
    vmInitial: "", vmFinal: "", meterTemp: "", faktorKalibrasiMeter: "", 
    beratAwalAir: "", beratAkhirAir: "",  jumlahImpinger: "", beratAwalAirArray: [], beratAkhirAirArray: [], stackTemp: "", staticPressure: "", 
    pitotCoeff: "", pitotDP: "", dgmDeltaH: "", dgmTempTM: "", 
    estPitotDeltaP: "", samplingRate: "", actualNozzleDia: "", deltaHActual: "", samplingTime: "", faktorKalibrasiMeterY: "",
    fotoCerobong: "", stackName: "", location: "", profileName: "",
    stackLocationAddress: "", stackLocationLatitude: null, stackLocationLongitude: null, 
    tekananAbsolut: null, kecepatanGas: null, molBasisKering: null, molBasisBasah: null, volumeGasKering: null
};



export const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<CalculatorData>(initialData);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]); // <-- State baru

    // Implementasi resetData
    const resetData = () => {
        setData(initialData);
        // console.log("Data Calculator direset ke nilai awal.");
    };

    // Fungsi utilitas untuk memperbarui field tunggal
    const updateField = (field: keyof CalculatorData, value: string | number | null | string[] | number[]) => {
        setData(prevData => ({
            ...prevData,
            [field]: value,
        }));
    };

    // [FUNGSI 1] Memuat Bookmark dari AsyncStorage
    const loadBookmarks = async () => {
        try {
            const storedBookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
            if (storedBookmarks) {
                setBookmarks(JSON.parse(storedBookmarks));
            }
        } catch (e) {
            console.error("Gagal memuat bookmarks:", e);
        }
    };
    
    // [FUNGSI 2] Menyimpan Sesi Saat Ini sebagai Bookmark
    const saveBookmark = async (name: string) => {
        try {
            const newBookmark: Bookmark = {
                id: Date.now().toString(),
                name: name, // Menggunakan nama yang diberikan
                data: { ...data }, // Salin data sesi saat ini
                date: Date.now(),
            };

            const updatedBookmarks = [newBookmark, ...bookmarks];
            setBookmarks(updatedBookmarks);
            await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
            return newBookmark;
        } catch (e) {
            console.error("Gagal menyimpan bookmark:", e);
        }
    };

    // [FUNGSI 3] Menghapus Bookmark
    const deleteBookmark = async (id: string) => {
        try {
            const updatedBookmarks = bookmarks.filter(b => b.id !== id);
            setBookmarks(updatedBookmarks);
            await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
        } catch (e) {
            console.error("Gagal menghapus bookmark:", e);
        }
    };

    // [FUNGSI 4] Memuat Data Bookmark ke Sesi Saat Ini
    const loadSessionFromBookmark = (bookmarkData: CalculatorData) => {
        setData(bookmarkData);
    };

    // ... (useEffect untuk memuat bookmarks saat mount)
    useEffect(() => {
        loadBookmarks();
    }, []);

    const contextValue = useMemo(() => ({
        data,
        setData,
        updateField,
        resetData, // <-- Sertakan di contextValue
        bookmarks,
        loadBookmarks,
        saveBookmark,
        deleteBookmark,
        loadSessionFromBookmark,
    }), [data, bookmarks]);

    return (
        <CalculatorContext.Provider value={contextValue}>
            {children}
        </CalculatorContext.Provider>
    );
};

export const useCalculator = () => {
    const context = useContext(CalculatorContext);
    if (!context) {
        throw new Error('useCalculator must be used within a CalculatorProvider');
    }
    return context;
};