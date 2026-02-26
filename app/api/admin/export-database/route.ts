import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ADMIN_EMAIL } from '@/lib/adminConfig';
import * as xlsx from 'xlsx';

export async function GET(request: Request) {
    try {
        // 1. Authenticate user to ensure it's the admin
        const authHeader = request.headers.get('authorization');
        let isAuthorized = false;

        // Note: For a direct API endpoint without Next.js middleware handling the session token perfectly in all cases, 
        // passing the session token or relying on supabase.auth.getUser() might be tricky if the cookies aren't forwarded from the client.
        // We will try to get the user from supabase config if cookies are configured, or require a token.
        // Since it's a client-side fetch, we can pass the auth token in headers.

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.replace('Bearer ', '');
            const { data: { user }, error: authError } = await supabase.auth.getUser(token);
            if (!authError && user && user.email === ADMIN_EMAIL) {
                isAuthorized = true;
            }
        } else {
            // Fallback to checking via default client (assuming cookies might be sent automatically if configured or testing locally)
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.email === ADMIN_EMAIL) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
        }

        // 2. Define the tables to export
        const tables = [
            'profiles',
            'institutions',
            'institutions_terkait',
            'cities_jabar',
            'role_types',
            'questions',
            'survey_responses',
            'survey_answers'
        ];

        // 3. Create a new workbook
        const workbook = xlsx.utils.book_new();

        // 4. Fetch data for each table and append as a sheet
        for (const table of tables) {
            const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false, nullsFirst: false }).limit(50000); // safety limit

            if (error) {
                console.error(`Error fetching table ${table}:`, error);
                // Continue to next table even if one fails, or add an empty sheet with the error message
                const errorSheet = xlsx.utils.json_to_sheet([{ error: error.message }]);
                xlsx.utils.book_append_sheet(workbook, errorSheet, table.substring(0, 31)); // sheet names max 31 chars
                continue;
            }

            if (data && data.length > 0) {
                const worksheet = xlsx.utils.json_to_sheet(data);
                xlsx.utils.book_append_sheet(workbook, worksheet, table.substring(0, 31));
            } else {
                // Add an empty sheet for tables with no data
                const worksheet = xlsx.utils.json_to_sheet([{ 'Message': 'No data found' }]);
                xlsx.utils.book_append_sheet(workbook, worksheet, table.substring(0, 31));
            }
        }

        // 5. Generate Excel file buffer
        const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // 6. Return the file as response
        const filename = `IPKN_Database_Backup_${new Date().toISOString().split('T')[0]}.xlsx`;

        return new NextResponse(excelBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error: any) {
        console.error("Failed to export database:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
