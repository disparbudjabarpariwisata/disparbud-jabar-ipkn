import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { respondent_id, role_id, answers } = body;

        if (!respondent_id || !role_id || !Array.isArray(answers)) {
            return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
        }

        // Upsert all answers. The "answers" array should contain:
        // { question_id, answer_text, answer_json }

        const payload = answers.map((ans: any) => ({
            respondent_id,
            role_id,
            question_id: ans.question_id,
            answer_text: ans.answer_text,
            answer_json: ans.answer_json
        }));

        if (payload.length > 0) {
            const { error: insertError } = await supabaseAdmin
                .from('survey_answers')
                .upsert(payload, { onConflict: 'respondent_id, question_id' });

            if (insertError) {
                console.error('Submit Error:', insertError);
                throw insertError;
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan internal.' }, { status: 500 });
    }
}
