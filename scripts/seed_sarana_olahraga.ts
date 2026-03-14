import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Fallback to anon key if service role is missing, but should be service roke

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Reading data_sarana_olahraga.json...");
    const rawData = fs.readFileSync(path.join(__dirname, 'data_sarana_olahraga.json'), 'utf8');
    const jsonData = JSON.parse(rawData);

    const profiles = jsonData.region_profiles || [];
    const rows = jsonData.dashboard_rows || [];

    // Fetch existing map data
    const { data: currentDataMap, error: fetchErr } = await supabase
        .from('data_map')
        .select('*');

    if (fetchErr) {
        console.error("Failed to fetch data_map from Supabase:", fetchErr);
        return;
    }

    let updatedCount = 0;

    for (const profile of profiles) {
        // filter region known, exclude "Pemerintah Provinsi Jawa Barat" / "Provinsi Jawa Barat" if not in data_map
        // data_map mostly stores specific regencies/cities
        if (profile.region_type === 'provinsi' || profile.region_type === 'tidak_diketahui') {
            continue;
        }

        const cityName = profile.region_name;
        // Find in DB
        const dbRow = currentDataMap?.find(r => r.city_name === cityName);

        if (!dbRow) {
            console.warn(`[WARN] Region "${cityName}" not found in data_map. Skipping.`);
            continue;
        }

        // Get matching rows
        const matchingRows = rows.filter((r: any) => r.region_name === cityName);

        // Update content JSON 
        const currentContent = dbRow.content || {};
        const updatedContent = {
            ...currentContent,
            sarana_olahraga: {
                profile: profile,
                facilities: matchingRows
            }
        };

        const { error: updateErr } = await supabase
            .from('data_map')
            .update({ content: updatedContent })
            .eq('id', dbRow.id);

        if (updateErr) {
            console.error(`[ERROR] Failed to update "${cityName}":`, updateErr);
        } else {
            console.log(`[SUCCESS] Updated "${cityName}" with ${matchingRows.length} facilities.`);
            updatedCount++;
        }
    }

    console.log(`\nSeeding completed. Updated ${updatedCount} regions.`);
}

run();
