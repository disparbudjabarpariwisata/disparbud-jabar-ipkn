/**
 * populate_data_tables.mjs
 * Script untuk extract data dari data_map dan insert ke 3 tabel baru.
 * Jalankan dengan: node scripts/populate_data_tables.mjs
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load .env.local manually
const envFile = readFileSync('.env.local', 'utf-8');
const env = Object.fromEntries(
    envFile.split('\n')
        .filter(line => line && !line.startsWith('#') && line.includes('='))
        .map(line => {
            const idx = line.indexOf('=');
            return [line.substring(0, idx).trim(), line.substring(idx + 1).trim()];
        })
);

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE env vars in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Helpers ─────────────────────────────────────────────────────
const joinList = (arr) => Array.isArray(arr) ? arr.filter(Boolean).join(', ') : '';

async function insertBatch(tableName, rows, chunkSize = 100) {
    let total = 0;
    for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const { error } = await supabase.from(tableName).insert(chunk);
        if (error) {
            console.error(`  ❌ Chunk ${Math.floor(i / chunkSize) + 1} error:`, error.message);
        } else {
            total += chunk.length;
            process.stdout.write(`  ✅ ${total}/${rows.length} rows inserted\r`);
        }
    }
    console.log(`  ✅ ${total}/${rows.length} rows inserted — DONE`);
    return total;
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
    console.log('🔄 Fetching all data from data_map...');

    const { data: mapData, error: fetchError } = await supabase
        .from('data_map')
        .select('id, city_name, city_type, medical_data, content')
        .eq('active', true)
        .order('city_name', { ascending: true });

    if (fetchError) {
        console.error('❌ Fetch error:', fetchError.message);
        process.exit(1);
    }

    console.log(`✅ Found ${mapData.length} cities/kabupaten\n`);

    // ── 1. KESEHATAN ──────────────────────────────────────────────
    console.log('📊 [1/3] Populating data_kesehatan_jabar...');

    // Clear existing data first
    const { error: clearK } = await supabase
        .from('data_kesehatan_jabar')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
    if (clearK) console.warn('  ⚠️ Clear warning:', clearK.message);

    const kesehatanRows = [];
    for (const row of mapData) {
        if (!row.medical_data) continue;
        for (const [tahunStr, yearData] of Object.entries(row.medical_data)) {
            const ds = yearData?.datasets || {};
            const jkn = ds['JKN'] || {};
            const dokter = ds['Rasio Dokter'] || {};
            const rst = ds['Rasio Tempat Tidur'] || {};
            const penyakit = ds['Penyakit Menular'] || {};
            kesehatanRows.push({
                city_name: row.city_name,
                city_type: row.city_type || '',
                tahun: parseInt(tahunStr),
                penduduk: jkn.population || dokter.population || rst.population || 0,
                peserta_jkn: jkn.jkn_participants || 0,
                rasio_jkn: jkn.jkn_coverage_ratio || 0,
                total_dokter: dokter.total_doctors || 0,
                rasio_dokter_per_1000: dokter.doctor_ratio_per_1000_population || 0,
                tempat_tidur_rs: rst.hospital_beds || 0,
                rasio_rst_per_1000: rst.hospital_bed_ratio_per_1000_population || 0,
                kasus_dbd: penyakit.dengue_cases || 0,
                kasus_hiv_baru: penyakit.new_hiv_cases || 0,
                kasus_kusta_baru: penyakit.new_leprosy_cases || 0,
                kasus_tbc: penyakit.tuberculosis_cases || 0,
                kasus_malaria: penyakit.positive_malaria_cases || 0,
                kasus_filariasis: penyakit.chronic_filariasis_cases || 0,
            });
        }
    }
    await insertBatch('data_kesehatan_jabar', kesehatanRows);

    // ── 2. DESA WISATA ────────────────────────────────────────────
    console.log('\n🌿 [2/3] Populating data_desa_wisata_jabar...');

    const { error: clearD } = await supabase
        .from('data_desa_wisata_jabar')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
    if (clearD) console.warn('  ⚠️ Clear warning:', clearD.message);

    const desaRows = [];
    for (const row of mapData) {
        const villages = row.content?.desa_wisata || [];
        for (const v of villages) {
            desaRows.push({
                city_name: row.city_name,
                city_type: row.city_type || '',
                nama_desa_wisata: v.nama || '',
                status: v.status || 'Rintisan',
                kecamatan: v.kecamatan || '',
                desa_kelurahan: v.desa_kelurahan || '',
                potensi_alam: joinList(v.potensi?.alam_list),
                potensi_buatan: joinList(v.potensi?.buatan_list),
                potensi_budaya: joinList(v.potensi?.budaya_list),
            });
        }
    }
    await insertBatch('data_desa_wisata_jabar', desaRows);

    // ── 3. SARPRAS OLAHRAGA ───────────────────────────────────────
    console.log('\n🏟️  [3/3] Populating data_sarpras_olahraga_jabar...');

    const { error: clearS } = await supabase
        .from('data_sarpras_olahraga_jabar')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
    if (clearS) console.warn('  ⚠️ Clear warning:', clearS.message);

    const sarprasRows = [];
    for (const row of mapData) {
        const facilities = row.content?.sarana_olahraga?.facilities || [];
        for (const f of facilities) {
            const namaFasilitas = (f.named_facilities || [])
                .map(n => n.facility_name).filter(Boolean).join(', ');
            sarprasRows.push({
                city_name: row.city_name,
                city_type: row.city_type || '',
                cabang_olahraga: f.sport_branch_name || '',
                kode_cabang: f.sport_branch_code || '',
                kategori_fasilitas: f.facility_category || '',
                subkategori: f.facility_subcategory || '',
                kelas_kualitas: f.quality_class || '',
                jumlah_unit: f.availability_count || 0,
                nama_fasilitas: namaFasilitas,
                catatan: joinList(f.notes),
                row_id: f.row_id || '',
            });
        }
    }
    await insertBatch('data_sarpras_olahraga_jabar', sarprasRows);

    // ── Summary ───────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════');
    console.log('🎉 POPULATE COMPLETE!');
    console.log(`   📊 Kesehatan  : ${kesehatanRows.length} rows`);
    console.log(`   🌿 Desa Wisata: ${desaRows.length} rows`);
    console.log(`   🏟️  Sarpras    : ${sarprasRows.length} rows`);
    console.log('══════════════════════════════════════════════\n');
}

main().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
