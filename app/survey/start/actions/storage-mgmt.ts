'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { uploadToGoogleDrive } from '@/lib/googleDrive';

export async function getStorageStatsAction() {
    try {
        let totalSize = 0;
        
        // List all files in the bucket (simplified, assuming flat for now)
        const { data: files, error: listError } = await supabaseAdmin.storage.from('survey_uploads').list('', { limit: 1000 });
        if (listError) throw listError;
        
        if (files) {
            files.forEach(f => {
                if (f.metadata && f.metadata.size) {
                    totalSize += f.metadata.size;
                }
            });
        }

        return { 
            success: true, 
            usageBytes: totalSize, 
            limitBytes: 1024 * 1024 * 1024 // 1GB limit
        };
    } catch (err: any) {
        console.error('Failed to get storage stats:', err);
        return { success: false, error: err.message };
    }
}

export async function syncToGDriveAction() {
    try {
        // 1. Get all files in Supabase Storage
        const { data: files, error: listError } = await supabaseAdmin.storage.from('survey_uploads').list('', { limit: 1000 });
        if (listError) throw listError;

        if (!files || files.length === 0 || (files.length === 1 && files[0].name === '.emptyFolderPlaceholder')) {
            return { success: true, message: 'Tidak ada file untuk disinkronisasi.' };
        }

        let syncedCount = 0;
        let errors = [];

        for (const fileMetadata of files) {
            const fileName = fileMetadata.name;
            if (fileName === '.emptyFolderPlaceholder') continue;

            try {
                // 2. Download file from Supabase
                const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
                    .from('survey_uploads')
                    .download(fileName);
                
                if (downloadError) throw downloadError;

                // 3. Upload to Google Drive
                const arrayBuffer = await fileBlob.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                const gDriveResult = await uploadToGoogleDrive(
                    buffer,
                    fileName,
                    fileMetadata.metadata?.mimetype || 'application/octet-stream',
                    'Survey Migrated'
                );

                // 4. Update Database
                // We use ilike to find any link containing the filename
                
                // Update survey_answers
                const { error: ansErr } = await supabaseAdmin
                    .from('survey_answers')
                    .update({ answer_text: gDriveResult.fileUrl })
                    .ilike('answer_text', `%${fileName}%`);
                if (ansErr) console.error('Error updating survey_answers:', ansErr);

                // Update survey_multiple_answers
                const { error: multErr } = await supabaseAdmin
                    .from('survey_multiple_answers')
                    .update({ answer_value: gDriveResult.fileUrl })
                    .ilike('answer_value', `%${fileName}%`);
                if (multErr) console.error('Error updating survey_multiple_answers:', multErr);

                // 5. Delete from Supabase only after DB update
                await supabaseAdmin.storage.from('survey_uploads').remove([fileName]);
                
                syncedCount++;
            } catch (err: any) {
                console.error(`Failed to sync ${fileName}:`, err);
                errors.push(`${fileName}: ${err.message}`);
            }
        }

        return { 
            success: true, 
            message: `Berhasil memindahkan ${syncedCount} file ke Google Drive.`,
            errorDetails: errors.length > 0 ? errors : null
        };
    } catch (err: any) {
        console.error('Sync process failed:', err);
        return { success: false, error: err.message };
    }
}
