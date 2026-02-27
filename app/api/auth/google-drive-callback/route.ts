import { NextRequest, NextResponse } from 'next/server';

/**
 * One-time use: Callback handler for Google OAuth2.
 * Exchanges the authorization code for a refresh token.
 * The refresh token is displayed on screen — copy it to your .env.local / Vercel env vars.
 */
export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code');
    const error = request.nextUrl.searchParams.get('error');

    if (error) {
        return new NextResponse(
            `<html><body style="font-family:sans-serif;padding:40px;">
                <h1 style="color:red;">❌ Authorization Failed</h1>
                <p>Error: ${error}</p>
            </body></html>`,
            { headers: { 'Content-Type': 'text/html' } }
        );
    }

    if (!code) {
        return new NextResponse(
            `<html><body style="font-family:sans-serif;padding:40px;">
                <h1 style="color:red;">❌ No Code</h1>
                <p>No authorization code received from Google.</p>
            </body></html>`,
            { headers: { 'Content-Type': 'text/html' } }
        );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return new NextResponse(
            `<html><body style="font-family:sans-serif;padding:40px;">
                <h1 style="color:red;">❌ Missing Credentials</h1>
                <p>GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set.</p>
            </body></html>`,
            { headers: { 'Content-Type': 'text/html' } }
        );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/google-drive-callback`;

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.refresh_token) {
        return new NextResponse(
            `<html><body style="font-family:sans-serif;padding:40px;">
                <h1 style="color:red;">❌ Token Exchange Failed</h1>
                <pre style="background:#f5f5f5;padding:20px;border-radius:8px;overflow:auto;">${JSON.stringify(tokenData, null, 2)}</pre>
                <p>Make sure you set <code>prompt=consent</code> and <code>access_type=offline</code>.</p>
            </body></html>`,
            { headers: { 'Content-Type': 'text/html' } }
        );
    }

    // Display the refresh token for the user to copy
    return new NextResponse(
        `<html><body style="font-family:sans-serif;padding:40px;max-width:700px;margin:auto;">
            <h1 style="color:#10b981;">✅ Berhasil!</h1>
            <p>Salin <strong>Refresh Token</strong> di bawah ini ke <code>.env.local</code> dan Vercel Environment Variables:</p>
            
            <h3>GOOGLE_REFRESH_TOKEN</h3>
            <div style="background:#1e293b;color:#10b981;padding:16px;border-radius:12px;word-break:break-all;font-family:monospace;font-size:14px;cursor:pointer;" 
                 onclick="navigator.clipboard.writeText('${tokenData.refresh_token}');this.style.borderColor='#10b981';this.style.border='2px solid #10b981';">
                ${tokenData.refresh_token}
            </div>
            <p style="color:#64748b;font-size:13px;">Klik teks di atas untuk copy ke clipboard.</p>

            <h3>Cara penggunaan:</h3>
            <ol>
                <li>Tambahkan ke <code>.env.local</code>:<br><code>GOOGLE_REFRESH_TOKEN=${tokenData.refresh_token}</code></li>
                <li>Tambahkan juga ke <strong>Vercel → Settings → Environment Variables</strong></li>
                <li>Redeploy aplikasi</li>
            </ol>

            <p style="margin-top:30px;color:#94a3b8;font-size:12px;">
                ⚠️ Halaman ini hanya perlu dikunjungi <strong>satu kali</strong>. 
                Setelah refresh token disimpan, Anda bisa menghapus route ini.
            </p>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
    );
}
