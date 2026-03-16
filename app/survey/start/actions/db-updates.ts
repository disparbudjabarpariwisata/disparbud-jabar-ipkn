'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function saveSurveyFileUrlAction(formData: FormData) {
    try {
        const fileUrl = formData.get('file_url') as string | null;
        const respondentId = formData.get('respondent_id') as string | null;
        const questionId = formData.get('question_id') as string | null;
        const roleId = formData.get('role_id') as string | null;
        const isMultiple = formData.get('is_multiple') === 'true';

        if (!fileUrl || !respondentId || !questionId || !roleId) {
            return { success: false, error: 'Data tidak lengkap untuk update database.' };
        }

        if (!isMultiple) {
            const { error: dbError } = await supabaseAdmin
                .from('survey_answers')
                .upsert(
                    {
                        respondent_id: respondentId,
                        role_id: roleId,
                        question_id: questionId,
                        answer_text: fileUrl,
                    },
                    { onConflict: 'respondent_id, question_id' }
                );

            if (dbError) throw dbError;
        } else {
            const groupLabel = formData.get('group_label') as string | null;
            const fieldLabel = formData.get('field_label') as string | null;

            if (groupLabel && fieldLabel) {
                // Delete existing entry for this specific multiple input field
                await supabaseAdmin
                    .from('survey_multiple_answers')
                    .delete()
                    .eq('respondent_id', respondentId)
                    .eq('question_id', questionId)
                    .eq('group_label', groupLabel)
                    .eq('field_label', fieldLabel);

                const { error: multiDbError } = await supabaseAdmin
                    .from('survey_multiple_answers')
                    .insert({
                        respondent_id: respondentId,
                        role_id: roleId,
                        question_id: questionId,
                        group_label: groupLabel,
                        field_label: fieldLabel,
                        field_type: 'upload_file',
                        answer_value: fileUrl,
                    });

                if (multiDbError) throw multiDbError;
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error('Database Update Error:', error);
        return { success: false, error: error.message || 'Gagal menyimpan data ke database.' };
    }
}
