'use client';

import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { BookOpen, Globe } from 'lucide-react';

export function TentangIPKN() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    return (
        <section ref={ref} className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-inter">
                        Tentang IPKN
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Indeks Pariwisata dan Ekonomi Kreatif Nasional
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* TTDI Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-600 rounded-lg">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">TTDI</h3>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">
                            Travel and Tourism Development Index
                        </h4>
                        <p className="text-gray-700 leading-relaxed">
                            Indeks global yang disusun oleh <strong>World Economic Forum (WEF)</strong> untuk
                            mengukur faktor-faktor dan kebijakan yang memungkinkan pembangunan berkelanjutan
                            sektor perjalanan dan pariwisata, serta kontribusinya terhadap pembangunan negara.
                            Indeks ini menilai <strong>117 negara</strong>.
                        </p>
                    </motion.div>

                    {/* IPKN Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-amber-600 rounded-lg">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">IPKN</h3>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">
                            Indeks Pariwisata dan Ekonomi Kreatif Nasional
                        </h4>
                        <p className="text-gray-700 leading-relaxed">
                            Indeks yang dikembangkan oleh <strong>Kementerian Pariwisata dan Ekonomi Kreatif (Kemenparekraf)</strong> Indonesia
                            untuk mengukur tingkat pembangunan sektor pariwisata di tingkat daerah
                            (kabupaten/kota/provinsi) di Indonesia yang sebagian besar indikatornya
                            <strong> cascading dengan TTDI</strong>.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
