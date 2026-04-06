import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const [permukaanRes, kemantapanRes] = await Promise.all([
            supabaseAdmin.from('infraparjabar-permukaan_jalan').select('*'),
            supabaseAdmin.from('infraparjabar-kemantapan_jalan').select('*')
        ]);

        if (permukaanRes.error) throw permukaanRes.error;
        if (kemantapanRes.error) throw kemantapanRes.error;

        return NextResponse.json({
            success: true,
            data: {
                permukaan: permukaanRes.data,
                kemantapan: kemantapanRes.data
            }
        });
    } catch (error: any) {
        console.error('API Infrastruktur Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch infrastructure data' },
            { status: 500 }
        );
    }
}
