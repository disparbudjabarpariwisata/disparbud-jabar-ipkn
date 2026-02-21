import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;

    if (code) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data } = await supabase.auth.exchangeCodeForSession(code);

        if (data?.user) {
            // Set auth_provider to 'google' for Google SSO users
            if (!data.user.user_metadata?.auth_provider) {
                await supabase.auth.updateUser({
                    data: { auth_provider: 'google' },
                });
            }

            // Check if user has a role set, if not redirect to select-role
            if (!data.user.user_metadata?.role) {
                return NextResponse.redirect(`${origin}/select-role`);
            }
        }
    }

    // Redirect to dashboard after successful auth
    return NextResponse.redirect(`${origin}/dashboard`);
}
