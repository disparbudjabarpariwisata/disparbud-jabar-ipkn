'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'disparbudjabarpariwisata2026@gmail.com';

const ROLE_SLUG_MAP: Record<string, string> = {
    'Perangkat Daerah Provinsi Jawa Barat': 'perangkat-daerah',
    'Instansi Pemerintah Terkait': 'instansi-pemerintah',
};

export default function DashboardRouter() {
    const router = useRouter();
    const [isLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.replace('/login');
                return;
            }

            // Admin check by email
            if (user.email === ADMIN_EMAIL) {
                router.replace('/dashboard/admin');
                return;
            }

            const role = user.user_metadata?.role as string;

            if (!role) {
                router.replace('/select-role');
                return;
            }

            const slug = ROLE_SLUG_MAP[role];
            if (slug) {
                router.replace(`/dashboard/${slug}`);
            } else {
                // Fallback for unknown roles
                router.replace(`/dashboard/perangkat-daerah`);
            }
        };

        checkUser();
    }, [router]);

    if (!isLoading) return null;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-[#F8BC16]" size={40} />
                <p className="text-gray-500 font-medium">Loading your Dashboard...</p>
            </div>
        </div>
    );
}
