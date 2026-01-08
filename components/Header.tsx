'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

export function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
            className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 transition-shadow duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm'
                }`}
        >
            <div className="w-full px-4 md:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
                    {/* Logos */}
                    <div className="flex items-center gap-4">
                        <Image
                            src="/smilingwestjava.png"
                            alt="Smiling West Java"
                            width={60}
                            height={60}
                            className="h-12 w-auto"
                            style={{ width: 'auto', height: '3rem' }}
                            priority
                        />
                        <Image
                            src="/logopemprovjabar.png"
                            alt="Pemprov Jawa Barat"
                            width={60}
                            height={60}
                            className="h-12 w-auto"
                            style={{ width: 'auto', height: '3rem' }}
                            priority
                        />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3">
                        <Link href="/login">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-2.5 border-2 border-[#F8BC16] text-[#F8BC16] rounded-xl font-semibold hover:bg-yellow-50 hover:border-[#F2B10C] hover:text-[#F2B10C] transition-all shadow-sm hover:shadow-md"
                            >
                                Login
                            </motion.button>
                        </Link>
                        <Link href="/register">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-2.5 bg-[#F8BC16] text-white rounded-xl font-semibold hover:bg-[#F2B10C] transition-all shadow-md hover:shadow-lg"
                            >
                                Registrasi
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
