'use client';

import Image from 'next/image';
import { motion } from 'motion/react';

export function Footer() {
    return (
        <footer className="bg-blue-900 text-white py-12">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Logos */}
                <div className="flex justify-center items-center gap-6 mb-8">
                    <Image
                        src="/smilingwestjava.png"
                        alt="Smiling West Java"
                        width={80}
                        height={80}
                        className="h-16 w-auto"
                        style={{ width: 'auto', height: '4rem' }}
                    />
                    <Image
                        src="/logopemprovjabar.png"
                        alt="Pemprov Jawa Barat"
                        width={80}
                        height={80}
                        className="h-16 w-auto"
                        style={{ width: 'auto', height: '4rem' }}
                    />
                    <Image
                        src="/logodisparbudjabar.png"
                        alt="Disparbud Jawa Barat"
                        width={80}
                        height={80}
                        className="h-16 w-auto"
                        style={{ width: 'auto', height: '4rem' }}
                    />
                </div>

                {/* Institution Info */}
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">
                        Dinas Pariwisata dan Kebudayaan
                    </h3>
                    <p className="text-blue-200 mb-1">
                        Pemerintah Daerah Provinsi Jawa Barat
                    </p>
                    <p className="text-blue-300 text-sm">
                        Jl. L.L.R.E. Martadinata No. 209, Kota Bandung, Jawa Barat 40114
                    </p>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-6 border-t border-blue-800 text-center text-blue-300 text-sm">
                    <p>© {new Date().getFullYear()} IPKN JABAR - Data Production. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
