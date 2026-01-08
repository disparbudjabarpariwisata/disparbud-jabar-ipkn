'use client';

import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { Building2, TrendingUp, Plane, Users, Leaf } from 'lucide-react';

const categories = [
    {
        title: 'Enabling Environment',
        icon: Building2,
        color: 'from-blue-500 to-blue-600',
        description: 'Lingkungan yang mendukung pengembangan pariwisata',
    },
    {
        title: 'Travel and Tourism Policy Enabling Condition',
        icon: TrendingUp,
        color: 'from-purple-500 to-purple-600',
        description: 'Kebijakan yang mendorong sektor pariwisata',
    },
    {
        title: 'Infrastructure',
        icon: Plane,
        color: 'from-green-500 to-green-600',
        description: 'Infrastruktur pendukung pariwisata',
    },
    {
        title: 'Travel and Tourism Demand Drivers',
        icon: Users,
        color: 'from-orange-500 to-orange-600',
        description: 'Daya tarik dan permintaan wisatawan',
    },
    {
        title: 'Travel and Tourism Sustainability',
        icon: Leaf,
        color: 'from-teal-500 to-teal-600',
        description: 'Keberlanjutan sektor pariwisata',
    },
];

export function KategoriSubIndeks() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

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
                        Kategori Sub Indeks
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Lima kategori utama dalam penilaian IPKN Jawa Barat
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {categories.map((category, index) => {
                        const Icon = category.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100"
                            >
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                    {category.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {category.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
