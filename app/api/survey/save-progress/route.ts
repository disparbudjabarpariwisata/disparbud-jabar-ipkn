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

        const payload = (answers || [])
            .filter((ans: any) => ans.question_id) // ensure question_id exists
            .map((ans: any) => {
                const entry: any = {
                    respondent_id,
                    role_id,
                    question_id: ans.question_id,
                    answer_text: ans.answer_text || null,
                };
                // Only include answer_json if it has actual content
                if (ans.answer_json && Array.isArray(ans.answer_json) && ans.answer_json.length > 0) {
                    entry.answer_json = ans.answer_json;
                } else {
                    entry.answer_json = null;
                }
                return entry;
            });

        if (payload.length > 0) {
            const { error: insertError } = await supabaseAdmin
                .from('survey_answers')
                .upsert(payload, { onConflict: 'respondent_id, question_id' });

            if (insertError) {
                console.error('Submit Error (Standard):', insertError);
                return NextResponse.json({ error: `Gagal menyimpan jawaban: ${insertError.message}` }, { status: 500 });
            }
        }

        // Handle completely custom multiple_input type answers
        if (Array.isArray(multiple_answers) && multiple_answers.length > 0) {
            // Filter out entries with missing required fields
            const multiPayload = multiple_answers
                .filter((ans: any) => ans.question_id && ans.group_label && ans.field_label)
                .map((ans: any) => ({
                    respondent_id,
                    role_id,
                    question_id: ans.question_id,
                    group_label: ans.group_label,
                    field_label: ans.field_label,
                    field_type: ans.field_type || 'text',
                    answer_value: ans.answer_value || ''
                }));

            if (multiPayload.length > 0) {
                // First delete existing multiple answers for this respondent & questions
                const questionIds = Array.from(new Set(multiPayload.map(p => p.question_id)));
                if (questionIds.length > 0) {
                    const { error: delErr } = await supabaseAdmin
                        .from('survey_multiple_answers')
                        .delete()
                        .eq('respondent_id', respondent_id)
                        .in('question_id', questionIds);

                    if (delErr) {
                        console.error('Delete Error (Multiple):', delErr);
                        return NextResponse.json({ error: `Gagal menghapus jawaban lama: ${delErr.message}` }, { status: 500 });
                    }
                }

                // Then insert new answers flatly
                const { error: multiInsertError } = await supabaseAdmin
                    .from('survey_multiple_answers')
                    .insert(multiPayload);

                if (multiInsertError) {
                    console.error('Submit Error (Multiple):', multiInsertError);
                    return NextResponse.json({ error: `Gagal menyimpan jawaban detail: ${multiInsertError.message}` }, { status: 500 });
                }
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: error.message || 'Terjadi kesalahan internal.' }, { status: 500 });
    }
}

