import { NextResponse } from 'next/server';
import { uploadToGoogleDrive } from '@/lib/googleDrive';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Route segment config for Vercel deployment
// bodySizeLimit in next.config only applies to Server Actions, NOT Route Handlers
export const maxDuration = 60; // 60 seconds timeout for large file uploads to Google Drive
export const dynamic = 'force-dynamic';

// Allowed file extensions
const ALLOWED_EXTENSIONS = [
    '.pdf', '.xls', '.xlsx', '.doc', '.docx', '.ppt', '.pptx',
    '.jpeg', '.jpg', '.png', '.mp4', '.mov', '.zip', '.rar'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: Request) {
    try {
        console.log('[Upload] Received upload request');

        let formData: FormData;
        try {
            formData = await request.formData();
        } catch (parseError: any) {
            console.error('[Upload] Failed to parse formData:', parseError?.message);
            return NextResponse.json(
                { error: 'Gagal memproses file. File mungkin terlalu besar atau koneksi terputus. Batas maksimal upload adalah 50MB.' },
                { status: 413 }
            );
        }

        const file = formData.get('file') as File | null;
        const respondentId = formData.get('respondent_id') as string | null;
        const questionId = formData.get('question_id') as string | null;
        const roleId = formData.get('role_id') as string | null;
        const institutionName = formData.get('institution_name') as string | null;
        const isMultiple = formData.get('is_multiple') === 'true';

        // Validate required fields
        if (!file || !respondentId || !questionId || !roleId) {
            console.error('[Upload] Missing required fields:', { file: !!file, respondentId, questionId, roleId });
            return NextResponse.json(
                { error: 'Data tidak lengkap. File, respondent_id, question_id, dan role_id wajib diisi.' },
                { status: 400 }
            );
        }

        console.log(`[Upload] File: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Type: ${file.type}, Institution: ${institutionName || 'N/A'}`);
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `Ukuran file melebihi batas maksimal 50MB. Ukuran file Anda: ${(file.size / 1024 / 1024).toFixed(1)}MB` },
                { status: 400 }
            );
        }

        // Validate file type
        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
            return NextResponse.json(
                { error: `Tipe file "${fileExt}" tidak diizinkan. Gunakan: ${ALLOWED_EXTENSIONS.join(', ')}` },
                { status: 400 }
            );
        }

        // Read file buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create a descriptive filename: [InstitutionName]_[OriginalName]
        const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uploadFileName = `${timestamp}_${safeName}`;

        // Use institution name as subfolder
        const subfolder = institutionName || 'Tanpa Instansi';

        // Upload to Google Drive
        const result = await uploadToGoogleDrive(
            buffer,
            uploadFileName,
            file.type || 'application/octet-stream',
            subfolder
        );

        // Save the Google Drive link as the answer in survey_answers ONLY if it's NOT a multiple_input
        if (!isMultiple) {
            const { error: dbError } = await supabaseAdmin
                .from('survey_answers')
                .upsert(
                    {
                        respondent_id: respondentId,
                        role_id: roleId,
                        question_id: questionId,
                        answer_text: result.fileUrl,
                    },
                    { onConflict: 'respondent_id, question_id' }
                );

            if (dbError) {
                console.error('DB Error saving file link:', dbError);
                // Don't fail the request — file is already uploaded
            }
        } else {
            // For multiple_input file uploads, save directly to survey_multiple_answers
            const groupLabel = formData.get('group_label') as string | null;
            const fieldLabel = formData.get('field_label') as string | null;

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
                        answer_value: result.fileUrl,
                    });

                if (multiDbError) {
                    console.error('DB Error saving multiple file link:', multiDbError);
                }
            }
        }

        return NextResponse.json({
            success: true,
            fileUrl: result.fileUrl,
            fileId: result.fileId,
            fileName: result.fileName,
        });

    } catch (error: any) {
        console.error('[Upload API Error]', {
            name: error?.name,
            message: error?.message,
            stack: error?.stack?.substring(0, 500),
        });

        // Provide specific error messages based on common failure modes
        let userMessage = 'Terjadi kesalahan saat upload file.';
        let statusCode = 500;

        if (error?.message?.includes('refresh access token') || error?.message?.includes('Token')) {
            userMessage = 'Koneksi ke Google Drive gagal. Silakan hubungi administrator untuk memeriksa konfigurasi.';
        } else if (error?.message?.includes('upload file ke Google Drive')) {
            userMessage = 'Upload file ke Google Drive gagal. Silakan coba lagi dalam beberapa saat.';
        } else if (error?.message?.includes('subfolder')) {
            userMessage = 'Gagal menyiapkan folder penyimpanan. Silakan coba lagi.';
        } else if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
            userMessage = 'Koneksi ke server penyimpanan file terputus. Silakan periksa koneksi internet dan coba lagi.';
        } else if (error?.message) {
            userMessage = error.message;
        }

        return NextResponse.json(
            { error: userMessage },
            { status: statusCode }
        );
    }
}
