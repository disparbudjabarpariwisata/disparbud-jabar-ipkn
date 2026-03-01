import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { respondent_id, role_id, answers, multiple_answers } = body;

        if (!respondent_id || !role_id || (!Array.isArray(answers) && !Array.isArray(multiple_answers))) {
            return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
        }

        // Upsert all standard answers. The "answers" array should contain:
        // { question_id, answer_text, answer_json }

        const payload = (answers || []).map((ans: any) => ({
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
                console.error('Submit Error (Standard):', insertError);
                throw insertError;
            }
        }

        // Handle completely custom multiple_input type answers
        if (Array.isArray(multiple_answers) && multiple_answers.length > 0) {
            const multiPayload = multiple_answers.map((ans: any) => ({
                respondent_id,
                role_id,
                question_id: ans.question_id,
                group_label: ans.group_label,
                field_label: ans.field_label,
                field_type: ans.field_type,
                answer_value: ans.answer_value
            }));

            // First delete existing multiple answers for this respondent & questions
            const questionIds = Array.from(new Set(multiPayload.map(p => p.question_id)));
            if (questionIds.length > 0) {
                const { error: delErr } = await supabaseAdmin
                    .from('survey_multiple_answers')
                    .delete()
                    .eq('respondent_id', respondent_id)
                    .in('question_id', questionIds);

                if (delErr) throw delErr;
            }

            // Then insert new answers flatly
            const { error: multiInsertError } = await supabaseAdmin
                .from('survey_multiple_answers')
                .insert(multiPayload);

            if (multiInsertError) {
                console.error('Submit Error (Multiple):', multiInsertError);
                throw multiInsertError;
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan internal.' }, { status: 500 });
    }
}
