require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const westJavaLocations = [
    { name: "Kota Bandung", type: "Kota" },
    { name: "Kota Bogor", type: "Kota" },
    { name: "Kota Bekasi", type: "Kota" },
    { name: "Kota Depok", type: "Kota" },
    { name: "Kota Cimahi", type: "Kota" },
    { name: "Kota Tasikmalaya", type: "Kota" },
    { name: "Kota Banjar", type: "Kota" },
    { name: "Kota Sukabumi", type: "Kota" },
    { name: "Kota Cirebon", type: "Kota" },
    { name: "Kabupaten Bogor", type: "Kabupaten" },
    { name: "Kabupaten Sukabumi", type: "Kabupaten" },
    { name: "Kabupaten Cianjur", type: "Kabupaten" },
    { name: "Kabupaten Bandung", type: "Kabupaten" },
    { name: "Kabupaten Bandung Barat", type: "Kabupaten" },
    { name: "Kabupaten Garut", type: "Kabupaten" },
    { name: "Kabupaten Tasikmalaya", type: "Kabupaten" },
    { name: "Kabupaten Ciamis", type: "Kabupaten" },
    { name: "Kabupaten Kuningan", type: "Kabupaten" },
    { name: "Kabupaten Cirebon", type: "Kabupaten" },
    { name: "Kabupaten Majalengka", type: "Kabupaten" },
    { name: "Kabupaten Sumedang", type: "Kabupaten" },
    { name: "Kabupaten Indramayu", type: "Kabupaten" },
    { name: "Kabupaten Subang", type: "Kabupaten" },
    { name: "Kabupaten Purwakarta", type: "Kabupaten" },
    { name: "Kabupaten Karawang", type: "Kabupaten" },
    { name: "Kabupaten Bekasi", type: "Kabupaten" },
    { name: "Kabupaten Pangandaran", type: "Kabupaten" }
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rawData = {
  "records": [
    {
      "no": 1,
      "nama_desa_wisata": "Desa Wisata Kampung Tajur",
      "alamat": {
        "desa_kelurahan": "Desa Pasanggrahan",
        "kecamatan": "Kecamatan Bojong",
        "kabupaten_kota": "Kabupaten Purwakarta"
      },
      "status_desa_wisata": "Berkembang",
      "potensi": {
        "alam_list": ["Area Pesawahan dan Perkebunan", "Sungai Ciherang", "Air Terjun Panembahan", "Pemandangan Gunung Burangrang", "Bumi Perkemahan Pasir Batu"],
        "budaya_list": ["Tutungkulan", "Pencak Silat", "Upacara Adat dan Angklung"],
        "buatan_list": ["Wisata Ziarah", "Wisata Kuliner"]
      }
    },
    {
      "no": 2,
      "nama_desa_wisata": "Desa Wisata Cibukamanah",
      "alamat": {
        "desa_kelurahan": "Desa Cibukamanah",
        "kecamatan": "Kecamatan Cibatu",
        "kabupaten_kota": "Kabupaten Purwakarta"
      },
      "status_desa_wisata": "Rintisan",
      "potensi": {
        "alam_list": ["Curug Kalapa"],
        "budaya_list": [],
        "buatan_list": []
      }
    },
    {
      "no": 3,
      "nama_desa_wisata": "Desa Wisata Batu Nunggal Margaluyu",
      "alamat": {
        "desa_kelurahan": "Desa Margaluyu",
        "kecamatan": "Kecamatan Kiarapedes",
        "kabupaten_kota": "Kabupaten Purwakarta"
      },
      "status_desa_wisata": "Rintisan",
      "potensi": {
        "alam_list": ["Bukit Katumbiri", "Telaga PUSIBA"],
        "budaya_list": [],
        "buatan_list": []
      }
    },
    {
      "no": 4,
      "nama_desa_wisata": "Desa Wisata Parakan Garokgek",
      "alamat": {
        "desa_kelurahan": "Desa Parakan Garokgek",
        "kecamatan": "Kecamatan Kiarapedes",
        "kabupaten_kota": "Kabupaten Purwakarta"
      },
      "status_desa_wisata": "Rintisan",
      "potensi": {
        "alam_list": ["Sungai Cidomas"],
        "budaya_list": [],
        "buatan_list": []
      }
    },
    {
        "no": 5,
        "nama_desa_wisata": "Desa Wisata Legok Barong",
        "alamat": {
          "desa_kelurahan": "Desa Pusakamulya",
          "kecamatan": "Kecamatan Kiarapedes",
          "kabupaten_kota": "Kabupaten Purwakarta"
        },
        "status_desa_wisata": "Rintisan",
        "potensi": {
          "alam_list": ["Goa Jepang"],
          "budaya_list": [],
          "buatan_list": ["Sasak", "Panyawangan"]
        }
    },
    {
        "no": 6,
        "nama_desa_wisata": "Desa Wisata Sasanakerta",
        "alamat": {
          "desa_kelurahan": "Desa Ciracas",
          "kecamatan": "Kecamatan Kiarapedes",
          "kabupaten_kota": "Kabupaten Purwakarta"
        },
        "status_desa_wisata": "Rintisan",
        "potensi": {
          "alam_list": ["Sumber mata air panas", "Wisata pesawahan"],
          "budaya_list": [],
          "buatan_list": []
        }
    },
    {
        "no": 7,
        "nama_desa_wisata": "Desa Wisata Sumbersari",
        "alamat": {
          "desa_kelurahan": "Desa Sumbersari",
          "kecamatan": "Kecamatan Kiarapedes",
          "kabupaten_kota": "Kabupaten Purwakarta"
        },
        "status_desa_wisata": "Rintisan",
        "potensi": {
          "alam_list": ["Wisata Hutan", "Bukit Pinus"],
          "budaya_list": [],
          "buatan_list": []
        }
    },
    {
        "no": 8,
        "nama_desa_wisata": "Desa Wisata Mekar Wangi",
        "alamat": {
          "desa_kelurahan": "Desa Mekar Jaya",
          "kecamatan": "Kecamatan Kiarapedes",
          "kabupaten_kota": "Kabupaten Purwakarta"
        },
        "status_desa_wisata": "Rintisan",
        "potensi": {
          "alam_list": [],
          "budaya_list": ["Ritual budaya hajat mulud", "Tradisi Leuit"],
          "buatan_list": []
        }
    },
    {
        "no": 9,
        "nama_desa_wisata": "Desa Wisata Sukamulya",
        "alamat": {
          "desa_kelurahan": "Desa Sukamulya",
          "kecamatan": "Kecamatan Tegalwaru",
          "kabupaten_kota": "Kabupaten Purwakarta"
        },
        "status_desa_wisata": "Rintisan",
        "potensi": {
          "alam_list": ["Gunung Parang", "Camping ground", "Sasak panyawangan", "Gunung Bangkok"],
          "budaya_list": [],
          "buatan_list": ["Skylodge"]
        }
    },
    {
        "no": 10,
        "nama_desa_wisata": "Desa Wisata Kampung Bojong Honje",
        "alamat": {
          "desa_kelurahan": "Desa Cibuntu",
          "kecamatan": "Kecamatan Wanayasa",
          "kabupaten_kota": "Kabupaten Purwakarta"
        },
        "status_desa_wisata": "Rintisan",
        "potensi": {
          "alam_list": ["Wisata Curug", "Keramat"],
          "budaya_list": ["Tutunggulan", "Kosidah", "Tari Jaipong", "Pencak Silat", "Bajak Sawah"],
          "buatan_list": []
        }
    },
    {
      "no": 11,
      "nama_desa_wisata": "Desa Wisata Kampung Adat Cirendeu",
      "alamat": {
        "desa_kelurahan": "Kelurahan Leuwigajah",
        "kecamatan": "Kecamatan Cimahi Selatan",
        "kabupaten_kota": "Kota Cimahi"
      },
      "status_desa_wisata": "Berkembang",
      "potensi": {
        "alam_list": ["Wisata Puncak Salam", "Wisata Hutan Larangan", "Wisata Kebun Singkong"],
        "budaya_list": ["Angklung Buncis", "Seren Taun Ngemban Taun", "Melasti", "Peringatan Longsor TPA Leuwigajah"],
        "buatan_list": ["Wisata Edukasi", "Permainan Tradisonal", "Outbound"]
      }
    },
    {
        "no": 12,
        "nama_desa_wisata": "Kampung Wisata Ciseupan",
        "alamat": {
          "desa_kelurahan": "Kelurahan Cibeber",
          "kecamatan": "Kecamatan Cimahi Selatan",
          "kabupaten_kota": "Kota Cimahi"
        },
        "status_desa_wisata": "Rintisan",
        "potensi": {
          "alam_list": ["Wisata Danau", "Wisata Bukit (Tracking)", "Wisata Mancing"],
          "budaya_list": ["Seni Pencak Silat"],
          "buatan_list": ["Outbound"]
        }
    },
    {
        "no": 13,
        "nama_desa_wisata": "Kampung Wisata Legokawi - Torobosan",
        "alamat": {
          "desa_kelurahan": "Kelurahan Cipageran",
          "kecamatan": "Kecamatan Cimahi Utara",
          "kabupaten_kota": "Kota Cimahi"
        },
        "status_desa_wisata": "Rintisan",
        "potensi": {
          "alam_list": ["Wisata Tracking"],
          "budaya_list": ["Tarian", "Reog", "Teater"],
          "buatan_list": ["Permainan Tradisional"]
        }
    },
    {
        "no": 14,
        "nama_desa_wisata": "Kampung Wisata Hanjuang (Kampung gambar)",
        "alamat": {
          "desa_kelurahan": "Kelurahan Cibabat",
          "kecamatan": "Kecamatan Cimahi Utara",
          "kabupaten_kota": "Kota Cimahi"
        },
        "status_desa_wisata": "Rintisan",
        "potensi": {
          "alam_list": [],
          "budaya_list": [],
          "buatan_list": ["Outbound"]
        }
    }
  ]
};

async function run() {
  try {
    const aggregatedData = {};

    rawData.records.forEach(record => {
      let kabupatenKota = record.alamat.kabupaten_kota.trim();
      
      const validLocation = westJavaLocations.find(loc => {
        const standardName = loc.name.toLowerCase();
        const inputName = kabupatenKota.toLowerCase();
        return standardName.includes(inputName) || inputName.includes(standardName);
      });

      if (!validLocation) {
        console.warn(`Could not find a match for: ${kabupatenKota}`);
        return;
      }

      const cityName = validLocation.name;
      if (!aggregatedData[cityName]) {
        aggregatedData[cityName] = [];
      }

      aggregatedData[cityName].push({
        nama: record.nama_desa_wisata.trim(),
        desa_kelurahan: record.alamat.desa_kelurahan.trim(),
        kecamatan: record.alamat.kecamatan.trim(),
        status: record.status_desa_wisata,
        potensi: record.potensi
      });
    });

    for (const [cityName, villages] of Object.entries(aggregatedData)) {
      console.log(`Upserting ${villages.length} villages for ${cityName} into desa_wisata_data...`);
      
      const { data: existing } = await supabase
        .from('data_map')
        .select('id')
        .eq('city_name', cityName)
        .single();

      if (existing) {
        const { error: updateErr } = await supabase
          .from('data_map')
          .update({ desa_wisata_data: villages })
          .eq('id', existing.id);
        
        if (updateErr) {
            console.error("Update error (retrying with content column):", updateErr.message);
            // Fallback to content column if desa_wisata_data still not in cache
            const { data: current } = await supabase.from('data_map').select('content').eq('id', existing.id).single();
            const newContent = { ...(current?.content || {}), desa_wisata: villages };
            await supabase.from('data_map').update({ content: newContent }).eq('id', existing.id);
        }
      } else {
        const cityType = cityName.toLowerCase().startsWith('kota') ? 'Kota' : 'Kabupaten';
        const { error: insertErr } = await supabase
          .from('data_map')
          .insert({
            city_name: cityName,
            city_type: cityType,
            active: true,
            desa_wisata_data: villages
          });
        
        if (insertErr) {
            console.error("Insert error:", insertErr.message);
        }
      }
    }

    console.log("Seeding complete.");
  } catch (error) {
    console.error("Script failed:", error);
  }
}

run();
