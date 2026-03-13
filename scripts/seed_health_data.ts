import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { westJavaLocations } from '../lib/westJavaLocations';

// Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Ensure this is available

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Data structure expected by `data_map`:
// { location_id, content: JSONB }

async function run() {
  try {
    // 1. Fetch location IDs
    // Instead of querying a non-existent `west_java_locations` table, we use the static array
    // mapped to the `data_map` table's expected city_name format.

    const locationNameMap = new Map();
    // Use the `name` from westJavaLocations which matches what's stored in `data_map.city_name`
    westJavaLocations.forEach(loc => {
        // Create variations for matching
        const shortName = loc.name.replace(/(Kota|Kabupaten)\s+/i, '').trim().toLowerCase();
        locationNameMap.set(shortName, loc.name); // Store full name for querying `data_map` later
    });

    // 2. Load JSON files
    const jknDataRaw = JSON.parse(fs.readFileSync('/tmp/jkn.json', 'utf8'));
    const penyakitMenularRaw = JSON.parse(fs.readFileSync('/tmp/penyakit_menular.json', 'utf8'));
    const rasioTempatTidurRaw = JSON.parse(fs.readFileSync('/tmp/rasio_tempat_tidur.json', 'utf8'));
    const rasioDokterRaw = JSON.parse(fs.readFileSync('/tmp/rasio_dokter.json', 'utf8'));

    // The JKN data has a slightly different format (array of records inside 'data'), while others have a 'records' array.
    const jknRecords = jknDataRaw.data;
    const penyakitMenularRecords = penyakitMenularRaw.records;
    const rasioTempatTidurRecords = rasioTempatTidurRaw.records;
    const rasioDokterRecords = rasioDokterRaw.records;


    // 3. Process records by city and year. We'll aggregate them into a single structure
    const aggregatedData: Record<string, any> = {};

    function processRecords(records: any[], datasetName: string, mappingFn: (record: any) => any) {
        if (!records) return;
        records.forEach(record => {
            const shortName = record.region_name_short.toLowerCase();
            const cityName = locationNameMap.get(shortName);

            if (!cityName) {
                console.warn(`Could not find city mapping for: ${record.region_name_short}`);
                return;
            }

            const year = record.year || record.tahun;
            
            if (!aggregatedData[cityName]) aggregatedData[cityName] = {};
            if (!aggregatedData[cityName][year]) aggregatedData[cityName][year] = { 
                datasets: {}
            };

            aggregatedData[cityName][year].datasets[datasetName] = mappingFn(record);
        });
    }

    // Process each dataset
    processRecords(jknRecords, 'JKN', (r) => ({
      population: r.population,
      jkn_participants: r.jkn_participants,
      jkn_coverage_ratio: r.jkn_coverage_ratio
    }));

    processRecords(penyakitMenularRecords, 'Penyakit Menular', (r) => ({
        tuberculosis_cases: r.tuberculosis_cases,
        new_hiv_cases: r.new_hiv_cases,
        new_leprosy_cases: r.new_leprosy_cases,
        dengue_cases: r.dengue_cases,
        positive_malaria_cases: r.positive_malaria_cases,
        chronic_filariasis_cases: r.chronic_filariasis_cases
    }));

    processRecords(rasioTempatTidurRecords, 'Rasio Tempat Tidur', (r) => ({
        population: r.population,
        hospital_beds: r.hospital_beds,
        hospital_bed_ratio_per_1000_population: r.hospital_bed_ratio_per_1000_population
    }));

     processRecords(rasioDokterRecords, 'Rasio Dokter', (r) => ({
        population: r.population,
        total_doctors: r.total_doctors,
        doctor_ratio_per_1000_population: r.doctor_ratio_per_1000_population
    }));


    // 4. Save to database.
    for (const [cityName, yearData] of Object.entries(aggregatedData)) {
      const cityType = cityName.toLowerCase().startsWith('kota') ? 'Kota' : 'Kabupaten';
      
      // Check if entry exists for this location (to avoid duplicates or update)
       const { data: existing, error: fetchErr } = await supabase
       .from('data_map')
       .select('id')
       .eq('city_name', cityName)
       .single();

       if (fetchErr && fetchErr.code !== 'PGRST116') {
           console.error("Error fetching existing data:", fetchErr);
           continue;
       }

       if (existing) {
            // Update
             console.log(`Updating health data for location ${cityName}...`);
            const { error: updateErr } = await supabase
            .from('data_map')
            .update({ medical_data: yearData })
            .eq('id', existing.id);
            if(updateErr) console.error("Update error:", updateErr);

       } else {
            // Insert
            console.log(`Inserting health data for location ${cityName}...`);
             const { error: insertErr } = await supabase
            .from('data_map')
            .insert({
                city_name: cityName,
                city_type: cityType,
                active: true,
                medical_data: yearData
            });
             if(insertErr) {
                 console.error("Insert error:", insertErr);
             }
       }
    }
    
    console.log("Seed complete.");

  } catch (error) {
    console.error("Script failed:", error);
  }
}

run();
