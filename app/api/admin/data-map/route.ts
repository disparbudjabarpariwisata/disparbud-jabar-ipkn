import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('data_map')
            .select('*')
            .order('city_name', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, data: data || [] });
    } catch (error: any) {
        console.error('Admin Data Map GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
            const {
                id,
                city_name,
                city_type,
                description,
                tourism_highlights,
                tourist_attractions,
                culinary,
                accommodation,
                transportation,
                image_url,
                website_url,
                active,
                desa_wisata_data,
                content,
            } = body;

            if (!city_name || !city_type) {
                return NextResponse.json({ error: 'Nama kota dan tipe wajib diisi.' }, { status: 400 });
            }

            if (id) {
                // Update
                const { error } = await supabaseAdmin
                    .from('data_map')
                    .update({
                        city_name,
                        city_type,
                        description: description || null,
                        tourism_highlights: tourism_highlights || null,
                        tourist_attractions: tourist_attractions || null,
                        culinary: culinary || null,
                        accommodation: accommodation || null,
                        transportation: transportation || null,
                        image_url: image_url || null,
                        website_url: website_url || null,
                        active: active ?? true,
                        desa_wisata_data: desa_wisata_data || null,
                        content: content || null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', id);

                if (error) throw error;
                return NextResponse.json({ success: true, message: 'Data berhasil diperbarui.' });
            } else {
                // Insert
                const { error } = await supabaseAdmin
                    .from('data_map')
                    .insert({
                        city_name,
                        city_type,
                        description: description || null,
                        tourism_highlights: tourism_highlights || null,
                        tourist_attractions: tourist_attractions || null,
                        culinary: culinary || null,
                        accommodation: accommodation || null,
                        transportation: transportation || null,
                        image_url: image_url || null,
                        website_url: website_url || null,
                        active: active ?? true,
                        desa_wisata_data: desa_wisata_data || null,
                        content: content || null,
                    });

            if (error) throw error;
            return NextResponse.json({ success: true, message: 'Data berhasil ditambahkan.' });
        }
    } catch (error: any) {
        console.error('Admin Data Map POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID wajib diisi.' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('data_map')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Data berhasil dihapus.' });
    } catch (error: any) {
        console.error('Admin Data Map DELETE Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
