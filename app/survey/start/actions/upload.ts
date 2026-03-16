'use server';

import { uploadToGoogleDrive } from '@/lib/googleDrive';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const maxDuration = 60; // 60 seconds timeout for large file uploads

export async function uploadFileAction(formData: FormData) {
    try {
        const file = formData.get('file') as File | null;
        const respondentId = formData.get('respondent_id') as string | null;
        const questionId = formData.get('question_id') as string | null;
        const roleId = formData.get('role_id') as string | null;
        const institutionName = formData.get('institution_name') as string | null;
        const isMultiple = formData.get('is_multiple') === 'true';

        if (!file || !respondentId || !questionId || !roleId) {
            return { success: false, error: 'Data tidak lengkap.' };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const timestamp = new Date().toISOString().slice(0, 10);
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uploadFileName = `${timestamp}_${safeName}`;
        const subfolder = institutionName || 'Tanpa Instansi';

        const result = await uploadToGoogleDrive(
            buffer,
            uploadFileName,
            file.type || 'application/octet-stream',
            subfolder
        );

        if (!isMultiple) {
            await supabaseAdmin.from('survey_answers').upsert(
                {
                    respondent_id: respondentId,
                    role_id: roleId,
                    question_id: questionId,
                    answer_text: result.fileUrl,
                },
                { onConflict: 'respondent_id, question_id' }
            );
        } else {
            const groupLabel = formData.get('group_label') as string | null;
            const fieldLabel = formData.get('field_label') as string | null;

            if (groupLabel && fieldLabel) {
                await supabaseAdmin
                    .from('survey_multiple_answers')
                    .delete()
                    .eq('respondent_id', respondentId)
                    .eq('question_id', questionId)
                    .eq('group_label', groupLabel)
                    .eq('field_label', fieldLabel);

                await supabaseAdmin.from('survey_multiple_answers').insert({
                    respondent_id: respondentId,
                    role_id: roleId,
                    question_id: questionId,
                    group_label: groupLabel,
                    field_label: fieldLabel,
                    field_type: 'upload_file',
                    answer_value: result.fileUrl,
                });
            }
        }

        return {
            success: true,
            fileUrl: result.fileUrl,
            fileId: result.fileId,
            fileName: result.fileName,
        };
    } catch (error: any) {
        console.error('Upload Error:', error);
        return { success: false, error: error.message || 'Gagal upload file.' };
    }
}
