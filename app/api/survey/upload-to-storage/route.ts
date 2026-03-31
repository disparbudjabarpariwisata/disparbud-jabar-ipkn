import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const ALLOWED_EXTENSIONS = [
    '.pdf', '.xls', '.xlsx', '.doc', '.docx', '.ppt', '.pptx',
    '.jpeg', '.jpg', '.png', '.mp4', '.mov', '.zip', '.rar'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: Request) {
    try {
        let formData: FormData;
        try {
            formData = await request.formData();
        } catch (parseError: any) {
            console.error('[StorageUpload] Failed to parse formData:', parseError?.message);
            return NextResponse.json(
                { error: 'Gagal memproses file. File mungkin terlalu besar atau koneksi terputus. Batas maksimal upload adalah 50MB.' },
                { status: 413 }
            );
        }

        const file = formData.get('file') as File | null;
        const respondentId = formData.get('respondent_id') as string | null;
        const questionId = formData.get('question_id') as string | null;
        const roleId = formData.get('role_id') as string | null;
        const isMultiple = formData.get('is_multiple') === 'true';
        const groupLabel = formData.get('group_label') as string | null;
        const fieldLabel = formData.get('field_label') as string | null;

        if (!file || !respondentId || !questionId || !roleId) {
            console.error('[StorageUpload] Missing required fields:', { file: !!file, respondentId, questionId, roleId });
            return NextResponse.json(
                { error: 'Data tidak lengkap. File, respondent_id, question_id, dan role_id wajib diisi.' },
                { status: 400 }
            );
        }

        console.log(`[StorageUpload] File: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `Ukuran file melebihi batas maksimal 50MB. Ukuran file Anda: ${(file.size / 1024 / 1024).toFixed(1)}MB` },
                { status: 400 }
            );
        }

        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
            return NextResponse.json(
                { error: `Tipe file "${fileExt}" tidak diizinkan. Gunakan: ${ALLOWED_EXTENSIONS.join(', ')}` },
                { status: 400 }
            );
        }

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const timestamp = new Date().getTime();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = isMultiple
            ? `${respondentId}/multiple/${timestamp}_${safeName}`
            : `${respondentId}/${timestamp}_${safeName}`;

        // Upload to Supabase Storage using admin key (bypasses RLS)
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('survey_uploads')
            .upload(filePath, buffer, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.type || 'application/octet-stream',
            });

        if (uploadError) {
            console.error('[StorageUpload] Upload error:', uploadError);
            throw new Error(`Gagal menyimpan file: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('survey_uploads')
            .getPublicUrl(filePath);

        // Save to database
        if (!isMultiple) {
            const { error: dbError } = await supabaseAdmin
                .from('survey_answers')
                .upsert(
                    {
                        respondent_id: respondentId,
                        role_id: roleId,
                        question_id: questionId,
                        answer_text: publicUrl,
                    },
                    { onConflict: 'respondent_id, question_id' }
                );

            if (dbError) {
                console.error('[StorageUpload] DB Error saving file link:', dbError);
            }
        } else {
            if (groupLabel && fieldLabel) {
                // Delete existing entry and insert new one
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
                        answer_value: publicUrl,
                    });

                if (multiDbError) {
                    console.error('[StorageUpload] DB Error saving multiple file link:', multiDbError);
                }
            }
        }

        return NextResponse.json({
            success: true,
            publicUrl,
            fileName: safeName,
        });

    } catch (error: any) {
        console.error('[StorageUpload API Error]', {
            name: error?.name,
            message: error?.message,
            stack: error?.stack?.substring(0, 500),
        });

        return NextResponse.json(
            { error: error.message || 'Terjadi kesalahan saat upload file.' },
            { status: 500 }
        );
    }
}
