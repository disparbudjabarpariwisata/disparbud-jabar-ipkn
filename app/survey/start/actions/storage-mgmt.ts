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
        console.log('Starting organized recursive Supabase to GDrive sync...');
        
        const allFiles = await listAllFilesRecursive('');
        if (allFiles.length === 0) {
            return { success: true, message: 'Tidak ada file untuk disinkronisasi.' };
        }

        let syncedCount = 0;
        let deletedDummyCount = 0;
        let errors = [];
        const dummyTarget = 'Compro CV KC 2025.pdf';

        for (const file of allFiles) {
            try {
                // 1. Check if it's the dummy file correctly identified by user
                if (file.name.includes(dummyTarget)) {
                    // Delete from DB and Storage immediately without migrating
                    await supabaseAdmin.from('survey_answers').delete().ilike('answer_text', `%${file.name}%`);
                    await supabaseAdmin.from('survey_multiple_answers').delete().ilike('answer_value', `%${file.name}%`);
                    await supabaseAdmin.storage.from('survey_uploads').remove([file.path]);
                    deletedDummyCount++;
                    console.log('Deleted dummy test file:', file.path);
                    continue;
                }

                // 2. Fetch Metadata (Institution & Question)
                // We find the answer record that points to this file
                const { data: ansData } = await supabaseAdmin
                    .from('survey_answers')
                    .select('*, respondents(*, institutions(*)), questions(*)')
                    .ilike('answer_text', `%${file.name}%`)
                    .single();

                let metaPath = 'Survey Migrated';
                if (ansData) {
                    const instName = ansData.respondents?.institutions?.name || 'Unknown Institution';
                    const qText = ansData.questions?.question_text?.substring(0, 50) || 'Unknown Question';
                    metaPath = `Survey Migrated/${instName}/${qText}`;
                } else {
                    // Check multiple answers
                    const { data: multData } = await supabaseAdmin
                        .from('survey_multiple_answers')
                        .select('*, respondents(*, institutions(*)), questions(*)')
                        .ilike('answer_value', `%${file.name}%`)
                        .single();
                    
                    if (multData) {
                        const instName = multData.respondents?.institutions?.name || 'Unknown Institution';
                        const qText = multData.questions?.question_text?.substring(0, 50) || 'Unknown Question';
                        metaPath = `Survey Migrated/${instName}/${qText}`;
                    }
                }

                // 3. Download from Supabase
                const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
                    .from('survey_uploads')
                    .download(file.path);
                
                if (downloadError) throw downloadError;

                // 4. Upload to GDrive with nested folder
                const arrayBuffer = await fileBlob.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                const gDriveResult = await uploadToGoogleDrive(
                    buffer,
                    file.name,
                    file.metadata?.mimetype || 'application/octet-stream',
                    metaPath
                );

                // 5. Update Database links
                await supabaseAdmin
                    .from('survey_answers')
                    .update({ answer_text: gDriveResult.fileUrl })
                    .ilike('answer_text', `%${file.name}%`);

                await supabaseAdmin
                    .from('survey_multiple_answers')
                    .update({ answer_value: gDriveResult.fileUrl })
                    .ilike('answer_value', `%${file.name}%`);

                // 6. Delete from Supabase
                await supabaseAdmin.storage.from('survey_uploads').remove([file.path]);
                
                syncedCount++;
            } catch (err: any) {
                console.error(`Failed to sync ${file.path}:`, err);
                errors.push(`${file.name}: ${err.message}`);
            }
        }

        let finalMsg = `Berhasil memindahkan ${syncedCount} file ke Google Drive secara terorganisir.`;
        if (deletedDummyCount > 0) finalMsg += ` Dan menghapus ${deletedDummyCount} file dummy.`;

        return { 
            success: true, 
            message: finalMsg,
            errorDetails: errors.length > 0 ? errors : null
        };
    } catch (err: any) {
        console.error('Organized sync failed:', err);
        return { success: false, error: err.message };
    }
}
