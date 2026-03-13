const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env from .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

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
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const jsonPath = '/Users/kabayangroup/Downloads/desa_wisata_jawa_barat_2023.json';
    if (!fs.existsSync(jsonPath)) {
        console.error("JSON file not found at:", jsonPath);
        process.exit(1);
    }
    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    const rawJSON = JSON.parse(fileContent);
    const records = rawJSON.records;

    console.log(`Found ${records.length} records in JSON file.`);

    const aggregatedData = {};

    records.forEach(record => {
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
        potensi: {
            alam_list: record.potensi.alam_list || [],
            budaya_list: record.potensi.budaya_list || [],
            buatan_list: record.potensi.buatan_list || []
        }
      });
    });

    for (const [cityName, villages] of Object.entries(aggregatedData)) {
      console.log(`Upserting ${villages.length} villages for ${cityName}...`);
      
      const { data: existing } = await supabase
        .from('data_map')
        .select('id, content')
        .eq('city_name', cityName)
        .single();

      if (existing) {
        const { error: updateErr } = await supabase
          .from('data_map')
          .update({ 
              desa_wisata_data: villages,
              content: { ...(existing.content || {}), desa_wisata: villages }
          })
          .eq('id', existing.id);
        if (updateErr) console.error(`Error updating ${cityName}:`, updateErr.message);
      } else {
        const cityType = cityName.toLowerCase().startsWith('kota') ? 'Kota' : 'Kabupaten';
        const { error: insertErr } = await supabase
          .from('data_map')
          .insert({
            city_name: cityName,
            city_type: cityType,
            active: true,
            desa_wisata_data: villages,
            content: { desa_wisata: villages }
          });
        if (insertErr) console.error(`Error inserting ${cityName}:`, insertErr.message);
      }
    }

    console.log("Full seeding complete.");
  } catch (error) {
    console.error("Script failed:", error);
  }
}

run();
