import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
    'survey_international_tourism',
    'survey_komunitas',
    'survey_pelaku_usaha',
    'survey_pemda_kabkota',
    'survey_pemerintah_pusat',
    'survey_pemerintah_terkait',
    'survey_perangkat_daerah',
    'survey_swasta_terkait'
];

const suppliedData = [
    { question_id: '5bbb6e4f-6e47-4df5-941d-63c393599317', answer_text: '98', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: '2de5dd54-1644-45de-9352-5cc24036bd7c', answer_text: '1', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: 'ea82e1d8-80a4-4c5b-9785-15fac9ec9670', answer_text: '1,3', created_at: '2026-02-22 12:46:13.345681+00' },
    { question_id: '60544d13-9020-43b3-8b81-a910acc36203', answer_text: '1.0', created_at: '2026-02-22 12:46:32.756165+00' },
    { question_id: 'fdccea36-2681-4097-a716-d7feab9e4ada', answer_text: '1', created_at: '2026-02-22 12:48:38.098043+00' },
    { question_id: 'ea905fc3-a687-41df-b2b3-30cb3f632db6', answer_text: '12', created_at: '2026-02-21 17:17:56.843741+00' },
    { question_id: '86687f0b-39f7-4d08-9a2d-0d97a7c35cec', answer_text: '1', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: '91014fb6-7992-48dd-824e-ba20ac7b1a5b', answer_text: '1', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: '7b995d7b-6d8b-4313-a3c8-c8f7e081d0df', answer_text: '1', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: '0d35fb48-ec92-407d-9810-2f88c7d3cdab', answer_text: '1', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: '37e8b19a-2a0a-4ee0-9ea4-5a9b5c3f5a29', answer_text: '5', created_at: '2026-02-21 17:15:49.427391+00' },
    { question_id: '0744dc4e-23b0-4206-89ba-397d66ba1e80', answer_text: '1', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: '43ee747f-fce3-4dc6-8d67-3357e304d777', answer_text: '6', created_at: '2026-02-22 12:47:19.515649+00' },
    { question_id: 'e68b41d6-efea-4691-bf11-cc0e95654612', answer_text: '1', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: '757f990c-90ff-4f8b-a599-20357d5e74c2', answer_text: '1', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: '659d0219-ef52-4e44-8844-2c910832ca47', answer_text: '7', created_at: '2026-02-22 12:47:12.878032+00' },
    { question_id: 'c9f1b028-4bde-4769-950c-344ed1b59863', answer_text: '10', created_at: '2026-02-21 17:18:00.678594+00' },
    { question_id: '4aa7c67e-c696-46a1-96fb-9c6284dd49e0', answer_text: '2,5', created_at: '2026-02-22 12:46:15.708456+00' },
    { question_id: '56aa5971-5ba3-4f78-9cde-3ad9c3503b1f', answer_text: '3,5', created_at: '2026-02-22 12:46:36.983171+00' },
    { question_id: '6a7bdee4-22aa-4449-b33a-865ab49cd1b7', answer_text: '57', created_at: '2026-02-22 12:46:29.997812+00' },
    { question_id: '55b4c9e4-5b30-4cd3-8ef4-f5df7728b905', answer_text: '4', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: '2b0f2818-9564-4e1d-862d-ca17f791ebac', answer_text: '1', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: '60c309d1-218a-43f0-adab-dc670b1bc6eb', answer_text: '100', created_at: '2026-02-22 12:46:20.494667+00' },
    { question_id: '252a0e72-7176-4f7c-abe5-bee63849bd75', answer_text: '1', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: 'ec4fb267-3e5a-4b6c-b4e8-adf84d673a06', answer_text: '2', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: '4ab17371-e779-4101-b042-d3cd360fbf96', answer_text: '2', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: '2453ac8c-faac-4655-b6d3-0feead5c3469', answer_text: '1', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: 'f150144a-e89d-4dd1-af2f-7c8975bc354f', answer_text: '1', created_at: '2026-02-22 12:46:27.145616+00' },
    { question_id: '18a5b392-5f49-4051-955e-6962800711ef', answer_text: '1', created_at: '2026-02-22 12:47:01.479194+00' },
    { question_id: '77cfd56b-85a5-4cbe-92ce-ba05def0d471', answer_text: '2', created_at: '2026-02-21 17:17:49.266338+00' }
];

async function run() {
    const email = 'iafitriani89@gmail.com';
    const pin = 'XXGRJI';
    let foundTarget = null;
    let targetTable = '';

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').eq('email', email).eq('pin', pin);
        if (data && data.length > 0) {
            foundTarget = data[0];
            targetTable = table;
            break;
        }
    }

    if (!foundTarget) {
        console.error("Respondent not found!");
        return;
    }

    console.log(`Found respondent in ${targetTable}: ID ${foundTarget.id}`);

    const { data: roleData } = await supabase.from('role_types').select('id').eq('name', foundTarget.role_name).single();

    if (!roleData) {
        console.error("Role not found for role_name:", foundTarget.role_name);
        return;
    }

    const roleId = roleData.id;
    const respondentId = foundTarget.id;
    console.log(`Role ID: ${roleId}`);

    const formattedData = suppliedData.map(d => ({
        respondent_id: respondentId,
        role_id: roleId,
        question_id: d.question_id,
        answer_text: d.answer_text,
        created_at: d.created_at,
        updated_at: d.created_at
    }));

    const { error: insErr } = await supabase.from('survey_answers').insert(formattedData);

    if (insErr) {
        console.error("Error inserting answers:", insErr);
    } else {
        console.log(`Successfully inserted ${formattedData.length} answers.`);
    }

    const { error: updErr } = await supabase.from(targetTable).update({ status: 'completed' }).eq('id', respondentId);
    if (updErr) {
        console.log("Error updating status:", updErr);
    } else {
        console.log("Status updated to completed.");
    }
}

run();
