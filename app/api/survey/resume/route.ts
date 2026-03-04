import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const sanitizeEmail = (input: string): string => {
    return (input || '').toLowerCase().replace(/[<>"'`;(){}\s]/g, '').trim();
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, pin } = body;

        const cleanEmail = sanitizeEmail(email);
        const cleanPin = (pin || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

        if (!cleanEmail || !cleanPin) {
            return NextResponse.json({ error: 'Email dan PIN wajib diisi.' }, { status: 400 });
        }

        const tables = [
            'survey_perangkat_daerah',
            'survey_pemerintah_terkait',
            'survey_swasta_terkait',
            'survey_komunitas',
            'survey_pelaku_usaha',
            'survey_pemda_kabkota',
            'survey_pemerintah_pusat',
            'survey_international_tourism'
        ];

        let foundIdentity: any = null;

        for (const table of tables) {
            // Find the oldest record for this PIN (the Anchor ID)
            const { data, error } = await supabaseAdmin
                .from(table)
                .select('*')
                .eq('pin', cleanPin)
                .order('created_at', { ascending: true })
                .limit(1)
                .single();

            if (data && !error) {
                // Return the Anchor identity so all progress is bound to it
                foundIdentity = { ...data, table_source: table, session_email: cleanEmail };
                break;
            }
        }

        if (!foundIdentity) {
            return NextResponse.json({ error: 'PIN Institusi tidak ditemukan. Silakan mendaftar (Isi Survei Baru) terlebih dahulu.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: foundIdentity });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan internal.' }, { status: 500 });
    }
}
