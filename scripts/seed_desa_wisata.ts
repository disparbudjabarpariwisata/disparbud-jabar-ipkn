import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { westJavaLocations } from '../lib/westJavaLocations';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rawData = {
  "records": [
    {
      "no": 1,
      "nama_desa_wisata": "Desa Wisata\nKampung Tajur",
      "alamat": {
        "desa_kelurahan": "Desa\nPasanggrahan",
        "kecamatan": "Kecamatan\nBojong",
        "kabupaten_kota": "Kabupaten\nPurwakarta"
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
      "nama_desa_wisata": "Desha Waist\nCibukamanah",
      "alamat": {
        "desa_kelurahan": "Desa\nCibukamanah",
        "kecamatan": "Kecamatan Cibatu",
        "kabupaten_kota": "Kabupaten\nPurwakarta"
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
      "nama_desa_wisata": "Desa Wisata Batu\nNunggal\nMargaluyu",
      "alamat": {
        "desa_kelurahan": "Desa Margaluyu",
        "kecamatan": "Kecamatan\nKiarapedes",
        "kabupaten_kota": "Kabupaten\nPurwakarta"
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
      "nama_desa_wisata": "Desa Wisata\nParakan Garokgek",
      "alamat": {
        "desa_kelurahan": "Desa Parakan\nGarokgek",
        "kecamatan": "Kecamatan\nKiarapedes",
        "kabupaten_kota": "Kabupaten\nPurwakarta"
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
        "nama_desa_wisata": "Desa Wisata\nLegok Barong",
        "alamat": {
          "desa_kelurahan": "Desa Pusakamulya",
          "kecamatan": "Kecamatan\nKiarapedes",
          "kabupaten_kota": "Kabupaten\nPurwakarta"
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
        "nama_desa_wisata": "Desa Wisata\nSasanakerta",
        "alamat": {
          "desa_kelurahan": "Desa Ciracas",
          "kecamatan": "Kecamatan\nKiarapedes",
          "kabupaten_kota": "Kabupaten\nPurwakarta"
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
        "nama_desa_wisata": "Desa Wisata\nSumbersari",
        "alamat": {
          "desa_kelurahan": "Desa Sumbersari",
          "kecamatan": "Kecamatan\nKiarapedes",
          "kabupaten_kota": "Kabupaten\nPurwakarta"
        },
        "status_desa_wisata": "Rintisan",
        "potensi": {
          "alam_list": [],
          "budaya_list": [],
          "buatan_list": []
        }
    },
    {
        "no": 8,
        "nama_desa_wisata": "Desa Wisata\nMekar Wangi",
        "alamat": {
          "desa_kelurahan": "Desa Mekar Jaya",
          "kecamatan": "Kecamatan\nKiarapedes",
          "kabupaten_kota": "Kabupaten\nPurwakarta"
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
        "nama_desa_wisata": "Desa Wisata\nSukamulya",
        "alamat": {
          "desa_kelurahan": "Desa Sukamulya",
          "kecamatan": "Kecamatan\nTegalwaru",
          "kabupaten_kota": "Kabupaten\nPurwakarta"
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
        "nama_desa_wisata": "Desa Wisata\nKampung Bojong\nHonje",
        "alamat": {
          "desa_kelurahan": "Desa Cibuntu",
          "kecamatan": "Kecamatan\nWanayasa",
          "kabupaten_kota": "Kabupaten\nPurwakarta"
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
      "nama_desa_wisata": "Desa Wisata\nKampung Adat\nCirendeu",
      "alamat": {
        "desa_kelurahan": "Kelurahan\nLeuwigajah",
        "kecamatan": "Kecamatan Cimahi\nSelatan",
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
        "nama_desa_wisata": "Kampung Wisata\nCiseupan",
        "alamat": {
          "desa_kelurahan": "Kelurahan Cibeber",
          "kecamatan": "Kecamatan Cimahi\nSelatan",
          "kabupaten_kota": "Kota Cimahi"
        },
        "status_desa_wisata": "Rintisan",
        "potensi": {
          "alam_list": ["Wisata Danau", "Wisata Bukit (Tracking)", "Wisata Mancing"],
          "budaya_list": ["Seni Pencak", "Silat"],
          "buatan_list": ["Outbound"]
        }
    },
    {
        "no": 13,
        "nama_desa_wisata": "Kampung Wisata\nLegokawi -\nTorobosan",
        "alamat": {
          "desa_kelurahan": "Kelurahan\nCipageran",
          "kecamatan": "Kecamatan Cimahi\nUtara",
          "kabupaten_kota": "Kota Cimahi"
        },
        "status_desa_wisata": "Rintisan",
        "potensi": {
          "alam_list": ["Wisata Tracking"],
          "budaya_list": ["Tarian", "Reog", "Teater"],
          "buatan_list": ["Permainan", "Tradisional"]
        }
    },
    {
        "no": 14,
        "nama_desa_wisata": "Kampung Wisata\nHanjuang\n(Kampung\ngambar)",
        "alamat": {
          "desa_kelurahan": "Kelurahan Cibabat",
          "kecamatan": "Kecamatan Cimahi\nUtara",
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
    const aggregatedData: Record<string, any> = {};

    rawData.records.forEach(record => {
      let kabupatenKota = record.alamat.kabupaten_kota.replace(/\n/g, ' ').trim();
      
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
        nama: record.nama_desa_wisata.replace(/\n/g, ' ').trim(),
        desa_kelurahan: record.alamat.desa_kelurahan.replace(/\n/g, ' ').trim(),
        kecamatan: record.alamat.kecamatan.replace(/\n/g, ' ').trim(),
        status: record.status_desa_wisata,
        potensi: record.potensi
      });
    });

    for (const [cityName, villages] of Object.entries(aggregatedData)) {
      console.log(`Upserting ${villages.length} villages for ${cityName}...`);
      
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
        if (updateErr) console.error("Update error:", updateErr);
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
        if (insertErr) console.error("Insert error:", insertErr);
      }
    }

    console.log("Seeding complete.");
  } catch (error) {
    console.error("Script failed:", error);
  }
}

run();
