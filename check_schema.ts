import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data: cols, error } = await supabase.rpc('get_table_columns', { table_name: 'survey_answers' });

    // If the rpc doesn't exist, just select one row to inspect keys
    if (error) {
        console.log("RPC failed, fetching a single row to check keys...");
        const { data: row } = await supabase.from('survey_answers').select('*').limit(1);
        if (row && row.length > 0) {
            console.log("Columns:", Object.keys(row[0]));
        } else {
            console.log("Table is empty, can't infer schema from row.");

            // Try fetching from multiple_answers as a fallback to see its structure
            const { data: mRow } = await supabase.from('survey_multiple_answers').select('*').limit(1);
            if (mRow && mRow.length > 0) {
                console.log("Multiple Answers Columns:", Object.keys(mRow[0]));
            }
        }
    } else {
        console.log("Columns:", cols);
    }
}

checkSchema();
