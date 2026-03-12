import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ADMIN_EMAIL } from '@/lib/adminConfig';

export async function GET(request: Request) {
    try {
        // 1. Authenticate user to ensure it's the admin
        const authHeader = request.headers.get('authorization');
        let isAuthorized = false;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.replace('Bearer ', '');
            const { data: { user }, error: authError } = await supabase.auth.getUser(token);
            if (!authError && user && user.email === ADMIN_EMAIL) {
                isAuthorized = true;
            }
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.email === ADMIN_EMAIL) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
        }

        const tables = [
            'profiles',
            'registered_users',
            'institution_names',
            'institution_names2',
            'cities_jabar',
            'role_types',
            'survey_questions',
            'survey_answers',
            'survey_pemda_kabkota',
            'survey_pemerintah_terkait',
            'survey_perangkat_daerah',
            'hero_slides',
            'seo_settings'
        ];

        let sqlDump = `-- Supabase Database Backup\n`;
        sqlDump += `-- Date: ${new Date().toISOString()}\n\n`;

        // 3. Fetch data for each table and append as SQL INSERT statements
        for (const table of tables) {
            let query = supabase.from(table).select('*');
            if (table !== 'profiles') {
                query = query.order('created_at', { ascending: true, nullsFirst: false });
            }
            const { data, error } = await query;

            if (error) {
                console.error(`Error fetching table ${table}:`, error);
                sqlDump += `-- Error exporting table ${table}: ${error.message}\n\n`;
                continue;
            }

            if (data && data.length > 0) {
                sqlDump += `-- Table: ${table}\n`;

                // Get column names from the first row
                const columns = Object.keys(data[0]);

                for (const row of data) {
                    const values = columns.map(col => {
                        const val = row[col];
                        if (val === null) return 'NULL';
                        if (typeof val === 'string') {
                            // Escape single quotes by doubling them
                            const escapedStr = val.replace(/'/g, "''");
                            return `'${escapedStr}'`;
                        }
                        if (typeof val === 'object') {
                            // Handle JSONB/JSON columns
                            const jsonStr = JSON.stringify(val).replace(/'/g, "''");
                            return `'${jsonStr}'`;
                        }
                        return val;
                    });

                    sqlDump += `INSERT INTO "${table}" ("${columns.join('", "')}") VALUES (${values.join(', ')});\n`;
                }
                sqlDump += '\n';
            } else {
                sqlDump += `-- Table: ${table} (Empty)\n\n`;
            }
        }

        // 4. Return the file as response
        const filename = `IPKN_Database_Backup_${new Date().toISOString().split('T')[0]}.sql`;

        return new NextResponse(sqlDump, {
            status: 200,
            headers: {
                'Content-Type': 'application/sql',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error: any) {
        console.error("Failed to export database as SQL:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
