import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const respondentId = searchParams.get('respondentId');

        if (!respondentId) {
            return NextResponse.json({ error: 'ID Responden wajib diisi.' }, { status: 400 });
        }

        // Fetch standard answers
        const { data, error } = await supabaseAdmin
            .from('survey_answers')
            .select('question_id, answer_text, answer_json')
            .eq('respondent_id', respondentId);

        if (error) {
            console.error('Fetch Error:', error);
            throw error;
        }

        // Fetch multiple answers
        const { data: multipleData, error: multipleError } = await supabaseAdmin
            .from('survey_multiple_answers')
            .select('question_id, group_label, field_label, field_type, answer_value')
            .eq('respondent_id', respondentId);

        if (multipleError) {
            console.error('Fetch Multiple Error:', multipleError);
            throw multipleError;
        }

        // Transform results back into a Record<question_id, any value> map shape expected by SurveyStartPage
        const formatted: Record<string, any> = {};
        data.forEach(ans => {
            if (ans.answer_json) {
                formatted[ans.question_id] = ans.answer_json; // checkbox
            } else {
                formatted[ans.question_id] = ans.answer_text; // others
            }
        });

        return NextResponse.json({ success: true, data: formatted, multiple_data: multipleData || [] });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan internal.' }, { status: 500 });
    }
}
