import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const [mapRes, jknRes, bedRes, drRes, desaRes, sarprasRes] = await Promise.all([
            supabaseAdmin.from('data_map').select('*').eq('active', true).order('city_name', { ascending: true }),
            supabaseAdmin.from('kesehatan_rasio_jkn').select('*'),
            supabaseAdmin.from('kesehatan_rasio_bedrs').select('*'),
            supabaseAdmin.from('kesehatan_rasio_drumum').select('*'),
            supabaseAdmin.from('desawisata_jabar').select('*').order('no', { ascending: true }),
            supabaseAdmin.from('data_sarpras_olahraga_jabar').select('*')
        ]);

        if (mapRes.error) throw mapRes.error;
        if (jknRes.error) throw jknRes.error;
        if (bedRes.error) throw bedRes.error;
        if (drRes.error) throw drRes.error;
        if (desaRes.error) throw desaRes.error;
        if (sarprasRes.error) throw sarprasRes.error;

        const combinedData = (mapRes.data || []).map(city => {
            const nameSearch = city.city_name.toUpperCase();
            
            const jkn = jknRes.data?.find(j => 
                j.kabupaten_kota.toUpperCase() === nameSearch || 
                j.kabupaten_kota.toUpperCase() === nameSearch.replace(/^(KABUPATEN |KOTA )/, '')
            );

            const bed = bedRes.data?.find(b => 
                b.kabupaten_kota.toUpperCase() === nameSearch || 
                b.kabupaten_kota.toUpperCase() === nameSearch.replace(/^(KABUPATEN |KOTA )/, '')
            );

            const dr = drRes.data?.find(d => 
                d.kabupaten_kota.toUpperCase() === nameSearch || 
                d.kabupaten_kota.toUpperCase() === nameSearch.replace(/^(KABUPATEN |KOTA )/, '')
            );

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

            // Match desa wisata by kabupaten_kota
            const desa_wisata_data = (desaRes.data || []).filter(d => {
                const dName = d.kabupaten_kota?.toUpperCase() || '';
                return dName === nameSearch || dName === nameSearch.replace(/^(KABUPATEN |KOTA )/, '');
            }).map(d => ({
                nama: d.nama_desa_kampung_wisata,
                desa_kelurahan: d.desa_kelurahan,
                kecamatan: d.kecamatan,
                status: d.status_desa_wisata,
                potensi_alam: d.potensi_alam,
                potensi_budaya: d.potensi_budaya,
                potensi_buatan: d.potensi_buatan
            }));

            // Match sarpras olahraga by city_name
            const sarpras_olahraga_data = (sarprasRes.data || []).filter(s => {
                const sName = s.city_name?.toUpperCase() || '';
                return sName === nameSearch || sName === nameSearch.replace(/^(KABUPATEN |KOTA )/, '');
            });

            const { medical_data, desa_wisata_data: _oldDesa, ...rest } = city;
            
            // Clean up old embedded json if it exists in response
            if (rest.content && rest.content.sarana_olahraga) {
                delete rest.content.sarana_olahraga;
            }

            return {
                ...rest,
                regional_health,
                desa_wisata_data,
                sarpras_olahraga_data
            };
        });

        return NextResponse.json({ success: true, data: combinedData });
    } catch (error: any) {
        console.error('Map Data API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error.' }, { status: 500 });
    }
}
