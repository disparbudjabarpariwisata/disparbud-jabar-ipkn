'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, ScrollText } from 'lucide-react';

interface PrivacyPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    hasAccepted: boolean;
}

export default function PrivacyPolicyModal({ isOpen, onClose, onAccept, hasAccepted }: PrivacyPolicyModalProps) {
    const [scrolledToBottom, setScrolledToBottom] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Check if user scrolled near the bottom
        if (scrollHeight - scrollTop - clientHeight < 50) {
            setScrolledToBottom(true);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Kebijakan Privasi</h2>
                                    <p className="text-sm text-gray-500">Mohon baca dengan seksama dokumen ini</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Scrollable */}
                        <div
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-6 text-gray-600 space-y-4 text-justify leading-relaxed"
                        >
                            <p className="font-semibold text-gray-900">
                                Berdasarkan Undang-Undang Perlindungan Data Pribadi (UU PDP) No. 27 Tahun 2022.
                            </p>
                            <p>
                                IPKN JABAR berkomitmen untuk melindungi privasi dan data pribadi Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda saat menggunakan layanan kami.
                            </p>

                            <h3 className="font-bold text-gray-900 mt-4">1. Pengumpulan Data</h3>
                            <p>
                                Kami mengumpulkan data yang Anda berikan secara sukarela saat mendaftar, seperti Nama, Email, Peran (Role), dan data institusi terkait.
                            </p>

                            <h3 className="font-bold text-gray-900 mt-4">2. Tujuan Penggunaan</h3>
                            <p>
                                Data Anda digunakan semata-mata untuk keperluan verifikasi identitas, akses ke dashboard Data Production, dan keperluan statistik pariwisata Jawa Barat. Kami tidak akan menjual atau membagikan data Anda ke pihak ketiga tanpa persetujuan.
                            </p>

                            <h3 className="font-bold text-gray-900 mt-4">3. Hak Subjek Data</h3>
                            <p>
                                Sesuai regulasi, Anda berhak untuk mengakses, memperbaiki, dan meminta penghapusan data pribadi Anda dengan menghubungi admin kami.
                            </p>

                            <h3 className="font-bold text-gray-900 mt-4">4. Keamanan Data</h3>
                            <p>
                                Kami menerapkan langkah-langkah keamanan teknis dan organisasional yang memadai untuk mencegah akses tidak sah, pengungkapan, atau kehilangan data.
                            </p>

                            <p className="pt-4 text-sm text-gray-400 italic">
                                * Gulir sampai bawah untuk menyetujui.
                            </p>
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                            <label className="flex items-start gap-3 cursor-pointer select-none group">
                                <div className="relative flex items-center mt-1">
                                    <input
                                        type="checkbox"
                                        checked={hasAccepted}
                                        onChange={onAccept}
                                        className="h-5 w-5 rounded border-gray-300 text-[#F8BC16] focus:ring-[#F8BC16] transition-all cursor-pointer"
                                    />
                                </div>
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                    Saya telah membaca dan menyetujui seluruh ketentuan Kebijakan Privasi di atas sesuai dengan perundang-undangan yang berlaku.
                                </span>
                            </label>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-gray-300/50"
                                >
                                    Tutup & Lanjutkan
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
