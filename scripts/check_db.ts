import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching from data_map...");
    const { data, error } = await supabase.from('data_map').select('*');
    if (error) {
        console.error("DB Error:", error);
    } else {
        console.log("Total rows:", data?.length);
        if (data && data.length > 0) {
            console.log("First row:", data[0].city_name);
            const bandung = data.find(d => d.city_name === 'Kota Bandung');
            console.log("Kota Bandung row exists?", !!bandung);
            if (bandung) {
               console.log("Active status:", bandung.active);
            }
        }
    }
}
run();
