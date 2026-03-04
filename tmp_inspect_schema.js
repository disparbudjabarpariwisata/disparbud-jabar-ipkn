const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://qqufiwsrithwbpyzawoq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdWZpd3NyaXRod2JweXphd29xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgxNjA0MSwiZXhwIjoyMDgzMzkyMDQxfQ.k7OjPfZLZfVFXQU1iTjEu9ABCGNIQRpNPI1Cl00wsZI'
);

async function main() {
    const { data, error } = await supabase
        .from('survey_questions')
        .select('id, question_text, options')
        .eq('question_type', 'multiple_input');

    if (error) {
        console.error(error);
        return;
    }

    data.forEach((q) => {
        console.log(`\n\n--- QUESTION ID: ${q.id} ---\nTEXT: ${q.question_text}`);
        try {
            let schemaObj;
            if (Array.isArray(q.options) && typeof q.options[0] === 'string') {
                schemaObj = JSON.parse(q.options[0]);
            } else if (typeof q.options === 'object') {
                schemaObj = q.options;
            }
            console.log(JSON.stringify(schemaObj, null, 2));
        } catch (e) {
            console.log("Error parsing options");
        }
    });
}

main();
