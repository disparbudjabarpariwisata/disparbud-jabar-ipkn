import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const resend = new Resend(process.env.RESEND_API_KEY);

// Map role name to correct Supabase table using keyword-based lookup
const getTableForRole = (role: string) => {
    const lower = role.toLowerCase();
    const mapping: { keywords: string[]; table: string }[] = [
        { keywords: ['perangkat daerah'], table: 'survey_perangkat_daerah' },
        { keywords: ['instansi pemerintah', 'pemerintah terkait'], table: 'survey_pemerintah_terkait' },
        { keywords: ['swasta'], table: 'survey_swasta_terkait' },
        { keywords: ['komunitas', 'asosiasi'], table: 'survey_komunitas' },
        { keywords: ['pelaku usaha', 'ekraf'], table: 'survey_pelaku_usaha' },
        { keywords: ['kota/kabupaten', 'kabupaten', 'pemda'], table: 'survey_pemda_kabkota' },
        { keywords: ['pemerintah pusat'], table: 'survey_pemerintah_pusat' },
        { keywords: ['internasional', 'international', 'tourism institution'], table: 'survey_international_tourism' },
    ];

    for (const entry of mapping) {
        if (entry.keywords.some(kw => lower.includes(kw))) {
            return entry.table;
        }
    }
    return null;
};

// ============================================================
// Server-side Input Sanitization
// ============================================================
const sanitize = (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    return input
        .replace(/<[^>]*>/g, '')           // Strip HTML tags
        .replace(/javascript:/gi, '')       // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '')         // Remove event handlers
        .replace(/[<>"'`;(){}]/g, '')      // Remove dangerous characters
        .replace(/&[#\w]+;/g, '')           // Remove HTML entities
        .replace(/\\[nrtbf"'\\]/g, '')     // Remove escape sequences
        .trim();
};

const sanitizeName = (input: string): string => {
    return sanitize(input).replace(/[^a-zA-Z\s.,]/g, '');
};

const sanitizePhone = (input: string): string => {
    return (input || '').replace(/[^0-9]/g, '');
};

const sanitizeEmail = (input: string): string => {
    return (input || '').toLowerCase().replace(/[<>"'`;(){}\s]/g, '').trim();
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { role, city, institution, picName, position, email, whatsapp, pin } = body;

        // Server-side sanitize all inputs
        const cleanRole = sanitize(role);
        const cleanCity = sanitize(city || '');
        const cleanInstitution = sanitize(institution);
        const cleanPicName = sanitizeName(picName);
        const cleanPosition = sanitizeName(position);
        const cleanEmail = sanitizeEmail(email);
        const cleanWhatsapp = sanitizePhone(whatsapp);
        const cleanPin = (pin || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

        // Server-side validation
        if (!cleanRole || !cleanInstitution || !cleanPicName || !cleanPosition || !cleanEmail || !cleanWhatsapp || !cleanPin) {
            return NextResponse.json({ error: 'Data tidak lengkap. Semua field wajib diisi.' }, { status: 400 });
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
            return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
        }

        if (!/^(62|08)[0-9]{8,13}$/.test(cleanWhatsapp)) {
            return NextResponse.json({ error: 'Format nomor WhatsApp tidak valid.' }, { status: 400 });
        }

        if (!/^[A-Z0-9]{6}$/.test(cleanPin)) {
            return NextResponse.json({ error: 'PIN harus 6 karakter alfanumerik.' }, { status: 400 });
        }

        // 1. Identify Target Table
        const tableName = getTableForRole(cleanRole);
        if (!tableName) {
            console.error('Unknown role:', cleanRole);
            return NextResponse.json({ error: 'Kategori Instansi tidak valid: ' + cleanRole }, { status: 400 });
        }

        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown IP';
        const location = request.headers.get('x-vercel-ip-city') || 'Unknown Location';

        // 2. Insert using supabaseAdmin (service role) to bypass RLS
        const insertData: any = {
            role_name: cleanRole,
            institution: cleanInstitution,
            pic_name: cleanPicName,
            position: cleanPosition,
            email: cleanEmail,
            whatsapp: cleanWhatsapp,
            pin: cleanPin,
            ip_address: ip,
            location: location,
            status: 'incomplete'
        };

        // Add city if it belongs to pemda kabkota
        if (tableName === 'survey_pemda_kabkota') {
            insertData.city = cleanCity;
        }

        const { data: dbData, error: dbError } = await supabaseAdmin
            .from(tableName)
            .insert(insertData)
            .select()
            .single();

        if (dbError) {
            console.error("Supabase Insert Error:", dbError);
            return NextResponse.json({ error: 'Gagal merekam data ke sistem.' }, { status: 500 });
        }

        // 3. Send Email Notification with Resend
        const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'Smiling West Java Survey <survey@smilingwestjava.official.id>',
            to: email,
            subject: 'Akses PIN - Smiling West Java Survey',
            html: `
                <!DOCTYPE html>
                <html lang="id">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Akses PIN Survei</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-w-md; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border-radius: 12px; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <tr>
                            <td align="center" style="padding-bottom: 30px;">
                                <img src="https://smilingwestjava.official.id/smilingwestjava.png" alt="Smiling West Java Logo" style="max-height: 80px; width: auto;" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 8px;">Akses PIN Survei Anda</h1>
                                <p style="color: #64748b; font-size: 16px; text-align: center; line-height: 1.6; margin-bottom: 30px;">
                                  Halo <strong>${picName}</strong>,<br/>
                                  Terima kasih telah berpartisipasi dalam mendata informasi pariwisata Jawa Barat.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center">
                                <div style="background-color: #fefce8; border: 1px solid #fef08a; padding: 24px; border-radius: 12px; max-width: 300px; margin: 0 auto;">
                                    <p style="margin: 0; color: #854d0e; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">PIN Akses Anda</p>
                                    <p style="margin: 0; color: #000000; font-size: 36px; font-weight: 900; letter-spacing: 8px;">${pin}</p>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-top: 40px;">
                                <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                                    Gunakan kombinasi <strong>Email</strong> dan <strong>PIN</strong> ini untuk masuk kembali ke dalam sistem survei jika pengisian Anda terputus sewaktu-waktu.
                                </p>
                                <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                                    <strong>Instansi:</strong> ${institution}<br/>
                                    <strong>Kategori:</strong> ${role}
                                </p>
                                <div style="text-align: center; margin-top: 30px;">
                                    <a href="https://smilingwestjava.official.id/survey" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Lanjutkan Survei</a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-top: 40px; border-top: 1px solid #e2e8f0; margin-top: 40px; text-align: center;">
                                <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
                                    Pesan ini dikirimkan otomatis oleh sistem Smiling West Java.<br/>
                                    Dinas Pariwisata dan Kebudayaan Provinsi Jawa Barat.
                                </p>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        });

        if (emailError) {
            console.error("Resend Email Error:", emailError);
            // We shouldn't fail the whole user registration if email fails since DB succeeded, 
            // but we might log it. Returning success since the principal entity was stored.
        }

        // Return the id and data for local storage persistence if needed
        return NextResponse.json({ success: true, respondentId: dbData.id });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan internal.' }, { status: 500 });
    }
}
