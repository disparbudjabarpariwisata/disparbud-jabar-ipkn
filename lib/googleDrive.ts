import jwt from 'jsonwebtoken';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Generate an OAuth2 access token from Service Account credentials using JWT
 */
async function getAccessToken(): Promise<string> {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n');

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
        throw new Error('Gagal mendapatkan access token Google.');
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
 * 
 * @param fileBuffer - The file content as Buffer
 * @param fileName - Original file name
 * @param mimeType - MIME type of the file
 * @param subfolder - Optional: subfolder name inside the main folder (e.g. respondent name)
 */
export async function uploadToGoogleDrive(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    subfolder?: string
): Promise<UploadResult> {
    const accessToken = await getAccessToken();
    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;

    // Determine the target folder (use subfolder if provided)
    let targetFolderId = parentFolderId;

    if (subfolder) {
        targetFolderId = await getOrCreateSubfolder(accessToken, parentFolderId, subfolder);
    }

    // Use multipart upload (metadata + file content in one request)
    const metadata = {
        name: fileName,
        parents: [targetFolderId],
    };

    const boundary = '===GDRIVE_UPLOAD_BOUNDARY===';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    // Build multipart body
    const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
    const filePart = `${delimiter}Content-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n${fileBuffer.toString('base64')}`;

    const requestBody = `${metadataPart}${filePart}${closeDelimiter}`;

    const uploadRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': `multipart/related; boundary=${boundary}`,
            },
            body: requestBody,
        }
    );

    if (!uploadRes.ok) {
        const errBody = await uploadRes.text();
        console.error('Google Drive Upload Error:', errBody);
        throw new Error('Gagal upload file ke Google Drive.');
    }

    const fileData = await uploadRes.json();

    // Set permission: anyone with link can view
    await fetch(
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
        console.error('Google Drive Create Folder Error:', errBody);
        throw new Error('Gagal membuat subfolder di Google Drive.');
    }

    const folderData = await createRes.json();
    return folderData.id;
}
