import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('kata_kreatif_jabar')
            .select('id, kota_kabupaten, skor_2022, skor_2023, orde, kategori')
            .order('orde', { ascending: true })
            .order('skor_2023', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data: data || [] });
    } catch (err: any) {
        console.error('kata-kreatif API error:', err);
        return NextResponse.json(
            { success: false, error: err.message || 'Internal error' },
            { status: 500 }
        );
    }
}
