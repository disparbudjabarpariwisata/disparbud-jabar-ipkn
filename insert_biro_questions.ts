import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addBiroQuestions() {
    console.log("Adding Biro Perekonomian questions...\n");

    const questions = [
        {
            id: '56bc3e41-e1c5-40a7-ab93-3866c2864603',
            role_id: 'a6566276-64f2-4a06-bed8-b4beac1565e5', // Assuming this is the standard Respondent role ID
            question_text: 'Bagaimana kebijakan pemerintah provinsi anda dalam memastikan stabilitas lingkungan berusaha? (stabilitas lingkungan berusaha mencakup upaya pemerintah daerah dalam menjaga kondisi persaingan dan keberlanjutan usaha)?',
            question_type: 'linear_scale',
            options: ['1 = sangat tidak baik, 7 = sangat baik'],
            is_required: true,
            sort_order: 10,
            active: true,
            institution_name: 'Biro Perekonomian'
        },
        {
            id: 'af1a697b-bb4d-470b-842e-b80bd9a3ee49',
            role_id: 'a6566276-64f2-4a06-bed8-b4beac1565e5',
            question_text: 'Berapa persentase realisasi pembayaran cicilan pokok utang yang jatuh tempo terhadap anggaran pada posisi akhir tahun (bulan desember)?',
            question_type: 'number',
            options: ['Persentase (%)'],
            is_required: true,
            sort_order: 13,
            active: true,
            institution_name: 'Biro Perekonomian'
        }
    ];

    for (const q of questions) {
        console.log(`Checking question: ${q.question_text.substring(0, 30)}...`);

        const { data: existing, error: errCheck } = await supabase
            .from('survey_questions')
            .select('id')
            .eq('id', q.id);

        if (errCheck) {
            console.error("Error checking question:", errCheck);
            continue;
        }

        if (existing && existing.length > 0) {
            console.log("  -> Question ID already exists, updating...");
            const { error: errUpdate } = await supabase
                .from('survey_questions')
                .update(q)
                .eq('id', q.id);
            if (errUpdate) console.error("     Update Error:", errUpdate);
            else console.log("     Updated successfully.");
        } else {
            console.log("  -> Question ID does not exist, inserting...");
            const { error: errInsert } = await supabase
                .from('survey_questions')
                .insert(q);
            if (errInsert) console.error("     Insert Error:", errInsert);
            else console.log("     Inserted successfully.");
        }
    }
}

addBiroQuestions();
