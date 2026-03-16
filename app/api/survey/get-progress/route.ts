import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const respondentId = searchParams.get('respondentId');

        if (!respondentId) {
            return NextResponse.json({ error: 'ID Responden wajib diisi.' }, { status: 400 });
        }

        // Fetch standard answers (with fallback if keterangan column doesn't exist yet)
        let data: any[] | null = null;

        const { data: dataWithKet, error: ketErr } = await supabaseAdmin
            .from('survey_answers')
            .select('question_id, answer_text, answer_json, keterangan, created_at')
            .eq('respondent_id', respondentId);

        if (ketErr) {
            // keterangan column may not exist yet, retry without it
            const { data: dataFallback, error: fallbackErr } = await supabaseAdmin
                .from('survey_answers')
                .select('question_id, answer_text, answer_json, created_at')
                .eq('respondent_id', respondentId);
            if (fallbackErr) throw fallbackErr;
            data = dataFallback;
        } else {
            data = dataWithKet;
        }

        // Fetch multiple answers
        const { data: multipleData, error: multipleError } = await supabaseAdmin
            .from('survey_multiple_answers')
            .select('question_id, group_label, field_label, field_type, answer_value, created_at')
            .eq('respondent_id', respondentId);

        if (multipleError) {
            console.error('Fetch Multiple Error:', multipleError);
            throw multipleError;
        }

        // Transform results back into a Record<question_id, any value> map shape expected by SurveyStartPage
        const formatted: Record<string, any> = {};
        const keteranganMap: Record<string, string> = {};
        const timestampsMap: Record<string, string> = {};
        data.forEach(ans => {
            if (ans.answer_json) {
                formatted[ans.question_id] = ans.answer_json; // checkbox
            } else {
                formatted[ans.question_id] = ans.answer_text; // others
            }
            if (ans.keterangan) {
                keteranganMap[ans.question_id] = ans.keterangan;
            }
            if (ans.created_at) {
                timestampsMap[ans.question_id] = ans.created_at;
            }
        });

        return NextResponse.json({ 
            success: true, 
            data: formatted, 
            multiple_data: multipleData || [], 
            keterangan: keteranganMap,
            timestamps: timestampsMap
        });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan internal.' }, { status: 500 });
    }
}
