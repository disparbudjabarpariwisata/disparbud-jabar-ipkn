import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 500,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const users = data.users.map((u) => ({
            id: u.id,
            email: u.email,
            role: u.user_metadata?.role || 'No role',
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            provider: u.app_metadata?.provider || 'email',
        }));

        return NextResponse.json({ users });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
