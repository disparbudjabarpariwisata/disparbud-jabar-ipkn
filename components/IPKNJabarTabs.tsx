'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { TrendingUp, Award, Target } from 'lucide-react';

const dataByYear = {
    '2022': {
        score: '3.85',
        rank: '12',
        description: 'Peringkat 12 dari 34 Provinsi di Indonesia',
        highlights: ['Infrastruktur tourism berkembang', 'Peningkatan kunjungan wisatawan', 'Program digitalisasi pariwisata'],
    },
    '2024': {
        score: '4.12',
        rank: '8',
        description: 'Peringkat 8 dari 34 Provinsi di Indonesia',
        highlights: ['Peningkatan daya saing pariwisata', 'Pengembangan destinasi prioritas', 'Kolaborasi stakeholder meningkat'],
    },
    '2025': {
        score: '4.35',
        rank: '5',
        description: 'Target Peringkat 5 dari 34 Provinsi di Indonesia',
        highlights: ['Target peningkatan skor IPKN', 'Percepatan pembangunan infrastruktur', 'Penguatan branding Jawa Barat'],
    },
};

export function IPKNJabarTabs() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    const [activeYear, setActiveYear] = useState<'2022' | '2024' | '2025'>('2024');

    const currentData = dataByYear[activeYear];

    return (
        <section ref={ref} className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-inter">
                        IPKN Jawa Barat
                    </h2>
                    <p className="text-lg text-gray-600">
                        Perkembangan Indeks Pariwisata Jawa Barat
                    </p>
                </motion.div>

                {/* Tab Buttons */}
                <div className="flex justify-center gap-4 mb-12">
                    {(['2022', '2024', '2025'] as const).map((year) => (
                        <motion.button
                            key={year}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveYear(year)}
                            className={`px-8 py-3 rounded-xl font-semibold transition-all ${activeYear === year
                                ? 'bg-[#F8BC16] text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {year}
                        </motion.button>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeYear}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-4xl mx-auto"
                    >
                        {/* Stats Cards */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white rounded-2xl p-8 shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <TrendingUp className="w-8 h-8 text-green-600" />
                                    <span className="text-gray-600 font-medium">Skor IPKN</span>
                                </div>
                                <div className="text-5xl font-bold text-gray-900 mb-2">
                                    {currentData.score}
                                </div>
                                <p className="text-gray-600">dari skala 5.0</p>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <Award className="w-8 h-8 text-blue-600" />
                                    <span className="text-gray-600 font-medium">Peringkat Nasional</span>
                                </div>
                                <div className="text-5xl font-bold text-gray-900 mb-2">
                                    #{currentData.rank}
                                </div>
                                <p className="text-gray-600">{currentData.description}</p>
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <Target className="w-6 h-6 text-amber-600" />
                                <h3 className="text-xl font-semibold text-gray-900">Highlight {activeYear}</h3>
                            </div>
                            <ul className="space-y-3">
                                {currentData.highlights.map((highlight, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="w-2 h-2 bg-[#F8BC16] rounded-full mt-2" />
                                        <span className="text-gray-700">{highlight}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
