import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const TABLES = [
    'survey_perangkat_daerah',
    'survey_pemerintah_terkait',
    'survey_swasta_terkait',
    'survey_komunitas',
    'survey_pelaku_usaha',
    'survey_pemda_kabkota',
    'survey_pemerintah_pusat',
    'survey_international_tourism'
];

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { field, value } = body;

        if (!field || !value) {
            return NextResponse.json({ error: 'Field and value are required' }, { status: 400 });
        }

        if (field !== 'pin' && field !== 'email') {
            return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
        }

        // Check across all tables concurrently
        // Check across all tables concurrently
        const checks = TABLES.map((table) =>
            (supabase as any)
                .from(table)
                .select('id')
                .eq(field, value)
                .limit(1)
        );

        const results = await Promise.all(checks);

        // If any result has data (length > 0), it's a conflict
        const hasConflict = results.some(result => result.data && result.data.length > 0);

        return NextResponse.json({ hasConflict });

    } catch (error) {
        console.error("Conflict Check Error:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan saat mengecek data.' }, { status: 500 });
    }
}
