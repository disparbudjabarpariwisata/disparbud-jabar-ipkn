import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('data_map')
            .select('*')
            .eq('active', true)
            .order('city_name', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, data: data || [] });
    } catch (error: any) {
        console.error('Map Data API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error.' }, { status: 500 });
    }
}
