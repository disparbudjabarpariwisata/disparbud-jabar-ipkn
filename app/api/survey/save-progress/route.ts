import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { respondent_id, role_id, answers, multiple_answers } = body;

        if (!respondent_id || !role_id || (!Array.isArray(answers) && !Array.isArray(multiple_answers))) {
            return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
        }

        // 1. Prepare standard payload
        const payload = (answers || [])
            .filter((ans: any) => ans.question_id) // ensure question_id exists
            .map((ans: any) => {
                const entry: any = {
                    respondent_id,
                    role_id,
                    question_id: ans.question_id,
                    answer_text: ans.answer_text || null,
                    keterangan: ans.keterangan || null,
                };
                // Only include answer_json if it has actual content
                if (ans.answer_json && Array.isArray(ans.answer_json) && ans.answer_json.length > 0) {
                    entry.answer_json = ans.answer_json;
                } else {
                    entry.answer_json = null;
                }
                return entry;
            });

        // 2. Prepare multiple_input payload
        let multiPayload: any[] = [];
        if (Array.isArray(multiple_answers) && multiple_answers.length > 0) {
            multiPayload = multiple_answers
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
        }

        // 3. Prevent FK Violations: If admin deleted a question while respondent was filling it,
        // it would cause a survey_answers_question_id_fkey constraint error.
        // We fetch the currently valid question IDs from DB and filter both payloads.
        const allClientQuestionIds = Array.from(new Set([
            ...payload.map((p: any) => p.question_id),
            ...multiPayload.map((p: any) => p.question_id)
        ]));

        const validQuestionIds = new Set<string>();
        if (allClientQuestionIds.length > 0) {
            const { data: validQ, error: checkErr } = await supabaseAdmin
                .from('survey_questions')
                .select('id')
                .in('id', allClientQuestionIds);

            if (!checkErr && validQ) {
                validQ.forEach(q => validQuestionIds.add(q.id));
            }
        }

        // Filter payloads to only include those that still exist in DB
        const finalPayload = payload.filter((p: any) => validQuestionIds.has(p.question_id));
        const finalMultiPayload = multiPayload.filter((p: any) => validQuestionIds.has(p.question_id));

        // 4. Upsert Standard Answers
        if (finalPayload.length > 0) {
            const { error: insertError } = await supabaseAdmin
                .from('survey_answers')
                .upsert(finalPayload, { onConflict: 'respondent_id, question_id' });

            if (insertError) {
                // If error is due to missing keterangan column, retry without it
                if (insertError.message && insertError.message.includes('keterangan')) {
                    const payloadWithoutKet = finalPayload.map((p: any) => {
                        const { keterangan, ...rest } = p;
                        return rest;
                    });
                    const { error: retryError } = await supabaseAdmin
                        .from('survey_answers')
                        .upsert(payloadWithoutKet, { onConflict: 'respondent_id, question_id' });
                    if (retryError) {
                        console.error('Submit Error (Standard Retry):', retryError);
                        return NextResponse.json({ error: `Gagal menyimpan jawaban: ${retryError.message}` }, { status: 500 });
                    }
                } else {
                    console.error('Submit Error (Standard):', insertError);
                    return NextResponse.json({ error: `Gagal menyimpan jawaban: ${insertError.message}` }, { status: 500 });
                }
            }
        }

        // 5. Handle completely custom multiple_input type answers
        if (finalMultiPayload.length > 0) {
            // First delete existing multiple answers for this respondent & questions
            const questionIds = Array.from(new Set(finalMultiPayload.map(p => p.question_id)));
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
                .insert(finalMultiPayload);

            if (multiInsertError) {
                console.error('Submit Error (Multiple):', multiInsertError);
                return NextResponse.json({ error: `Gagal menyimpan jawaban detail: ${multiInsertError.message}` }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: error.message || 'Terjadi kesalahan internal.' }, { status: 500 });
    }
}

