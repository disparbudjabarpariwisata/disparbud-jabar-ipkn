import jwt from 'jsonwebtoken';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Generate an OAuth2 access token from Service Account credentials using JWT
 */
async function getAccessToken(): Promise<string> {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
    // Handle private key: strip surrounding quotes, then convert literal \n to real newlines
    let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '';
    // Remove surrounding quotes if present (some env parsers keep them)
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
        (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
        privateKey = privateKey.slice(1, -1);
    }
    // Convert literal \n sequences to actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');

    const now = Math.floor(Date.now() / 1000);

    const payload = {
        iss: email,
        scope: SCOPES.join(' '),
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600, // 1 hour
    };

    const assertion = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion,
        }),
    });

    if (!tokenRes.ok) {
        const errBody = await tokenRes.text();
        console.error('Google OAuth Token Error:', errBody);
        throw new Error(`Gagal mendapatkan access token Google: ${errBody}`);
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
 * Upload a file to Google Drive using simple upload + separate metadata update.
 * This avoids multipart encoding issues.
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
    console.log(`[GDrive] Target folder: ${parentFolderId}, subfolder: ${subfolder || 'none'}`);

    // Determine the target folder (use subfolder if provided)
    let targetFolderId = parentFolderId;

    if (subfolder) {
        targetFolderId = await getOrCreateSubfolder(accessToken, parentFolderId, subfolder);
        console.log(`[GDrive] Using subfolder ID: ${targetFolderId}`);
    }

    // Step 1: Upload file content using simple upload
    const metadata = JSON.stringify({
        name: fileName,
        parents: [targetFolderId],
    });

    // Use multipart/related with proper Blob-based body instead of string concatenation
    const boundary = 'survey_upload_boundary_' + Date.now();

    // Build the multipart body as concatenated Uint8Arrays for proper binary handling
    const encoder = new TextEncoder();

    const metadataHeaders = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`;
    const metadataBody = metadata;
    const fileHeaders = `\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`;
    const closingBoundary = `\r\n--${boundary}--`;

    // Convert parts to Uint8Arrays
    const part1 = encoder.encode(metadataHeaders + metadataBody + fileHeaders);
    const part2 = new Uint8Array(fileBuffer);
    const part3 = encoder.encode(closingBoundary);

    // Concatenate all parts
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
        console.error('[GDrive] Upload Error Response:', uploadRes.status, errBody);
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
        // Don't fail — file is uploaded, permission can be set manually
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
    // Search for existing subfolder
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

    // Create subfolder
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
        throw new Error(`Gagal membuat subfolder di Google Drive: ${errBody}`);
    }

    const folderData = await createRes.json();
    console.log(`[GDrive] Created subfolder: ${folderName} -> ${folderData.id}`);
    return folderData.id;
}
