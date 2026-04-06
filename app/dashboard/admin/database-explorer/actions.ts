'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getAllTablesDataAction() {
    try {
        // Since we can't easily query information_schema from the standard Supabase client 
        // without raw SQL (which might be restricted), we define the known core tables.
        const tableNames = [
            'survey_perangkat_daerah',
            'survey_pemerintah_terkait',
            'survey_pemda_kabkota',
            'survey_questions',
            'survey_answers',
            'survey_multiple_answers',
            'role_types',
            'institution_names',
            'institution_names2',
            'cities_jabar',
            'data_map',
            'hero_slider',
            'seo_settings',
            'users',
            'data_kesehatan_jabar',
            'data_desa_wisata_jabar',
            'data_sarpras_olahraga_jabar',
            'infraparjabar-permukaan_jalan',
            'infraparjabar-kemantapan_jalan',
        ];

        const allData: Record<string, any[]> = {};
        
        for (const table of tableNames) {
            const { data, error } = await supabaseAdmin.from(table).select('*').limit(100);
            if (!error && data) {
                allData[table] = data;
            } else {
                allData[table] = []; // Empty or error
            }
        }

        return { success: true, allData };
    } catch (err: any) {
        console.error('Database Explorer Error:', err);
        return { success: false, error: err.message };
    }
}

export async function getSingleTableDataAction(tableName: string) {
    try {
        const { data, error } = await supabaseAdmin.from(tableName).select('*').limit(200);
        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function getFullTableDataAction(tableName: string) {
    try {
        // High limit for full export, enough for mirroring most core tables
        const { data, error } = await supabaseAdmin.from(tableName).select('*').limit(10000);
        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        console.error(`Export Error for ${tableName}:`, err);
        return { success: false, error: err.message };
    }
}
