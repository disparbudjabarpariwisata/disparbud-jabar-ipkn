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
            const { data, error } = await supabaseAdmin
                .from(table)
                .select('*')
                .eq('email', cleanEmail)
                .eq('pin', cleanPin)
                .single();

            if (data && !error) {
                foundIdentity = { ...data, table_source: table };
                break;
            }
        }

        if (!foundIdentity) {
            return NextResponse.json({ error: 'Kombinasi Email dan PIN tidak ditemukan. Periksa kembali data Anda.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: foundIdentity });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan internal.' }, { status: 500 });
    }
}
