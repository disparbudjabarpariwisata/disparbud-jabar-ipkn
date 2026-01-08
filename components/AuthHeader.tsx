'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function AuthHeader() {
    return (
        <header className="w-full flex justify-center items-center py-6 px-4 bg-white/50 backdrop-blur-sm fixed top-0 z-10">
            <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
                <div className="relative h-10 w-auto aspect-[16/9]">
                    <Image
                        src="/smilingwestjava.png"
                        alt="Smiling West Java"
                        fill
                        className="object-contain"
                        sizes="100px"
                    />
                </div>
                <div className="w-px h-8 bg-gray-300 mx-2" />
                <div className="relative h-10 w-10">
                    <Image
                        src="/logopemprovjabar.png"
                        alt="Pemprov Jabar"
                        fill
                        className="object-contain"
                        sizes="40px"
                    />
                </div>
                <div className="relative h-10 w-10">
                    <Image
                        src="/logodisparbudjabar.png"
                        alt="Disparbud Jabar"
                        fill
                        className="object-contain"
                        sizes="40px"
                    />
                </div>
            </Link>
        </header>
    );
}
