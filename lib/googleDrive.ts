const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Get a fresh access token using the stored refresh token.
 * This uses OAuth2 Client Credentials + Refresh Token flow,
 * so files are owned by the actual Gmail user (not a Service Account).
 */
async function getAccessToken(): Promise<string> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Google OAuth2 credentials belum dikonfigurasi. Pastikan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, dan GOOGLE_REFRESH_TOKEN sudah ada di environment variables.');
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    });

    if (!tokenRes.ok) {
        const errBody = await tokenRes.text();
        console.error('[GDrive] Token Refresh Error:', errBody);
        throw new Error(`Gagal refresh access token Google: ${errBody}`);
    }

    const tokenData = await tokenRes.json();
    return tokenData.access_token;
}

interface UploadResult {
    fileId: string;
    fileUrl: string;
    fileName: string;
}

/**
 * Upload a file to Google Drive and return the shareable link.
 */
export async function uploadToGoogleDrive(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    subfolder?: string
): Promise<UploadResult> {
    const accessToken = await getAccessToken();
    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;

    console.log(`[GDrive] Starting upload: ${fileName} (${mimeType}, ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB)`);

    // Determine the target folder
    let targetFolderId = parentFolderId;

    if (subfolder) {
        targetFolderId = await getOrCreateSubfolder(accessToken, parentFolderId, subfolder);
        console.log(`[GDrive] Using subfolder ID: ${targetFolderId}`);
    }

    // Build multipart body with proper binary handling
    const metadata = JSON.stringify({
        name: fileName,
        parents: [targetFolderId],
    });

    const boundary = 'survey_upload_boundary_' + Date.now();
    const encoder = new TextEncoder();

    const metadataHeaders = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`;
    const fileHeaders = `\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`;
    const closingBoundary = `\r\n--${boundary}--`;

    const part1 = encoder.encode(metadataHeaders + metadata + fileHeaders);
    const part2 = new Uint8Array(fileBuffer);
    const part3 = encoder.encode(closingBoundary);

    const body = new Uint8Array(part1.length + part2.length + part3.length);
    body.set(part1, 0);
    body.set(part2, part1.length);
    body.set(part3, part1.length + part2.length);

    const uploadRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': `multipart/related; boundary=${boundary}`,
            },
            body: body,
        }
    );

    if (!uploadRes.ok) {
        const errBody = await uploadRes.text();
        console.error('[GDrive] Upload Error:', uploadRes.status, errBody);
        throw new Error(`Gagal upload file ke Google Drive (${uploadRes.status}): ${errBody}`);
    }

    const fileData = await uploadRes.json();
    console.log(`[GDrive] Upload success: fileId=${fileData.id}`);

    // Set permission: anyone with link can view
    const permRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                role: 'reader',
                type: 'anyone',
            }),
        }
    );

    if (!permRes.ok) {
        console.error('[GDrive] Permission Error:', await permRes.text());
    }

    return {
        fileId: fileData.id,
        fileUrl: fileData.webViewLink || `https://drive.google.com/file/d/${fileData.id}/view`,
        fileName: fileData.name,
    };
}

/**
 * Find or create a subfolder inside a parent folder on Google Drive
 */
async function getOrCreateSubfolder(
    accessToken: string,
    parentFolderId: string,
    folderName: string
): Promise<string> {
    const query = `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
        {
            headers: { Authorization: `Bearer ${accessToken}` },
        }
    );

    if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.files && searchData.files.length > 0) {
            return searchData.files[0].id;
        }
    } else {
        console.error('[GDrive] Subfolder search error:', await searchRes.text());
    }

    const createRes = await fetch(
        'https://www.googleapis.com/drive/v3/files?fields=id',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentFolderId],
            }),
        }
    );

    if (!createRes.ok) {
        const errBody = await createRes.text();
        console.error('[GDrive] Create Folder Error:', errBody);
        throw new Error(`Gagal membuat subfolder: ${errBody}`);
    }

    const folderData = await createRes.json();
    console.log(`[GDrive] Created subfolder: ${folderName} -> ${folderData.id}`);
    return folderData.id;
}
