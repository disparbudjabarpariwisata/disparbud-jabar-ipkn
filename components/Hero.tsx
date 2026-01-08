'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import Aurora from './Aurora';

export function Hero() {
    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="/pantaipangandaran.jpg"
                    alt="Pantai Pangandaran"
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Aurora Animation Overlay */}
            <Aurora
                colorStops={["#1b2864", "#c29c14", "#085920"]}
                speed={0.7}
                blend={0.7}
            />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl font-inter">
                        IPKN JABAR
                    </h1>
                    <p className="text-2xl md:text-3xl lg:text-4xl text-white/90 mb-4 drop-shadow-lg font-roboto">
                        Data Production
                    </p>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl drop-shadow-md font-jakarta">
                        Sistem Informasi Indeks Pariwisata dan Ekonomi Kreatif Nasional Jawa Barat
                    </p>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-8"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2"
                    >
                        <motion.div className="w-1 h-2 bg-white/50 rounded-full" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
