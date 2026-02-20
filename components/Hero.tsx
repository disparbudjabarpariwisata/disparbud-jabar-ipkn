'use client';

import Image from 'next/image';

export function Hero() {
    return (
        <section className="relative h-[348px] md:h-[100vh] w-full overflow-hidden bg-black -mt-[214px] md:-mt-[104px] pt-[214px] md:pt-[104px]">
            {/* Background Image (Replaced with colorful exported PNG from Figma) */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/afe17b47905a1f3498944aac61b527d2096478c6.png"
                    alt="West Java abstract landscape"
                    fill
                    sizes="100vw"
                    className="object-cover opacity-90 mix-blend-screen"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-50" />
            </div>

            {/* Empty content as per Figma (The "Smiling West Java" title is in the Header) */}
        </section>
    );
}
