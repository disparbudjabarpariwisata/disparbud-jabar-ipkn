export interface WestJavaLocation {
  id: number;
  name: string;
  type: 'Kota' | 'Kabupaten';
  coordinates: [number, number]; // [latitude, longitude]
  population?: string;
  area?: string;
  description?: string;
}

export const westJavaLocations: WestJavaLocation[] = [
  // Kota (9)
  { id: 1, name: 'Kota Bandung', type: 'Kota', coordinates: [-6.9175, 107.6191], population: '2.4 juta', area: '167.67 km²', description: 'Ibu kota Provinsi Jawa Barat' },
  { id: 2, name: 'Kota Bekasi', type: 'Kota', coordinates: [-6.2383, 106.9756], population: '2.5 juta', area: '210.49 km²', description: 'Kota penyangga Jakarta' },
  { id: 3, name: 'Kota Bogor', type: 'Kota', coordinates: [-6.5950, 106.8169], population: '1.1 juta', area: '118.50 km²', description: 'Kota hujan dengan Kebun Raya Bogor' },
  { id: 4, name: 'Kota Depok', type: 'Kota', coordinates: [-6.4025, 106.7942], population: '2.3 juta', area: '200.29 km²', description: 'Kota penyangga dengan banyak universitas' },
  { id: 5, name: 'Kota Cirebon', type: 'Kota', coordinates: [-6.7063, 108.5571], population: '320 ribu', area: '37.36 km²', description: 'Kota pelabuhan dengan budaya kaya' },
  { id: 6, name: 'Kota Sukabumi', type: 'Kota', coordinates: [-6.9278, 106.9272], population: '320 ribu', area: '48.25 km²', description: 'Kota dengan pemandangan pegunungan' },
  { id: 7, name: 'Kota Tasikmalaya', type: 'Kota', coordinates: [-7.3274, 108.2207], population: '680 ribu', area: '183.21 km²', description: 'Kota industri kerajinan' },
  { id: 8, name: 'Kota Cimahi', type: 'Kota', coordinates: [-6.8722, 107.5425], population: '570 ribu', area: '40.25 km²', description: 'Kota dengan fasilitas militer' },
  { id: 9, name: 'Kota Banjar', type: 'Kota', coordinates: [-7.3709, 108.5389], population: '180 ribu', area: '131.97 km²', description: 'Kota termuda di Jawa Barat' },
  // Kabupaten (18)
  { id: 10, name: 'Kabupaten Bandung', type: 'Kabupaten', coordinates: [-7.0051, 107.5662], population: '3.6 juta', area: '1,767.96 km²', description: 'Kabupaten terluas di sekitar Kota Bandung' },
  { id: 11, name: 'Kabupaten Bandung Barat', type: 'Kabupaten', coordinates: [-6.8558, 107.4841], population: '1.8 juta', area: '1,305.77 km²', description: 'Destinasi wisata alam' },
  { id: 12, name: 'Kabupaten Bekasi', type: 'Kabupaten', coordinates: [-6.2349, 107.1389], population: '3.2 juta', area: '1,224.88 km²', description: 'Kawasan industri dan pertanian' },
  { id: 13, name: 'Kabupaten Bogor', type: 'Kabupaten', coordinates: [-6.4414, 106.8446], population: '5.7 juta', area: '2,710.49 km²', description: 'Kabupaten terpadat di Jawa Barat' },
  { id: 14, name: 'Kabupaten Ciamis', type: 'Kabupaten', coordinates: [-7.3256, 108.3534], population: '1.5 juta', area: '1,414.78 km²', description: 'Kabupaten dengan budaya Sunda kental' },
  { id: 15, name: 'Kabupaten Cianjur', type: 'Kabupaten', coordinates: [-6.8167, 107.1333], population: '2.3 juta', area: '3,614.03 km²', description: 'Terkenal dengan beras berkualitas' },
  { id: 16, name: 'Kabupaten Cirebon', type: 'Kabupaten', coordinates: [-6.7461, 108.4914], population: '2.2 juta', area: '990.36 km²', description: 'Wilayah pertanian dan perikanan' },
  { id: 17, name: 'Kabupaten Garut', type: 'Kabupaten', coordinates: [-7.2211, 107.8992], population: '2.6 juta', area: '3,074.07 km²', description: 'Kota dodol dengan pemandian air panas' },
  { id: 18, name: 'Kabupaten Indramayu', type: 'Kabupaten', coordinates: [-6.3264, 108.3200], population: '1.8 juta', area: '2,099.42 km²', description: 'Lumbung padi nasional' },
  { id: 19, name: 'Kabupaten Karawang', type: 'Kabupaten', coordinates: [-6.3214, 107.3061], population: '2.4 juta', area: '1,753.27 km²', description: 'Kawasan industri otomotif terbesar' },
  { id: 20, name: 'Kabupaten Kuningan', type: 'Kabupaten', coordinates: [-6.9758, 108.4839], population: '1.1 juta', area: '1,194.09 km²', description: 'Kekayaan alam dan ekowisata' },
  { id: 21, name: 'Kabupaten Majalengka', type: 'Kabupaten', coordinates: [-6.8361, 108.2278], population: '1.2 juta', area: '1,204.24 km²', description: 'Penghasil mangga gedong gincu' },
  { id: 22, name: 'Kabupaten Pangandaran', type: 'Kabupaten', coordinates: [-7.6850, 108.6500], population: '420 ribu', area: '1,010.00 km²', description: 'Destinasi wisata pantai terkenal' },
  { id: 23, name: 'Kabupaten Purwakarta', type: 'Kabupaten', coordinates: [-6.5572, 107.4431], population: '930 ribu', area: '971.72 km²', description: 'Waduk Jatiluhur' },
  { id: 24, name: 'Kabupaten Subang', type: 'Kabupaten', coordinates: [-6.5694, 107.7639], population: '1.5 juta', area: '2,051.76 km²', description: 'Daerah pertanian dan perikanan' },
  { id: 25, name: 'Kabupaten Sukabumi', type: 'Kabupaten', coordinates: [-6.9278, 106.7572], population: '2.5 juta', area: '4,145.70 km²', description: 'Kabupaten terluas di Jawa Barat' },
  { id: 26, name: 'Kabupaten Sumedang', type: 'Kabupaten', coordinates: [-6.8388, 107.9214], population: '1.2 juta', area: '1,558.72 km²', description: 'Terkenal dengan tahu Sumedang' },
  { id: 27, name: 'Kabupaten Tasikmalaya', type: 'Kabupaten', coordinates: [-7.4661, 108.1947], population: '1.8 juta', area: '2,708.82 km²', description: 'Pusat kerajinan dan industri kreatif' },
];

export const westJavaCenter: [number, number] = [-6.9147, 107.6098];
