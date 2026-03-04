process.loadEnvFile('.env.local');
const { createClient } = require('@supabase/supabase-js');

function generateInstitutionPin(institutionName) {
    if (!institutionName) return '';
    const cleanStr = institutionName.trim().toUpperCase() + "_SMILE_WJ";
    let hash = 5381;
    for (let i = 0; i < cleanStr.length; i++) {
        const char = cleanStr.charCodeAt(i);
        hash = ((hash << 5) + hash) + char;
        hash = hash & hash;
    }
    let hashStr = Math.abs(hash).toString(36).toUpperCase();
    while (hashStr.length < 6) {
        hashStr = "A" + hashStr;
    }
    return hashStr.substring(0, 6);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
    'survey_perangkat_daerah',
    'survey_pemerintah_terkait',
    'survey_swasta_terkait',
    'survey_komunitas',
    'survey_pelaku_usaha',
    'survey_pemda_kabkota',
    'survey_pemerintah_pusat',
    'survey_international_tourism'
];

async function migratePins() {
    let totalUpdated = 0;
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('id, institution, pin');
        if (error) {
            console.error(`Error fetching table ${table}:`, error);
            continue;
        }

        console.log(`Found ${data.length} records in ${table}...`);
        for (const row of data) {
            const newPin = generateInstitutionPin(row.institution);
            if (newPin !== row.pin) {
                const { error: updateError } = await supabase.from(table).update({ pin: newPin }).eq('id', row.id);
                if (updateError) {
                    console.error(`Error updating record ${row.id} in ${table}:`, updateError);
                } else {
                    totalUpdated++;
                }
            }
        }
    }
    console.log(`Successfully updated ${totalUpdated} records.`);
}

migratePins();
