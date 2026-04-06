import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const [mapRes, jknRes, bedRes, drRes] = await Promise.all([
            supabaseAdmin.from('data_map').select('*').eq('active', true).order('city_name', { ascending: true }),
            supabaseAdmin.from('kesehatan_rasio_jkn').select('*'),
            supabaseAdmin.from('kesehatan_rasio_bedrs').select('*'),
            supabaseAdmin.from('kesehatan_rasio_drumum').select('*')
        ]);

        if (mapRes.error) throw mapRes.error;
        if (jknRes.error) throw jknRes.error;
        if (bedRes.error) throw bedRes.error;
        if (drRes.error) throw drRes.error;

        const combinedData = (mapRes.data || []).map(city => {
            // Find match for the city in health tables
            // Notes: Health tables use "KABUPATEN BOGOR", "BOGOR" etc.
            // City name in data_map e.g., "Kabupaten Bogor" or "Kota Bogor"
            const nameSearch = city.city_name.toUpperCase();
            
            // JKN table match logic
            const jkn = jknRes.data?.find(j => 
                j.kabupaten_kota.toUpperCase() === nameSearch || 
                j.kabupaten_kota.toUpperCase() === nameSearch.replace(/^(KABUPATEN |KOTA )/, '')
            );

            // Bed RS match logic
            const bed = bedRes.data?.find(b => 
                b.kabupaten_kota.toUpperCase() === nameSearch || 
                b.kabupaten_kota.toUpperCase() === nameSearch.replace(/^(KABUPATEN |KOTA )/, '')
            );

            // Dr Umum match logic
            const dr = drRes.data?.find(d => 
                d.kabupaten_kota.toUpperCase() === nameSearch || 
                d.kabupaten_kota.toUpperCase() === nameSearch.replace(/^(KABUPATEN |KOTA )/, '')
            );

            // Populate regional_health struct with cleanly parsed values
            const regional_health = {
                '2024': {
                    jkn_percent: jkn?.persen_uhc_2024 || 0,
                    bed_ratio: bed?.rasio_bed_rs_2024 || 0,
                    doctor_ratio: dr?.rasio_dokter_umum_2024 || 0,
                    spesialis_ratio: dr?.rasio_dokter_spesialis_2024 || 0
                },
                '2025': {
                    jkn_percent: jkn?.persen_uhc_2025 || 0,
                    bed_ratio: bed?.rasio_bed_rs_2025 || 0,
                    doctor_ratio: dr?.rasio_dokter_umum_2025 || 0,
                    spesialis_ratio: dr?.rasio_dokter_spesialis_2025 || 0
                }
            };

            // Remove legacy medical_data from response to save payload size
            const { medical_data, ...rest } = city;

            return {
                ...rest,
                regional_health
            };
        });

        return NextResponse.json({ success: true, data: combinedData });
    } catch (error: any) {
        console.error('Map Data API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error.' }, { status: 500 });
    }
}
