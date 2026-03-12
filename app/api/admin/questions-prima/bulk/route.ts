import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const { assigned_institutions, ...questionData } = payload;

        if (!assigned_institutions || !Array.isArray(assigned_institutions) || assigned_institutions.length === 0) {
            return NextResponse.json({ error: 'Minimal pilih 1 institusi.' }, { status: 400 });
        }

        const inserts = assigned_institutions.map((inst: { role_id: string; institution_name: string }) => ({
            ...questionData,
            role_id: inst.role_id,
            institution_name: inst.institution_name,
        }));

        const { data, error } = await supabaseAdmin
            .from('survey_questions')
            .insert(inserts)
            .select();

        if (error) {
            console.error('Bulk Insert Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: data.length, data }, { status: 200 });

    } catch (error: any) {
        console.error('API /bulk Catch Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
