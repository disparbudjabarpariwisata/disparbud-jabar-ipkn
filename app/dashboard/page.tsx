'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function DashboardRouter() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.replace('/login');
                return;
            }

            // Get role from metadata
            const role = user.user_metadata?.role as string;

            if (!role) {
                // If no role, restricted or default to something? 
                // Let's send to login or 'nasional' default just in case
                console.warn("No role found for user");
                // router.replace('/login'); // Or handle error
                // For safety, let's keep them here or show message
            }

            // Route based on role
            // Slugs: nasional, provinsi, kota-kabupaten, mitra, akademisi
            const roleSlug = role.toLowerCase().replace('/', '-').replace(' ', '-'); // 'Kota/Kabupaten' -> 'kota-kabupaten', 'Mitra Pariwisata' -> 'mitra-pariwisata'

            // Wait, standardizing slug logic:
            // "Nasional" -> "nasional"
            // "Provinsi" -> "provinsi"
            // "Kota/Kabupaten" -> "kota-kabupaten"
            // "Mitra Pariwisata" -> "mitra-pariwisata"
            // "Akademisi" -> "akademisi"

            // I should explicitly map to handle potential variations

            let targetPath = '/dashboard/nasional'; // Default fall back

            if (role === 'Nasional') targetPath = '/dashboard/nasional';
            else if (role === 'Provinsi') targetPath = '/dashboard/provinsi';
            else if (role === 'Kota/Kabupaten') targetPath = '/dashboard/kota-kabupaten';
            else if (role.includes('Mitra')) targetPath = '/dashboard/mitra-pariwisata'; // Includes 'Mitra Pariwisata'
            else if (role === 'Akademisi') targetPath = '/dashboard/akademisi';

            router.replace(targetPath);
        };

        checkUser();
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-[#F8BC16]" size={40} />
                <p className="text-gray-500 font-medium">Memuat Dashboard Anda...</p>
            </div>
        </div>
    );
}
