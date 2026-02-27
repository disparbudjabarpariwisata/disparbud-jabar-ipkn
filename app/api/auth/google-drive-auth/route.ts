import { NextResponse } from 'next/server';

/**
 * One-time use: Generates a Google OAuth2 authorization URL.
 * Visit this endpoint in the browser to start the auth flow.
 * After authorizing, Google will redirect to /api/auth/google-drive-callback with the code.
 */
export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
        return NextResponse.json(
            { error: 'GOOGLE_CLIENT_ID belum diset di environment variables.' },
            { status: 500 }
        );
    }

    // Determine the redirect URI based on the current environment
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/google-drive-callback`;

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/drive.file',
        access_type: 'offline',
        prompt: 'consent', // Force consent to always get refresh_token
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // Redirect to Google's authorization page
    return NextResponse.redirect(authUrl);
}
