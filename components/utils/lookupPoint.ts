// ====================================================================
// --- 1. DEFINISI TIPE DATA (Untuk TypeScript) ---
// ====================================================================
// Tipe untuk struktur data lookup Anda
type PointLookup = {
    pointD12In: { [key: string]: number };
    pointD24in: { [key: string]: number };
}

// ====================================================================
// --- 2. DATA LOOKUP STATIS ---
// ====================================================================
export const downstreamPoint: PointLookup = {
    // Kolom C (D12In) - Digunakan ketika Diameter <= 0.61
    pointD12In: { 
      '5': 24, 
      '6': 20, 
      '7': 16, 
      '8': 8, 
      '10': 8 
    }, 
    // Kolom D (D24In) - Digunakan ketika Diameter > 0.61
    pointD24in: { 
      '5': 24, 
      '6': 20, 
      '7': 16, 
      '8': 12, 
      '10': 12 
    }
};
// Asumsi upstreamPoint memiliki data yang sama
export const upstreamPoint: PointLookup = downstreamPoint; 

// ====================================================================
// --- 3. FUNGSI LOGIKA PERHITUNGAN ---
// ====================================================================

/**
 * Menentukan kunci lookup ('5', '6', '7', '8', atau '10') berdasarkan nilai E59.
 * Mereplikasi IF(E59<=5;5; IF(E59<=6;6; ...))
 */
const getLookupKeyD = (nilaiDownstreamPoint: number): string => { 
    if (nilaiDownstreamPoint <= 5) return '5';
    if (nilaiDownstreamPoint <= 6) return '6';
    if (nilaiDownstreamPoint <= 7) return '7';
    if (nilaiDownstreamPoint <= 8) return '8';
    if (nilaiDownstreamPoint > 8) return '10';
    
    return '5'; // Default
};
const getLookupKeyU = (nilaiUpstreamPoint: number): string => { 
    if (nilaiUpstreamPoint <= 1.25) return '5';
    if (nilaiUpstreamPoint <= 1.5) return '6';
    if (nilaiUpstreamPoint <= 1.75) return '7';
    if (nilaiUpstreamPoint <= 2.25) return '8';
    if (nilaiUpstreamPoint > 2.5) return '10';
    
    return '5'; // Default
};

/**
 * Menerjemahkan rumus IF bersarang Excel (Diameter/C46 vs E59) ke JavaScript.
 * IF(Diameter > 0,61; [LOOKUP D]; [LOOKUP C])
 * @param {number} nilaiDiameter - Nilai Diameter (berfungsi sebagai C46).
 * @param {number} nilaiDownstreamPoint - Nilai E59 yang sudah dihitung.
 * @param {PointLookup} lookupTable - Objek data (downstreamPoint/upstreamPoint).
 * @returns {number | null} Hasil lookup Titik Lintas atau null jika error.
 */
export const hitungNilaiLookupD = (
    nilaiDiameter: number, 
    nilaiDownstreamPoint: number, 
    downstreamPointTable: PointLookup
): number | null => {
    
    // Keluar jika E59 tidak valid/nol
    if (nilaiDownstreamPoint <= 0) {
        return null;
    }

    // 1. Tentukan Kunci Baris (E59)
    const lookupKey = getLookupKeyD(nilaiDownstreamPoint); 
    
    // 2. Tentukan Kolom Pilihan (Diameter > 0.61)
    let kolomPilihanD: { [key: string]: number };
    
    if (nilaiDiameter > 0.61) {
        // TRUE: Kolom D (pointD24in)
        kolomPilihanD = downstreamPointTable.pointD24in; 
    } else {
        // FALSE: Kolom C (pointD12In)
        kolomPilihanD = downstreamPointTable.pointD12In; 
    }
    
    // 3. Ambil Nilai Akhir
    const hasilAkhirD = kolomPilihanD[lookupKey];
    
    return hasilAkhirD !== undefined ? hasilAkhirD : null;
};

export const hitungNilaiLookupU = (
    nilaiDiameter: number, 
    nilaiUpstreamPoint: number, 
    downstreamPointTable: PointLookup
): number | null => {
    
    // Keluar jika E59 tidak valid/nol
    if (nilaiUpstreamPoint <= 0) {
        return null;
    }

    // 1. Tentukan Kunci Baris (E59)
    const lookupKey = getLookupKeyU(nilaiUpstreamPoint); 
    
    // 2. Tentukan Kolom Pilihan (Diameter > 0.61)
    let kompilasiPilihanU: { [key: string]: number };
    
    if (nilaiDiameter > 0.61) {
        // TRUE: Kolom D (pointD24in)
        kompilasiPilihanU = downstreamPointTable.pointD24in; 
    } else {
        // FALSE: Kolom C (pointD12In)
        kompilasiPilihanU = downstreamPointTable.pointD12In; 
    }
    
    // 3. Ambil Nilai Akhir
    const hasilAkhirD = kompilasiPilihanU[lookupKey];
    
    return hasilAkhirD !== undefined ? hasilAkhirD : null;
};