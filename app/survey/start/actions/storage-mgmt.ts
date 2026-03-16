'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { uploadToGoogleDrive } from '@/lib/googleDrive';

async function listAllFilesRecursive(path: string = ''): Promise<{ name: string; path: string; metadata: any }[]> {
    const { data, error } = await supabaseAdmin.storage.from('survey_uploads').list(path, { limit: 1000 });
    if (error) throw error;
    if (!data) return [];

    let allFiles: { name: string; path: string; metadata: any }[] = [];

    for (const item of data) {
        const itemPath = path ? `${path}/${item.name}` : item.name;
        
        // If it's a folder (metadata is null or it has no size and is not the placeholder)
        if (!item.metadata && item.name !== '.emptyFolderPlaceholder') {
            const subFiles = await listAllFilesRecursive(itemPath);
            allFiles = allFiles.concat(subFiles);
        } else if (item.name !== '.emptyFolderPlaceholder') {
            allFiles.push({
                name: item.name,
                path: itemPath,
                metadata: item.metadata
            });
        }
    }

    return allFiles;
}

export async function getStorageStatsAction() {
    try {
        let totalSize = 0;
        const allFiles = await listAllFilesRecursive('');
        
        allFiles.forEach(f => {
            if (f.metadata && f.metadata.size) {
                totalSize += f.metadata.size;
            }
        });

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
        console.log('Starting recursive Supabase to GDrive sync...');
        
        // 1. Get ALL files recursively
        const allFiles = await listAllFilesRecursive('');

        if (allFiles.length === 0) {
            return { success: true, message: 'Tidak ada file untuk disinkronisasi.' };
        }

        let syncedCount = 0;
        let errors = [];

        for (const file of allFiles) {
            try {
                // 2. Download file from Supabase using full path
                const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
                    .from('survey_uploads')
                    .download(file.path);
                
                if (downloadError) throw downloadError;

                // 3. Upload to Google Drive
                const arrayBuffer = await fileBlob.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                const gDriveResult = await uploadToGoogleDrive(
                    buffer,
                    file.name,
                    file.metadata?.mimetype || 'application/octet-stream',
                    'Survey Migrated'
                );

                // 4. Update Database
                // Update survey_answers
                const { error: ansErr } = await supabaseAdmin
                    .from('survey_answers')
                    .update({ answer_text: gDriveResult.fileUrl })
                    .ilike('answer_text', `%${file.name}%`);
                if (ansErr) console.error('Error updating survey_answers:', ansErr);

                // Update survey_multiple_answers
                const { error: multErr } = await supabaseAdmin
                    .from('survey_multiple_answers')
                    .update({ answer_value: gDriveResult.fileUrl })
                    .ilike('answer_value', `%${file.name}%`);
                if (multErr) console.error('Error updating survey_multiple_answers:', multErr);

                // 5. Delete from Supabase only after DB update
                await supabaseAdmin.storage.from('survey_uploads').remove([file.path]);
                
                syncedCount++;
            } catch (err: any) {
                console.error(`Failed to sync ${file.path}:`, err);
                errors.push(`${file.name}: ${err.message}`);
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
